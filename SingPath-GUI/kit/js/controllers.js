/* App Controllers */


// Global hash change callback register
window.onHash = [];

// Create an alternative to jQuery onhashchange event
function checkHash() {
  if(hash = window.location.hash) {
    // Remove the hash from the address bar
    window.location.hash = '';
    
    // Call a callback function if there's any in the Global register
    if(typeof(callback = window.onHash[hash]) == 'function') {
      callback.call();
    }
  }
}
setInterval(checkHash, 100);


// Create a Global var to keep track of the player session
window.USER = {
 "isLogged": false
}
window.MENU = true;


function RankingStatsPageCtr($scope){
	$scope.index_style = '';
}


function IndexStatsPageCtr($scope){
	$scope.index_style = 'top:-150px';
}


// Set a certain number of actions when the page is loaded
function LoadPageCtrl($scope, $resource) {
  // Mapping the Global var to the current controller var
  // Note: Object copping in JavaScript is made by reference
  $scope.USER = window.USER;
  $scope.MENU = window.MENU;
  
  // Send a request back to the server which page was loaded and when
  LogAccessCtrl($resource);
  
  // Preload some basic images
  MM_preloadImages('_images/landingPages/landingPageButtons/singpathLogo_on.png','_images/landingPages/landingPageButtons/signUp_on.png','_images/landingPages/landingPageButtons/houseProfile_on.png','_images/landingPages/landingPageButtons/shoppingTrolley_on.png','_images/landingPages/landingPageButtons/gr8ph1csLogo_on.png','_images/landingPages/landingPageButtons/signIn_on.png');
}


// Send a request back to the server which page was loaded and when
function LogAccessCtrl($resource) {
  logAccess = $resource('../jsonapi/log_access').get(function() {
    logAccess.page = getHref();
    logAccess.date = new Date().getTime();
    
    // Saving will be available once we create the back-end server to response the POST requests
    // logAccess.$save();
  });
}


// Preload images
// TODO: To be updated
function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}


function UserLoginMenuCtrl($scope, $resource, $window) {
  $scope.player = $resource('../jsonapi/player').get(function() {
    // Setting the Global var
    window.USER.isLogged = getUserLoggedInStatus($scope.player);
    
    // Secure a maximum nickname chars so the string won't over flow outside the box
    $scope.player.nickname = clampString($scope.player.nickname, 35);
  });
  
  // Sign in btn attributes
  $scope.btn = {
    "href" : "#",
    "title": "Sign in to SingPath",
    "label": "Sign In"
  };
}


function IndexCtrl($scope, $resource) {
  // Load all games statistics
  $scope.stats = $resource('../jsonapi/statistics').get();
  
  // Load all details about the current player
  $scope.current_players = $resource('../jsonapi/current_players').query();
}


// Load all Programming language's Logos at the footer in the index page
function FooterLogosCtrl($scope, $resource) {
  $scope.baseSrcBegin = "_images/landingPages/indexPage/logos/";
  $scope.baseSrcEnd   = "Logo.png";
  $scope.footerLogos  = $resource('../jsonapi/footerLogos').query();
}


function RankingCtrl($scope, $resource) {
  countryModel = $resource("../jsonapi/country_ranking");
  $scope.country_ranking = countryModel.get();
  
  $scope.addZeros = function(elem){
		width = 2;
		number = elem.rank;
		width -= number.toString().length;
		if ( width > 0 )
		  {
		    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
		  }
		return number;
	}
}


function ContributionCtrl($scope, $resource) {
  // Setting all panel properties
  $scope.containerClass = "contributorsContainer";
  $scope.label          = "Contributors";
  $scope.btn            = {
    "href" : "contribution.html",
    "title": "View All Contributors",
    "size" : "small",
    "label": "View All Contributors"
  };
  
  // Getting all contributors from the jsonapi
  $scope.contributors = $resource('../jsonapi/contributors').query();
  
  // Cache the base sorce path so we could keep the database thin
  $scope.baseSrc = '../kit/_images/landingPages/contributionPage/profiles/';
};


function StaffCtrl($scope, $resource) {
  // Setting all panel properties
  $scope.containerClass = "staffContainer";
  $scope.label          = "Staff";
  $scope.btn            = {
    "href" : "staff.html",
    "title": "More Staff",
    "size" : "big",
    "label": "More Staff"
  };
  
  // Getting all contributors from the jsonapi
  $scope.staff = $resource('../jsonapi/staff').query();
  
  // Cache the base sorce path so we could keep the database thin
  $scope.baseSrc = '../kit/_images/landingPages/contributionPage/profiles/';
};


