// 최대 100문장만 저장
DSide.ChatStore = OBJECT({
	
	preset : () => {
		return DSide.TargetStore;
	}
});