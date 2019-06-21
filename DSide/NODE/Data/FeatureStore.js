// 서비스의 특정 기능을 저장하는 스토어
DSide('Data').FeatureStore = OBJECT({
	
	preset : (params) => {
		return DSide.Data.Store;
	}
});