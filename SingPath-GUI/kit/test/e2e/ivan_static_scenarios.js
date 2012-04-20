// Common tests

// Testing element cloak removal from the element selector
function testCloak(selector) {
  expect(element(selector).attr('ng-cloak')).not().toBeDefined();
}


// Test the image base and hover URLs
function testImageBaseAndHover(imageSelector, imagesUrl) {
  // Test image base URL
  expect(element(imageSelector).css('background-image')).toMatch('^url\\("?http(.)+'+ imagesUrl +'_off.png"?\\)$');
  
  // Get image current class
  expect(element(imageSelector).attr('class')).value(function(currentClass) {
    // Set image respective hover class
    hoverClass = currentClass ? currentClass+' hover' : 'hover';
    element(imageSelector).attr('class', hoverClass);
    
    // Update main image selector with the hover class
    imageSelector = currentClass ? imageSelector.replace(currentClass, hoverClass.replace(' ', '.')) : imageSelector+'.hover';
    
    // Test image hover URL
    expect(element(imageSelector).css('background-image')).toMatch('^url\\("?http(.)+'+ imagesUrl +'_on.png"?\\)$');
  });
}


// Test all options from a given resource in a respected element from a given container selector
function testMenuOptions(options, containerSelector, selectedOptionClass) {
  // General test options function
  function test(windowPath) {
    windowHref = selectedOptionClass ? windowPath.substr(windowPath.lastIndexOf('/')+1) : '';
    
    // Test all options
    for(i in options) {
      option = options[i];
      
      // Test selected menu option if needed
      if(windowHref == option["href"] && selectedOptionClass) {
        expect(element(containerSelector + ' > a:eq('+ i +')').attr("class")).toMatch(selectedOptionClass);
      }
      
      // Test all the rest option properties
      linkSelecter = containerSelector + ' > a:eq('+ i +')';
      
      expect(element(linkSelecter).text()        ).toBe(option["text"]);
      expect(element(linkSelecter).attr("href")  ).toBe(option["href"]);
      expect(element(linkSelecter).attr("target")).toBe(option["target"]);
      expect(element(linkSelecter).attr("title") ).toBe(option["title"]);
    }
  }
  
  // Getting window path if needed
  if (selectedOptionClass) {
    browser().window().path().execute(function(data, windowPath) { test(windowPath) });
  } else {
    test();
  }
}


// Test all Page Head Elements
function testPageHead() {
  testSiteLogo();
  testUserLoginMenu();
  testHeadMenuOptions();
}


// Test the site top left logo
function testSiteLogo() {
  logoSelector = '#logo';
  $logo        = element(logoSelector);
  
  // Test link properties
  expect($logo.attr('href' )).toBe('index.html');
  expect($logo.attr('title')).toBe('SingPath Logo');
  
  // Test the logo base and hover URLs
  testImageBaseAndHover(logoSelector, '/kit/_images/landingPages/landingPageButtons/singpathLogo');
}


