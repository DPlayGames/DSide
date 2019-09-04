DSide.AccountDetailStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'AccountDetail',
			
			dataStructure : {
				
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
		
		// 계정 해시 셋
		let accountHashSet = {};
		
		EACH(self.getDataSet(), (data, hash) => {
			accountHashSet[data.accountId] = hash;
		});
		
		// 데이터 삭제 기능을 private으로
		let dropData = self.dropData;
		delete self.dropData;
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 해시를 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let accountId = params.data.accountId;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 1) {
					
					let originHash = accountHashSet[accountId];
					
					let result = origin(params);
					if (result.savedData !== undefined) {
						
						// 기존에 데이터가 있으면 제거합니다.
						if (originHash !== undefined) {
							dropData(originHash);
						}
						
						accountHashSet[accountId] = params.hash;
						
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
		
		// 데이터의 싱크를 맞춥니다.
		let syncData;
		OVERRIDE(self.syncData, (origin) => {
			
			// 데이터 싱크 시 해시를 저장합니다.
			syncData = self.syncData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let accountId = params.data.accountId;
				
				// 기존에 데이터가 있으면 제거합니다.
				let originHash = accountHashSet[accountId];
				if (originHash !== undefined) {
					dropData(originHash);
				}
				
				origin(params);
				
				accountHashSet[accountId] = params.hash;
			};
		});
		
		// 데이터 수정 기능을 제거합니다.
		delete self.updateData;
		
		// 데이터 삭제 기능을 제거합니다.
		delete self.removeData;
		
		// 특정 계정의 세부 내용을 가져옵니다.
		let getAccountDetail = self.getAccountDetail = (accountId) => {
			//REQUIRED: accountId
			
			let hash = accountHashSet[accountId];
			if (hash !== undefined) {
				
				return self.getData(hash);
			}
		};
		
		// 이름으로 계정들을 찾습니다.
		let findAccountIds = self.findAccountIds = (nameQuery) => {
			//REQUIRED: nameQuery
			
			let accountIds = [];
			
			if (nameQuery !== undefined && nameQuery.trim() !== '') {
				
				EACH(self.getDataSet(), (data) => {
					
					if (new RegExp(nameQuery, 'g').test(data.name) === true) {
						
						accountIds.push(data.accountId);
					}
				});
			}
			
			return accountIds;
		};
	}
});