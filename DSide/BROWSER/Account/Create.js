DSide('Account').Create = METHOD({

	run : () => {
		
		let mnemonic = bip39.generateMnemonic();
		
		let seed = bip39.mnemonicToSeed(mnemonic);
		
		let rootKey = ethereumjs.WalletHD.fromMasterSeed(seed);
		let hardenedKey = rootKey.derivePath('m/44\'/60\'/0\'/0');
		let childKey = hardenedKey.deriveChild(0);
		
		let wallet = childKey.getWallet();
		
		return {
			address : wallet.getChecksumAddressString(),
			privateKey : wallet.getPrivateKeyString().substring(2).toUpperCase(),
			mnemonic : mnemonic
		};
	}
});
