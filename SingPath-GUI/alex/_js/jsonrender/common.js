function log_access(page) {
    ajax({
        url: '../log_access',
        data: {page: page},
        skip_check_login_error: true,
        skip_display_error: true,
        dataType: 'json',
        success: function(result) {
            //nothing to do
        }
    });
}
/**
 * Checks the given json object, and if it has an 'error' key, and the error message
 * is 'No player currently logged in' or 'No player logged in', it shows
 * the Janrain login box.
 * Otherwise nothing happens.
 */
function checkLoginError(jsonResult) {
  var result = false;
  try {
      if (jsonResult && jsonResult['error'] && 
          (jsonResult['error'] == 'No player currently logged in' ||
           jsonResult['error'] == 'No player logged in')) {
            result = true;
            showJanrainLoginBox();
      }
  } catch (e) {
      //ignore all exceptions
  }
  return result;
}
var _janrainLoginBoxTimer = null;
var _janrainLoginBoxCounter = 0;
function showJanrainLoginBox() {
    $('.rpxnow').remove();
    $('script').each(function(i, e){if (/rpx/.test(e.src)){$(e).remove()}});
    var host = document.location.protocol+'//'+document.location.host;
    var url = host+'/rpx.php?target='+window.location;
    var a = document.createElement('a');
    a.setAttribute('class', 'rpxnow');
    a.setAttribute('href', 'https://singpath.rpxnow.com/openid/v2/signin?token_url='+url);
    document.body.appendChild(a);

    var rpxJsHost = (("https:" == document.location.protocol) ? "https://" : "http://static.");
    var myscript = document.createElement('script');
    myscript.setAttribute('src', rpxJsHost + "rpxnow.com/js/lib/rpx.js");
    document.body.appendChild(myscript);

    window.clearTimeout(_janrainLoginBoxTimer);
    _janrainLoginBoxCounter = 0;
    showJanrainLoginBoxHelper();
    $("div#loading").show();
}
function showJanrainLoginBoxHelper() {
    try {
        var elements = document.getElementsByClassName("rpxnow");
        if (elements && elements.length > 0) {
            elements[0].onclick();
            $("div#loading").hide();
        }
    } catch (e) {
        //Janrain need time for initialization, until then we get an exception:
        //"TypeError: Property 'onclick' of object XXX is not a function"
        window.clearTimeout(_janrainLoginBoxTimer);
        _janrainLoginBoxCounter++;
        //if Janrain popup is not visible, reschedule this method again
        if ($('div.widget').length == 0) {
            if (_janrainLoginBoxCounter < 25) {
                _janrainLoginBoxTimer = window.setTimeout(showJanrainLoginBoxHelper, 200);
            } else {
                var host = document.location.protocol+'//'+document.location.host;
                var url = host+'/rpx.php?target='+window.location;
                window.location = 'https://singpath.rpxnow.com/openid/v2/signin?token_url='+url;
            }
        } else {
            $("div#loading").hide();
        }
    }
}
function getIdFromURL(varName, defaultValue) {
    var r = RegExp(varName + '=([0-9]+)');
    var result = defaultValue;
    if (r.exec(document.URL) != null) {
        result = parseInt(RegExp.$1);
    }
    return result;
}
function getParameterFromURL(varName, defaultValue) {
    var r = RegExp(varName + '=([^&?]+)');
    var result = defaultValue;
    if (r.exec(document.URL) != null) {
        result = unescape(RegExp.$1);
    }
    return result;
}
function loadPlayerData(afterFunc, noredirect, loginNameDetail) {
    if (loginNameDetail == undefined) {
        loginNameDetail = 'logIndetailsNameText';
    }
    // player data
    ajax({
        url: '../jsonapi/player',
        skip_check_login_error: true,
        skip_display_error: true,
        success: function(player) {
            /*var k = "";
            for(var prop in player) {
                k+=prop+" "+player[prop];
            }
            alert(k);*/
            var tags = '';
            var tagsLink = '';
            for (var idx in player.tags) {
              if (tags) {
                tags += ', ';
                tagsLink += ', ';
              }
              tags += player.tags[idx];
              tagsLink += '<a class="rankingLinks" href="/alex/ranking.html?tag='+
                    escape(player.tags[idx])+'">'+player.tags[idx]+'</a>';
            }
            if (!noredirect) {
                if (checkLoginError(player)) {
                    return;
                }
            }
            if (player['error']) {
                $('#logIndetailsNameText').html("Please Sign In To Register");
                $('#logInGravatarPhoto').html('');
            } else {
                $('#' + loginNameDetail).html(player.nickname);
                $('#logInGravatarPhoto').html('<img src="' + player.gravatar + '" class="logInGravatarPhoto"/>');
            }
            $('#editProfileName').val(player.nickname);
            $('#editProfileYearOfBirth').val(player.yearOfBirth);
            $('#editProfileTags').val(tags);
            $('#profileNameText').html(player.nickname);
            $('#hpGravatarLarge').html('<img src="' + player.gravatar + '" class="hpGravatarLarge"/>');   //default view
            $('#editGravatarLarge').html('<img src="' + player.gravatar + '" class="editGravatarLarge"/>'); //edit profile

            var professional = '';
            if (player.professional == '1') {
                professional = 'Professional';
            }
            if (player.professional == '0') {
                professional = 'Student';
            }
            var html =
                '<table class="profileDetailsInfo">'+
                  '<tr>'+
                    '<td class="value"><b>'+professional+'</b></td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>Location:</b> '+(player.location ? player.location : '')+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>Tags:</b> '+tagsLink+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>About me:</b> '+(player.about ? player.about : '')+'</td>'+
                  '</tr>'+
                '</table>';
            $('#hpProfileDetails').html(html); //home page, profile details
            
            $('#profileDetails').removeClass('professional');
            $('#profileDetails').removeClass('student');
            if (player.professional == '1') {
                $('#editProfileStudent').each(function(i){this.checked = false;});
                $('#editProfileProfessional').each(function(i){this.checked = true;});
                $('#profileDetails').addClass('professional');
            }
            if (player.professional == '0') {
                $('#editProfileProfessional').each(function(i){this.checked = false;});
                $('#editProfileStudent').each(function(i){this.checked = true;});
                $('#profileDetails').addClass('student');
            }
            $('div#gender').removeClass('male');
            $('div#gender').removeClass('female');
            if (player.gender) {
                $('select#gender').each(function(i){this.value = player.gender;});
                $('div#gender').addClass(player.gender);
            }
            if (player.location) {
                $('#editProfileLocation').each(function(i){this.value = player.location;});
            }
            if (player.about) {
                $('#editProfileAbout').each(function(i){this.value = player.about;});
            }
            if (player.countryFlagURL) {
                $('div#country').html('<img src="'+player.countryFlagURL+'" class="country"/>');
            }
            
            if (typeof(afterFunc) == 'function') {
                afterFunc(player);
            }
        }
    });
}
function createBadge(imageURL, tooltip, clazz) {
    var html = '<img src="'+imageURL+'"';
    if (tooltip) {
        html += ' title="'+tooltip+'" onclick="alert(&quot;'+tooltip+'&quot;)"'
    }
    if (clazz) {
        html += ' class="'+clazz+'"';
    }
    return html+'/>';
}
function loadOtherPlayerProfile(player_id, $popup, afterFunc) {
    // player data
    ajax({
        url: '../jsonapi/player'+(player_id ? '/'+player_id : ''),
        data: {load_badges: 1},
        success: function(player) {
            /*var k = "";
            for(var prop in player) {
                k+=prop+" "+player[prop];
            }
            alert(k);*/
            var tags = '';
            for (var idx in player.tags) {
              if (tags) {
                tags += ', ';
              }
              tags += '<a class="rankingLinks" href="/alex/ranking.html?tag='+
                    escape(player.tags[idx])+'">'+player.tags[idx]+'</a>';
            }
            $popup.find('#profileNameText').html(player.nickname);
            $popup.find('#showGravatarLarge').html('<img src="' + player.gravatar + '" class="showGravatarLarge"/>');

            $('table#showProfile').removeClass('professional');
            $('table#showProfile').removeClass('student');
            var professional = '';
            if (player.professional == '1') {
                professional = 'Professional';
                $('table#showProfile').addClass('professional');
            }
            if (player.professional == '0') {
                professional = 'Student';
                $('table#showProfile').addClass('student');
            }
            var html =
                '<table class="profileDetailsInfo">'+
                  '<tr>'+
                    '<td class="value"><b>'+professional+'</b></td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>Location:</b> '+(player.location ? player.location : '')+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>Tags:</b> '+tags+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value"><b>About me:</b> '+(player.about ? player.about : '')+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td class="value">';
            var highestBadge = {};
            var i;
            var badge;
            for (i in player.badges) {
                badge = player.badges[i];
                var id = badge.pathID + '-' + JSON.stringify(badge['class']);
                if (highestBadge[id]) {
                    if (badge.awardOrder > highestBadge[id].awardOrder) {
                        highestBadge[id] = badge;
                    }
                } else {
                    highestBadge[id] = badge;
                }
            }
            for (i in highestBadge) {
                badge = highestBadge[i];
                html += createBadge(badge.imageURL, badge.description, 'badge');
            }
            html +=
                    '</td>'+
                  '</tr>'+
                '</table>';
            $popup.find('#hpProfileDetails').html(html); //home page, profile details
            
            if (player.gender) {
                $popup.find('div#gender').removeClass('male');
                $popup.find('div#gender').removeClass('female');
                $popup.find('div#gender').addClass(player.gender);
            }
            if (player.countryFlagURL) {
                var tooltip = '';
                if (player.country) {
                    tooltip = 'title="'+player.country+'"';
                }
                $popup.find('div#country').html('<img src="'+player.countryFlagURL+
                    '" class="country" '+tooltip+'/>');
            }
            
            initRolls();
            
            //TODO load player's badges
            
            if (typeof(afterFunc) == 'function') {
                afterFunc(player);
            }
        }
    });
}
function loadRankingData(path_id, afterFunc) {
    var data = {};
    if (path_id != undefined) {
        data['path_id'] = path_id;
    }

    // ranking data
    ajax({
        url: '../jsonapi/ranking',
        data: data,
        success: function(rankings) {
            for(var i in rankings.players) {
                var p = rankings.players[i];
                var x = parseInt(i);
                x = x + 1;
                var badgeTooltip = "";
                if (p.highestBadge) {
                    badgeTooltip = p.highestBadge.description;
                }
                
                var rankImage = p.rank;
                if (parseInt(p.rank) < 100) {
                    rankImage = '<img alt="'+p.rank+'" src="_images/commonButtons/numbers/number'+lpad2(p.rank)+'.png"/>';
                }
                $('#topRankings').append(
                    '<table class="topRankingsRow">' +
                        '<tr class="topRankingsRow topRankingsRow'+x+'">' +
                            '<td class="topRankingsRank">' + rankImage + '</td>'+
                            '<td class="topRankingsGravatar"><img src="' + p.gravatar + '" class="topRankingsGravatar" /></td>'+
                            '<td class="topRankingsName"><font onclick="showProfilePopup(' + p.playerid + ')">' + p.name + '</font></td>'+
                            '<td class="topRankingsBadge">'+
                              (p.badgeURL ? '<img src="' + p.badgeURL + '" class="topRankingsBadge" title="'+badgeTooltip+'"/>' : '')+
                            '</td>'+
                            '<td class="topRankingsFlag">'+
                              '<img src="' + (p.playerCountryFlagURL ? p.playerCountryFlagURL : '_images/flags/singPath_on.png') +
                              '" class="topRankingsFlag"/>'+
                            '</td>'+
                            '<td class="topRankingsSolved">' + p.solved_num + '</td>'+
                        '</tr>'+
                    '</table>');
            }
            if (rankings['path_name']) {
                $('table.topRankings td.boxHeader').html(rankings['path_name']+' Rankings');
            }
            if (typeof(afterFunc) == 'function') {
                afterFunc(rankings);
            }
        }
    });
}
/**
 * creates a new game on the given path, and starts the game
 * if no path_id given, it tries to get path_id from the URL, otherwise the python path will be used (10030)
 */
