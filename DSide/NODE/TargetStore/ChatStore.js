// 최대 100문장만 저장
DSide.ChatStore = OBJECT({
	
	preset : () => {
		return DSide.TargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Chat',
			
			dataStructure : {
				
				senderId : {
					notEmpty : true,
					size : 42
				},
				
				message : {
					notEmpty : true,
					size : {
						max : 256
					}
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 최대 100문장을 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				
				origin(params);
				
				// 메시지 개수가 100개를 넘기면
				if (COUNT_PROPERTIES(self.getDataSet()) > 100) {
					
					let firstDataId;
					let minCreateTime;
					
					// 첫 메시지를 찾습니다.
					EACH(self.getDataSet(), (data, id) => {
						if (minCreateTime === undefined || minCreateTime > data.createTime) {
							firstDataId = id;
							minCreateTime = data.createTime;
						}
					});
					
					// 첫 메시지를 삭제합니다.
					if (firstDataId !== undefined) {
						removeData(firstDataId);
					}
				}
			};
		});
	}
});