DSide.PrivateEncrypt = METHOD(() => {
	
	let crypto = require('crypto');
	
	return {
		
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.privateKey
			//REQUIRED: params.message
			
			let privateKey = params.privateKey;
			let message = params.message;
			
			return crypto.privateEncrypt(privateKey, Buffer.from(message, 'utf8')).toString('base64');
		}
	};
});
