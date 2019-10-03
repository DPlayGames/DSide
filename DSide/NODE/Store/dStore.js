/*
 * DSide의 토큰인 d를 저장하는 스토어
 * 
 * 매일 20d보다 적은 d를 갖고 있는 계정의 잔고를 20d로 만들어줍니다.
 * DSide를 운영하면 하루 최대 480d가 충전됩니다.
 * 이더리움 네트워크 제공자의 경우 4800d를 추가로 더 충전합니다.
 */
DSide.dStore = OBJECT({
	
	preset : () => {
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
		
		const ETHUtil = require('ethereumjs-util');
		
		// 초기 d의 수량은 20개입니다.
		const INIT_D_BALANCE = 20;
		
		// 특정 계정의 잔고를 가져옵니다.
		let getBalance = self.getBalance = (accountId) => {
			//REQUIRED: accountId
			
			accountId = ETHUtil.toChecksumAddress(accountId);
			
			let data = self.getData(accountId);
			
			return data !== undefined ? data.d : INIT_D_BALANCE;
		};
		
		// 다른 계정으로 d를 이전합니다.
		let transfer = self.transfer = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.targetAccountId
			//REQUIRED: params.amount
			//REQUIRED: params.hash
			
			let accountId = params.accountId;
			let targetAccountId = params.targetAccountId;
			let amount = params.amount;
			let hash = params.hash;
			
			accountId = ETHUtil.toChecksumAddress(accountId);
			targetAccountId = ETHUtil.toChecksumAddress(targetAccountId);
			
			if (
			// 데이터를 검증합니다.
			DSide.Verify({
				accountId : accountId,
				data : {
					targetAccountId : targetAccountId,
					amount : amount
				},
				hash : hash
			}) === true) {
				
				if (use({
					accountId : accountId,
					amount : amount
				}) === true) {
					
					charge({
						accountId : targetAccountId,
						amount : amount
					});
					
					// 성공
					return true;
				}
			}
			
			// 실패
			return false;
		};
		
		let use = self.use = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.amount
			
			let accountId = params.accountId;
			let amount = params.amount;
			
			accountId = ETHUtil.toChecksumAddress(accountId);
			
			let data = self.getData(accountId);
			if (data === undefined) {
				
				// 계정이 없으면 생성합니다.
				data = self.saveData({
					id : accountId,
					data : {
						d : INIT_D_BALANCE,
						createTime : new Date()
					}
				}).savedData;
			}
			
			// 잔고가 더 커야합니다.
			if (data.d - amount >= 0) {
				
				data.d -= amount;
				data.lastUpdateTime = new Date();
				
				self.updateData({
					id : accountId,
					data : data
				});
				
				// 성공
				return true;
			}
			
			// 실패
			return false;
		};
		
		let charge = self.charge = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.amount
			
			let accountId = params.accountId;
			let amount = params.amount;
			
			accountId = ETHUtil.toChecksumAddress(accountId);
			
			let data = self.getData(accountId);
			if (data === undefined) {
				
				// 계정이 없으면 생성합니다.
				data = self.saveData({
					id : accountId,
					data : {
						d : INIT_D_BALANCE,
						createTime : new Date()
					}
				}).savedData;
			}
			
			data.d += amount;
			data.lastUpdateTime = new Date();
			
			self.updateData({
				id : accountId,
				data : data
			});
		};
		
		// 초기 d 수량보다 부족한 계정들에 d를 충전합니다.
		let chargeLacks = self.chargeLacks = () => {
			
			EACH(self.getDataSet(), (data, accountId) => {
				
				if (data.d < INIT_D_BALANCE) {
					
					// 데이터를 삭제하면, 다음에 데이터를 생성할 때 초기 d 량으로 초기화됩니다.
					self.dropData(accountId);
				}
			});
		};
		
		// 노드 운영 보상을 지급합니다.
		let chargeNodeReward = self.chargeNodeReward = (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.operationTime
			
			let accountId = params.accountId;
			let operationTime = params.operationTime;
			
			accountId = ETHUtil.toChecksumAddress(accountId);
			
			charge({
				accountId : accountId,
				
				// 하루 최대 480 d를 지급 받습니다.
				amount : INTEGER(operationTime / 1000 / 60 / 60 * INIT_D_BALANCE)
			});
		};
	}
});