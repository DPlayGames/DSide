DSide.Verify = METHOD((m) => {
	
	const EthereumUtil = require('ethereumjs-util');
	
	return {
	
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.accountId
			//REQUIRED: params.data
			//REQUIRED: params.hash
			
			let accountId = params.accountId;
			let data = params.data;
			let hash = params.hash;
			
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
			
			let hashData = EthereumUtil.fromRpcSig(hash);
			
			let message = Buffer.from(str);
			let prefix = Buffer.from('\x19Ethereum Signed Message:\n');
			let prefixedMsg = EthereumUtil.keccak256(
				Buffer.concat([prefix, Buffer.from(String(message.length)), message])
			);
			
			let pub = EthereumUtil.ecrecover(prefixedMsg, hashData.v, hashData.r, hashData.s);
			
			return accountId.toLowerCase() === EthereumUtil.bufferToHex(EthereumUtil.pubToAddress(pub));
		}
	};
});
