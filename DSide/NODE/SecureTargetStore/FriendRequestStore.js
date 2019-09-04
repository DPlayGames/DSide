DSide.FriendRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'FriendRequest',
			
			dataStructure : {}
		};
	},
	
	init : (inner, self) => {
		
		// 신청 내역
		let history = {};
		
		EACH(self.getTargetHashSet(), (hash, target) => {
			EACH(self.getDataSet(target), (data) => {
				history[data.accountId + ' -> ' + target] = true;
			});
		});
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 내역을 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let target = params.data.target;
				let accountId = params.data.accountId;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 1) {
					
					if (
					// 신청 내역이 존재하면 신청 불가
					history[accountId + ' -> ' + target] === undefined) {
						
						let result = origin(params);
						if (result.savedData !== undefined) {
							
							history[accountId + ' -> ' + target] = true;
							
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
							isNotVerified : true
						};
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
			
			// 데이터 싱크 시 내역을 저장합니다.
			syncData = self.syncData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let target = params.data.target;
				let accountId = params.data.accountId;
				
				origin(params);
				
				history[accountId + ' -> ' + target] = true;
			};
		});
		
		// 데이터를 삭제합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			// 데이터 삭제 시  삭제합니다.
			removeData = self.removeData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.hash
				//REQUIRED: params.checkHash
				
				let result = origin(params);
				
				if (result.originData !== undefined) {
					delete history[result.originData.accountId + ' -> ' + result.originData.target];
				}
				
				return result;
			};
		});
		
		// 데이터를 삭제합니다.
		let dropData;
		OVERRIDE(self.dropData, (origin) => {
			
			// 데이터 삭제 시 내역도 삭제합니다.
			dropData = self.dropData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.hash
				
				let originData = self.getData(params);
				
				origin(params);
				
				if (originData !== undefined) {
					delete history[originData.accountId + ' -> ' + originData.target];
				}
			};
		});
		
		// 데이터 수정 기능을 제거합니다.
		delete self.updateData;
		
		// 이미 친구 신청했는지 확인합니다.
		let checkRequested = self.checkRequested = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.target
			
			return history[params.accountId + ' -> ' + params.target] === true;
		};
	}
});