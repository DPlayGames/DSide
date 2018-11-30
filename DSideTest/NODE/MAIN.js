DSideTest.MAIN = METHOD({
	
	run : () => {
		
		var crypto = require('crypto');

var prime_length = 60;
var diffHell = crypto.createDiffieHellman(prime_length);

diffHell.generateKeys('base64');
console.log("Public Key : " ,diffHell.getPublicKey('base64'));
console.log("Private Key : " ,diffHell.getPrivateKey('base64'));

console.log("Public Key : " ,diffHell.getPublicKey('hex'));
console.log("Private Key : " ,diffHell.getPrivateKey('hex'));
		
		let message = '푸른 하늘 은하수';
		let encryptedMessage;
		
		console.log(encryptedMessage = DSide.PrivateEncrypt({
			privateKey : diffHell.getPrivateKey('base64'),
			message : message
		}));
		console.log(DSide.PublicDecrypt({
			publicKey : diffHell.getPublicKey('base64'),
			encryptedMessage : encryptedMessage
		}));
	}
});
