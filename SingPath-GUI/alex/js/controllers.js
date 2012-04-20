/* App Controllers */

  
function IndexCtrl($resource) {	
	this.current_players = [{"playerid": 58546, "nickname": "Danny", "rank": 1, "gravatar": "http://www.gravatar.com/avatar/cff81e54497e85d41ac0997f37e38416/?default=&amp;s=80"}, {"playerid": 6618736, "nickname": "Lindroos", "rank": 2, "gravatar": "http://www.gravatar.com/avatar/700cc42121c63a4ae6dc074cca78b9e9/?default=&amp;s=80"}, {"playerid": 6936456, "nickname": "cablin", "rank": 3, "gravatar": "http://www.gravatar.com/avatar/64add95e501623a59eff526cc433e288/?default=&amp;s=80"}, {"playerid": 8232339, "nickname": "UnforgetaBill", "rank": 4, "gravatar": "http://www.gravatar.com/avatar/f2dc5584e417ac484f2047a71f8ede74/?default=&amp;s=80"}, {"playerid": 6646408, "nickname": "Pythonista Supra", "rank": 5, "gravatar": "http://www.gravatar.com/avatar/d4f342130d55ed01e9a597f0525533dd/?default=&amp;s=80"}];
	
	this.stats = {"active_paths": 3, 
			 "most_popular_lang": "Python", 
			 "num_players": 4306, 
			 "last_country": "Nigeria",
			 "ave_per_problem": 3.5,
			 "num_badges": "21,014",
			  "num_playing": 4,
			  "last_player": "Secret Agent",
			  "last_badge": "Python Level 5",
			  "last_Badge_url": "/static/badges/python/p007_on.png"
			};
	    statsModel = $resource("../jsonapi/statistics");
	    this.stats = statsModel.get();
	    
	    currentPlayersModel = $resource("../jsonapi/current_players");
	    this.current_players = currentPlayersModel.query();
	}
  IndexCtrl.$inject = ["$resource"];
                          
function MyCtrl1() {}
MyCtrl1.$inject = [];

function MyCtrl2() {}
MyCtrl2.$inject = [];
