DSide.Node = CLASS((cls) => {
	
	// 현재 국제 표준시를 밀리세컨드 단위로
	let getNowUTC = () => {
		
		// 국제 표준시
		let now = new Date();
		
		return now.getTime() + now.getTimezoneOffset() * 60000;
	};
	
	return {
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.tokenName
			//REQUIRED: params.socketServerPort
			//REQUIRED: params.webSocketServerPort
			//REQUIRED: params.version
			//REQUIRED: params.accountAddress
			//REQUIRED: params.dataStructures
			//REQUIRED: params.ips
			
			let tokenName = params.tokenName;
			let socketServerPort = params.socketServerPort;
			let webSocketServerPort = params.webSocketServerPort;
			let version = params.version;
			let accountAddress = params.accountAddress;
			let dataStructures = params.dataStructures;
			
			// 전체 데이터 관리자
			let dataManager = DSide.Data.DataManager(dataStructures);
			
			// 초기 연결할 IP들
			let initIps = params.ips;
			
			// 실제로 연결된 IP들의 정보
			let ipInfos;
			let connectionTimes;
			
			// 다른 노드가 연결할 서버를 생성합니다.
			MULTI_PROTOCOL_SOCKET_SERVER({
				socketServerPort : socketServerPort,
				webServer : WEB_SERVER(webSocketServerPort)
			}, (clientInfo, on, off, send, disconnect) => {
				
				// 접속한 클라이언트의 IP를 반환합니다.
				on('getClientIp', (ip, ret) => {
					
					// 초기 노드면 최초 접근 시간을 저장합니다.
					if (ip !== undefined && ipInfos === undefined) {
						
						ipInfos = {};
						connectionTimes = {};
						
						ipInfos[ip] = {
							connectTime : new Date(),
							accountAddress : accountAddress
						};
					}
					
					ret(clientInfo.ip);
				});
				
				// 노드가 연결됩니다.
				on('connectNode', (accountAddress, ret) => {
					
					if (ipInfos !== undefined) {
						
						ipInfos[clientInfo.ip] = {
							connectTime : new Date(),
							accountAddress : accountAddress
						};
						
						createNodeClient(clientInfo.ip, accountAddress);
					}
				});
				
				// 노드의 버전을 반환합니다.
				on('getVersion', (notUsing, ret) => {
					ret(version);
				});
				
				// 노드의 현재 시간을 반환합니다.
				on('getNowUTC', (notUsing, ret) => {
					ret(getNowUTC());
				});
				
				// 실제로 연결된 IP들의 정보를 반환합니다.
				on('getIpInfos', (notUsing, ret) => {
					if (ipInfos !== undefined) {
						ret({
							ipInfos : ipInfos,
							connectionTimes : connectionTimes
						});
					}
				});
				
				// 토큰 저장소의 Hash를 반환합니다.
				on('getTokenStoreHash', (notUsing, ret) => {
					ret(DSide.Data.TokenStore.getHash());
				});
				
				// 토큰 저장소의 계정들을 반환합니다.
				on('getTokenAccounts', (notUsing, ret) => {
					ret(DSide.Data.TokenStore.getAccounts());
				});
				
				// 데이터 저장소의 Hash를 반환합니다.
				on('getStoreHash', (storeName, ret) => {
					//REQUIRED: storeName
					
					ret(dataManager.getStoreHash(storeName));
				});
				
				// 데이터 목록을 반환합니다.
				on('getDataSet', (storeNameOrParams, ret) => {
					//REQUIRED: storeNameOrParams
					//REQUIRED: storeNameOrParams.storeName
					//OPTIONAL: storeNameOrParams.target
					
					ret(dataManager.getDataSet(storeNameOrParams));
				});
				
				// 데이터를 저장합니다.
				on('saveData', (params, ret) => {
					//REQUIRED: params
					//REQUIRED: params.hash
					//REQUIRED: params.data
					//REQUIRED: params.data.storeName
					//OPTIONAL: params.data.target
					//REQUIRED: params.data.address
					//REQUIRED: params.data.createTime
					//OPTIONAL: params.isFromNode
					
					let data = params.data;
					let isFromNode = params.isFromNode;
					
					let createTime = data.createTime;
					
					// 5초 이내에 데이터가 작성된 경우에만 저장합니다.
					if (getNowUTC() - createTime.getTime() < 5000) {
						
						// 데이터 검증은 Store가 알아서 합니다.
						let result = dataManager.saveData(params);
						
						// 성공적으로 저장되면 모든 노드에 전파
						if (isFromNode !== true && result.savedData !== undefined) {
							
							params.isFromNode = true;
							
							EACH(nodes, (node) => {
								node.send({
									methodName : 'saveData',
									data : params
								});
							});
						}
						
						ret(result);
					}
					
					else {
						ret({
							isTimeout : true
						});
					}
				});
				
				// 데이터를 반환합니다.
				on('getData', (params, ret) => {
					//REQUIRED: params
					//REQUIRED: params.storeName
					//OPTIONAL: params.target
					//REQUIRED: params.hash
					
					ret(dataManager.getData(params));
				});
				
				// 데이터를 수정합니다.
				on('updateData', (params, ret) => {
					//REQUIRED: params
					//REQUIRED: params.originHash
					//REQUIRED: params.signature
					//REQUIRED: params.hash
					//REQUIRED: params.data.storeName
					//OPTIONAL: params.data.target
					//REQUIRED: params.data.address
					//REQUIRED: params.data.createTime
					//REQUIRED: params.data.lastUpdateTime
					//OPTIONAL: params.isFromNode
					
					let originHash = params.originHash;
					let signature = params.signature;
					let hash = params.hash;
					let data = params.data;
					let isFromNode = params.isFromNode;
					
					let address = data.address;
					let lastUpdateTime = data.lastUpdateTime;
					
					// 5초 이내에 데이터가 수정된 경우에만 저장합니다.
					if (getNowUTC() - lastUpdateTime.getTime() < 5000) {
						
						// 데이터 작성자인지 검증합니다.
						if (DSide.Data.Verify({
							signature : signature,
							address : address,
							data : originHash
						}) === true) {
							
							let result = dataManager.updateData(params);
							
							// 성공적으로 수정되면 모든 노드에 전파
							if (isFromNode !== true && result.savedData !== undefined) {
								
								params.isFromNode = true;
								
								EACH(nodes, (node) => {
									node.send({
										methodName : 'updateData',
										data : params
									});
								});
							}
							
							ret(result);
						}
						
						else {
							ret({
								isNotVerified : true
							});
						}
					}
					
					else {
						ret({
							isTimeout : true
						});
					}
				});
				
				// 데이터를 삭제합니다.
				on('removeData', (params, ret) => {
					//REQUIRED: params
					//REQUIRED: params.storeName
					//OPTIONAL: params.target
					//REQUIRED: params.hash
					//REQUIRED: params.signature
					//REQUIRED: params.address
					//OPTIONAL: params.isFromNode
					
					let storeName = params.storeName;
					let target = params.target;
					let hash = params.hash;
					let signature = params.signature;
					let address = params.address;
					let isFromNode = params.isFromNode;
					
					// 데이터 작성자인지 검증합니다.
					if (DSide.Data.Verify({
						signature : signature,
						address : address,
						data : hash
					}) === true) {
						
						let result = dataManager.removeData(params);
						
						// 성공적으로 삭제되면 모든 노드에 전파
						if (isFromNode !== true && result.originData !== undefined) {
							
							params.isFromNode = true;
							
							EACH(nodes, (node) => {
								node.send({
									methodName : 'removeData',
									data : params
								});
							});
						}
						
						ret(result);
					}
					
					else {
						ret({
							isNotVerified : true
						});
					}
				});
				
				// 토큰의 잔고를 확인합니다.
				on('getTokenBalance', (address, ret) => {
					//REQUIRED: address
					
					ret(DSide.Data.TokenStore.getBalance(address));
				});
				
				// 토큰을 이체합니다.
				on('transferToken', (params, ret) => {
					//REQUIRED: params
					//REQUIRED: params.address
					//REQUIRED: params.hash
					//REQUIRED: params.to
					//REQUIRED: params.amount
					//OPTIONAL: params.isFromNode
					
					let isFromNode = params.isFromNode;
					
					if (DSide.Data.TokenStore.transfer(params) === true) {
						
						// 성공적으로 이체하면 모든 노드에 전파
						if (isFromNode !== true && result.originData !== undefined) {
							
							params.isFromNode = true;
							
							EACH(nodes, (node) => {
								node.send({
									methodName : 'transferToken',
									data : params
								});
							});
						}
						
						ret({
							isDone : true
						});
					}
					
					else {
						ret({
							isNotVerified : true
						});
					}
				});
			});
			
			// 토큰 스토어 싱크를 수행합니다.
			let syncTokenStore = (fastestSend) => {
				
				fastestSend('getTokenStoreHash', (hash) => {
					
					// 해시값이 다르면 데이터 싱크를 시작합니다.
					if (DSide.Data.TokenStore.getHash() !== hash) {
						
						fastestSend('getTokenAccounts', (tokenAccounts) => {
							
							// 토큰량을 비교하여 수정
							EACH(tokenAccounts, (balance, accountAddress) => {
								
								let _balance = DSide.Data.TokenStore.getBalance(accountAddress);
								
								if (_balance !== balance) {
									
									DSide.Data.TokenStore.increaseToken({
										address : accountAddress,
										amount : balance - _balance
									});
								}
							});
							
							// 노드에 없는 계정이면 삭제
							EACH(DSide.Data.TokenStore.getAccounts(), (balance, accountAddress) => {
								if (tokenAccounts[accountAddress] === undefined) {
									DSide.Data.TokenStore.removeAccount(accountAddress);
								}
							});
						});
					}
				});
			};
			
			// 데이터 스토어의 싱크를 수행합니다.
			let syncDataStore = (storeName, fastestSend) => {
				
				let dataStructure = dataStructures[storeName];
					
				fastestSend({
					methodName : 'getStoreHash',
					data : storeName
				}, (storeHash) => {
					
					// 해시값이 다르면 데이터 싱크를 시작합니다.
					if (dataManager.getStoreHash(storeName) !== storeHash) {
						
						// 대상이 필요한 경우
						if (dataStructure.type === 'TargetStore') {
							
							fastestSend({
								methodName : 'getDataSet',
								data : storeName
							}, (nodeDataSet) => {
								
								let dataSet = dataManager.getDataSet(storeName);
								
								// 데이터를 비교합니다.
								EACH(nodeDataSet, (hash, target) => {
									
									// 해시값이 다르면 내부 데이터를 비교합니다.
									if (dataSet[target] !== hash) {
										
										fastestSend({
											methodName : 'getDataSet',
											data : {
												storeName : storeName,
												target : target
											}
										}, (nodeDataSet) => {
											
											let dataSet = dataManager.getDataSet({
												storeName : storeName,
												target : target
											});
											
											// 현재 없는 데이터면 생성
											EACH(nodeDataSet, (data, hash) => {
												if (dataSet[hash] === undefined) {
													dataManager.saveData({
														hash : hash,
														data : data,
														isForSync : true
													});
												}
											});
											
											// 노드에 없는 데이터면 삭제
											EACH(dataSet, (data, hash) => {
												if (nodeDataSet[hash] === undefined) {
													dataManager.removeData({
														storeName : storeName,
														target : target,
														hash : hash
													});
												}
											});
										});
									}
								});
								
								// 노드에 없는 대상이면 삭제
								EACH(dataSet, (hash, target) => {
									if (nodeDataSet[target] === undefined) {
										dataManager.removeTarget({
											storeName : storeName,
											target : target
										});
									}
								});
							});
						}
						
						else {
							
							fastestSend({
								methodName : 'getDataSet',
								data : storeName
							}, (nodeDataSet) => {
								
								let dataSet = dataManager.getDataSet(storeName);
								
								// 현재 없는 데이터면 생성
								EACH(nodeDataSet, (data, hash) => {
									if (dataSet[hash] === undefined) {
										dataManager.saveData({
											hash : hash,
											data : data,
											isForSync : true
										});
									}
								});
								
								// 노드에 없는 데이터면 삭제
								EACH(dataSet, (data, hash) => {
									if (nodeDataSet[hash] === undefined) {
										dataManager.removeData({
											storeName : storeName,
											hash : hash
										});
									}
								});
							});
						}
					}
				});
			};
			
			let nodes = [];
			
			let createNodeClient = (ip, accountAddress, callback) => {
				
				CONNECT_TO_SOCKET_SERVER({
					host : ip,
					port : socketServerPort
				}, {
					error : () => {
						delete connectionTimes[accountAddress];
						delete ipInfos[ip];
					},
					success : (on, off, send, disconnect) => {
						
						send('getVersion', (nodeVersion) => {
							
							// 버전이 같아야합니다.
							if (nodeVersion === version) {
								
								let node = {
									accountAddress : accountAddress,
									on : on,
									off : off,
									send : send,
									disconnect : disconnect
								};
								
								nodes.push(node);
								
								on('__DISCONNECTED', () => {
									
									REMOVE({
										array : nodes,
										value : node
									});
									
									if (ipInfos[ip] !== undefined) {
										
										if (connectionTimes[accountAddress] === undefined) {
											connectionTimes[accountAddress] = 0;
										}
										
										connectionTimes[accountAddress] += Date.now() - ipInfos[ip].connectTime.getTime();
										
										delete ipInfos[ip];
									}
								});
								
								if (callback !== undefined) {
									callback(node);
								}
							}
							
							else {
								disconnect();
								
								delete connectionTimes[accountAddress];
								delete ipInfos[ip];
							}
						});
					}
				});
			};
			
			// 노드를 찾고 연결합니다.
			NEXT([
			(next) => {
				
				let isInitConnected = false;
				
				// 우선 모든 IP들에 연결을 시도합니다.
				EACH(initIps, (ip) => {
					
					CONNECT_TO_SOCKET_SERVER({
						host : ip,
						port : socketServerPort
					}, {
						error : () => {
							// 연결 오류를 무시합니다.
						},
						success : (on, off, send, disconnect) => {
							
							// 내 IP를 가져옵니다.
							send({
								methodName : 'getClientIp',
								data : ip
							}, (clientIp) => {
								
								// 내 스스로에는 연결 금지
								if (ip !== clientIp && clientIp.substring(0, 8) !== '192.168.') {
									
									if (isInitConnected !== true) {
										next(clientIp, send, disconnect);
										isInitConnected = true;
									}
									
									else {
										disconnect();
									}
								}
								
								else {
									disconnect();
								}
							});
						}
					});
				});
			},
			
			(next) => {
				return (clientIp, send, disconnect) => {
					
					// 실제로 연결된 IP들의 정보를 가져옵니다.
					send('getIpInfos', (result) => {
						
						ipInfos = result.ipInfos;
						connectionTimes = result.connectionTimes;
						
						let isFirst = true;
						
						// 노드들을 찾습니다.
						EACH(ipInfos, (info, ip) => {
							
							// 내 스스로에는 연결 금지
							if (ip !== clientIp) {
								
								createNodeClient(ip, info.accountAddress, (node) => {
									
									node.send({
										methodName : 'connectNode',
										data : accountAddress
									});
									
									// 첫 노드를 찾은 순간부터 데이터 싱크
									if (isFirst === true) {
										next();
										isFirst = false;
									}
								});
							}
							
							else {
								disconnect();
							}
						});
						
						// 현재 클라이언트 IP 정보를 추가
						ipInfos[clientIp] = {
							connectTime : new Date(),
							accountAddress : accountAddress
						};
						
						// 실제로 연결된 IP 목록들을 가져온 후에는 접속 종료
						disconnect();
					});
				};
			},
			
			() => {
				return () => {
					
					// 가장 빠른 노드로부터 데이터의 싱크를 맞춥니다.
					let fastestSend = (params, callback) => {
						if (nodes.length > 0) {
							nodes[0].send(params, callback);
						}
					};
					
					// 토큰 스토어 싱크
					syncTokenStore(fastestSend);
					
					// 데이터 스토어들 싱크
					EACH(dataStructures, (dataStructure, storeName) => {
						syncDataStore(storeName, fastestSend);
					});
				};
			}]);
			
			// 하루에 한 번 데이터를 통합합니다.
			INTERVAL(1, RAR(() => {
				
				let nowCal = CALENDAR(new Date(getNowUTC()));
				
				// 자정 정각이 되면 실행
				if (nowCal.getHour() === 0 && nowCal.getMinute() === 0 && nowCal.getSecond() === 0) {
					
					// 토큰 충전
					DSide.Data.TokenStore.chargeLacks();
					
					// 접속 시간에 따라 토큰 충전
					EACH(ipInfos, (info, ip) => {
						
						if (connectionTimes[info.accountAddress] === undefined) {
							connectionTimes[info.accountAddress] = 0;
						}
						
						connectionTimes[info.accountAddress] += Date.now() - info.connectTime.getTime();
						
						info.connectionTime = new Date();
					});
					
					EACH(connectionTimes, (connectionTime, accountAddress) => {
						DSide.Data.TokenStore.chargeNodeReward({
							address : accountAddress,
							connectionTime : connectionTime
						});
					});
					
					connectionTimes = {};
					
					// 데이터 통합
					
					// 토큰 데이터 통합
					let tokenStoreHash = DSide.Data.TokenStore.getHash();
					
					let hashWeights = {};
					hashWeights[tokenStoreHash] = DSide.Data.TokenStore.getBalance(accountAddress);
					
					let hashNodes = {};
					hashNodes[tokenStoreHash] = [];
					
					PARALLEL(nodes, [
					(node, done) => {
						
						let isDone = false;
						
						// 토큰 스토어 싱크
						node.send('getTokenStoreHash', (hash) => {
							
							if (isDone !== true) {
								
								if (hashWeights[hash] === undefined) {
									hashWeights[hash] = 0;
								}
								
								if (hashNodes[hash] === undefined) {
									hashNodes[hash] = [];
								}
								
								hashWeights[hash] += DSide.Data.TokenStore.getBalance(node.accountAddress);
								
								hashNodes[hash].push(node);
								
								done();
								isDone = true;
							}
						});
						
						// 타임아웃 5초
						DELAY(5, () => {
							if (isDone !== true) {
								done();
								isDone = true;
							}
						});
					},
					
					() => {
						
						let maxWeight = -1;
						let maxWeightHash;
						
						EACH(hashWeights, (hash, weight) => {
							
							if (maxWeight < weight) {
								weight = maxWeight;
								maxWeightHash = hash;
							}
						});
						
						syncTokenStore((params, callback) => {
							
							EACH(hashNodes[maxWeightHash], (node) => {
								if (CHECK_IS_IN({
									array : nodes,
									value : node
								}) === true) {
									
									node.send(params, callback);
									return false;
								}
							});
						});
					}]);
					
					// 모든 데이터 통합
					EACH(dataStructures, (dataStructure, storeName) => {
						
						let storeHash = dataManager.getStoreHash(storeName);
						
						let hashWeights = {};
						hashWeights[storeHash] = DSide.Data.TokenStore.getBalance(accountAddress);
						
						let hashNodes = {};
						hashNodes[storeHash] = [];
						
						PARALLEL(nodes, [
						(node, done) => {
							
							let isDone = false;
							
							// 데이터 스토어 싱크
							node.send({
								methodName : 'getStoreHash',
								data : storeName
							}, (hash) => {
								
								if (isDone !== true) {
									
									if (hashWeights[hash] === undefined) {
										hashWeights[hash] = 0;
									}
									
									if (hashNodes[hash] === undefined) {
										hashNodes[hash] = [];
									}
									
									hashWeights[hash] += DSide.Data.TokenStore.getBalance(node.accountAddress);
									
									hashNodes[hash].push(node);
									
									done();
									isDone = true;
								}
							});
							
							// 타임아웃 5초
							DELAY(5, () => {
								if (isDone !== true) {
									done();
									isDone = true;
								}
							});
						},
						
						() => {
							
							let maxWeight = -1;
							let maxWeightHash;
							
							EACH(hashWeights, (hash, weight) => {
								
								if (maxWeight < weight) {
									weight = maxWeight;
									maxWeightHash = hash;
								}
							});
							
							syncDataStore(storeName, (params, callback) => {
								
								EACH(hashNodes[maxWeightHash], (node) => {
									if (CHECK_IS_IN({
										array : nodes,
										value : node
									}) === true) {
										
										node.send(params, callback);
										return false;
									}
								});
							});
						}]);
					});
				}
			}));
		}
	};
});