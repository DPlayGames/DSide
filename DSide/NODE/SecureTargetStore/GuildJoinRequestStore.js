DSide.GuildJoinRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	}
});