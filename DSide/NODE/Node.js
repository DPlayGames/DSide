DSide.Node = CLASS((cls) => {
	
	// 현재 국제 표준시를 밀리세컨드 단위로
	let getNowUTC = () => {
		
		// 국제 표준시
		let now = new Date();
		
		return now.getTime() + now.getTimezoneOffset() * 60000
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
			
			// 실제로 연결된 IP들
			let ips;
			
			// 다른 노드가 연결할 서버를 생성합니다.
			MULTI_PROTOCOL_SOCKET_SERVER({
				socketServerPort : socketServerPort,
				webServer : WEB_SERVER(webSocketServerPort)
			}, (clientInfo, on, off, send, disconnect) => {
				
				// 접속한 클라이언트의 IP를 반환합니다.
				on('getClientIp', (notUsing, ret) => {
					ret(clientInfo.ip);
				});
				
				// 노드의 버전을 반환합니다.
				on('getVersion', (notUsing, ret) => {
					ret(version);
				});
				
				// 노드의 현재 시간을 반환합니다.
				on('getNowUTC', (notUsing, ret) => {
					ret(getNowUTC());
				});
				
				// 실제로 연결된 IP들을 반환합니다.
				// 없는 경우 초기 연결할 IP들을 반환합니다.
				on('getIps', (notUsing, ret) => {
					ret(ips === undefined ? initIps : ips);
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
					
					let data = params.data;
					
					let createTime = data.createTime;
					
					// 5초 이내에 데이터가 작성된 경우에만 저장합니다.
					if (getNowUTC() - createTime.getTime() < 5000) {
						
						// 데이터 검증은 Store가 알아서 합니다.
						dataManager.saveData(params);
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
					
					let originHash = params.originHash;
					let signature = params.signature;
					let hash = params.hash;
					let data = params.data;
					
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
							dataManager.updateData(params);
						}
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
					
					let storeName = params.storeName;
					let target = params.target;
					let hash = params.hash;
					let signature = params.signature;
					let address = params.address;
					
					// 데이터 작성자인지 검증합니다.
					if (DSide.Data.Verify({
						signature : signature,
						address : address,
						data : hash
					}) === true) {
						dataManager.removeData(params);
					}
				});
			});
			
			let nodes = [];
			
			// 노드를 찾고 연결합니다.
			NEXT([
			(next) => {
				
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
							
							send('getClientIp', (clientIp) => {
								
								if (ips === undefined) {
									next(clientIp, send, disconnect);
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
					
					// IPv6 to IPv4
					if (clientIp.substring(0, 7) === '::ffff:') {
						clientIp = clientIp.substring(7);
					}
					
					// 내 스스로에는 연결 금지
					if (true) { //TODO: 테스트용
					//if (ip !== clientIp) {
						
						// 실제로 연결된 IP 목록들을 가져옵니다.
						send('getIps', (_ips) => {
							ips = _ips;
							
							// 노드들을 찾습니다.
							EACH(ips, (ip) => {
								
								CONNECT_TO_SOCKET_SERVER({
									host : ip,
									port : socketServerPort
								}, {
									error : () => {
										// 연결 오류를 무시합니다.
									},
									success : (on, off, send, disconnect) => {
										
										send('getVersion', (nodeVersion) => {
											
											// 버전이 같아야합니다.
											if (nodeVersion === version) {
												
												let node = {
													on : on,
													off : off,
													send : send,
													disconnect : disconnect
												};
												
												// 빠르게 접속된 순서대로 저장
												nodes.push(node);
												
												// 첫 노드를 찾은 순간부터 데이터 싱크
												if (nodes.length === 1) {
													next();
												}
												
												on('__DISCONNECTED', () => {
													REMOVE({
														array : nodes,
														value : node
													});
												});
											}
											
											else {
												disconnect();
											}
										});
									}
								});
							});
							
							// 실제로 연결된 IP 목록들을 가져온 후에는 접속 종료
							disconnect();
						});
					}
					
					else {
						disconnect();
					}
				};
			},
			
			() => {
				return () => {
					
					let getFastestNode = (callback) => {
						if (nodes.length > 0) {
							callback(nodes[0]);
						}
					};
					
					// 가장 빠른 노드로부터 데이터의 싱크를 맞춥니다.
					EACH(dataStructures, (dataStructure, storeName) => {
						
						getFastestNode((fastestNode) => {
							
							fastestNode.send({
								methodName : 'getStoreHash',
								data : storeName
							}, (storeHash) => {
								
								// 해시값이 다르면 데이터 싱크를 시작합니다.
								if (dataManager.getStoreHash(storeName) !== storeHash) {
									
									// 대상이 필요한 경우
									if (dataStructure.type === 'TargetStore') {
										
										fastestNode.send({
											methodName : 'getDataSet',
											data : storeName
										}, (nodeDataSet) => {
											
											let dataSet = dataManager.getDataSet(storeName);
											
											// 데이터를 비교합니다.
											EACH(nodeDataSet, (hash, target) => {
												
												// 해시값이 다르면 내부 데이터를 비교합니다.
												if (dataSet[target] !== hash) {
													
													fastestNode.send({
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
																	data : data
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
										
										fastestNode.send({
											methodName : 'getDataSet',
											data : storeName
										}, (nodeDataSet) => {
											
											let dataSet = dataManager.getDataSet(storeName);
											
											// 현재 없는 데이터면 생성
											EACH(nodeDataSet, (data, hash) => {
												if (dataSet[hash] === undefined) {
													dataManager.saveData({
														hash : hash,
														data : data
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
						});
					});
				};
			}]);
		}
	};
});