function YourLevelBadgesCtrl($scope, $resource) {	
  yourLevelBadgesModel = $resource("../jsonapi/all_badges");
  $scope.badges = yourLevelBadgesModel.get();
  $scope.doFilter = function(elem) {
    elem.imageURL = elem.imageURL.replace(/^\/static/, "../static");
      if (elem.imageURL && !elem.awarded) {
        elem.imageURL = elem.imageURL.replace('_on', '_off');
      }
    var eval_class = (elem.class.indexOf('CountryBadge')<0 && elem.class.indexOf('Level_Badge')<0);
      return (eval_class);
  }
  
  $scope.clickEvent = function(elem,badge){
    window.alert("elem:"+elem.src);
  }
  
  $scope.returnClass = function(elem){
    var url = elem.imageURL.replace(/^\/static/, "../static");
      var clazz = 'earnedBadge';
      if (url && !elem.awarded) {
          clazz = 'notEarnedBadge';
      }
      return clazz;
  }
}


function CountryLevelBadgesCtrl($scope, $resource) {	
  countryLevelBadgesModel = $resource("../jsonapi/all_badges");
  $scope.badges = countryLevelBadgesModel.get();
  $scope.doFilter = function(elem) { 
    elem.imageURL = elem.imageURL.replace(/^\/static/, "../static");
      if (elem.imageURL && !elem.awarded) {
        elem.imageURL = elem.imageURL.replace('_on', '_off');
      }
      var eval_class = elem.class.indexOf('CountryBadge')>0
      return eval_class ;
  }
  $scope.clickEvent = function(elem,badge){
    window.alert("elem:"+elem.src);
  }
  $scope.returnClass = function(elem){
    var url = elem.imageURL.replace(/^\/static/, "../static");;
      var clazz = 'earnedBadge';
      if (url && !elem.awarded) {
          clazz = 'notEarnedBadge';
      }
      return clazz;
  }
}


function YourBadgesBoxTop($scope, $resource) {	
  yourBadgesBoxTop = $resource("../jsonapi/all_badges");
  $scope.badges = yourBadgesBoxTop.get();
  $scope.badges_elements = [];
  $scope.prevBadge = undefined;
  
  $scope.clickEvent = function(elem,badge){
    window.alert("elem:"+elem.src);
  }
  
  $scope.doFilter = function(elem) {
    elem.imageURL = elem.imageURL.replace(/^\/static/, "../static");
      if (elem.imageURL && !elem.awarded) {
        elem.imageURL = elem.imageURL.replace('_on', '_off');
      }
      $scope.badges_elements.push(elem);
      var eval_class = elem.class.indexOf('Level_Badge')>0;
      return eval_class;
  }
  $scope.returnStyle = function(elem){
    var index = $scope.badges_elements.indexOf(elem);
    var prevBadge = undefined;
    if (index>0) {
      prevBadge = $scope.badges_elements[index-1];
      
    }else{
      window.alert(elem.description);
    }
    if (prevBadge && prevBadge.path_id != elem.path_id){
      
      return '{display:block;clear:both;}';
    }
    return '';
  }
  $scope.returnClass = function(elem){
    var url = elem.imageURL.replace(/^\/static/, "../static");;
      var clazz = 'earnedBadge';
      if (url && !elem.awarded) {
          clazz = 'notEarnedBadge';
      }
      return clazz;
  }
}


function CountriesCtrl($scope, $resource) {	
  allCountriesModel = $resource("../jsonapi/all_countries");
  $scope.allCountries = allCountriesModel.get();
  $scope.countries = [];
  $scope.countriesCount= function(){
      var index = 0;
    angular.forEach($scope.allCountries.countries, function(elem) {
        ++index;
      });
    return index;
    };
}


