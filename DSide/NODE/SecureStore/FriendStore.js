DSide.FriendStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Friend',
			
			dataStructure : {
				
				account2Id : {
					notEmpty : true,
					size : 42
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 해시를 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.account2Id
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let accountId = params.data.accountId;
				let account2Id = params.data.account2Id;
				
				// 친구 요청이 있는 경우에만 친구로 등록할 수 있습니다.
				if (DSide.FriendRequestStore.checkRequested({
					accountId : account2Id,
					target : accountId
				}) === true) {
					
					let result = origin(params);
					if (result.savedData !== undefined) {
						
						// 친구 요청을 제거합니다.
						DSide.FriendRequestStore.acceptedRequest({
							accountId : accountId,
							account2Id : account2Id
						});
					}
					
					return result;
				}
				
				// 유효하지 않은 데이터입니다.
				else {
					return {
						isNotVerified : true
					};
				}
			};
		});
		
		// 데이터를 삭제합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			removeData = self.removeData = (params) => {
				//REQUIRED: params.friendId
				//REQUIRED: params.hash
				
				let friendId = params.friendId;
				let hash = params.hash;
				
				let originData;
				
				EACH(self.getDataSet(), (data, friendHash) => {
					
					if (data.accountId === friendId) {
						
						if (DSide.Verify({
							accountId : data.account2Id,
							data : friendId,
							hash : hash
						}) === true) {
							
							originData = data;
							
							self.dropData(friendHash);
							
							return false;
						}
					}
					
					if (data.account2Id === friendId) {
						
						if (DSide.Verify({
							accountId : data.accountId,
							data : friendId,
							hash : hash
						}) === true) {
							
							originData = data;
							
							self.dropData(friendHash);
							
							return false;
						}
					}
				});
				
				if (originData !== undefined) {
					
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
		});
		
		// 친구 목록을 가져옵니다.
		let getFriendIds = self.getFriendIds = (accountId) => {
			//REQUIRED: accountId
			
			let friendIds = [];
			
			EACH(self.getDataSet(), (data) => {
				if (data.accountId === accountId) {
					friendIds.push(data.account2Id);
				} else if (data.account2Id === accountId) {
					friendIds.push(data.accountId);
				}
			});
			
			return friendIds;
		};
	}
});