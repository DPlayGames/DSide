DSide.PendingTransactionStore = OBJECT({
	
	preset : () => {
		return DSide.TargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'PendingTransaction',
			
			dataStructure : {
				
				network : {
					notEmpty : true,
					size : {
						max : 256
					}
				},
				
				transactionHash : {
					notEmpty : true,
					size : 66
				},
				
				message : {
					size : {
						max : 256
					}
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// 트랜잭션이 완료될 때 까지 확인합니다.
		let watchTransaction = (id, data) => {
			//REQUIRED: id
			//REQUIRED: data
			
			let retry = RAR(() => {
				
				if (DSide.EthereumNetworkProviderStore.getWeb3(data.network) === undefined) {
					
					SHOW_ERROR('DSide.PendingTransactionStore', 'Web3이 초기화되지 않았습니다.', {
						id : id,
						data : data
					});
					
					self.dropData({
						target : data.target,
						id : id
					});
				}
				
				else {
					
					DSide.EthereumNetworkProviderStore.getWeb3(data.network).eth.getTransactionReceipt(data.transactionHash, (error, result) => {
						
						// 트랜잭선 오류 발생
						if (error !== TO_DELETE) {
							
							SHOW_ERROR('DSide.PendingTransactionStore', '트랜잭션 오류가 발생했습니다.', {
								id : id,
								data : data
							});
							
							self.dropData({
								target : data.target,
								id : id
							});
						}
						
						// 아무런 값이 없으면 재시도
						else if (result === TO_DELETE || result.blockHash === TO_DELETE) {
							retry();
						}
						
						// 트랜잭션 완료
						else {
							console.log({
								target : data.target,
								id : id
							});
							self.dropData({
								target : data.target,
								id : id
							});
						}
					});
				}
			});
		};
		
		EACH(self.getTargetHashSet(), (hash, target) => {
			EACH(self.getDataSet(target), (data, id) => {
				watchTransaction(id, data);
			});
		});
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			saveData = self.saveData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				
				origin(params);
				
				watchTransaction(params.id, params.data);
			};
		});
		
		// 데이터의 싱크를 맞춥니다.
		let syncData;
		OVERRIDE(self.syncData, (origin) => {
			
			syncData = self.syncData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				
				origin(params);
				
				watchTransaction(params.id, params.data);
			};
		});
	}
});