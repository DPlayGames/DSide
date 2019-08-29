DSide.UserStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'User',
			
			dataStructure : {}
		};
	}
});