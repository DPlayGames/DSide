// 일정 시간이 지난 후 데이터가 삭제되는 스토어
DSide('Data').TimeoutStore = CLASS((cls) => {
	
	// 현재 국제 표준시를 밀리세컨드 단위로
	let getNowUTC = () => {
		
		// 국제 표준시
		let now = new Date();
		
		return now.getTime() + now.getTimezoneOffset() * 60000
	};
	
	return {
	
		preset : () => {
			return DSide.Data.Store;
		},
	
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.timelimit (초)
			
			let timelimit = params.timelimit;
			
			INTERVAL(1, () => {
				
				EACH(self.getDataSet(), (data, hash) => {
					
					if (getNowUTC() - data.createTime.getTime() > timelimit * 1000) {
						
						self.remove(hash);
					}
				});
			});
		}
	};
});
