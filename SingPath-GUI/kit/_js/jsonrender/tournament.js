
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });

    var tournamentID = getTournamentID();
    $("#tournamentID").attr("value", tournamentID);
    
    // Ivan, Note: Function was updated in LogAccessCtrl():controllers.js
    // log_access('tournament');
    
    // player data
    loadPlayerData();
});

function renderTournamentList(response){
	var tournamentID = getTournamentID();
    var html = '';
    var num = 0;
    for (var i in response) {
        if (num >= 5) {
            break;
        }
        var t = response[i];
        if (t['status'] != 'Invisible') {
            var id = t['tournamentID'];
            var img = t['smallPicture'];
            if (img == undefined || img == null || img == "") {
                img = '_images/tournaments/emptySmall.png';
            } else if (!(/^http(s)?:\/\//.test(img)) && !(/^\//.test(img))) {
                img = '_images/tournaments/'+img.replace(/\\/g, '/');
            }
            var tooltip = '';
            if (t['description'] && t['description'] != '') {
                tooltip = t['description'];
            }
            html +=
                '<a href="tournament.html?tournamentID='+id+'" class="rolls" title="'+tooltip+'">'+
                '<img src="'+img+'" class="tour"/>'+
                '</a> ';
            num++;
            
            //automatically redirects to the first tournament if no tournamentID provided in the URL
            if (!tournamentID) {
                window.location = 'tournament.html?tournamentID=' + id;
                return;
            }
        }
        $('#tourChooser').html(html);
        initRolls();
        autoPreloadRollsImages();
    }
}

function reloadTournamentPage(tournamentID){
	$('a#viewRanking').attr('href', 'tournamentRanking.html?tournamentID='+tournamentID);
}

function checkTournamentRegistrationStatus(response){
            if (response) {
                var img = response['largePicture'];
                if (img == undefined || img == null || img == "") {
                    img = '_images/tournaments/emptySmall.png';
                } else if (!(/^http(s)?:\/\//.test(img)) && !(/^\//.test(img))) {
                    img = '_images/tournaments/'+img.replace(/\\/g, '/');
                }
                img = img.replace(/\\/g, '/');
                var html = '<img class="tourHeadingPicture" src="'+img+'"/>';
                var shortTitle = response['shortTitle'];
                if (shortTitle == undefined || shortTitle == null || shortTitle == '') {
                    shortTitle = response['description'];
                }
                var longTitle = response['longTitle'];
                if (longTitle == undefined || longTitle == null) {
                    longTitle = '';
                }
                var winnerText = response['winnerText'];
                if (winnerText == undefined || winnerText == null) {
                    winnerText = '';
                }
                $('#tourHeadingPictureHolder').html(html);
                $('#tourHeadingTextTitle').html(shortTitle);
                $('#tourHeadingText').html(longTitle);
                $('#tourHeadingWinner').html(winnerText);
            }
            if (response['status'] && response['status'] == 'Closed') {
                $('#tourMBLabel').html('Tournament closed');
                disableSignIn();
            } else if (response['status'] && response['status'] == 'Finished') {
                $('#tourMBLabel').html('Tournament finished');
                disableSignIn();
            } else {
                if (response['status'] && response['status'] == 'Open for registration') {
                    //player already registered
                    if (response && response['currentPlayerRegistered'] && (response['currentPlayerRegistered'] == true)) {
                        $('#tourMBLabel').html('You already registered');
                        enableTournament();
                        disableSignIn();
                        checkTournamentRoundStatus();
                    } else {
                        $('#tourMBLabel').html('Open for registration');
                    }
                }
            }
}
function hasNonFinishedHeat(heats) {
    for (var i in heats) {
        var heat = heats[i];
        if (heat['stopTime'] && (heat['stopTime'] != 'None') &&
            heat['currentTime'] && (heat['currentTime'] != 'None')) {
            var c = strToDatestamp(heat['currentTime']);
            var s = strToDatestamp(heat['stopTime']);
            if (c && (c > 0) && s && (s > 0) && (c < s + 86400000)) { //rounds will be active 24 hours after heat closed
                return heat;
            }
        }
    }
    return false;
}
function checkTournamentRoundStatus() {
    ajax({
        url   : '../jsonapi/tournament/' + getTournamentID(),
        success: function(response){
            //there are rounds in the tournament
            if (response && response['rounds'] && response['rounds'].length && (response['rounds'].length > 0)) {
                var r = response['rounds'];
                var s;
                for (var i = 0; i < 2; i++) {
                    var i1 = i + 1;
                    if (r[i]) {
                        s = r[i]['description'] + ' - ' + r[i]['problemIDs'].length + ' Problems';
                        $('#tourInitialText0'+i1).html(s);
                        if (r[i]['currentHeatID'] && r[i]['currentHeatID'] > 0 && r[i]['heats']) {
                            var heat = hasNonFinishedHeat(r[i]['heats']);
                            if (heat != false) {
                                var onclick = 'play_round('+r[i]['roundID']+')';
                                if (response['tournamentType'] == 'AnyTime') {
                                    var pid = response['currentPlayerID'];
                                    if (heat['gameIDsForHeat'] && heat['gameIDsForHeat'][pid] > 0) {
                                        //have game, no warning
                                    } else {
                                        onclick = 'return confirmPlayRound('+r[i]['roundID']+');';
                                    }
                                }
                                $('#round'+i1)[0].setAttribute('onclick', onclick);
                                if ($.browser.msie) {
                                    $('#tourInitialPlayNow0'+i1)[0].setAttribute('style', 'display: block');
                                    $('#tourInitialText0'+i1)[0].setAttribute('style', 'display: block');
                                } else {
                                    $('#tourInitialPlayNow0'+i1).fadeTo('slow', 1);
                                    $('#tourInitialText0'+i1).fadeTo('slow', 1);
                                }
                            }
                        }
                    }
                }
                //set the timer to countdown to the next currentHeat's startTime
                //("next currentHeat" is the nearest currentHeat (from any round) which is not started yet).
                //if all currentHeat is started, countdown to the last endTime of all currentHeat.
                //if all currentHeat is finished, no countdown.
                var minStart = null;
                var minCurrent = null;
                var maxStop = null;
                var maxCurrent = null;
                for (var i in r) {
                    var round = r[i];
                    if (round.heats) {
                        for (var j in round.heats) {
                            var heat = round.heats[j];
                            if (heat['startTime'] && (heat['startTime'] != 'None') &&
                                    heat['currentTime'] && (heat['currentTime'] != 'None') &&
                                    (heat['currentTime'] < heat['startTime'])) {
                                if ((minStart == null) || (heat['startTime'] < minStart)) {
                                    minStart = heat['startTime'];
                                    minCurrent = heat['currentTime'];
                                }
                            }
                            if (heat['stopTime'] && (heat['stopTime'] != 'None') &&
                                    heat['currentTime'] && (heat['currentTime'] != 'None') &&
                                    (heat['currentTime'] < heat['stopTime'])) {
                                if ((maxStop == null) || (heat['stopTime'] > maxStop)) {
                                    maxStop = heat['stopTime'];
                                    maxCurrent = heat['currentTime'];
                                }
                            }
                        }
                    }
                }
                var from = null;
                var to = null;
                if (minStart != null) {
                    from = strToDatestamp(minCurrent);
                    to = strToDatestamp(minStart);
                    $('#tourMBLabel').html('Tournament begins in');
                } else if (maxStop != null) {
                    from = strToDatestamp(maxCurrent);
                    to = strToDatestamp(maxStop);
                    $('#tourMBLabel').html('Tournament ends in');
                }
                if (from != null && to != null && !isNaN(from) && !isNaN(to)) {
                    var liftoffTime = new Date(to - from + new Date().getTime());
                    $('#tourMBClock').countdown({
                        until: liftoffTime,
                        compact:true,
                        compactLabels:['','','',''],
                        format: 'DHMS',
                        layout: '<span>{d<}{dnn} {d>}{hnn}:{mnn}:{snn}</span>'
                    });
                }
            }
            if (!getParameterFromURL('no_refresh')) {
                window.setTimeout(checkTournamentRoundStatus, 30000);
            }
        }
    });
}
function play_round(round_id) {
    ajax({
        url   : '../jsonapi/launch_game_for_round',
        data  : {'round_id': round_id}, // data to be submitted
        success: function(response){
            window.location = 'play.html?gameID=' + response['gameID'];
        }
    });
}
function confirmPlayRound(round_id) {
    if (confirm('Are you sure that you are ready to start? Once you click OK, '+
            'the game will begin. You can not restart the timer. Make sure that '+
            'you have your snacks and beverages and are ready to play.')) {
        play_round(round_id);
        return true;
    }
    return false;
}
function getTournamentID() {
    return getIdFromURL('tournamentID');
}
function enableTournament() {
    $('#tourInitialGamePlayGrey').attr('class', 'tourInitialGamePlayEnabled');
    $('#tourInitialPlayNow01').hide();
    $('#tourInitialText01').hide();
    $('#tourInitialPlayNow02').hide();
    $('#tourInitialText02').hide();
    $('#tourInitialGamePlay').removeAttr('style').hide().fadeIn();
    $('#tourInitialPlayNow01').fadeTo("slow", 0.33);
    $('#tourInitialText01').fadeTo("slow", 0.33);
    $('#tourInitialPlayNow02').fadeTo("slow", 0.33);
    $('#tourInitialText02').fadeTo("slow", 0.33);
}
var _disableSignIn = 0;
function disableSignIn() {
    if (_disableSignIn == 0) {
        _disableSignIn = 1;
        $('td.tourInitialPasscodeSignInButton a').removeAttr('onclick');
        $('#password').attr('disabled', 'disabled');
        $('.tourInitialPasscodeBox').fadeTo("slow", 0.33);
    }
}
// temp function to emulate enter tournament
function toggleTourney() {
    var form = $("#frmpass");
    ajax({
        url   : form.attr('action'),
        data  : form.serialize(), // data to be submitted
        skip_display_error: true,
        success: function(response){
            if (response.error) {
                if (response.error == 'Please specify status by choosing student or professional in your profile details.' ||
                    response.error == 'Please personalize nickname in your profile details.') {
                    showProfileEditPopup();
                }
                alert(response.error);
                return;
            }
            //alert(response.success); // do what you like with the response
            if(!response.success) {
                $("#password").attr("value","");
                alert("Incorrect Password!");
            }
            //$("#rsl").attr("value",response);
            enableTournament();
            disableSignIn();
            checkTournamentRoundStatus();
            //$('#round2').attr("oncllck","none");
        }
    });
    return false;
}