function TagsCtrl($scope, $resource, $location) {
	tagsCtrl = $resource('../jsonapi/tags');
	$scope.tags = [];
	$scope.tagsCtrl = tagsCtrl.get(function(){
		angular.forEach($scope.tagsCtrl.tags, function(elem) {
			$scope.tags.push(elem);
	    });
		if ($location.search().tag){
			var selected = -1;
			var pointer = 0;
			angular.forEach($scope.tagsCtrl.tags, function(elem) {
		          if (elem==$location.search().tag){
		        	  selected = pointer;
		          }
		           ++pointer;
		    });
			if (selected==-1){
				//insert the new tag into the array
				$scope.tags.push($location.search().tag);
				selected = $scope.tags.length-1;
			}
			$scope.index = selected;
		}
	});
	$scope.index = 0;
	$scope.tagCount= function(){
        var index = 0;
    	angular.forEach($scope.tags, function(elem) {
          ++index;
        });
    	return index;
    };
	$scope.selectNextTag = function(){
		if ($scope.index<$scope.tagCount()-1)
			++$scope.index;
		else
			$scope.index = 0;
	}
}


function LanguageSelectorCtrl($scope, $resource) {
	$scope.allClass = 'on';
	$scope.languages = []
	languageSelector = $resource('../jsonapi/get_game_paths');
	$scope.languageSelector = languageSelector.get(function(){
			angular.forEach($scope.languageSelector.paths, function(elem) {
				$scope.languages.push({data:elem,selected:false});
			});
	});
	$scope.pathSelected=function(path){
		var index = 0;
		var selected = -1
		angular.forEach($scope.languageSelector.paths, function(elem) {
				if (elem==path)
					selected = index;
				++index;
		});
		if (selected!=-1 && $scope.languages[selected].selected)
			return "on";
		return "off";
	}
	$scope.pathAllSelected = function(){
		return $scope.allClass;
	}
	$scope.setPathAllSelected = function(value){
		$scope.allClass=value;
	}
	
	$scope.setPathSelected=function(path,all){
		var index = 0;
		var selected = -1;
		angular.forEach($scope.languageSelector.paths, function(elem) {
				if (elem==path)
					selected = index;
				++index;
		});
		angular.forEach($scope.languages,function(elem){
			elem.selected = false;
		});
		if (all){
			$scope.setPathAllSelected('on');
		}
		else{
			$scope.setPathAllSelected('off');
			$scope.languages[selected].selected = true;
		}
	}
}


function ChallengeAnswerCtrl($scope, $resource, $location) {
	challengeRes = $resource('../jsonapi/get_challenge_player_message?challenge_id=:challenge_id&player_id=:player_id');
	
	$scope.player_id = null;
	$scope.challenge_id = null;
	$scope.challenge = null;
	$scope.name = null;
	$scope.publicMessage = null;
	$scope.registeredMessage = null;
	$scope.unlockMessage = null;
	$scope.privateMessage = null;
	$scope.challenge_id = null;
	$scope.playerFeedback = null;
	$scope.playerAttachmentID = null;
	
	if ($location.search().challenge_id && $location.search().player_id ){
		$scope.challenge_id = $location.search().challenge_id;
	    $scope.player_id = $location.search().player_id;
		$scope.challenge = challengeRes.get({challenge_id: $scope.challenge_id, player_id: $scope.player_id},
		function(){
			$scope.name=$scope.challenge.challenge.name;
            $scope.publicMessage = $scope.challenge.challenge.publicMessage;
            $scope.registeredMessage = $scope.challenge.challenge.registeredMessage;
            $scope.unlockMessage=$scope.challenge.challenge.unlockMessage;
            $scope.privateMessage=$scope.challenge.challenge.privateMessage;
            $scope.challenge_id=$scope.challenge.challenge.challenge_id;
            $scope.playerFeedback=$scope.challenge.challenge.playerFeedback;
            $scope.playerAttachmentID =$scope.challenge.challenge.playerAttachmentID;
		}
		);
	}
}


function TournamentsCtrl($scope, $resource) {
	tournament = $resource("../jsonapi/list_tournaments");
	$scope.tournament = tournament.query(function(){
			renderTournamentList($scope.tournament);
			if (getTournamentID()) {
					tournament_registration_status = $resource('../jsonapi/tournament_registration_status/' + getTournamentID());
					tournament_registration_status_get = tournament_registration_status.get(function(){
						checkTournamentRegistrationStatus(tournament_registration_status_get);
						reloadTournamentPage(getTournamentID());
					});
		      } else {
		        disableSignIn();
		      }
	});
}


