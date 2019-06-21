// 이더리움 네트워크 제공자 스토어
DSide('Data').EthereumNetworkProviderStore = OBJECT({
	
	preset : (params) => {
		return DSide.Data.Store;
	}
});