// Test the user login info or login menu elements
function testUserLoginMenu() {
  player = {
    "player_id": 57733,
    // "player_id": "NA",
    "gravatar" : "http://www.gravatar.com/avatar/ff255e745f42e8617e7d19e69cccd2f5/?default=&amp;s=80",
    "nickname" : "Mark Zuckerberg"
  }
  
  // Simulation of setting the Global USER var
  USER_loggedIn = getUserLoggedInStatus(player);
  
  // If the user is logged in we'll perform a test over his main info in the user top menu
  if(USER_loggedIn) {
    userMenuSelector = '#userMenu';
    
    // Testing user home btn properties and images
    homeBtnSelector = userMenuSelector + ' > .homeBtn';
    $homeBtn        = element(homeBtnSelector);
    expect($homeBtn.attr('href' )).toBe('home.html');
    expect($homeBtn.attr('title')).toBe('Return to Your Home page');
    
    testImageBaseAndHover(homeBtnSelector, '/kit/_images/landingPages/landingPageButtons/houseProfile');
    
    
    // Testing user main info
    expect(element(userMenuSelector + ' > .gravatar').attr('src')).toBe(player.gravatar);
    expect(element(userMenuSelector + ' > .nickname').text()     ).toBe(player.nickname);
    
    // Testing user shop btn properties and images
    shopBtnSelector = userMenuSelector + ' > .shopBtn';
    $shopBtn        = element(shopBtnSelector);
    
    expect($shopBtn.attr('href' )).toBe('shop.html');
    expect($shopBtn.attr('title')).toBe('Go to the SingPath Shop');
    
    testImageBaseAndHover(shopBtnSelector, '/kit/_images/landingPages/landingPageButtons/shoppingTrolley');
    
    // Test sign out btn visibility
    $signOutBtn = element('#menuFooterTop > [ng-switch=""] > a');
    expect($signOutBtn.attr('href' )).toBe('sign_out');
    expect($signOutBtn.attr('title')).toBe('Sign out from Your Profile');
    expect($signOutBtn.text()       ).toMatch('sign out');
    
  } else {
    // if the user isn't logged in we'll perform test over the log in elements
    
    logInBoxSelector = '#logInBox';
    
    // Test message box greetings text
    expect(element(logInBoxSelector + ' > .messageBox').text()).toMatch('Welcome, please sign in to your account');
    
    // Test commonBtn properties
    commonBtnSelector = logInBoxSelector + ' > .commonBtn';
    expect(element(commonBtnSelector).attr('title')).toBe('Sign in to SingPath');
    expect(element(commonBtnSelector + ' > .middle').text()).toMatch('Sign In');
    
    // Test sign out btn visibility
    expect(element('#menuFooterTop > [ng-switch=""] > a')).not().toBeDefined();
  }
}


// Testing all Head Menu options
function testHeadMenuOptions() {
  // Loading window path
  expect(browser().window().path()).value(function(path) {
    // Note: It's important to load the options after the execution of expect(...).value()
    //       coz otherwise testMenuOptions() could mix vars with other testMenuOptions() calls
    options = [
      {"text": "Play"        , "href": "home.html"        , "target": "", "class": "", "title": "SingPath - The Most Fun Way to Practice Software"},
      {"text": "Splash"      , "href": "index.html"       , "target": "", "class": "", "title": "Splash"},
      {"text": "About Us"    , "href": "aboutUs.html"     , "target": "", "class": "", "title": "About Us"},
      {"text": "How to Use"  , "href": "howToUse.html"    , "target": "", "class": "", "title": "How to Use"},
      {"text": "Contribution", "href": "contribution.html", "target": "", "class": "", "title": "Contribution"},
      {"text": "Tournament"  , "href": "tournament.html"  , "target": "", "class": "", "title": "Tournament"},
      {"text": "Ranking"     , "href": "ranking.html"     , "target": "", "class": "", "title": "Ranking"}
    ];
    
    // Test all Head Menu options from the given resouce
    testMenuOptions(options, '#menuOptionsText', 'menuSelected');
  });
}


// Common function to test all elements loaded in the left profile menu with the sent resource
function testCommonLeftMenu(resource, containerSelector) {
  menuSelector  = containerSelector + ' > .textContainer > [ng-switch=""] > [ng-include=""] > .text';
  expectedCount = resource.length;
  
  // Test the removing of the cloak over the left menu
  testCloak(menuSelector);
  
  profiles = using(menuSelector).repeater('.profile');
  expect(profiles.count()).toBe(expectedCount);
  
  profileImgSrcPart = '../kit/_images/landingPages/contributionPage/profiles/';
  
  for(i=0; i<expectedCount; i++) {
    profile = resource[i];
    
    // Testing profile name and title
    expect(profiles.row(i)).toEqual([profile["name"], profile["title"]]);
    
    // Testing profile image source
    expect(element(menuSelector + ' > .profile > img:eq('+ i +')').attr('src')).toBe(profileImgSrcPart+ profile["src"] +'.png');
  }
}


