// 유저들의 토큰 정보를 담고 있는 특수 스토어
DSide('Data').TokenStore = OBJECT({
	
	init : (inner, self) => {
		
		let dataSet = {};
		
		let isToSave = false;
		
		// 이미 저장된 데이터들을 불러옵니다.
		READ_FILE({
			path : 'data/Token.json',
			isSync : true
		}, {
			notExists : () => {
				// ignore.
			},
			success : (dataSetStr) => {
				dataSet = PARSE_STR(dataSetStr.toString());
			}
		});
		
		let useToken = self.useToken = (params) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.amount
			
			let address = params.address;
			let amount = params.amount;
		};
	}
});