function TournamentCtrl($scope, $resource) {
	var tournamentID = getParameterFromURL('tournamentID');
	tournament = $resource('../jsonapi/tournament/'+tournamentID);
	$scope.tournament = tournament.get(function(){
		renderTournamentRanking($scope.tournament)
	});
}


function ChallengesCtrl($scope, $resource) {
  $scope.loadChallenges = function (is_all_challenges){
          var challenges_per_page = 30;
      var data = {};
        if (getPathId()) {
            data['path_id' ] = getPathId();
        }
        var challenges_per_page = 30;
        data['limit'] = challenges_per_page + 1;
        var page = (is_all_challenges ? page_all_challenges : page_my_challenges);
        data['offset'] = challenges_per_page * page;
        var url = (is_all_challenges ? '../jsonapi/list_challenges' : '../jsonapi/list_my_challenges');
        url = url + '?path_id=:path_id&limit=:limit&offset=:offset'
        var prevCode;
        var nextCode;
        if (is_all_challenges) {
            prevCode = 'page_all_challenges--;loadChallenges()';
            nextCode = 'page_all_challenges++;loadChallenges()';
        } else {
            prevCode = 'page_my_challenges--;loadMyChallenges()';
            nextCode = 'page_my_challenges++;loadMyChallenges()';
        }
      challengeRes = $resource(url);
      $scope.badgesById = {};
      $scope.countriesById = {};
      $scope.challenge = challengeRes.get({path_id:data['path_id' ],limit:data['limit'],offset:data['offset']},function(){
        all_badges = $resource("../jsonapi/all_badges");
        self.badges = all_badges.get(function(){
           for (var i in self.badges['badges']) {
                      var b = self.badges['badges'][i];
                      self.badgesById[b['id']] = b;
                  }
           all_countries = $resource("../jsonapi/all_countries");
           self.countries = all_countries.get(function(){
             for (var i in self.countries['countries']) {
                        var b = self.countries['countries'][i];
                        var name = b['countryName'];
                        self.countriesById[b['id']] = b;
                    }
             renderChallenges(
                  self.countriesById,
                  self.badgesById,
                  $scope.challenge,
                          is_all_challenges,
                          challenges_per_page,
                          data['offset'],
                          prevCode,
                          nextCode);
            });
         });
      });
  }
  $scope.loadChallenges(true);
}


function ChallengesAllCtrl($scope, $resource) {
  var url = '../jsonapi/list_challenges';
  $scope.badgesById = {};
  $scope.countriesById = {};
  challengeRes = $resource(url);
  $scope.challenge = challengeRes.get(function(){
    all_badges = $resource("../jsonapi/all_badges");
    $scope.badges = all_badges.get(function(){
       for (var i in $scope.badges['badges']) {
                  var b = $scope.badges['badges'][i];
                  $scope.badgesById[b['id']] = b;
              }
       all_countries = $resource("../jsonapi/all_countries");
       $scope.countries = all_countries.get(function(){
         for (var i in $scope.countries['countries']) {
                    var b = $scope.countries['countries'][i];
                    var name = b['countryName'];
                    $scope.countriesById[b['id']] = b;
                }
          loadChallenges($scope.challenge,$scope.badgesById,$scope.countriesById)
        });
     });
  });
}


function ListChallengePlayersCtrl($scope, $resource) {
	var challenge_id = getIdFromURL('challenge_id');
	if (challenge_id){
			var url = '../jsonapi/list_challenge_players';
			url = url + '?challenge_id=:challenge_id';
			challengeRes = $resource(url);
			$scope.challenge = challengeRes.get({challenge_id:challenge_id},function(){
					loadChallengePlayers($scope.challenge);
			});
	}
}


function LoadProblemCtrl($scope, $resource) {
  var problem_id = getIdFromURL('problem_id');
  if (problem_id){
      var url = '../jsonapi/get_problem';
      url = url + '?problem_id=:problem_id';
      problemRes = $resource(url);
      $scope.problemRes = problemRes.get({problem_id:problem_id},function(){
        loadProblem($scope.problemRes);
      });
  }else {
        loadLanguages();
    }
}


