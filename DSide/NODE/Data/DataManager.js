// 전체 데이터를 관리합니다.
DSide('Data').DataManager = CLASS({
	
	init : (inner, self, dataStructures) => {
		//REQUIRED: dataStructures
		
		// 유저들의 토큰 정보를 저장하는 스토어
		let tokenStore;
		
		let stores = {};
		
		EACH(dataStructures, (dataStructure, storeName) => {
			
			// 데이터의 타겟이 존재하는 스토어
			if (dataStructure.type === 'TargetStore') {
				stores[storeName] = DSide.Data.TargetStore({
					storeName : storeName,
					structure : dataStructure.structure
				});
			}
			
			// 일정 시간이 지난 후 데이터가 삭제되는 스토어
			else if (dataStructure.type === 'TimeoutStore') {
				stores[storeName] = DSide.Data.TimeoutStore({
					storeName : storeName,
					structure : dataStructure.structure
				});
			}
		});
		
		let getStoreHash = self.getStoreHash = (storeName) => {
			//REQUIRED: storeName
			
			let store = stores[storeName];
			
			return store.getHash();
		};
		
		let getDataSet = self.getDataSet = (storeNameOrParams) => {
			//REQUIRED: storeNameOrParams
			//REQUIRED: storeNameOrParams.storeName
			//OPTIONAL: storeNameOrParams.target
			
			let storeName;
			let target;
			
			if (CHECK_IS_DATA(storeNameOrParams) !== true) {
				storeName = storeNameOrParams;
			} else {
				storeName = storeNameOrParams.storeName;
				target = storeNameOrParams.target;
			}
			
			let store = stores[storeName];
			
			return store.getDataSet(target);
		};
		
		let saveData = self.saveData = (params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.address
			
			let storeName = params.storeName;
			let target = params.target;
			let hash = params.hash;
			let data = params.data;
			
			let store = stores[storeName];
			
			store.saveData({
				target : target,
				hash : hash,
				data : data
			});
		};
		
		let getData = self.getData = (params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.hash
			
			let storeName = params.storeName;
			let target = params.target;
			let hash = params.hash;
			
			let store = stores[storeName];
			
			if (target === undefined) {
				return store.getData(hash);
			}
			
			else {
				return store.getData({
					target : target,
					hash : hash
				});
			}
		};
		
		let updateData = self.updateData = (params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.originHash
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.address
			
			let storeName = params.storeName;
			let target = params.target;
			let hash = params.hash;
			let data = params.data;
			
			let store = stores[storeName];
			
			store.updateData({
				target : target,
				hash : hash,
				data : data
			});
		};
		
		let removeData = self.removeData = (params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.hash
			
			let storeName = params.storeName;
			let target = params.target;
			let hash = params.hash;
			
			let store = stores[storeName];
			
			if (target === undefined) {
				store.removeData(hash);
			}
			
			else {
				store.removeData({
					target : target,
					hash : hash
				});
			}
		};
	}
});
