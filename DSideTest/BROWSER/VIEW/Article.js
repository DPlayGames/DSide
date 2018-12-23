DSideTest.Article = CLASS({

	preset : () => {
		return VIEW;
	},

	init : (inner, self) => {
		
		DSide.Connect({
			port : 8224,
			ips : [
				'192.168.1.38',
				'59.6.136.208',
				'218.152.184.238',
				'172.30.1.22'
			]
		}, (node) => {
			console.log('CONNECTED!');
			
			console.log(node.getNodeTime(new Date()));
			
			window.web3 = new Web3(Web3.givenProvider);
			
			web3.eth.getAccounts((error, accounts) => {
				
				let address = accounts[0];
				let data = {
					storeName : 'Article',
					address : address,
					title : 'test title',
					content : 'test content',
					createTime : node.getNodeTime(new Date())
				};
				
				let sortedData = {};
				Object.keys(data).sort().forEach((key) => {
					sortedData[key] = data[key];
				});
				
				web3.eth.personal.sign(STRINGIFY(sortedData), address, (error, hash) => {
					
					node.saveData({
						hash : hash,
						data : data
					}, console.log);
				});
			});
		});
	}
});
