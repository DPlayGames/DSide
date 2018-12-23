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
		
		let getNodeTime = self.getNodeTime = (time) => {
			return new Date(time.getTime() - timeDiff);
		};
		
		let saveData = self.saveData = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.hash
			//REQUIRED: params.data
			//REQUIRED: params.data.storeName
			//OPTIONAL: params.data.target
			//REQUIRED: params.data.address
			//REQUIRED: params.data.createTime
			
			send({
				methodName : 'saveData',
				data : params
			}, callback);
		};
	}
});