// Test the content of the staff left menu
function testStaffMenu() {
  // Test the content of the contributors right menu
  staff = [
    {"name": "Sandra Boesch, PhD(ABD)", "title": "Editor in Chief"            , "src": "Sandra"},
    {"name": "Chris Boesch"           , "title": "Editor in Chief"            , "src": "Chris"},
    {"name": "Shane Williams"         , "title": "Designer, Gr8ph1cs Creative", "src": "Shane"}
  ];
  
  // Use a common function to test all loaded elements with the staff resource
  testCommonLeftMenu(staff, '.staffContainer');
}


// Test the contribution menu form the common function
function testContributionMenu() {
  // Test the content of the contributors right menu
  contributors = [
    {"name": "Danny"          , "title": "Professor, Singapore", "src": "Danny"},
    {"name": "Chris Meyers"   , "title": "Specialist"          , "src": "ChrisMeyers"},
    {"name": "Allen B. Downey", "title": "Writer"              , "src": "AllenDowney"},
    {"name": "Chris Boesch"   , "title": "Editor in Chief"     , "src": "Chris"},
    {"name": "Jeffery Elkner" , "title": "Writer"              , "src": "Jeffery"}
  ];
  
  // Use a common function to test all loaded elements with the contributors resource
  testCommonLeftMenu(contributors, '.contributorsContainer');
}


// Test all Page Footer Elements
function testPageFooter() {
  testFooterMenuOptions();
  testCopyright();
  testCompanyLogo();
}


// Test Footer Menu Options
function testFooterMenuOptions() {
  options = [
    {"text": "home"        , "href": "index.html"                         , "target": "",       "class": "", "title": "Return to Your Home page"},
    {"text": "about us"    , "href": "aboutUs.html"                       , "target": "",       "class": "", "title": "about us"},
    {"text": "how to use"  , "href": "howToUse.html"                      , "target": "",       "class": "", "title": "how to use"},
    {"text": "terms of use", "href": "termsOfUse.html"                    , "target": "",       "class": "", "title": "terms of use"},
    {"text": "contribution", "href": "contributions.html"                 , "target": "",       "class": "", "title": "contribution"},
    {"text": "feedback"    , "href": "http://getsatisfaction.com/singpath", "target": "_blank", "class": "", "title": "feedback"},
    {"text": "contact us"  , "href": "contactUs.html"                     , "target": "",       "class": "", "title": "contact us"},
    {"text": "shop"        , "href": "shop.html"                          , "target": "",       "class": "", "title": "shop"}
  ];
  
  // Test all Footer Menu options from the given resouce
  testMenuOptions(options, '#menuFooterTop');
}


// Test Copyright elements
function testCopyright() {
  // Test the Copyright year
  expect(element('#menuFooterBottom > span:first').text()).toMatch('SingPath '+ new Date().getFullYear() +'$');
}


// Test The visibility of the company logo
function testCompanyLogo() {
  // Test link properties
  logoSelector = '#gr8ph1csLogo';
  $logo        = element(logoSelector);
  expect($logo.attr('href'  )).toBe('http://www.Gr8ph1cs.com');
  expect($logo.attr('target')).toBe('_blank');
  expect($logo.attr('title' )).toBe('Designed by gr8ph1cs Creative');
  
  // Test logo base and hover URLs
  testImageBaseAndHover(logoSelector, '/kit/_images/landingPages/landingPageButtons/gr8ph1csLogo');
}


