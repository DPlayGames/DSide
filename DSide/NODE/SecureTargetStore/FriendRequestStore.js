DSide.FriendRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'FriendRequest',
			
			dataStructure : {
				
				targetAccountId : {
					notEmpty : true,
					size : 42
				}
			}
		};
	}
});