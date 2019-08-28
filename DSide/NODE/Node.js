DSide.Node = OBJECT((cls) => {
	
	const HARD_CODED_URLS = ['localhost:8814'];
	
	// 현재 국제 표준시를 밀리세컨드 단위로
	let getNowUTC = () => {
		
		// 국제 표준시
		let now = new Date();
		
		return now.getTime() + now.getTimezoneOffset() * 60000;
	};
	
	return {
		
		init : (inner, self) => {
			
			// 현재 노드의 URL
			let thisNodeURL;
			
			// 실제로 연결된 노드 URL 목록
			let nodeURLs = [];
			
			// 모든 클라이언트들의 send 함수
			let sendToClients = [];
			
			// 다른 노드가 연결할 서버를 생성합니다.
			WEB_SOCKET_SERVER(WEB_SERVER(CONFIG.DSide.port), (clientInfo, on, off, send, disconnect) => {
				
				let loginToken;
				let signedAccountId;
				
				// 모든 사용자들에게 전파합니다.
				let broadcast = (methodName, data) => {
					EACH(sendToClients, (sendToClient) => {
						
						// 현재 클라이언트는 제외
						if (sendToClient !== send) {
							
							sendToClient({
								methodName : methodName,
								data : data
							});
						}
					});
				};
				
				// 접속한 클라이언트의 IP를 반환합니다.
				on('getClientIp', (notUsing, ret) => {
					ret(clientInfo.ip);
				});
				
				// 실제로 연결된 노드 URL 목록을 반환합니다.
				on('getNodeURLs', (notUsing, ret) => {
					ret(nodeURLs.length === 0 ? HARD_CODED_URLS : nodeURLs);
				});
				
				// 노드의 버전을 반환합니다.
				on('getVersion', (notUsing, ret) => {
					ret(CONFIG.DSide.version);
				});
				
				// 노드의 현재 시간을 반환합니다.
				on('getNodeTime', (notUsing, ret) => {
					ret(getNowUTC());
				});
				
				// 로그인 토큰을 생성합니다.
				on('generateLoginToken', (notUsing, ret) => {
					ret(loginToken = RANDOM_STR(24));
				});
				
				// 로그인합니다.
				on('login', (params, ret) => {
					
					let hash = params.hash;
					let accountId = params.accountId;
					
					// hash가 정상적으로 서명되었는지 검증합니다.
					if (DSide.Verify({
						accountId : accountId,
						data : loginToken,
						hash : hash
					}) === true) {
						signedAccountId = accountId;
						
						ret(true);
					} else {
						ret(false);
					}
				});
				
				// 채팅 메시지를 저장합니다.
				on('sendChatMessage', (message) => {
					
					if (signedAccountId !== undefined && message !== undefined) {
						
						message = String(message).trim();
						
						if (message !== '') {
							
							// 모든 사용자들에게 전파합니다.
							broadcast('newChatMessage', {
								senderId : signedAccountId,
								//TODO: 추후 이름 기능 추가
								//senderName : ,
								message : message
							});
						}
					}
				});
				
				// 채팅 메시지들을 가져옵니다.
				on('getChatMessages', (subject, ret) => {
					//ret(DSide.ChatStore.getMessages());
				});
				
				sendToClients.push(send);
				on('__DISCONNECTED', () => {
					REMOVE({
						array : sendToClients,
						value : send
					});
				});
			});
			
			// 다른 노드에 연결합니다.
			let connectToNode = (url, callback) => {
				
				//TODO:
			};
			
			// 노드를 찾고 연결합니다.
			NEXT([
			
			// 하드코딩된 노드들의 URL로부터 최초 접속 노드를 찾습니다.
			(next) => {
				
				let isSomeNodeConnected = false;
				
				// 우선 하드코딩된 노드들의 URL에 연결을 시도합니다.
				EACH(HARD_CODED_URLS, (url) => {
					
					let splits = url.split(':');
					let host = splits[0];
					
					CONNECT_TO_WEB_SOCKET_SERVER({
						host : host,
						port : INTEGER(splits[1])
					}, {
						error : () => {
							// 연결 오류를 무시합니다.
						},
						success : (on, off, send, disconnect) => {
							
							if (isSomeNodeConnected !== true) {
								
								// 내 IP를 가져옵니다.
								send('getClientIp', (clientIp) => {
									
									// 내 스스로에는 연결 금지
									if (
									isSomeNodeConnected !== true &&
									host !== clientIp &&
									clientIp.substring(0, 8) !== '192.168.' &&
									clientIp !== '127.0.0.1' &&
									clientIp !== 'localhost') {
										
										// 실제로 연결된 노드 URL 목록을 가져옵니다.
										send('getNodeURLs', (urls) => {
											
											if (isSomeNodeConnected !== true) {
												
												// 현재 노드의 URL을 설정합니다.
												thisNodeURL = clientIp + ':' + CONFIG.DSide.port;
												
												next(urls);
												
												isSomeNodeConnected = true;
											}
											
											disconnect();
										});
									}
									
									else {
										disconnect();
									}
								});
							}
							
							else {
								disconnect();
							}
						}
					});
				});
			},
			
			// 최초 접속 노드로부터 모든 노드의 URL 목록을 가져와 연결합니다.
			(next) => {
				return (urls) => {
					
					// 모든 노드들에 연결합니다.
					EACH(urls, (url) => {
						
						// 현재 노드와는 연결하지 않습니다.
						if (url !== thisNodeURL) {
							
							connectToNode(url, (node) => {
								
								// 가장 빠른 노드와 데이터 싱크를 수행합니다.
								if (fastestNode === undefined) {
									fastestNode = node;
									next(fastestNode);
								}
							});
						}
					});
				};
			},
			
			// 가장 빠른 노드와 데이터 싱크를 수행합니다.
			() => {
				return (fastestNode) => {
					
					//TODO:
				};
			}]);
		}
	};
});