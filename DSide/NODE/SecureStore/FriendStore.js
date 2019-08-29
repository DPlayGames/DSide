DSide.FriendStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Friend',
			
			dataStructure : {}
		};
	}
});