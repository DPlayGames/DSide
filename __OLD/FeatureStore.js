// 서비스의 특정 기능을 저장하는 스토어
DSide.FeatureStore = OBJECT({
	
	preset : (params) => {
		return DSide.Store;
	}
});