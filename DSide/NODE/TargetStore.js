DSide.TargetStore = CLASS((cls) => {
	
	let stores = {};
	
	let getAllStores = cls.getAllStores = () => {
		return stores;
	};
	
	return {
		
		preset : (params) => {
			//REQUIRED: params
			//REQUIRED: params.dataStructure
			
			let dataStructure = params.dataStructure;
			
			dataStructure.target = {
				notEmpty : true,
				size : {
					max : 256
				}
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
			
			// 전체 대상 해시 셋
			let targetHashSet = {};
			
			// 저장되어있는 대상 해시 셋을 불러옵니다.
			READ_FILE({
				path : 'data/' + storeName + '.json',
				isSync : true
			}, {
				notExists : () => {
					// ignore.
				},
				success : (targetHashSetStr) => {
					
					targetHashSet = PARSE_STR(targetHashSetStr.toString());
					
					if (targetHashSet === undefined) {
						targetHashSet = {};
					}
				}
			});
			
			// 대상 해시 셋에 변경사항이 있는지
			let isTargetHashSetEdited = false;
			
			// 데이터 검증 오브젝트
			let valid = VALID(dataStructure);
			
			// 전체 데이터 맵
			let dataMap = {};
			
			EACH(targetHashSet, (hash, target) => {
				
				// 저장되어있는 데이터들을 불러옵니다.
				READ_FILE({
					path : 'data/' + storeName + '/' + target + '.json',
					isSync : true
				}, {
					notExists : () => {
						// ignore.
					},
					success : (dataSetStr) => {
						dataMap[target] = PARSE_STR(dataSetStr.toString());
					}
				});
			});
			
			// 변경사항이 있는지
			let isEditeds = {};
			
			// 모든 데이터를 가지고 만든 해쉬를 반환합니다.
			let getHash = self.getHash = () => {
				return DSide.Store.generateHash(dataMap);
			};
			
			// 대상 해시 셋을 가지고 만든 해쉬를 반환합니다.
			let getTargetHash = self.getTargetHash = (target) => {
				//REQUIRED: target
				
				return DSide.Store.generateHash(getDataSet(target));
			};
			
			// 모든 데이터를 반환합니다.
			let getDataSet = self.getDataSet = (target) => {
				//REQUIRED: target
				
				return dataMap[target] === undefined ? {} : dataMap[target];
			};
			
			// 모든 대상 해시 셋을 반환합니다.
			let getTargetHashSet = self.getTargetHashSet = () => {
				return targetHashSet;
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
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.createTime
				
				let id = params.id;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let target = data.target;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					// 데이터가 유효한지 검사합니다.
					if (createTime !== undefined && lastUpdateTime === undefined) {
						
						if (dataMap[target] === undefined) {
							dataMap[target] = {};
						}
						
						if (dataMap[target][id] === undefined) {
							
							dataMap[target][id] = data;
							
							isEditeds[target] = true;
							
							// 데이터가 변경되면 대상의 해시값도 변경됩니다.
							targetHashSet[target] = getHash(target);
							
							isTargetHashSetEdited = true;
							
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
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				
				let id = params.id;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let target = data.target;
					let createTime = data.createTime;
					
					// 데이터가 유효한지 검사합니다.
					// 이 때는 수정일이 존재할 수 있습니다.
					if (createTime !== undefined) {
						
						if (dataMap[target] === undefined) {
							dataMap[target] = {};
						}
						
						dataMap[target][id] = data;
						
						isEditeds[target] = true;
						
						// 데이터가 변경되면 대상의 해시값도 변경됩니다.
						targetHashSet[target] = getHash(target);
						
						isTargetHashSetEdited = true;
					}
				}
			};
			
			// 데이터를 가져옵니다.
			let getData = self.getData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.id
				
				let target = params.target;
				let id = params.id;
				
				if (dataMap[target] !== undefined) {
					return dataMap[target][id];
				}
			};
			
			// 데이터를 수정합니다.
			let updateData = self.updateData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				
				let id = params.id;
				let data = params.data;
				
				let validResult = checkValid(data);
				
				// 데이터를 저장하기 전 검증합니다.
				if (validResult.isValid === true) {
					
					let target = data.target;
					let createTime = data.createTime;
					let lastUpdateTime = data.lastUpdateTime;
					
					let originData = getData({
						target : target,
						id : id
					});
					
					if (originData !== undefined) {
						
						// 데이터가 유효한지 검사합니다.
						if (createTime === originData.createTime && lastUpdateTime !== undefined && target === originData.target) {
							
							// 기존 데이터는 삭제합니다.
							removeData({
								target : target,
								id : id
							});
							
							if (dataMap[target] === undefined) {
								dataMap[target] = {};
							}
							
							dataMap[target][id] = data;
							
							isEditeds[target] = true;
							
							// 데이터가 변경되면 대상의 해시값도 변경됩니다.
							targetHashSet[target] = getHash(target);
							
							isTargetHashSetEdited = true;
							
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
				//REQUIRED: params.target
				//REQUIRED: params.id
				
				let originData = getData(params);
				if (originData !== undefined) {
					
					let target = params.target;
					let id = params.id;
					
					// 존재하지 않는 대상이면 대상을 삭제합니다.
					if (dataMap[target] === undefined) {
						removeTarget(target);
					}
					
					else {
						
						delete dataMap[target][id];
						
						// 빈 대상이면 대상을 삭제합니다.
						if (CHECK_IS_EMPTY_DATA(dataMap[target]) === true) {
							removeTarget(target);
						}
						
						else {
							
							targetHashSet[target] = getHash(target);
							
							// 데이터가 변경되면 대상의 해시값도 변경됩니다.
							isTargetHashSetEdited = true;
							
							isEditeds[target] = true;
						}
					}
					
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
			
			// 대상을 삭제합니다.
			let removeTarget = self.removeTarget = (target) => {
				//REQUIRED: target
				
				delete dataMap[target];
				delete targetHashSet[target];
				
				// 데이터가 변경되면 대상의 해시값도 변경됩니다.
				isTargetHashSetEdited = true;
				
				isEditeds[target] = true;
			};
			
			// 10초에 한번씩 변경사항을 확인하여, 변경사항이 있는 경우 모든 데이터를 파일로 저장합니다.
			INTERVAL(10, () => {
				
				EACH(isEditeds, (notUsing, target) => {
					
					// 적절히 저장 시간을 분배합니다.
					DELAY(Math.random() * 10, () => {
						
						if (isEditeds[target] === true) {
							
							if (dataMap[target] === undefined) {
								REMOVE_FILE('data/' + storeName + '/' + target + '.json');
							}
							
							else {
								
								WRITE_FILE({
									path : 'data/' + storeName + '/' + target + '.json',
									content : STRINGIFY(dataMap[target])
								});
							}
							
							delete isEditeds[target];
						}
					});
				});
			});
			
			// 10초에 한번씩 해시 셋의 변경사항을 확인하여, 변경사항이 있는 경우 모든 해시 셋을 파일로 저장합니다.
			INTERVAL(10, () => {
				
				// 적절히 저장 시간을 분배합니다.
				DELAY(Math.random() * 10, () => {
					
					if (isTargetHashSetEdited === true) {
						
						WRITE_FILE({
							path : 'data/' + storeName + '.json',
							content : STRINGIFY(targetHashSet)
						});
						
						isTargetHashSetEdited = false;
					}
				});
			});
		}
	};
});