function runPaths(path_id, num_problems) {
    //alert("trace");
    if (path_id == undefined) {
        path_id = getIdFromURL('path_id', 10030);
    }
    if (num_problems == undefined) {
        num_problems = 3;
    }
    ajax({
        url: '../jsonapi/create_game/pathID/'+escape(path_id)+'/numProblems/'+escape(num_problems)+'',
        success: function(player) {
            window.location = "play.html?gameID=" + escape(player.gameID);
        }
    });

}
/**
 * creates a new game on the given problemset, and starts the game
 * if no problemset_id given, it tries to get problemset_id from the URL, otherwise nothing will happen
 */
function runProblemset(problemset_id, num_problems) {
    //alert("trace");
    if (problemset_id == undefined) {
        problemset_id = getIdFromURL('problemset_id');
    }
    if (num_problems == undefined) {
        num_problems = 3;
    }
    if (problemset_id != undefined) {
        ajax({
            url: '../jsonapi/create_game/problemsetID/'+escape(problemset_id)+'/numProblems/'+escape(num_problems)+'/',
            success: function(player) {
                if (player.gameID) {
                    var url = "play.html?gameID=" + escape(player.gameID);
                    window.location = url;
                }
            }
        });
    }
}
function getFirstChildNodeWithName(node, name) {
  node = node.firstChild;
  while (node != null && node.nodeName != name) {
    node = node.nextSibling;
  }
  return node;
}
function getNextSiblingWithName(node, name) {
  if (node != null) {
    node = node.nextSibling;
    while (node != null && node.nodeName != name) {
      node = node.nextSibling;
    }
  }
  return node;
}
function displayTab(td, tabIndex) {
  var tr = td.parentNode;
  var tdIndex = 0;
  td = getFirstChildNodeWithName(tr, "TD");
  while (td != null) {
    if (td.style.display != 'none') {
      var clazz = td.getAttribute('class');
      if (clazz != 'tabHeaderRightEnd') {
        clazz = clazz.replace(/Off$/, '');
        var idx = parseInt(tdIndex / 3);
        if (idx != tabIndex) {
          clazz += 'Off';
        }
        if (clazz != td.getAttribute('class')) {
          td.setAttribute('class', clazz);
        }
        
        tdIndex++;
      }
    }
    td = getNextSiblingWithName(td, "TD");
  }
}
function initRolls() {
    $(".rolls img, img.rolls").hover(
     function() {
      this.src = this.src.replace("_off","_on");
     },
     function() {
      this.src = this.src.replace("_on","_off");
     }
    );
}
function strToDatestamp(str) {
    if (!str) {
        return 0;
    }
    if (/([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9]) ([0-9][0-9]):([0-9][0-9]):([0-9][0-9]).([0-9]+)/.exec(str) != null) {
        var msec = 0;
        try {
          msec = Math.floor(parseFloat('0.'+RegExp.$7)*1000);
        } catch (e) {
        }
        return Date.UTC(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, msec);
    }
    if (/([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9]) ([0-9][0-9]):([0-9][0-9]):([0-9][0-9])/.exec(str) != null) {
        return Date.UTC(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6);
    }
    var i = str.indexOf('.');
    if (i >= 0) {
        str = str.substr(0, i);
    }
    return new Date(str).getTime();
}
function lpad2(str) {
    str = ''+str;
    if (str.length == 0) {
        return '00';
    }
    if (str.length == 1) {
        return '0'+str;
    }
    return str;
}
function rpad3(str) {
    str = ''+str;
    if (str.length == 0) {
        return '000';
    }
    if (str.length == 1) {
        return str+'00';
    }
    if (str.length == 2) {
        return str+'0';
    }
    return str;
}
function log(msg) {
    try {
        if (console && console.log) {
            console.log(msg);
        }
    } catch (e) {
    }
}
function preloadImages(list) {
    var d = document;
    if (d.images) {
        if(!d._preload_images) {
          d._preload_images = {};
        }
        for(var i = 0; i < list.length; i++) {
            if (!d._preload_images[list[i]]) {
                var img = new Image;
                img.src = list[i];
                d._preload_images[list[i]] = img;
            }
        }
    }
}
function autoPreloadRollsImages() {
    var list = new Array();
    $('.rolls img, img.rolls').each(function(){
        var src = this.getAttribute('src');
        if (src) {
            if (src.indexOf('_off') >= 0) {
                src = src.replace('_off', '_on');
                list[list.length] = src;
            } else if (src.indexOf('_on') >= 0) {
                src = src.replace('_on', '_off');
                list[list.length] = src;
            }
        }
    });
    if (list) {
        preloadImages(list);
    }
}