describe('Additinal tests from Ivan', function() {
  it('Testing kit/index.html', function() {
    // Load page
    browser().navigateTo('../../index.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    
    // Test TV field
    fieldSelector = '#landingImageTVIcon';
    
    // Test TV icon
    TVIconSelector = fieldSelector + ' > .tvIcon';
    expect(element(TVIconSelector).attr('title')).toBe('Watch the SingPath videos');
    testImageBaseAndHover(TVIconSelector, '/kit/_images/landingPages/landingPageButtons/television');
    
    // Test TV text
    expect(element(fieldSelector + ' > .text').text()).toBe('Coming Soon!!');
    
    
    // Test the removing of the cloak over the stats menu
    testCloak('#rankStatsBoxText');
    
    
    // Testing all stats in the #statsTextBoxtext
    statsSelector = '#rankStatsBoxText > p > .ng-binding:eq';
    statsResource = {
      "num_players"      : "4306",
      "num_badges"       : "21,014",
      "most_popular_lang": "Python", 
      "last_player"      : "Secret Agent",
      "last_country"     : "Nigeria",
      "last_badge_earner": "John",
      "last_badge"       : "Python Level 5"
    }
    
    i=0;
    for(key in statsResource) {
      expect(element(statsSelector +'('+ i++ +')').text()).toBe(statsResource[key]);
    }
    
    
    playersSelector     = '#friendsTextBoxtext'
    playersFullSelector = playersSelector     + ' > span:eq';
    numPlayresSelector  = playersFullSelector + '(0)';
    
    // Test the removing of the cloak over the total number of current players
    testCloak(numPlayresSelector);
    
    // Test the total number of current players
    expect(element(numPlayresSelector).text()).toBe("12");
    
    
    // Testing the Players content menu
    playersResources = [
      {"playerid": 58546, "nickname": "Danny", "rank": 1, "gravatar": "http://www.gravatar.com/avatar/cff81e54497e85d41ac0997f37e38416/?default=&amp;s=80"}, 
      {"playerid": 6618736, "nickname": "Lindroos", "rank": 2, "gravatar": "http://www.gravatar.com/avatar/700cc42121c63a4ae6dc074cca78b9e9/?default=&amp;s=80"}, 
      {"playerid": 6936456, "nickname": "cablin", "rank": 3, "gravatar": "http://www.gravatar.com/avatar/64add95e501623a59eff526cc433e288/?default=&amp;s=80"}, 
      {"playerid": 8232339, "nickname": "UnforgetaBill", "rank": 4, "gravatar": "http://www.gravatar.com/avatar/f2dc5584e417ac484f2047a71f8ede74/?default=&amp;s=80"}, 
      {"playerid": 6646408, "nickname": "Pythonista Supra", "rank": 5, "gravatar": "http://www.gravatar.com/avatar/d4f342130d55ed01e9a597f0525533dd/?default=&amp;s=80"},
      {"playerid": 58546, "nickname": "Danny", "rank": 1, "gravatar": "http://www.gravatar.com/avatar/cff81e54497e85d41ac0997f37e38416/?default=&amp;s=80"}, 
      {"playerid": 6618736, "nickname": "Lindroos", "rank": 2, "gravatar": "http://www.gravatar.com/avatar/700cc42121c63a4ae6dc074cca78b9e9/?default=&amp;s=80"}, 
      {"playerid": 6936456, "nickname": "cablin", "rank": 3, "gravatar": "http://www.gravatar.com/avatar/64add95e501623a59eff526cc433e288/?default=&amp;s=80"}, 
      {"playerid": 8232339, "nickname": "UnforgetaBill", "rank": 4, "gravatar": "http://www.gravatar.com/avatar/f2dc5584e417ac484f2047a71f8ede74/?default=&amp;s=80"}, 
      {"playerid": 6646408, "nickname": "Pythonista Supra", "rank": 5, "gravatar": "http://www.gravatar.com/avatar/d4f342130d55ed01e9a597f0525533dd/?default=&amp;s=80"},
      {"playerid": 8232339, "nickname": "UnforgetaBill", "rank": 4, "gravatar": "http://www.gravatar.com/avatar/f2dc5584e417ac484f2047a71f8ede74/?default=&amp;s=80"}, 
      {"playerid": 6646408, "nickname": "Pythonista Supra", "rank": 5, "gravatar": "http://www.gravatar.com/avatar/d4f342130d55ed01e9a597f0525533dd/?default=&amp;s=80"}
    ];
    
    players              = using(playersSelector).repeater('.player');
    expectedPlayersCount = playersResources.length;
    expect(players.count()).toBe(expectedPlayersCount);
    
    // Test each player cloak removal and avatar properties
    for(key in playersResources) {
      playerResource = playersResources[key];
      playerSelector = playersFullSelector +'('+ (key*1+1) +')';
      
      // Test cloak
      testCloak(playerSelector);
      
      // Test avatar properties
      expect(element(playerSelector + ' > img').attr('src')).toBe(playerResource["gravatar"]);
      expect(element(playerSelector + ' > img').attr('alt')).toBe(playerResource["nickname"]);
    }
    
    
    // Test social network field
    fieldselector = '#friendsTextBoxtextSocial';
    
    // Test text
    expect(element(fieldselector + ' > .text').text()).toBe('follow us on');
    
    // Test Facebook logo
    facebookLogoSelector = fieldselector + ' > .facebook';
    $facebookLogo        = element(facebookLogoSelector);
    expect($facebookLogo.attr('href'  )).toBe('http://www.facebook.com/apps/application.php?id=100409776687538');
    expect($facebookLogo.attr('target')).toBe('_blank');
    expect($facebookLogo.attr('title' )).toBe('follow us on Facebook');
    
    // Test Facebook hover images
    testImageBaseAndHover(facebookLogoSelector, '/kit/_images/landingPages/landingPageButtons/socialButtonsFacebook');
    
    
    // Test Twitter logo
    twitterLogoSelector = fieldselector + ' > .twitter';
    $twitterLogo        = element(twitterLogoSelector);
    expect($twitterLogo.attr('href'  )).toBe('http://twitter.com/#!/singpath');
    expect($twitterLogo.attr('target')).toBe('_blank');
    expect($twitterLogo.attr('title' )).toBe('follow us on Twitter');
    
    // Test Twitter hover images
    testImageBaseAndHover(twitterLogoSelector, '/kit/_images/landingPages/landingPageButtons/socialButtonsTwitter');
  });
  
  
  it('Testing kit/howToUse.html', function() {
    // Load page
    browser().navigateTo('../../howToUse.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    // Test Page content
    expect(element('#contributorsInfoBoxText > p').text()).toBe('How to Use');
    
    // Test the contribution menu form the common function
    testContributionMenu();
    
    // Test all page footer elements
    testPageFooter();
  });
  
  
  it('Testing kit/aboutUs.html', function() {
    // Load page
    browser().navigateTo('../../aboutUs.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    
    // TODO: Test Page content
    
    
    // Test the contribution menu form the common function
    testStaffMenu();
    
    // Test all page footer elements
    testPageFooter();
  });
  
  
  it('Testing kit/contribution.html', function() {
    // Load page
    browser().navigateTo('../../contribution.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    
    // TODO: Test Page content
    
    
    // Test the contribution menu form the common function
    testContributionMenu();
    
    // Test all page footer elements
    testPageFooter();
  });
  
  
  it('Testing kit/news.html', function() {
    // Load page
    browser().navigateTo('../../news.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    // Test Page content
    expect(element('#contributorsInfoBoxText > p').text()).toBe('News');
    
    // Test the contribution menu form the common function
    testContributionMenu();
    
    // Test all page footer elements
    testPageFooter();
  });
  
  
  it('Testing kit/shop.html', function() {
    // Load page
    browser().navigateTo('../../shop.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    
    // TODO: Test Page content
    
    
    // Test all page footer elements
    testPageFooter();
  });  
  
  
  it('Testing kit/badges.html', function() {
    // Load page
    browser().navigateTo('../../badges.html');
    
    // Test all Page Head Elements from the common function
    testPageHead();
    
    
    // TODO: Test Page content
    
    
    // Test all page footer elements
    testPageFooter();
  });
});
