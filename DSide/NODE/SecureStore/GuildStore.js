DSide.GuildStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Guild',
			
			dataStructure : {}
		};
	}
});