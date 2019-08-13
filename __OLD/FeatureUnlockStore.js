// 서비스의 특정 기능을 언락한 기록을 저장하는 스토어
DSide.FeatureUnlockStore = OBJECT({
	
	preset : (params) => {
		return DSide.TargetStore;
	}
});