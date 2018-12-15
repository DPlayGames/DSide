DSide('Data').Verify = METHOD((m) => {
	
	const ETHUtil = require('ethereumjs-util');
	
	return {
	
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.signature
			//REQUIRED: params.address
			//REQUIRED: params.data
			
			let signature = params.signature;
			let address = params.address;
			let data = params.data;
			
			let sortedData = {};
			Object.keys(data).sort().forEach((key) => {
				sortedData[key] = data[key];
			});
			
			let signatureData = ETHUtil.fromRpcSig(signature);
			
			let message = Buffer.from(STRINGIFY(sortedData));
			let prefix = Buffer.from('\x19Ethereum Signed Message:\n');
			let prefixedMsg = ETHUtil.keccak256(
				Buffer.concat([prefix, Buffer.from(String(message.length)), message])
			);
			
			let pub = ETHUtil.ecrecover(prefixedMsg, signatureData.v, signatureData.r, signatureData.s);
			
			return address.toLowerCase() === ETHUtil.bufferToHex(ETHUtil.pubToAddress(pub));
		}
	};
});
