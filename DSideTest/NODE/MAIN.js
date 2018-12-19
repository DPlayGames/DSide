DSideTest.MAIN = METHOD({

	run : () => {
		
		/*console.log(DSide.Data.Verify({
			signature : '0x8512f8058a60123c8ee9ddefd68154aa8b2f9b2163986394272f013207f4e65f7ee9cde2dd588a80fefa5f9c1256dac25d2ca2a5ea6cd0a62b7e407b2cf6232501',
			address : '0x85A7ed002e7024Dab267024d9ca664Da539a24ef',
			data : 'message'
		}));*/
		
		DSide.Node({
			tokenName : 'd',
			port : 1215,
			version : 0,
			accountAddress : '0x85A7ed002e7024Dab267024d9ca664Da539a24ef',
			dataStructures : {
				
				Comment : {
					type : 'TargetStore',
					structure : {
						target : {
							notEmpty : true,
							size : {
								max : 128
							}
						},
						content : {
							notEmpty : true,
							size : {
								max : 1000
							}
						}
					}
				},
				
				ViewCount : {
					type : 'TargetStore',
					structure : {
						target : {
							notEmpty : true,
							size : {
								max : 128
							}
						}
					}
				},
				
				Like : {
					type : 'TargetStore',
					structure : {
						target : {
							notEmpty : true,
							size : {
								max : 128
							}
						}
					}
				},
				
				Dislike : {
					type : 'TargetStore',
					structure : {
						target : {
							notEmpty : true,
							size : {
								max : 128
							}
						}
					}
				},
				
				Shout : {
					type : 'TimeoutStore',
					structure : {
						content : {
							notEmpty : true,
							size : {
								max : 1000
							}
						}
					}
				}
			},
			ips : [
				'192.168.1.39',
				'59.6.136.208',
				'218.152.184.238'
			]
		});
	}
});
