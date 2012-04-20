describe('Additinal test from Matias', function() {
	  //index.html
	  it('Testing kit/index.html', function() {
	    browser().navigateTo('../../index.html');
	    //stats box
	    expect(element('#rankStatsBoxText>p:first>span').text()).toBe('4306');
	    expect(element('#rankStatsBoxText>p:eq(1)>span').text()).toBe('21,014');
	    expect(element('#rankStatsBoxText>p:eq(2)>span').text()).toBe('Python');
	  });
	  //badges.html
	  it('Testing kit/badges.html', function() {
		    browser().navigateTo('../../badges.html');
		    
        //yourbadgesBoxTop
		    expect(element('#yourBadgesBoxTop > img').count()).toBe(20);
		    expect(element("#yourBadgesBoxTop > img:eq(0)").attr('title')).toBe("5 Python Contributions Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(1)").attr('title')).toBe("Beginner Python Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(2)").attr('title')).toBe("Beginner Python Contribution Badge (2)");
		    expect(element("#yourBadgesBoxTop > img:eq(3)").attr('title')).toBe("Beginner Python Contribution Badge (5)");
		    expect(element("#yourBadgesBoxTop > img:eq(4)").attr('title')).toBe("Challenge Creator Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(5)").attr('title')).toBe("GAE Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(6)").attr('title')).toBe("GAE Contribution Badge (2)");
		    expect(element("#yourBadgesBoxTop > img:eq(7)").attr('title')).toBe("Java Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(8)").attr('title')).toBe("Javascript Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(9)").attr('title')).toBe("Level Creator Badge (10) - Created a level with 10 problems");
		    expect(element("#yourBadgesBoxTop > img:eq(10)").attr('title')).toBe("Level Creator Badge (5) - Create a level with 5 problems");
		    expect(element("#yourBadgesBoxTop > img:eq(11)").attr('title')).toBe("Obj-C Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(12)").attr('title')).toBe("Problem Creator Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(13)").attr('title')).toBe("Python Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(14)").attr('title')).toBe("Ruby Contribution Badge");
		    expect(element("#yourBadgesBoxTop > img:eq(15)").attr('title')).toBe("Teacher Badge (10) - 10 people solved all the problems in one of your levels");
		    expect(element("#yourBadgesBoxTop > img:eq(16)").attr('title')).toBe("Teacher Badge (100) - 100 people solved all the problems in one of your levels");
		    expect(element("#yourBadgesBoxTop > img:eq(17)").attr('title')).toBe("Teacher Badge (25) - 25 people solved all the problems in one of your levels");
		    expect(element("#yourBadgesBoxTop > img:eq(18)").attr('title')).toBe("Teacher Badge (5) - 5 people solved all the problems in one of your levels");
		    expect(element("#yourBadgesBoxTop > img:eq(19)").attr('title')).toBe("Teacher Badge (50) - 50 people solved all the problems in one of your levels");
		    
		    //yourCountryBadgesBoxTop
		    expect(element('#yourCountryBadgesBoxTop > img').count()).toBe(80);
		    expect(element("#yourCountryBadgesBoxTop > img:eq(0)").attr('title')).toBe("Argentina Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:eq(1)").attr('title')).toBe("Asia/Pacific Region Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:eq(2)").attr('title')).toBe("Australia Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:eq(3)").attr('title')).toBe("Austria Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:eq(77)").attr('title')).toBe("Uruguay Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:eq(78)").attr('title')).toBe("Venezuela Unlock Badge");
		    expect(element("#yourCountryBadgesBoxTop > img:last").attr('title')).toBe("Vietnam Unlock Badge");
		    
		    //yourPathBadgesBox
		    expect(element("#yourPathBadgesBox > img:eq(0)").attr('title')).toBe("Beginner Python Level 1 Badge");
		    expect(element("#yourPathBadgesBox > img:eq(1)").attr('title')).toBe("Beginner Python Level 10 Badge");
		    expect(element("#yourPathBadgesBox > img:eq(2)").attr('title')).toBe("Beginner Python Level 2 Badge");
		    expect(element("#yourPathBadgesBox > img:eq(2)").attr('src')).toBe("../static/badges/mobilepaths/pythonMobile/mobilePythonBadge02.png");
		    expect(element("#yourPathBadgesBox > img:eq(3)").attr('title')).toBe("Beginner Python Level 3 Badge");
		    expect(element("#yourPathBadgesBox > img:eq(3)").attr('src')).toBe("../static/badges/mobilepaths/pythonMobile/mobilePythonBadge03.png");
		    expect(element("#yourPathBadgesBox > img:eq(4)").attr('title')).toBe("Beginner Python Level 4 Badge");
		    expect(element("#yourPathBadgesBox > img:eq(4)").attr('src')).toBe("../static/badges/mobilepaths/pythonMobile/mobilePythonBadge04.png");
		    expect(element("#yourPathBadgesBox > img:last").attr('title')).toBe("Ruby Level 9 Badge");
		    expect(element("#yourPathBadgesBox > img:last").attr('src')).toBe("../static/badges/ruby/r009_off.png");
	  });
	  
	  it('Testing kit/challengeBoard.html', function() {
	      browser().navigateTo('../../challengeboard.html');
	      expect(browser().location().hash()).toBe('');
	      expect(element('#challenge>tbody>tr:first>td[class$="name"]>a').text()).toBe("Find the sum of the first 100 prime numbers.");
	      expect(element('#challenge>tbody>tr:last>td[class$="name"]>a').text()).toBe("test test");

	  });
	  
	  it('Testing kit/ranking.html', function() {
	      browser().navigateTo('../../ranking.html');
	      expect(browser().location().hash()).toBe('');
	      
	      //expect(element('#nameBox').text()).toBe('Mark Zuckerberg');
	      expect(element("#infoBarRanking>span:first").text()).toBe("All");
	      expect(element("#infoBarRanking>span:last").text()).toBe("Ruby");
	      expect(element("#infoBarRanking>span").count()).toBe(7);
	      
	      element('#tourInfoBoxTitleTopAll #firstMiddleSlice').click(); //Singapore
	      expect(element('#rankingList>div>div[id$="Solved"]').count()).toBe(12);
	      
	      //
	      expect(element('#rankingList>div>div[id$="Solved"]:first>span').text()).toBe("243"); //#solved of first in ranking

	      expect(element('#rankingList>div>div[id$="Solved"]:last>span').text()).toBe("182"); //#solved of last in ranking
	      
	      expect(element("#rankingList>div").count()).toBe(12);
	      element('#tourInfoBoxTitleTopAll #secondMiddleSlice').click(); //WorldWide
	      expect(element("#rankingList>div").count()).toBe(25);
	      expect(element('#rankingList>div>div[id$="Solved"]:first>span').text()).toBe("243"); //#solved of first in ranking
	      expect(element('#rankingList>div>div[id$="Solved"]:last>span').text()).toBe("44"); //#solved of last in ranking

	      
	      expect(element('#rankCtryList > div').count()).toBe(79);
	      
	      expect(element('#rankCtryList>div>div[id$="Flag01"]:first>img').attr('alt')).toBe('Singapore');
	      expect(element('#rankCtryList>div>div[id$="NumPeople01"]:first').text()).toBe('1828');
	      expect(element('#rankCtryList>div>div[id$="Flag01"]:last>img').attr('alt')).toBe('Uruguay');
	      expect(element('#rankCtryList>div>div[id$="NumPeople01"]:last').text()).toBe('1');
	      
	      
	      element('#tourInfoBoxTitleTopAll #firstMiddleSlice').click(); //Singapore
	      expect(element('#rankingList > div:last').attr('id')).toBe('raBox20');
	      
	      element('#tourInfoBoxTitleTopAll #secondMiddleSlice').click(); //WorldWide
	      expect(element('#rankingList > div:last').attr('id')).toBe('raBoxUR');
	      
	      
	      //stats box
	      expect(element('#rankStatsBoxText>p:first>span').text()).toBe('4306');
	      expect(element('#rankStatsBoxText>p:eq(1)>span').text()).toBe('21,014');
	      expect(element('#rankStatsBoxText>p:eq(2)>span').text()).toBe('Python');
	      
	      
	      
	  });
	  
	  
	  
	});