function showProfilePopup(player_id) {
  if ($('#logIndetailsNameText').html() == "Please Sign In To Register") {
      return;
  }
  var html =
      '<div id="showProfilePopup" class="popup">'+
      '  <table class="popup">'+
      '    <tr class="popup">'+
      '      <td class="popup">'+
      '        <table class="showProfile" id="showProfile">'+
      '          <tr class="boxHeader">'+
      '            <td class="boxHeader">Profile</td>'+
      '          </tr>'+
      '          <tr class="boxContent">'+
      '            <td>'+
      '              <table class="showProfileName">'+
      '                <tr>'+
      '                  <td class="showProfileName">'+
      '                    <div id="profileNameText" class="profileNameText"></div>'+
      '                  </td>'+
      '                  <td class="showProfileClose">'+
      '                    <a href="javascript:" class="rolls"><img src="_images/commonButtons/close_off.png" alt="Close" '+
      'class="showProfileButtons showProfileCancelButton rolls" onclick="$(\'#showProfilePopup\').hide()"/></a>'+
      '                  </td>'+
      '                </tr>'+
      '              </table>'+
      '              <table class="showProfile2">'+
      '                <tr class="showProfileDetails">'+
      '                  <td class="showGravatarLarge">'+
      '                    <div id="showGravatarLarge"></div>'+
      '                    <div id="country"></div>'+
      '                    <div id="gender"></div>'+
      '                  </td>'+
      '                  <td class="showProfileDetails">'+
      '                    <div class="showProfileDetails">'+
      '                      <div class="hpProfileDetails" id="hpProfileDetails"></div>'+
      '                      <div class="showProfileBadges" id="showProfileBadges"></div>'+
      '                    </div>'+
      '                  </td>'+
      '                </tr>'+
      '              </table>'+
      '            </td>'+
      '          </tr>'+
      '        </table>'+
      '      </td>'+
      '    </tr>'+
      '  </table>'+
      '</div>';
  $('#showProfilePopup').remove();
  var $html = $(html);
  $('body').append($html);
  setAutohidePopup();
  loadOtherPlayerProfile(player_id, $html);
  initRolls();
}
function showAdv() {
	var advNum = 3;
	var rnd = Math.round(new Date().getTime() / 1000 / 5) % advNum;
	var html = '<img class="adv" src="_images/adv/gr8ph1csCreative'+rnd+'.png"/>';
	$('#bytes').html(html);
}
function setAutohidePopup() {
    $('div.popup').click(function(e){
        var target = (e && e.target) || (event && event.srcElement);
        var res = $(target).closest('div.popup > table.popup > tbody > tr.popup > td.popup > table');
        if (res.length == 0) {
            $(this).hide();
        }
    });
}
function showProfileEditPopup() {
  var html =
    '<div id="popup" class="popup">'+
    '  <table class="popup">'+
    '    <tr class="popup">'+
    '      <td class="popup">'+
    '        <table class="editProfile" id="editProfile">'+
    '          <tr class="boxHeader">'+
    '            <td class="boxHeader">Edit Profile</td>'+
    '          </tr>'+
    '          <tr class="boxContent">'+
    '            <td>'+
    '              <table class="editProfile2">'+
    '                  <tr class="editProfileDetails">'+
    '                    <td class="editGravatarLarge">'+
    '                      <div id="editGravatarLarge"><img src="" class="editGravatarLarge"/></div>'+
    '                      <div class="linkToGravatar">'+
    '                        <a href="http://www.gravatar.com" target="_blank" title="Go to www.gravatar.com (new window)">'+
    '                          <span class="emptySmallButton">Change Gravatar</span>'+
    '                        </a>'+
    '                      </div>'+
    '                    </td>'+
    '                    <td class="hpProfileDetails">'+
    '                      <table class="editProfileDetails">'+
    '                        <tr class="editProfile">'+
    '                          <td class="title">Name:</td>'+
    '                          <td class="editProfile inputLong">'+
    '                            <input type="editbox" class="editProfile" id="editProfileName" name="name"/>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile editProfileLocation">'+
    '                          <td class="title">Location:</td>'+
    '                          <td class="editProfile editProfileLocation inputLong">'+
    '                            <input type="editbox" class="editProfile editProfileLocation" id="editProfileLocation" placeholder="city"/>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile editProfileGender">'+
    '                          <td class="title">Gender:</td>'+
    '                          <td class="editProfile inputLong">'+
    '                            <select class="editProfile" id="gender">'+
    '                              <option value="">secret</option>'+
    '                              <option value="female">Female</option>'+
    '                              <option value="male">Male</option>'+
    '                            </select>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile editProfileYearOfBirth">'+
    '                          <td class="title">Year of birth:</td>'+
    '                          <td class="editProfile inputShort">'+
    '                            <table class="yearOfBirth">'+
    '                              <tr>'+
    '                                <td class="input">'+
    '                                  <input type="editbox" class="editProfile" id="editProfileYearOfBirth" name="yearOfBirth"/>'+
    '                                </td>'+
    '                                <td class="comment">'+
    '                                  <div class="yearOfBirth">Your year of birth will always be kept private and will not be shown on your profile.</div>'+
    '                                </td>'+
    '                              </tr>'+
    '                            </table>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile">'+
    '                          <td class="title">Tags:</td>'+
    '                          <td class="editProfile inputLong">'+
    '                            <input type="editbox" class="editProfile" id="editProfileTags" name="tags" placeholder="SMU, hackerspace, star trek"/>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile">'+
    '                          <td class="title">Professional:</td>'+
    '                          <td class="editProfile inputRadio">'+
    '                            <input type="radio" class="editProfile" id="editProfileProfessional" name="professional"/>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile">'+
    '                          <td class="title">Student:</td>'+
    '                          <td class="editProfile inputRadio">'+
    '                            <input type="radio" class="editProfile" id="editProfileStudent" name="professional"/>'+
    '                          </td>'+
    '                        </tr>'+
    '                        <tr class="editProfile editProfileAbout">'+
    '                          <td class="title">About Yourself:</td>'+
    '                          <td class="editProfile editProfileAbout textareaLong">'+
    '                            <textarea class="editProfile editProfileAbout" id="editProfileAbout" placeholder="Hobbies, favorite film, etc"></textarea>'+
    '                          </td>'+
    '                        </tr>'+
    '                      </table>'+
    '                    </td>'+
    '                    <td class="editProfileClose">'+
    '                      <a href="javascript:" class="rolls">'+
    '                        <img src="_images/commonButtons/close_off.png" alt="Close" '+
    'class="editProfileButtons editProfileCancelButton" onclick="cancelProfile()"/>'+
    '                      </a>'+
    '                    </td>'+
    '                  </tr>'+
    '              </table>'+
    '            </td>'+
    '          </tr>'+
    '          <tr class="submitButton">'+
    '            <td class="submitButton">'+
    '              <a href="javascript:"><img src="_images/commonButtons/saveDetailsLarge_off.png" '+
    'alt="save profile" class="editProfileButtons editProfileSaveButton" onclick="saveProfile()"/></a>'+
    '            </td>'+
    '          </tr>'+
    '        </table>'+
    '      </td>'+
    '    </tr>'+
    '  </table>'+
    '</div>';
  $('#popup').remove();
  var $html = $(html);
  $('body').append($html);
  setAutohidePopup();
  loadPlayerData();
  initRolls();
}
function saveProfile() {
    var nickname = $('#editProfileName')[0].value;
    var yearOfBirth = $('#editProfileYearOfBirth')[0].value;
    var tags = $('#editProfileTags')[0].value;
    var prof = '';
    if ($('#editProfileProfessional')[0].checked) {
        prof = 1;
    }
    if ($('#editProfileStudent')[0].checked) {
        prof = 0;
    }
    var gender = $('select#gender')[0].value;
    var location = $('#editProfileLocation')[0].value;
    var about = $('#editProfileAbout')[0].value;
    ajax({
        url: '../jsonapi/save_player_details',
        data: {
            nickname: nickname,
            year_of_birth: yearOfBirth,
            tags: tags,
            professional: prof,
            gender: gender,
            location: location,
            about: about
        },
        success: function(badges) {
            loadPlayerData();
        }
    });

    $('div#popup').hide();
}
function cancelProfile() {
    $('div#popup').hide();
}

