DSide.GuildMemberStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	}
});