function GetGamePathCtrl($scope, $resource) {
	var url = '../jsonapi/get_game_paths';
	challengeRes = $resource(url);
	$scope.get_game_paths = challengeRes.get(function(){
		 		all_countries = $resource("../jsonapi/all_countries");
				 $scope.countries = all_countries.get(function(){
					 //var url = '../jsonapi/get_challenge_for_edit';
					//url = url + '?challenge_id=:challenge_id';
					//	get_challenge_for_edit = $resource(url);
					//	$scope.get_challenge_for_edit = get_challenge_for_edit.get(function(){
							loadCountries($scope.countries);
						 	loadGamePathsAndBadges($scope.get_game_paths);
					//		loadChallenge($scope.get_challenge_for_edit);
					//	});
				 });
	});
}


function GetChallengeForEditCtrl($scope, $resource) {
  
}


function TournamentRankingCtrl($scope, $resource) {
	$scope.tournamentRanking = $resource('../jsonapi/get_heat_ranking').get();
}


function WorldWideRankingCtrl($scope, $resource) {
	$scope.ranking = [];
	$scope.currentCountry = "Singapore";
	$scope.currentCountryCode = "SG";
	$scope.activeWorldRanking = false;
	worldWideRanking = $resource('../jsonapi/worldwide_ranking?maxRank=:maxRank&path_id=:path_id&countryCode=:countryCode',{maxRank:'25',path_id:'6569723',countryCode:'SG'});
	$scope.worldWideRanking = worldWideRanking.get({maxRank:'25',path_id:'6569723',countryCode:'SG'},function(){
		$scope.initRanking($scope.doFilterByCountry);
	});
	
	$scope.getStyle0 = function(){
		return $scope.style0;
	}
	
	$scope.getStyle = function(){
		return $scope.style;
	}
	
	$scope.getStyle2 = function(){
		return $scope.style2;
	}
	
	$scope.getStyle3 = function(){
		return $scope.style3;
	}
	
	$scope.getStyle4 = function(){
		return $scope.style4;
	}
	
	$scope.activateWorldRanking = function() {
				 $scope.activeWorldRanking = true;
				 $scope.style0={
			      'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
			  	  'background-position': '-35px -52px',
			  	  'background-repeat': 'no-repeat',
			  	  'width': '8px',
			  	  'cursor': 'pointer'
			      }; 
			      $scope.style3={
			      	'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
			  		'background-position': '-170px -52px',
			  		'background-repeat': 'no-repeat',
			  		'width': '8px',
			  		'cursor': 'pointer'
			      };
			      $scope.style4={
			      	'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
			  		'background-position': '-13px -52px',
			  		'background-repeat': 'no-repeat',
			  		'width': '18px'
			      };
			      $scope.style2={
				  'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
			  	  'background-position': '0px -27px',
			  	  'background-repeat': 'no-repeat',
			  	  'color': 'white',
			  	  'font-size': '16px',
			  	  'font-weight': 'normal'
				  };
			      $scope.style= {
			        'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
					'background-position': '0px -1px',
					'background-repeat': 'no-repeat',
					'color': '#49727A',
					'font-size': '16px',
					'font-weight': 'normal',
					'cursor': 'pointer'
					};
	}
	
	$scope.activateTabCountry = function() {
			  $scope.activeWorldRanking = false;
			  $scope.style0={
			  'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
		  	  'background-position': '0px -52px',
		  	  'background-repeat': 'no-repeat',
		  	  'width': '8px'
			  };
		      $scope.style3={
			  'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
		  	  'background-position': '-129px -52px',
		  	  'background-repeat': 'no-repeat',
		  	  'width': '8px'
			  };
		      $scope.style4={
			  	'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
		  		'background-position': '-45px -52px',
		  		'background-repeat': 'no-repeat',
		  		'width': '23px',
		  		'cursor': 'pointer'
			  };
		      $scope.style={
			  'background-image': 'url(_images/commonButtons/tab-headers-combined.png)',
		  	  'background-position': '0px -27px',
		  	  'background-repeat': 'no-repeat',
		  	  'color': 'white',
		  	  'font-size': '16px',
		  	  'font-weight': 'normal'
			  };
		      $scope.style2= {'cursor':'pointer','color': '#517A83', 'border': '0px none #FFF100', 'background': 'url(_images/commonButtons/tab-headers-combined.png) no-repeat 0px 0px' };
	}

	$scope.loadLanguage = function(path_id) {
		$scope.path_id = path_id;
		$scope.worldWideRanking = worldWideRanking.get({maxRank:'25',path_id:$scope.path_id,countryCode:$scope.currentCountryCode},function(){
			if ($scope.activeWorldRanking)
				$scope.initRanking($scope.doFilter);
			else
				$scope.initRanking($scope.doFilterByCountry);
		});
	}  
	
	$scope.getCurrentCountry=function() {
		return $scope.currentCountry;
	}
	
	$scope.checkLast = function(elem) {
		var index = $scope.ranking.indexOf(elem);
		var count = $scope.playersCount();
		if (elem.rank>25)
			return "UR";
		width = 2;
		number = elem.rank;
		width -= number.toString().length;
		if ( width > 0 )
		  {
		    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
		  }
		return number;
	}
	$scope.addZeros = function(elem) {
		width = 2;
		number = elem.rank;
		if (elem.rank>25)
			return "25";
		width -= number.toString().length;
		if ( width > 0 )
		  {
		    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
		  }
		return number;
	}
	$scope.doLanguageSelection = function(elem) {
		return elem.path_id==$scope.current_path_id;
	}
	$scope.doFilter = function(elem) {
        return true;
    }
	
	$scope.doFilterByCountry = function(elem) {
        var isOK = elem.playerCountry.countryName==$scope.currentCountry;
        if (isOK){
        	return true;
        }
        return false;
    }
	$scope.setCountry = function(country) {
		$scope.currentCountry = country.countryName;
		$scope.currentCountryCode = country.country_code;
		$scope.worldWideRanking = worldWideRanking.get({maxRank:'25',path_id:$scope.path_id,countryCode:$scope.currentCountryCode},function(){
			$scope.initRanking($scope.doFilterByCountry);
		});
		$scope.activateTabCountry();
	}
	$scope.getRanking = function() {
			return $scope.ranking;
	}
	$scope.initRanking = function(whichFilter) {
		$scope.currentFilter = whichFilter;
		$scope.ranking = [];
		angular.forEach($scope.worldWideRanking.rankings.filter($scope.currentFilter), function(elem) {
	          $scope.ranking.push(elem);
	    });
	}
	$scope.reloadRanking = function() {
		$scope.ranking = [];
		angular.forEach($scope.worldWideRanking.rankings.filter($scope.currentFilter), function(elem) {
	          $scope.ranking.push(elem);
	    });
	}
	
	$scope.playersCount= function() {
        var index = 0;
    	angular.forEach($scope.worldWideRanking.rankings, function(elem) {
          ++index;
        });
    	return index;
      };
      //$scope.initRanking($scope.doFilter);
}


