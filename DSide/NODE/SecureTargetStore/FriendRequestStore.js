DSide.FriendRequestStore = OBJECT({
	
	preset : () => {
		return DSide.SecureTargetStore;
	}
});