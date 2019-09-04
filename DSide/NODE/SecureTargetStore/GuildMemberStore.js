DSide.GuildMemberStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'GuildMember',
			
			dataStructure : {
				
				guildId : {
					notEmpty : true,
					size : 42
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		//TODO:
	}
});