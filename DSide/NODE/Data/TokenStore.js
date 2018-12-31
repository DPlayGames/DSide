// 유저들의 토큰 정보를 담고 있는 특수 스토어
DSide('Data').TokenStore = OBJECT({
	
	init : (inner, self) => {
		
		const INIT_TOKEN_AMOUNT = 20;
		
		let accounts = {};
		
		let isToSave = false;
		
		// 이미 저장된 데이터들을 불러옵니다.
		READ_FILE({
			path : 'data/Token.json',
			isSync : true
		}, {
			notExists : () => {
				// ignore.
			},
			success : (accountsStr) => {
				accounts = PARSE_STR(accountsStr.toString());
			}
		});
		
		let getHash = self.getHash = () => {
			return DSide.Data.Store.generateHash(accounts);
		};
		
		let getAccounts = self.getAccounts = () => {
			return accounts;
		};
		
		let getBalance = self.getBalance = (address) => {
			//REQUIRED: address
			
			return accounts[address] !== undefined ? accounts[address] : INIT_TOKEN_AMOUNT;
		};
		
		let transfer = self.transfer = (params) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.hash
			//REQUIRED: params.to
			//REQUIRED: params.amount
			
			let address = params.address;
			let hash = params.hash;
			let to = params.to;
			let amount = params.amount;
			
			if (
				DSide.Data.Verify({
					signature : hash,
					address : address,
					data : {
						to : to,
						amount : amount
					}
				}) === true &&
				
				// 토큰 1개를 수수료로
				getBalance(address) >= amount + 1
			) {
				
				useToken({
					address : address,
					amount : amount + 1
				});
				
				increaseToken({
					address : to,
					amount : amount
				});
			}
			
			else {
				return false;
			}
		};
		
		let useToken = self.useToken = (params) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.amount
			
			let address = params.address;
			let amount = params.amount;
			
			return increaseToken({
				address : address,
				amount : -amount
			});
		};
		
		let increaseToken = self.increaseToken = (params) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.amount
			
			let address = params.address;
			let amount = params.amount;
			
			if (getBalance(address) + amount >= 0) {
				
				// 계정이 없으면 생성합니다.
				if (accounts[address] === undefined) {
					accounts[address] = INIT_TOKEN_AMOUNT;
				}
				
				accounts[address] += amount;
				
				isToSave = true;
				return true;
			}
			
			return false;
		};
		
		// 계정 삭제
		let removeAccount = self.removeAccount = (address) => {
			
			delete accounts[address];
			
			isToSave = true;
		};
		
		// 초기화 토큰량보다 부족한 계정에 토큰을 충전합니다.
		let chargeLacks = self.chargeLacks = () => {
			
			EACH(accounts, (amount, address) => {
				
				if (amount < INIT_TOKEN_AMOUNT) {
					
					// 계정을 삭제하면 다음에 계정을 생성할 때 초기화 토큰량으로 초기화됨
					removeAccount(address);
				}
			});
		};
		
		// 노드의 보상을 충전합니다.
		let chargeNodeReward = self.chargeNodeReward = (params) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.connectionTime
			
			let address = params.address;
			let connectionTime = params.connectionTime;
			
			increaseToken({
				address : address,
				amount : INTEGER(connectionTime / 1000 / 60 / 60 * INIT_TOKEN_AMOUNT)
			});
		};
		
		// 10초에 한번씩 데이터 저장
		DELAY(RANDOM(10), () => {
			
			INTERVAL(10, RAR(() => {
				
				if (isToSave === true) {
					
					WRITE_FILE({
						path : 'data/Token.json',
						content : STRINGIFY(accounts)
					});
					
					isToSave = false;
				}
			}));
		});
	}
});
