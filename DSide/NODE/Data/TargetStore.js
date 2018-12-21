// 데이터의 타겟이 존재하는 스토어
DSide('Data').TargetStore = CLASS((cls) => {
	
	const ETHUtil = require('ethereumjs-util');
	
	return {
		
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
			
			let getHash = self.getHash = () => {
				return '0x' + ETHUtil.keccak256(STRINGIFY(dataSet)).toString('hex');
			};
			
			let getDataSet = self.getDataSet = (target) => {
				//OPTIONAL: target
				
				//TODO:
			};
			
			let saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.signature
				//REQUIRED: params.account
				//REQUIRED: params.data
				
				let target = params.target;
				let signature = params.signature;
				let address = params.address;
				let data = params.data;
				
				// 데이터를 저장하기 전 검증합니다.
				if (DSide.Data.Verify({
					signature : signature,
					address : address,
					data : data
				}) === true) {
					
					//TODO:
				}
			};
		}
	};
});
