// 전체 데이터를 관리합니다.
DSide.DataManager = CLASS({
	
	init : (inner, self, dataStructures) => {
		//REQUIRED: dataStructures
		
		let stores = {};
		
		EACH(dataStructures, (dataStructure, storeName) => {
			
			// 데이터의 타겟이 존재하는 스토어
			if (dataStructure.type === 'TargetStore') {
				stores[storeName] = DSide.TargetStore({
					storeName : storeName,
					structure : dataStructure.structure
				});
			}
			
			// 일정 시간이 지난 후 데이터가 삭제되는 스토어
			else if (dataStructure.type === 'TimeoutStore') {
				stores[storeName] = DSide.TimeoutStore({
					storeName : storeName,
					structure : dataStructure.structure
				});
			}
			
			// 데이터를 저장하는 스토어
			else {
				stores[storeName] = DSide.Store({
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
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.storeName
			//OPTIONAL: params.data.target
			//OPTIONAL: params.isForSync
			
			let hash = params.hash;
			let data = params.data;
			let isForSync = params.isForSync;
			
			let storeName = data.storeName;
			let target = data.target;
			
			let store = stores[storeName];
			
			return store.saveData({
				target : target,
				hash : hash,
				data : data,
				isForSync : isForSync
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
			//REQUIRED: params.originHash
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.storeName
			//OPTIONAL: params.data.target
			
			let hash = params.hash;
			let data = params.data;
			
			let storeName = data.storeName;
			let target = data.target;
			
			let store = stores[storeName];
			
			return store.updateData({
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
				return store.removeData(hash);
			}
			
			else {
				return store.removeData({
					target : target,
					hash : hash
				});
			}
		};
		
		let removeTarget = self.removeTarget = (params) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//REQUIRED: params.target
			
			let storeName = params.storeName;
			let target = params.target;
			
			let store = stores[storeName];
			
			store.removeTarget(target);
		};
	}
});
