DSide.UserStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	}
});