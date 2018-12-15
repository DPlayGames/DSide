DSide.PublicDecrypt = METHOD(() => {
	
	let crypto = require('crypto');
	
	return {
		
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.publicKey
			//REQUIRED: params.encryptedMessage
			
			let publicKey = params.publicKey;
			let encryptedMessage = params.encryptedMessage;
			
			return crypto.publicDecrypt(publicKey, Buffer.from(encryptedMessage, 'base64'));
		}
	};
});
