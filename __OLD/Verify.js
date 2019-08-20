DSide.Verify = METHOD((m) => {
	
	const EthereumUtil = require('ethereumjs-util');
	
	return {
	
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.signature
			//REQUIRED: params.address
			//REQUIRED: params.data
			
			let signature = params.signature;
			let address = params.address;
			let data = params.data;
			
			let str;
			if (CHECK_IS_DATA(data) === true) {
				let sortedData = {};
				Object.keys(data).sort().forEach((key) => {
					sortedData[key] = data[key];
				});
				str = STRINGIFY(sortedData);
			} else {
				str = data;
			}
			
			let signatureData = EthereumUtil.fromRpcSig(signature);
			
			let message = Buffer.from(str);
			let prefix = Buffer.from('\x19Ethereum Signed Message:\n');
			let prefixedMsg = EthereumUtil.keccak256(
				Buffer.concat([prefix, Buffer.from(String(message.length)), message])
			);
			
			let pub = EthereumUtil.ecrecover(prefixedMsg, signatureData.v, signatureData.r, signatureData.s);
			
			return address.toLowerCase() === EthereumUtil.bufferToHex(EthereumUtil.pubToAddress(pub));
		}
	};
});
