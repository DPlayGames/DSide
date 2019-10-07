DSide.SecureStore = CLASS((cls) => {
	
	const ETHUtil = require('ethereumjs-util');
	
	let stores = {};
	
	let getAllStores = cls.getAllStores = () => {
		return stores;
	};
	
	return {
		
		preset : (params) => {
			//REQUIRED: params
			//REQUIRED: params.dataStructure
			
			let dataStructure = params.dataStructure;
			
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
			
			stores[storeName] = self;
			
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
				return DSide.Store.generateHash(dataSet);
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
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let data = params.data;
				let hash = params.hash;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let accountId = data.accountId;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					accountId = ETHUtil.toChecksumAddress(accountId);
					
					// 데이터가 유효한지 검사합니다.
					if (
					createTime !== undefined &&
					
					// 5초 이내에 데이터가 작성된 경우에만 저장합니다.
					DSide.Node.getNowUTC() - createTime.getTime() < 5000 &&
					
					lastUpdateTime === undefined &&
					
					dataSet[hash] === undefined &&
					
					DSide.Verify({
						accountId : accountId,
						data : data,
						hash : hash
					}) === true) {
						
						dataSet[hash] = data;
						
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
			
			// 데이터의 싱크를 맞춥니다.
			let syncData = self.syncData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let data = params.data;
				let hash = params.hash;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let accountId = data.accountId;
					let createTime = data.createTime;
					
					accountId = ETHUtil.toChecksumAddress(accountId);
					
					// 데이터가 유효한지 검사합니다.
					// 이 때는 수정일이 존재할 수 있습니다.
					if (createTime !== undefined && DSide.Verify({
						accountId : accountId,
						data : data,
						hash : hash
					}) === true) {
						
						dataSet[hash] = data;
						
						isEdited = true;
					}
				}
			};
			
			// 데이터를 가져옵니다.
			let getData = self.getData = (hash) => {
				//REQUIRED: hash
				
				return dataSet[hash];
			};
			
			// 데이터를 수정합니다.
			let updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let originHash = params.originHash;
				let data = params.data;
				let hash = params.hash;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let accountId = data.accountId;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					accountId = ETHUtil.toChecksumAddress(accountId);
					
					let originData = getData(originHash);
					if (originData !== undefined) {
						
						// 데이터가 유효한지 검사합니다.
						if (
						createTime.getTime() === originData.createTime.getTime() &&
						
						lastUpdateTime !== undefined &&
						
						// 5초 이내에 데이터가 수정된 경우에만 저장합니다.
						DSide.Node.getNowUTC() - lastUpdateTime.getTime() < 5000 &&
						
						accountId === originData.accountId &&
						
						DSide.Verify({
							accountId : accountId,
							data : data,
							hash : hash
						}) === true) {
							
							// 기존 데이터는 삭제합니다.
							dropData(originHash);
							
							dataSet[hash] = data;
							
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
			let removeData = self.removeData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.hash
				//REQUIRED: params.checkHash
				
				let hash = params.hash;
				let checkHash = params.checkHash;
				
				let originData = getData(hash);
				if (originData !== undefined) {
					
					if (DSide.Verify({
						accountId : originData.accountId,
						data : hash,
						hash : checkHash
					}) === true) {
						
						dropData(hash);
						
						// 데이터 삭제 완료
						return {
							originData : originData
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
			};
			
			// 데이터를 삭제합니다.
			let dropData = self.dropData = (hash) => {
				//REQUIRED: hash
				
				let originData = getData(hash);
				if (originData !== undefined) {
					
					delete dataSet[hash];
					
					isEdited = true;
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