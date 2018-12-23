// 데이터를 저장하는 스토어
DSide('Data').Store = CLASS((cls) => {
	
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
			
			let getDataSet = self.getDataSet = () => {
				return dataSet;
			};
			
			let saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.hash
				//REQUIRED: params.data
				//REQUIRED: params.data.account
				
				let hash = params.hash;
				let data = params.data;
				let address = data.address;
				
				// 데이터를 저장하기 전 검증합니다.
				if (DSide.Data.Verify({
					signature : hash,
					address : address,
					data : data
				}) === true) {
					
					dataSet[hash] = data;
				}
			};
			
			let getData = self.getData = (hash) => {
				//REQUIRED: hash
				
				return dataSet[hash];
			};
			
			let updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.hash
				//REQUIRED: params.data
				//REQUIRED: params.account
				
				let originHash = params.originHash;
				let hash = params.hash;
				let data = params.data;
				let address = data.address;
				
				delete dataSet[originHash];
				
				// 데이터를 저장하기 전 검증합니다.
				if (DSide.Data.Verify({
					hash : hash,
					address : address,
					data : data
				}) === true) {
					dataSet[hash] = data;
				}
			};
			
			let removeData = self.removeData = (hash) => {
				//REQUIRED: hash
				
				delete dataSet[hash];
			};
		}
	};
});