function ajax(props) {
    /*if (!props['dataType']) {
        props['dataType'] = 'jsonp';
    }
    if (!props['jsonpcallbackString']) {
        props['jsonpcallbackString'] = 'jsonp123';
    }
    props['callback'] = 'jsonp';
    if (props['url'][0] == '/') {
        props['url'] = '..'+props['url'];
    }
    */
    
    var f = props['success'];
    props['success'] = function(result){
        //console.log('writefile("'+props['url']+'",\'\'\''+JSON.stringify(result)+"''')"); //this is the new line
        if (props['skip_check_login_error'] != true) {
            if (checkLoginError(result)) {
                return;
            }
        }
        if (props['skip_display_error'] != true) {
            if (result && result['error']) {
                alert(result['error']);
                return;
            }
        }
        if (typeof(f) == 'function') {
            if ((props.url.indexOf('jsonapi') >= 0) && (typeof result == 'string')) {
                result = JSON.parse(result)
            }
            f(result);
        }
    }
    //$.jsonp(props); //Works from folder
    $.ajax(props); //Works from app engine
}
$(document).ready(function() {
    //add global Ajax error handler
    $(document).unbind('ajaxError');
    $(document).ajaxError(function(evt, xhr, settings, exception) {
        if (xhr) {
            var e;
            if (xhr.status == 414) {
                e = "The server responded with a status of 414 (Requested URI too long)";
            } else {
                e = "The server responded with a status of "+xhr.status;
            }
            var s = '' + xhr.responseText;
            var p1 = s.indexOf('<pre class="exception_value">');
            var p2 = s.indexOf('</pre>', p1);
            if (p1 >= 0 && p2 >= 0) { //cut out Python error, if there is such
                s = s.substring(p1 + 29, p2);
            } else if ((s.substring(0, 1) == '<') || (s.length > 100)) { //if it is an HTML answer, display generic error
                s = e;
            } //"s" is a string, probably an error message. Display it
            s = s.replace('Consider Text instead, which can store strings of any length.', '');
            if (!s) {
                s = e;
            }
            alert(s);
        }
    });

    initRolls();
    setAutohidePopup();
    preloadImages([
        '_images/commonButtons/largeButtonBlank_on.png',
        '_images/commonButtons/blankPathButton_on.png',
        '_images/commonButtons/smallButtonBlank_on.png'
    ]);
});

