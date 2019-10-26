require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'DSide',
		isDevMode : true,
		
		DSide : {
			version : '0.2',
			port : 8814,
			accountId : '0x17a4823037b71aDFE8F5bE1246404B1b14Ae1195'
		}
	},
	
	NODE_CONFIG : {
		// 반드시 싱글코어 모드로 실행해야 합니다.
		isSingleCoreMode : true
	}
});