DSide.Node = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.tokenName
		//REQUIRED: params.port
		//REQUIRED: params.version
		//REQUIRED: params.accountAddress
		//REQUIRED: params.dataStructures
		//REQUIRED: params.ips
		
		let tokenName = params.tokenName;
		let port = params.port;
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
		SOCKET_SERVER(port, (clientInfo, on, off, send, disconnect) => {
			
			// 접속한 클라이언트의 IP를 반환합니다.
			on('getClientIp', (notUsing, ret) => {
				ret(clientInfo.ip);
			});
			
			// 실제로 연결된 IP들을 반환합니다.
			// 없는 경우 초기 연결할 IP들을 반환합니다.
			on('getIps', (notUsing, ret) => {
				ret(ips === undefined ? initIps : inps);
			});
			
			// 데이터 저장소의 Hash를 반환합니다.
			on('getStoreHash', (storeName, ret) => {
				ret(dataManager.getStoreHash(storeName));
			});
			
			// 데이터 목록을 반환합니다.
			on('getDataSet', (params, ret) => {
				ret(dataManager.getDataSet(params));
			});
			
			// 데이터를 저장합니다.
			on('saveData', (params, ret) => {
				dataManager.saveData(params);
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
					port : port
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
								port : port
							}, {
								error : () => {
									// 연결 오류를 무시합니다.
								},
								success : (on, off, send, disconnect) => {
									
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
				EACH(dataManager.getStoreNames(), (storeName) => {
					
					getFastestNode((fastestNode) => {
						
						fastestNode.send({
							methodName : 'getStoreHash',
							data : storeName
						}, (storeHash) => {
							
							console.log(storeHash);
						});
					});
				});
			};
		}]);
	}
});