function HeatRankingCtrl($scope, $resource) {
	heatRanking = $resource('../jsonapi/get_heat_ranking');
	$scope.heatRanking = heatRanking.get();
	$scope.heatRankingArray = [];
	
	$scope.doFilter = function(elem) {
        $scope.heatRankingArray.push(elem);
        return true;
    }
	$scope.doFilter2 = function(elem) {
        $scope.heatRankingArray.push(elem);
        return true;
    }
}


function HeadMenuOptionsCtrl($scope, $resource, $location) {
  // Taking all menu options
  $scope.options = $resource('../jsonapi/headMenuOptions').query(function(options) {
    // Setting the selected menu option as 'menuSelected' regarding the page href
    href = getHref();
    for(i in options) {
      option = options[i];
      if(option.href == href) {
        option.class = 'menuSelected';
        break;
      }
    }
  });
}


function FooterMenuOptionsCtrl($scope, $resource) {
  // Taking all footer menu options
  $scope.options = $resource('../jsonapi/footerMenuOptions').query();
}


function GoogleAnalyticsCtrl($scope) {
  // Location Google Analytics JS file
  $scope.gaJsSrc = getFirstURLChars() + 'google-analytics.com/ga.js';
}


function JanrainCtrl($scope) {
  // Location Janrain JS file
  $scope.rpxJsSrc = getFirstURLChars() + 'rpxnow.com/js/lib/rpx.js';
}


function CopyrightCtrl($scope) {
  // Setting the Copyright year
  $scope.year = new Date().getFullYear();
}


// Controller for the home.html
function HomeCtrl($scope, $resource, $route){
  this.jsonapi = $resource('../jsonapi/:id', {id: '@id'});
  this.loadPlayer($scope);
}

HomeCtrl.prototype.loadPlayer = function($scope) {
  // Loading a test player
  this.jsonapi.get({id: 'player_test'}, function(player) {
    $scope.player = player;
  });
}
