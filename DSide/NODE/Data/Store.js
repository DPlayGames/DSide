// 데이터를 저장하는 스토어
DSide('Data').Store = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.structure
		
		let storeName = params.storeName;
		let structure = params.structure;
		
		let dataSet = {};
		
		// 이미 저장된 데이터들을 불러옵니다.
		READ_FILE({
			path : 'data/' + storeName + '.json',
			isSync : true
		}, {
			notExists : () => {
				// ignore.
			},
			success : (dataSetStr) => {
				dataSet = PARSE_STR(dataSetStr.toString());
			}
		});
		
		console.log(dataSet);
	}
});
