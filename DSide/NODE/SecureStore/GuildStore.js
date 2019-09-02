DSide.GuildStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Guild',
			
			dataStructure : {
				
				id : {
					notEmpty : true,
					size : 36
				},
				
				name : {
					notEmpty : true,
					size : {
						max : 20
					}
				},
				
				introduce : {
					size : {
						max : 256
					}
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// ID 해시 셋
		let idHashSet = {};
		
		EACH(self.getDataSet(), (data, hash) => {
			idHashSet[data.id] = hash;
		});
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 해시를 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let id = params.data.id;
				let accountId = params.data.accountId;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 20) {
					
					let originHash = idHashSet[id];
					
					// ID에 해당하는 길드가 있으면 생성 불가
					if (originHash !== undefined) {
						return {
							existedId : true
						};
					}
					
					else {
						
						let result = origin(params);
						if (result.savedData !== undefined) {
							
							idHashSet[id] = params.hash;
							
							// 데이터 저장 완료, d를 20 깎습니다.
							DSide.dStore.use({
								accountId : accountId,
								amount : 20
							});
						}
						
						return result;
					}
				}
				
				else {
					return {
						isNotEnoughD : true
					};
				}
			};
		});
		
		// 데이터의 싱크를 맞춥니다.
		let syncData;
		OVERRIDE(self.syncData, (origin) => {
			
			// 데이터 싱크 시 해시를 저장합니다.
			syncData = self.syncData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let id = params.data.id;
				
				origin(params);
				
				idHashSet[id] = params.hash;
			};
		});
		
		// 데이터를 수정합니다.
		let updateData;
		OVERRIDE(self.updateData, (origin) => {
			
			// 데이터 수정 시 해시를 저장합니다.
			updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let id = params.data.id;
				let accountId = params.data.accountId;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 1) {
					
					let result = origin(params);
					if (result.savedData !== undefined) {
						
						idHashSet[id] = params.hash;
						
						// 데이터 저장 완료, d를 1 깎습니다.
						DSide.dStore.use({
							accountId : accountId,
							amount : 1
						});
					}
					
					return result;
				}
				
				else {
					return {
						isNotEnoughD : true
					};
				}
			};
		});
		
		// 데이터를 삭제합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			// 데이터 삭제 시 해시도 삭제합니다.
			removeData = self.removeData = (params) => {
				//REQUIRED: params.hash
				//REQUIRED: params.checkHash
				
				let result = origin(params);
				
				if (result.originData !== undefined) {
					delete idHashSet[result.originData.id];
				}
				
				return result;
			};
		});
		
		// 데이터를 삭제합니다.
		let dropData;
		OVERRIDE(self.dropData, (origin) => {
			
			// 데이터 삭제 시 해시도 삭제합니다.
			dropData = self.dropData = (hash) => {
				
				let originData = self.getData(hash);
				
				origin(hash);
				
				if (originData !== undefined) {
					delete idHashSet[originData.id];
				}
			};
		});
		
		// 길드 정보를 가져옵니다.
		let getGuildInfo = self.getGuildInfo = (guildId) => {
			//REQUIRED: guildId
			
			let hash = idHashSet[guildId];
			if (hash !== undefined) {
				
				return self.getData(hash);
			}
		};
		
		// 길드 해시를 가져옵니다.
		let getGuildHash = self.getGuildHash = (guildId) => {
			//REQUIRED: guildId
			
			return idHashSet[guildId];
		};
	}
});