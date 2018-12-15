DSide('Data').Sign = METHOD({
	
	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.data
		//REQUIRED: params.privateKey
		
		let data = params.data;
		let privateKey = params.privateKey;
		
		let sortedData = {};
		Object.keys(data).sort().forEach((key) => {
			sortedData[key] = data[key];
		});
		
		let message = STRINGIFY(sortedData);
		let prefixedMessage = ethereumjs.Util.sha3('\x19Ethereum Signed Message:\n' + message.length + message);
		
		let signedMessage = ethereumjs.Util.ecsign(prefixedMessage, ethereumjs.Util.toBuffer('0x' + privateKey.toLowerCase()));
		
		return ethereumjs.Util.toRpcSig(signedMessage.v, signedMessage.r, signedMessage.s).toString('hex');
	}
});
