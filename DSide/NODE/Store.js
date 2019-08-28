DSide.Store = CLASS((cls) => {
	
	const ETHUtil = require('ethereumjs-util');
	
	let generateHash = cls.generateHash = (data) => {
		//REQUIRED: data
		
		let sortedData = {};
		Object.keys(data).sort().forEach((key) => {
			sortedData[key] = data[key];
		});
		
		return '0x' + ETHUtil.keccak256(STRINGIFY(sortedData)).toString('hex');
	};
	
	let stores = [];
	
	let getAllStores = cls.getAllStores = () => {
		return stores;
	};
	
	return {
		
		preset : (params) => {
			//REQUIRED: params
			//REQUIRED: params.dataStructure
			
			let dataStructure = params.dataStructure;
			
			dataStructure.id = {
				notEmpty : true,
				size : {
					max : 256
				}
			};
			
			dataStructure.accountId = {
				notEmpty : true,
				size : 42
			};
			
			dataStructure.createTime = {
				notEmpty : true,
				date : true
			};
			
			dataStructure.lastUpdateTime = {
				date : true
			};
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//REQUIRED: params.dataStructure
			
			let storeName = params.storeName;
			let dataStructure = params.dataStructure;
			
			stores.push(self);
			
			// 데이터 검증 오브젝트
			let valid = VALID(dataStructure);
			
			// 전체 데이터 세트
			let dataSet = {};
			
			// 저장되어있는 데이터들을 불러옵니다.
			READ_FILE({
				path : 'data/' + storeName + '.json',
				isSync : true
			}, {
				notExists : () => {
					// ignore.
				},
				success : (dataSetStr) => {
					
					dataSet = PARSE_STR(dataSetStr.toString());
					
					if (dataSet === undefined) {
						dataSet = {};
					}
				}
			});
			
			// 변경사항이 있는지
			let isEdited = false;
			
			// 모든 데이터를 가지고 만든 해쉬를 반환합니다.
			let getHash = self.getHash = () => {
				return generateHash(dataSet);
			};
			
			// 모든 데이터를 반환합니다.
			let getDataSet = self.getDataSet = () => {
				return dataSet;
			};
			
			// 데이터를 검증합니다.
			let checkValid = self.checkValid = (data) => {
				
				let result = valid.checkAndWash(data);
				
				return {
					isValid : result.checkHasError() !== true,
					validErrors : result.getErrors()
				};
			};
			
			// 데이터를 저장합니다.
			let saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				
				let id = params.id;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let accountId = data.accountId;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					// 데이터가 유효한지 검사합니다.
					if (createTime !== undefined && lastUpdateTime === undefined) {
						
						dataSet[id] = data;
						
						isEdited = true;
						
						// 데이터 저장 완료
						return {
							savedData : data
						};
					}
					
					// 유효하지 않은 데이터입니다.
					else {
						return {
							isNotVerified : true
						};
					}
				}
				
				// 데이터 검증에 실패했습니다.
				else {
					return {
						validErrors : validResult.validErrors
					};
				}
			};
			
			// 데이터를 가져옵니다.
			let getData = self.getData = (id) => {
				//REQUIRED: id
				
				return dataSet[id];
			};
			
			// 데이터를 수정합니다.
			let updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				
				let id = params.id;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let accountId = data.accountId;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					let originData = getData(id);
					if (originData !== undefined) {
						
						// 데이터가 유효한지 검사합니다.
						if (originData.createTime === createTime && lastUpdateTime !== undefined) {
							
							// 기존 데이터는 삭제합니다.
							removeData(id);
							
							dataSet[id] = data;
							
							isEdited = true;
							
							// 데이터 수정 완료
							return {
								originData : originData,
								savedData : data
							};
						}
						
						// 유효하지 않은 데이터입니다.
						else {
							return {
								isNotVerified : true
							};
						}
					}
					
					// 데이터가 존재하지 않습니다.
					else {
						return {
							isNotExists : true
						};
					}
				}
				
				// 데이터 검증에 실패했습니다.
				else {
					return {
						validErrors : validResult.validErrors
					};
				}
			};
			
			// 데이터를 삭제합니다.
			let removeData = self.removeData = (id) => {
				//REQUIRED: id
				
				let originData = getData(id);
				if (originData !== undefined) {
					
					delete dataSet[id];
					
					isEdited = true;
					
					// 데이터 삭제 완료
					return {
						originData : originData
					};
				}
				
				// 데이터가 존재하지 않습니다.
				else {
					return {
						isNotExists : true
					};
				}
			};
			
			// 10초에 한번씩 변경사항을 확인하여, 변경사항이 있는 경우 모든 데이터를 파일로 저장합니다.
			INTERVAL(10, () => {
				
				// 적절히 저장 시간을 분배합니다.
				DELAY(Math.random() * 10, () => {
					
					if (isEdited === true) {
						
						WRITE_FILE({
							path : 'data/' + storeName + '.json',
							content : STRINGIFY(dataSet)
						});
						
						isEdited = false;
					}
				});
			});
		}
	};
});