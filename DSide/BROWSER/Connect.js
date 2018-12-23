DSide.Connect = METHOD({
	
	run : (params, connectionListenerOrListeners) => {
		//REQUIRED: params
		//REQUIRED: params.port
		//REQUIRED: params.ips
		//REQUIRED: connectionListenerOrListeners
		//REQUIRED: connectionListenerOrListeners.success
		//OPTIONAL: connectionListenerOrListeners.error
		
		let port = params.port;
		let initIps = params.ips;
		
		let connectionListener;
		let errorListener;

		if (CHECK_IS_DATA(connectionListenerOrListeners) !== true) {
			connectionListener = connectionListenerOrListeners;
		} else {
			connectionListener = connectionListenerOrListeners.success;
			errorListener = connectionListenerOrListeners.error;
		}
		
		let ips;
		
		let node;
		
		// 우선 모든 IP들에 연결을 시도합니다.
		EACH(initIps, (ip) => {
			
			CONNECT_TO_WEB_SOCKET_SERVER({
				host : ip,
				port : port
			}, {
				error : () => {
					// 연결 오류를 무시합니다.
				},
				success : (on, off, send, disconnect) => {
					
					// 실제로 연결된 IP 목록들을 가져옵니다.
					send('getIps', (_ips) => {
						ips = _ips;
						
						// 노드들을 찾습니다.
						EACH(ips, (ip) => {
							
							CONNECT_TO_WEB_SOCKET_SERVER({
								host : ip,
								port : port
							}, {
								error : () => {
									// 연결 오류를 무시합니다.
								},
								success : (on, off, send, disconnect) => {
									
									// 가장 빠르게 접속한 노드를 연결
									if (node === undefined) {
										
										send('getNowUTC', (nodeTime) => {
											
											if (node === undefined) {
												
												node = DSide.Node({
													on : on,
													off : off,
													send : send,
													disconnect : disconnect,
													timeDiff : Date.now() - nodeTime
												});
												
												connectionListener(node);
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
						
						// 실제로 연결된 IP 목록들을 가져온 후에는 접속 종료
						disconnect();
					});
				}
			});
		});
	}
});
