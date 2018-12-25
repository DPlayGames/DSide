DSideTest.MAIN = METHOD({

	run : () => {
		
		DSideTest.MATCH_VIEW({
			uri : '',
			target : DSideTest.Home
		});
		
		DSideTest.MATCH_VIEW({
			uri : 'article',
			target : DSideTest.Article
		});
		
		DSideTest.MATCH_VIEW({
			uri : 'christmas',
			target : DSideTest.Christmas
		});
	}
});
