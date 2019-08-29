DSide.FriendRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'FriendRequest',
			
			dataStructure : {}
		};
	}
});