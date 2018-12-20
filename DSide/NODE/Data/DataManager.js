// 전체 데이터를 관리합니다.
DSide('Data').DataManager = CLASS({
	
	init : (inner, self, dataStructures) => {
		//REQUIRED: dataStructures
		
		let storeNames = [];
		let stores = {};
		
		EACH(dataStructures, (dataStructure, storeName) => {
			
			storeNames.push(storeName);
			
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
		
		let getStoreNames = self.getStoreNames = () => {
			return storeNames;
		};
		
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
			//REQUIRED: params.signature
			//REQUIRED: params.account
			//REQUIRED: params.data
			
			let storeName = params.storeName;
			let signature = params.signature;
			let address = params.address;
			let data = params.data;
			
			let store = stores[storeName];
			
			store.saveData({
				signature : signature,
				address : address,
				data : data
			});
		};
	}
});
