let ethUtil = require('ethereumjs-util');

let signature = '0x73b5b26d12ee4fda5cf1f7ff80c5705ca849f36fea6ea4e1673cce04aa79c31a75c4d0e869e7d99a1ba6bf806c179e6fd4dee18fc82e4dad4a77d174df128e721c';
let signatureData = ethUtil.fromRpcSig(signature);

let msg = Buffer.from('message');
let prefix = Buffer.from('\x19Ethereum Signed Message:\n');
let prefixedMsg = ethUtil.keccak256(
	Buffer.concat([prefix, Buffer.from(String(msg.length)), msg])
);

let pub = ethUtil.ecrecover(prefixedMsg, signatureData.v, signatureData.r, signatureData.s);
let address = ethUtil.bufferToHex(ethUtil.pubToAddress(pub));

console.log(address);
