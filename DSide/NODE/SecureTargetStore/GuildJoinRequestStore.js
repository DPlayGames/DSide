DSide.GuildJoinRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'GuildJoinRequest',
			
			dataStructure : {}
		};
	}
});