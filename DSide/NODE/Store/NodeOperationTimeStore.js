DSide.NodeOperationTimeStore = OBJECT({
	
	preset : () => {
		return DSide.Store;
	},
	
	params : () => {
		
		return {
			
			storeName : 'NodeOperationTime',
			
			dataStructure : {
				
				startOperationTime : {
					date : true
				},
				
				operationTime : {
					integer : true
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// 노드 운영 시간을 반환합니다.
		let getOperationTime = self.getOperationTime = (url) => {
			//REQUIRED: url
			
			let data = self.getData(url);
			if (data !== undefined) {
				
				if (data.startOperationTime !== undefined) {
					return Date.now() - data.startOperationTime.getTime();
				} else {
					return data.operationTime;
				}
			}
		};
		
		// 모든 노드들의 운영 시간을 초기화합니다.
		let clearOperationTimes = self.clearOperationTimes = () => {
			
			EACH(self.getDataSet(), (data, url) => {
				
				// 운영중인 노드가 아니면 제거합니다.
				if (data.startOperationTime === undefined) {
					self.dropData(url);
				}
				
				else {
					
					data.startOperationTime = new Date();
					
					self.updateData({
						id : url,
						data : data
					});
				}
			});
		};
	}
});