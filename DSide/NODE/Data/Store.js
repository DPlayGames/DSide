// 데이터를 저장하는 스토어
DSide('Data').Store = CLASS((cls) => {
	
	const ETHUtil = require('ethereumjs-util');
	
	let generateHash = cls.generateHash = (data) => {
		//REQUIRED: data
		
		return '0x' + ETHUtil.keccak256(STRINGIFY(data)).toString('hex');
	};
	
	return {
		
		preset : (params) => {
			//REQUIRED: params
			//REQUIRED: params.structure
			
			let structure = params.structure;
			
			structure.storeName = {
				notEmpty : true,
				size : {
					max : 256
				}
			};
			
			structure.address = {
				notEmpty : true,
				size : 42
			};
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//REQUIRED: params.structure
			
			let storeName = params.storeName;
			let structure = params.structure;
			
			let valid = VALID(structure);
			
			let dataSet = {};
			
			let isToSave = false;
			
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
				return generateHash(dataSet);
			};
			
			let getDataSet = self.getDataSet = () => {
				return dataSet;
			};
			
			let checkValid = self.checkValid = (data) => {
				
				let result = valid.checkAndWash(data);
				
				return {
					isValid : result.checkHasError() !== true,
					validErrors : result.getErrors()
				};
			};
			
			let saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.hash
				//REQUIRED: params.data
				//REQUIRED: params.data.account
				
				let hash = params.hash;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				if (validResult.isValid === true) {
					
					let address = data.address;
					
					// 데이터를 저장하기 전 검증합니다.
					if (data.lastUpdateTime === undefined && DSide.Data.Verify({
						signature : hash,
						address : address,
						data : data
					}) === true) {
						
						dataSet[hash] = data;
						
						isToSave = true;
						
						return {
							savedData : data
						};
					}
					
					else {
						return {
							isNotVerified : true
						};
					}
				}
				
				else {
					return {
						validErrors : validResult.validErrors
					};
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
				//REQUIRED: params.data.account
				//REQUIRED: params.data.createTime
				
				let originHash = params.originHash;
				let hash = params.hash;
				let data = params.data;
				
				let address = data.address;
				let createTime = data.createTime;
				
				let originData = getData(originHash);
				
				// 데이터를 저장하기 전 검증합니다.
				if (originData !== undefined && originData.createTime === createTime && DSide.Data.Verify({
					hash : hash,
					address : address,
					data : data
				}) === true) {
					
					removeData(originHash);
					
					dataSet[hash] = data;
					
					isToSave = true;
				}
			};
			
			let removeData = self.removeData = (hash) => {
				//REQUIRED: hash
				
				delete dataSet[hash];
				
				isToSave = true;
			};
			
			let setToSave = inner.setToSave = () => {
				isToSave = true;
			};
			
			// 10초에 한번씩 데이터 저장
			INTERVAL(10, () => {
				
				if (isToSave === true) {
					
					WRITE_FILE({
						path : 'data/' + storeName + '.json',
						content : STRINGIFY(dataSet)
					});
					
					isToSave = false;
				}
			});
		}
	};
});
