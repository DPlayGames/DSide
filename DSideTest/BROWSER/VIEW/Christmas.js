DSideTest.Christmas = CLASS({

	preset : () => {
		return VIEW;
	},

	init : (inner, self) => {
		
		let tree = [];
		
		REPEAT(3, (i) => {
			
			let leafs = [];
			tree.push(leafs);
			
			REPEAT(5, (j) => {
				
				REPEAT(5 - j + 3 - i, () => {
					tree.push(SPAN({
						style : {
							color : '#000'
						},
						c : '*'
					}));
				});
				REPEAT(j * 2 + 1 + i * 2, () => {
					tree.push(SPAN({
						style : {
							color : RANDOM(5) === 0 ? 'yellow' : 'green'
						},
						c : '*'
					}));
				});
				
				tree.push('\n');
			});
		});
		
		INTERVAL(0.5, () => {
		
			REPEAT(10, () => {
				
				let snow = DIV({
					style : {
						position : 'fixed',
						left : RANDOM(1280),
						color : '#fff'
					},
					c : '*'
				}).appendTo(BODY);
				
				ANIMATE({
					node : snow,
					keyframes : {
						from : {
							top : -100,
						},
						to : {
							top : 10000
						}
					},
					duration : 100
				});
			});
		});
		
		tree.push(H1({
			style : {
				marginLeft : 50,
				fontSize : 20,
				color : '#fff'
			},
			c : 'Dasom Merry Christmas~!'
		}));
		
		DIV({
			style : {
				marginTop : 100,
				marginLeft : 300,
				fontSize : 50,
				lineHeight : '0.5em'
			},
			c : tree
		}).appendTo(BODY);
	}
});
