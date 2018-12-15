DSideTest.Home = CLASS({

	preset : () => {
		return VIEW;
	},

	init : (inner, self) => {
		
		let testAddress = '0x85A7ed002e7024Dab267024d9ca664Da539a24ef';
		let testPrivateKey = '71FC4E7C7CFBA6C2796F1EB22A836AECE73D8939DEDFB594BA84D937C3436CCE';
		let testMnemonic = 'smooth affair engine mandate matrix palm glimpse song ozone omit earn hub';
		
		console.log(DSide.Data.Sign({
			data : 'message',
			privateKey : testPrivateKey
		}));
		
		/*window.web3 = new Web3(Web3.givenProvider);
		
		web3.eth.getAccounts((error, accounts) => {
			
			console.log(accounts[0].toLowerCase()); // 0xeccfaa737a5a80be37e4e70130628e692413cb36
			
			web3.eth.personal.sign('message', accounts[0].toLowerCase(), (error, signature) => {
				
				console.log(signature); // 0x73b5b26d12ee4fda5cf1f7ff80c5705ca849f36fea6ea4e1673cce04aa79c31a75c4d0e869e7d99a1ba6bf806c179e6fd4dee18fc82e4dad4a77d174df128e721c
			});
		});*/
	}
});
