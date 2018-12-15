DSide.Node = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.tokenName
		//REQUIRED: params.port
		//REQUIRED: params.version
		//REQUIRED: params.ips
		
		let tokenName = params.tokenName;
		let port = params.port;
		let version = params.version;
		let ips = params.ips;
		
		// 유저들의 토큰 정보를 저장하는 스토어
		let tokenStore;
		
		// 국제 표준시
		let now = new Date();
		let utc = now.getTime() + now.getTimezoneOffset() * 60000;
		now.setTime(utc);
		let nowCal = CALENDAR(now);
		
		/*console.log(nowCal.getYear());
		console.log(nowCal.getMonth());
		console.log(nowCal.getDate());
		console.log(nowCal.getHour());
		console.log(nowCal.getMinute());
		console.log(nowCal.getSecond());*/
		
		SOCKET_SERVER(port, (clientInfo, on, off, send, disconnect) => {
			
			console.log('client connected.', clientInfo);
	
			let roles = [];
	
			on('message', (data, ret) => {
				ret('Thanks!');
			});
	
			send({
				methodName : 'message',
				data : {
					msg : 'message from server.'
				}
			}, (retMsg) => {
				console.log(retMsg);
			});
	
			send({
				methodName : 'message',
				data : {
					msg : 'message from server.'
				}
			});
	
			on('login', (data) => {
				if (data !== undefined && data.username === 'test' && data.password === '1234') {
					roles.push('USER');
				}
			});
	
			on('checkRole', (role) => {
	
				if (role !== undefined && CHECK_IS_IN({
					data : roles,
					value : role
				}) === true) {
					console.log(role);
				}
			});
	
			// when disconnected
			on('__DISCONNECTED', () => {
				console.log('client disconnected.', clientInfo);
			});
		});
		
		//TODO: 우선 모든 IP들에 연결을 시도합니다. (본인 계정 제외)
		
		//TODO: 이후 IP 목록들을 다시 가져옵니다.
		
		//TODO: 이후 가장 빠른 커넥터를 찾습니다.
		
		EACH(ips, (ip) => {
			
			CONNECT_TO_SOCKET_SERVER({
				host : ip,
				port : port
			}, {
				error : (errorMsg) => {
					console.log('ERROR!', errorMsg);
				},
				success : (on, off, send, disconnect) => {
		
					on('message', (data, ret) => {
						ret('Thanks!');
					});
		
					send({
						methodName : 'message',
						data : {
							msg : 'message from client.'
						}
					}, (retMsg) => {
						console.log(retMsg);
					});
		
					send({
						methodName : 'message',
						data : {
							msg : 'message from client.'
						}
					});
		
					send({
						methodName : 'login',
						data : {
							username : 'test',
							password : '1234'
						}
					});
		
					DELAY(1, () => {
		
						send({
							methodName : 'checkRole',
							data : 'USER'
						});
					});
		
					// when disconnected
					on('__DISCONNECTED', () => {
						console.log('DISCONNECTED!');
					});
					
					DELAY(3, disconnect);
				}
			});
		});
	}
});