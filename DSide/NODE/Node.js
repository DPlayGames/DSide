DSide.Node = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.tokenName
		//REQUIRED: params.ips
		//REQUIRED: params.port
		
		// 유저들의 토큰 정보를 저장하는 스토어
		let tokenStore;
		
		// 국제 표준시
		let now = new Date();
		let utc = now.getTime() + now.getTimezoneOffset() * 60000;
		now.setTime(utc);
		let nowCal = CALENDAR(now);
		
		console.log(nowCal.getYear());
		console.log(nowCal.getMonth());
		console.log(nowCal.getDate());
		console.log(nowCal.getHour());
		console.log(nowCal.getMinute());
		console.log(nowCal.getSecond());
	}
});