//escape the string, so it will be safe to append it as an inner html code
//like this: 'onclick="'+jsEscape(myJsCode)+'"'
function jsEscape(s) {
  s = ""+s;
  s = s.replace(/[&'"<>]/g, function(ch){
      if (ch == '&') {
          return '\\x26';
      }
      if (ch == "'") {
          return '\\x27';
      }
      if (ch == '"') {
          return '\\x22';
      }
      if (ch == '<') {
          return '\\x3C';
      }
      if (ch == '>') {
          return '\\x3E';
      }
      return '';
  })
  return s;
}
function htmlEscape(s, spacesToNbsp) {
  s = ""+s;
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  s = s.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
  if (spacesToNbsp) {
      s = s.replace(/ /g, '&nbsp;');
  }
  return s;
}
function formatValue(value) {
  if (typeof(value) == "boolean") {
    return (value ? "True" : "False");
  }
  var s;
  if (value instanceof Array) {
    s = "[";
    for(var i = 0; i < value.length; i++) {
      if (i > 0) {
        s += ", ";
      }
      s += value[i];
    }
    s += "]";
    return htmlEscape(s, true);
  }
  if (value instanceof Object) { //dictionary
    s = "{";
    for (var key in value) {
      var v = value[key];
      if (s.length > 1) {
        s += ", ";
      }
      s += key + ": " + v;
    }
    s += "}";
    return htmlEscape(s, true);
  }
  return htmlEscape(value, true);
}
function formatErrorResult(results) {
    if (results.length > 0) {
        var table = document.createElement("table");
        table.setAttribute("border", "1");
        var tr = document.createElement("tr");
        var td = document.createElement("th");
        td.innerHTML = "Call";
        tr.appendChild(td);
        td = document.createElement("th");
        td.innerHTML = "Expected";
        tr.appendChild(td);
        td = document.createElement("th");
        td.innerHTML = "Received";
        tr.appendChild(td);
        td = document.createElement("th");
        td.innerHTML = "Correct";
        tr.appendChild(td);
        table.appendChild(tr);
        for(var i = 0; i < results.length; i++) {
            var r = results[i];
            tr = document.createElement("tr");
            td = document.createElement("td");
            td.innerHTML = r.call;
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = formatValue(r.expected);
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = formatValue(r.received);
            tr.appendChild(td);
            td = document.createElement("td");
            var status = (r.status == true ? r.status : r.correct);
            status = (status == true ? true : false);
            td.innerHTML = "<font color='white'>" + status + "</font>";
            td.setAttribute("bgcolor", (status ? "green" : "red"));
            tr.appendChild(td);
            table.appendChild(tr);
        }
        return table;
    } else {
        return "Error";
    }
}
