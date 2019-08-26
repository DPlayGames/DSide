DSide.Node = OBJECT((cls) => {
	
	// 현재 국제 표준시를 밀리세컨드 단위로
	let getNowUTC = () => {
		
		// 국제 표준시
		let now = new Date();
		
		return now.getTime() + now.getTimezoneOffset() * 60000;
	};
	
	return {
		
		init : (inner, self) => {
			
			// 다른 노드가 연결할 서버를 생성합니다.
			WEB_SOCKET_SERVER(WEB_SERVER(CONFIG.DSide.port), (clientInfo, on, off, send, disconnect) => {
				
				// 접속한 클라이언트의 IP를 반환합니다.
				on('getClientIp', (ip, ret) => {
					ret(clientInfo.ip);
				});
			});
		}
	};
});