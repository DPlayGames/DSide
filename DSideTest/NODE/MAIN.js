DSideTest.MAIN = METHOD({

	run : () => {
		
		DSide.Node({
			tokenName : 'd',
			socketServerPort : 8223,
			webSocketServerPort : 8224,
			version : 0,
			accountAddress : '0x85A7ed002e7024Dab267024d9ca664Da539a24ef',
			dataStructures : {
				
				Article : {
					type : 'Store',
					structure : {
						title : {
							notEmpty : true,
							size : {
								max : 1000
							}
						},
						content : {
							notEmpty : true,
							size : {
								max : 5000
							}
						}
					}
				}
				
				/*Comment : {
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
				}*/
			},
			ips : [
				'192.168.1.38',
				'59.6.136.208',
				'218.152.184.238',
				'172.30.1.22'
			]
		});
	}
});
