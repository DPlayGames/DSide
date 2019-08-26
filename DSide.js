require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'DSide',
		isDevMode : true,
		
		DSide : {
			port : 8814
		}
	},
	
	NODE_CONFIG : {
		isSingleCoreMode : true
	}
});