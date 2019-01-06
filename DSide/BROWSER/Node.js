DSide.Node = CLASS({
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.on
		//REQUIRED: params.off
		//REQUIRED: params.send
		//REQUIRED: params.disconnect
		//REQUIRED: params.timeDiff
		
		let on = params.on;
		let off = params.off;
		let send = params.send;
		let disconnect = params.disconnect;
		let timeDiff = params.timeDiff;
		
		// 노드 시간을 계산합니다.
		let getNodeTime = self.getNodeTime = (time) => {
			return new Date(time.getTime() - timeDiff);
		};
		
		// 데이터 목록을 반환합니다.
		let getDataSet = self.getDataSet = (storeNameOrParams, callback) => {
			//REQUIRED: storeNameOrParams
			//REQUIRED: storeNameOrParams.storeName
			//OPTIONAL: storeNameOrParams.target
			//REQUIRED: callback
			
			send({
				methodName : 'getDataSet',
				data : storeNameOrParams
			}, callback);
		};
		
		// 데이터를 저장합니다.
		let saveData = self.saveData = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.storeName
			//OPTIONAL: params.data.target
			//REQUIRED: params.data.address
			//REQUIRED: params.data.createTime
			//OPTIONAL: callback
			
			send({
				methodName : 'saveData',
				data : params
			}, callback);
		};
		
		// 데이터를 반환합니다.
		let getData = self.getData = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.hash
			//REQUIRED: callback
			
			send({
				methodName : 'getData',
				data : params
			}, callback);
		};
		
		// 데이터를 수정합니다.
		let updateData = self.updateData = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.originHash
			//REQUIRED: params.signature
			//REQUIRED: params.hash
			//REQUIRED: params.data.storeName
			//OPTIONAL: params.data.target
			//REQUIRED: params.data.address
			//REQUIRED: params.data.createTime
			//REQUIRED: params.data.lastUpdateTime
			//OPTIONAL: callback
			
			send({
				methodName : 'updateData',
				data : params
			}, callback);
		};
		
		// 데이터를 삭제합니다.
		let removeData = self.removeData = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.storeName
			//OPTIONAL: params.target
			//REQUIRED: params.hash
			//REQUIRED: params.signature
			//REQUIRED: params.address
			//OPTIONAL: callback
			
			send({
				methodName : 'removeData',
				data : params
			}, callback);
		};
		
		// 토큰의 잔고를 확인합니다.
		let getTokenBalance = self.getTokenBalance = (address, callback) => {
			//REQUIRED: address
			//OPTIONAL: callback
			
			send({
				methodName : 'getTokenBalance',
				data : address
			}, callback);
		};
		
		// 토큰을 이체합니다.
		let transferToken = self.transferToken = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.hash
			//REQUIRED: params.to
			//REQUIRED: params.amount
			//OPTIONAL: callback
			
			send({
				methodName : 'transferToken',
				data : params
			}, callback);
		};
	}
});