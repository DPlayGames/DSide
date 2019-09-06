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
					checkRequested({
						accountId : accountId,
						target : target
					}) !== true) {
						
						let result = origin(params);
						if (result.savedData !== undefined) {
							
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
		
		// 데이터 수정 기능을 제거합니다.
		delete self.updateData;
		
		// 이미 친구 신청했는지 확인합니다.
		let checkRequested = self.checkRequested = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.target
			
			let accountId = params.accountId;
			let target = params.target;
			
			let requested = false;
			EACH(self.getDataSet(target), (data) => {
				if (data.accountId === accountId) {
					requested = true;
					return false;
				}
			});
			
			return requested;
		};
		
		// 친구 요청 목록을 가져옵니다.
		let getRequesterIds = self.getRequesterIds = (accountId) => {
			//REQUIRED: accountId
			
			let requesterIds = [];
			
			EACH(self.getDataSet(accountId), (data) => {
				requesterIds.push(data.accountId);
			});
			
			return requesterIds;
		};
		
		// 친구 요청을 거절합니다.
		let deny = self.deny = (params) => {
			//REQUIRED: params
			//REQUIRED: params.target
			//REQUIRED: params.accountId
			//REQUIRED: params.hash
			
			let target = params.target;
			let accountId = params.accountId;
			let hash = params.hash;
			
			// 요청 대상만 거절 가능
			if (DSide.Verify({
				accountId : target,
				data : {
					target : target,
					accountId : accountId
				},
				hash : hash
			}) === true) {
				
				EACH(self.getDataSet(target), (data, hash) => {
					if (data.accountId === accountId) {
						
						self.dropData({
							target : target,
							hash : hash
						});
						
						return false;
					}
				});
			}
		};
		
		// 친구 요청을 수락했으면 요청 정보는 삭제합니다.
		let acceptedRequest = self.acceptedRequest = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.account2Id
			
			let accountId = params.accountId;
			let account2Id = params.account2Id;
			
			EACH(self.getDataSet(accountId), (data, hash) => {
				if (data.accountId === account2Id) {
					
					self.dropData({
						target : accountId,
						hash : hash
					});
					
					return false;
				}
			});
		};
	}
});