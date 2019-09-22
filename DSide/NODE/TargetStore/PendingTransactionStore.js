DSide.PendingTransactionStore = OBJECT({
	
	preset : () => {
		return DSide.TargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'PendingTransaction',
			
			dataStructure : {
				
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
	}
});