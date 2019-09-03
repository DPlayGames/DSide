DSide.GuildJoinRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'GuildJoinRequest',
			
			dataStructure : {
				
				guildId : {
					notEmpty : true,
					size : 42
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		let getAccountRequest = self.getAccountRequest = (accountId) => {
			//REQUIRED: accountId
			
			//TODO:
		}
		
		let dropAccountRequest = self.dropAccountRequest = (accountId) => {
			//REQUIRED: accountId
			
			//TODO:
		}
	}
});