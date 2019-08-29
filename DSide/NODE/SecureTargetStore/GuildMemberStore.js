DSide.GuildMemberStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'GuildMember',
			
			dataStructure : {}
		};
	}
});