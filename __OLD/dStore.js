/*
 * DSide의 토큰인 d를 저장하는 스토어
 * 
 * 매일 20d보다 적은 d를 갖고 있는 계정의 잔고를 20d로 만들어줍니다.
 * DSide를 운영하면 하루 최대 400d가 충전됩니다.
 * 이더리움 네트워크 제공자의 경우 4000d를 추가로 더 충전합니다.
 */
DSide.dStore = OBJECT({
	
	preset : (params) => {
		return DSide.Store;
	},
	
	params : () => {
		
		return {
			
			storeName : 'd',
			
			dataStructure : {
				d : {
					notEmpty : true,
					integer : true
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// 초기 d의 수량은 20개입니다.
		const INIT_D_BALANCE = 20;
		
		// 계정 해시 셋
		let accountHashSet = {};
		
		EACH(self.getDataSet(), (data) => {
			accountHashSet[data.accountId] = data.hash;
		});
		
		// 특정 계정의 잔고를 가져옵니다.
		let getBalance = self.getBalance = (accountId) => {
			//REQUIRED: accountId
			
			let balance = INIT_D_BALANCE;
			
			let hash = accountHashSet[accountId.toLowerCase()];
			if (hash !== undefined) {
				
				let data = self.getData(hash);
				if (data !== undefined) {
					
					balance = data.d;
				}
			}
			
			return balance;
		};
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 해시를 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.hash
				
				let result = origin(params);
				if (result.savedData !== undefined) {
					
					accountHashSet[result.savedData.accountId] = params.hash;
				}
				
				return result;
			};
		});
		
		// 데이터를 수정합니다.
		let updateData;
		OVERRIDE(self.updateData, (origin) => {
			
			// 데이터 수정 시 해시를 저장합니다.
			updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.data
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let result = origin(params);
				if (result.savedData !== undefined) {
					
					accountHashSet[result.savedData.accountId] = params.hash;
				}
				
				return result;
			};
		});
		
		// 데이터를 삭제합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			// 데이터 삭제 시 해시도 삭제합니다.
			removeData = self.removeData = (hash) => {
				//REQUIRED: hash
				
				let result = origin(hash);
				if (result.originData !== undefined) {
					
					delete accountHashSet[result.originData.accountId];
				}
				
				return result;
			};
		});
	}
});