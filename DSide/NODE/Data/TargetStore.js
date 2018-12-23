// 데이터의 타겟이 존재하는 스토어
DSide('Data').TargetStore = CLASS({
	
	preset : (params) => {
		//REQUIRED: params
		//REQUIRED: params.structure
		
		let structure = params.structure;
		
		structure.target = {
			notEmpty : true,
			size : {
				max : 256
			}
		};
		
		return DSide.Data.Store;
	},
	
	init : (inner, self) => {
		
		let dataSet = self.getDataSet();
		
		let targetDataSet = {};
		
		EACH(dataSet, (hash, target) => {
			
			// 이미 저장된 데이터들을 불러옵니다.
			READ_FILE({
				path : 'data/' + storeName + '/' + target + '.json',
				isSync : true
			}, {
				notExists : () => {
					// ignore.
				},
				success : (dataSetStr) => {
					targetDataSet[target] = PARSE_STR(dataSetStr.toString());
				}
			});
		});
		
		let isToSaveSet = {};
		
		let saveTargetHash = (target) => {
			if (targetDataSet[target] === undefined) {
				delete dataSet[target];
			} else {
				dataSet[target] = DSide.Data.Store.generateHash(targetDataSet[target]);
			}
			
			isToSaveSet[target] = true;
			
			inner.setToSave();
		};
		
		let getDataSet;
		OVERRIDE(self.getDataSet, (origin) => {
			
			getDataSet = self.getDataSet = (target) => {
				//OPTIONAL: target
				
				if (target !== undefined) {
					return targetDataSet[target] === undefined ? {} : targetDataSet[target];
				}
				
				return origin();
			};
		});
		
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.hash
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.account
				
				let hash = params.hash;
				let data = params.data;
				
				let target = data.target;
				let address = data.address;
				
				// 데이터를 저장하기 전 검증합니다.
				if (DSide.Data.Verify({
					signature : hash,
					address : address,
					data : data
				}) === true) {
					
					if (targetDataSet[target] === undefined) {
						targetDataSet[target] = {};
					}
					
					targetDataSet[target][hash] = data;
					
					saveTargetHash(target);
				}
			};
		});
		
		let getData;
		OVERRIDE(self.getData, (origin) => {
			
			getData = self.getData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.hash
				
				let target = params.target;
				let hash = params.hash;
				
				if (targetDataSet[target] !== undefined) {
					return targetDataSet[target][hash];
				}
			};
		});
		
		let updateData;
		OVERRIDE(self.updateData, (origin) => {
			
			updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.hash
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.account
				
				let originHash = params.originHash;
				let hash = params.hash;
				let data = params.data;
				
				let target = data.target;
				let address = data.address;
				
				// 데이터를 저장하기 전 검증합니다.
				if (DSide.Data.Verify({
					signature : hash,
					address : address,
					data : data
				}) === true) {
					
					if (targetDataSet[target] === undefined) {
						targetDataSet[target] = {};
					} else {
						delete targetDataSet[target][originHash];
					}
					
					targetDataSet[target][hash] = data;
					
					saveTargetHash(target);
				}
			};
		});
		
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			removeData = self.removeData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.hash
				
				let target = params.target;
				let hash = params.hash;
				
				if (targetDataSet[target] !== undefined) {
					delete targetDataSet[target][hash];
					
					if (CHECK_IS_EMPTY_DATA(targetDataSet[target]) === true) {
						delete targetDataSet[target];
					}
					
					saveTargetHash(target);
				}
			};
		});
		
		let removeTarget = self.removeTarget = (target) => {
			//REQUIRED: target
			
			delete targetDataSet[target];
			
			saveTargetHash(target);
		};
		
		// 10초에 한번씩 데이터 저장
		INTERVAL(10, () => {
			
			EACH(isToSaveSet, (isToSave, target) => {
				
				if (isToSave === true) {
					
					if (targetDataSet[target] === undefined) {
						REMOVE_FILE('data/' + storeName + '/' + target + '.json');
					}
					
					else {
						
						WRITE_FILE({
							path : 'data/' + storeName + '/' + target + '.json',
							content : STRINGIFY(targetDataSet[target])
						});
					}
					
					delete isToSaveSet[target];
				}
			});
		});
	}
});
