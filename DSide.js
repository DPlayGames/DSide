require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'DSide',
		isDevMode : true,
		
		webServerPort : 8814,
		sockerServerPort : 8815
	},
	
	NODE_CONFIG : {
		isSingleCoreMode : true
	}
});