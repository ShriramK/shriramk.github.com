var last_problemset_id = 0;
var isGamePath = 0;
var path_editor_id = 0;
var current_player_id = 0;
var is_admin = false;
var problemsetsById = {};
var path = {};

function loadProblemsetDetails(problemset_id) {
    last_problemset_id = problemset_id;
    
    $('#levelGamesChooseLoading').empty();
    $('#problemsetName').empty();
    showTab(1, problemset_id);
    $('table.tabHeader > tbody > tr > td').each(function() {$(this).show();});
    ajax({
        url: '../jsonapi/list_my_contributed_problems',
        data: {details: 1},
        success: function(problems) {
            var contributions = {};
            for (var i in problems.contributions) {
                var c = problems.contributions[i];
                contributions[c.problem_id] = c;
            }
            var url = document.URL;
            url = url.replace(/&?level_id=[0-9]+/, '')
            try {
                window.history.replaceState({}, '', url+'&level_id='+problemset_id);
            } catch (e) {
            }
            ajax({
                url: '../jsonapi/problems/'+problemset_id,
                data: {details: 1},
                success: function(problems) {
                    var s = '<table class="levelGames">';
                    for(i in problems.problems) {
                        var p = problems.problems[i];
                        var editor = '';
                        if (p.editor != undefined) {
                            editor = p.editor.nickname;
                        }
                        s += '<tr class="levelGames">'+
                             '<td class="levelGameMoveButtons">'+
                               '<div class="editproblem editproblemhidden">'+
                                 '<img class="rolls editproblem" '+
                                 '    src="_images/commonButtons/arrowUp_off.png" title="Move up this problem" '+
                                 '    onclick="moveProblemUp('+p.id+')"/>'+
                                 '<img class="rolls editproblem" '+
                                 '    src="_images/commonButtons/arrowDown_off.png" title="Move down this problem" '+
                                 '    onclick="moveProblemDown('+p.id+')"/>'+
                               '</div>'+
                             '</td>';
                        s += '<td class="levelGameDescription">'+p.name+'</td>'+
                             '<td class="levelGameEditor">'+editor+'</td>'+
                             '<td class="levelGameSolved">';
                        var solved = 0;
                        if (p.solved) {
                            solved = 1;
                        }
                        s += '<div class="badge"><img class="badge" src="../static/badges/ticks_'+(solved ? 'on' : 'off')+'.png" title="'+(solved ? 'Solved' : 'Not solved')+'"/></div>';
                        var contributionEnabled = true;
                        if (contributions[p.id]) {
                            var c = contributions[p.id];
                            var icon = '';
                            var tooltip = '';
                            if (c.status == 'accepted') {
                                icon = 'addContributionAccepted.png';
                                tooltip = 'Your problem is accepted!';
                                if (c.feedback) {
                                    tooltip += ' The path editor\'s feedback: '+c.feedback;
                                }
                            } else if (c.status == 'declined') {
                                icon = 'addContributionDeclined.png';
                                tooltip = 'Your problem is declined!';
                                if (c.feedback) {
                                    tooltip += ' The path editor\'s feedback: '+c.feedback;
                                }
                            } else if (c.status == null) {
                                icon = 'addContributionPending.png';
                                tooltip = 'Your problem is pending for approval!';
                                contributionEnabled = false;
                            }
                            if (icon) {
                                s += '<img class="decision" title="'+htmlEscape(tooltip)+'" '+
                                    'src="_images/commonButtons/'+icon+'" '+
                                    'onclick="alert(\''+jsEscape(tooltip)+'\')"/>';
                            }
                        } else {
                            s += '<div class="decision"></div>';
                        }
                        if (contributionEnabled) {
                            s += '<div class="contribute contributehidden"><img class="rolls contribute" '+
                                 'src="_images/commonButtons/addContributionCircle_off.png" title="Contribute this problem to SingPath" '+
                                 'onclick="contributeProblem('+p.id+')"/></div>';
                        }
                        s += '<div class="editproblem editproblemhidden">'+
                            '<img class="rolls editproblem" '+
                            '    src="_images/commonButtons/editCircle_off.png" title="Edit this problem" '+
                            '    onclick="editProblem('+p.id+')"/>'+
                            '<img class="rolls deleteproblem" '+
                            '    src="_images/commonButtons/deleteCircle_off.png" title="Delete this problem" '+
                            '    onclick="deleteProblem('+p.id+')"/>'+
                            '</div>';
                        s += '</td>';
                        s += '</tr>';
                    }
                    s += '</table>';
                    var problemset_editor_id = undefined;
                    if (problems.problemset && problems.problemset.editor) {
                        problemset_editor_id = problems.problemset.editor.player_id;
                    }
                    var can_edit = (is_admin || current_player_id == path_editor_id ||
                        current_player_id == problemset_editor_id)
                    if (!isGamePath || can_edit) {
                        s += '<center>';
                        if (can_edit) {
                            s += '<img class="rolls" src="_images/commonButtons/addEditDetails_off.png" onclick="showEditButtons()"/>';
                        }
                        if (!isGamePath) {
                            s += '<img class="rolls" src="_images/commonButtons/addContribution_off.png" onclick="showContributionButtons()"/>';
                        }
                        s += '</center>';
                    }
                    $('#levelGamesChooseLoading').html(s);
                    
                    $('#problemsetName').html(problems.problemset.name);
        //            $('#levCLText').html(problems.problemset.description);
                    
                    //if there are required badges for this level, display them
                    if (problems['required_badges']) {
                        s = '';
                        for (var i in problems['required_badges']) {
                            var badge = problems['required_badges'][i];
                            if (s.length > 0) {
                                s += ', ';
                            }
                            if (badge && badge['description']) {
                                s += badge['description'];
                            }
                        }
                        if (s) {
                            if (problems['required_badges'].length == 1) {
                                s = 'You need '+s+' to play this level.';
                            } else {
                                s = 'You need badges '+s+' to play this level.';
                            }
                            $('#levMBText').html(s);
                        }
                    }
                    initRolls();
                    autoPreloadRollsImages();
                }
            });
        }
    });
}
// path progress data
function loadPathProgressData(path_id) {
    ajax({
        url: '../jsonapi/get_path_progress/'+path_id,
        data: {details: 1},
        success: function(progress) {
            path = progress.path;
            var s = '<table class="pathLevels">';
            var imagesToPreload = new Array();
            isGamePath = progress.path.isGamePath; //if this is a game path, don't show the contribution button
            path_editor_id = progress.path.editor_id; //if the current player is the path editor, show edit button
            var can_edit = (is_admin || current_player_id == path_editor_id)
            for(var i in progress.details) {
                var p = progress.details[i];
                problemsetsById[p.id] = p;
                var x = parseInt(p['pathorder']);
                var description = p['description'];
                var problemsInProblemset = p['problemsInProblemset'];
                var currentPlayerProgress = p['currentPlayerProgress'];
                var str2 = (x < 10) ? '0'+x : ''+x;
                var str3 = (x < 100) ? '0'+str2 : ''+x;
                s += '<tr>'+
                     '<td class="pathLevelButton">';
                if (x <= 15) {
                    s += '<img class="rolls" src="_images/levelsPageButtons/level'+str3+
                        '_off.png" alt="click to enter level '+x+'" onclick="loadProblemsetDetails('+p.id+');"/>';
                } else {
                    s += '<span class="emptySmallButton" onclick="loadProblemsetDetails('+p.id+');">Level '+
                        x+'</span>';
                }
                s += '</td>'+
                     '<td class="levelDescription">'+description+'</td>'+
                     '<td class="levelProgress">'+currentPlayerProgress+'/'+problemsInProblemset+'</td>'+
                     '<td class="levelBadge">';
                s += '<div>';
                for(var j in p.badges) {
                    var badge = p.badges[j];
                    s += '<img class="badge" src="'+badge['url'].replace(/^\/static/, "../static")+'" title="'+badge['description']+'"/>';
                }
                s += '</div>';
                if (can_edit) {
                    s += '<div class="editproblemset">'+
                        '<img class="rolls editproblemset" '+
                        '    src="_images/commonButtons/editCircle_off.png" title="Edit this problemset" '+
                        '    onclick="showEditProblemsetPopup('+p.id+')"/>'+
                        '</div>';
                }
                s += '</td>';
                s += '</tr>';
                imagesToPreload[imagesToPreload.length] = '_images/levelsPageButtons/level'+str3+'_on.png';
            }
            if (can_edit) {
                s += '<tr>'+
                      '<td colspan="4" style="text-align: center">'+
                        '<img class="rolls" src="_images/commonButtons/addEditDetails_off.png" '+
                          'onclick="showEditProblemsets()">'+
                      '</td>'+
                    '</tr>';
            }
            s += '</table>';
            $('#levelsChooseLoading').html(s);
            $('#levCPTextTitle').html(progress.path.name);
            $('#currentPathName').html(progress.path.name);
            $('#pathName').html(progress.path.name);
            $('#levCPText').html(progress.path.description);
            $('#rankingLink').attr('href', 'ranking.html?path_id='+path_id)
            preloadImages(imagesToPreload);
            initRolls();
            
            var problemset_id = getIdFromURL('level_id');
            if (problemset_id) {
                loadProblemsetDetails(problemset_id);
            }
        }
    });
}
function showTab(index, problemset_id) {
    displayTab($('#currentPathName')[0], index);
    if (index == 0) {
        $('#levelGamesChooseLoading').hide();
        $('#levelsChooseLoading').show();
        $("#problemset_id").attr("value", '');
        $('table.levelsChoose').removeClass('problemsChoose');
    } else {
        $('#levelsChooseLoading').hide();
        $('#levelGamesChooseLoading').show();
        $("#problemset_id").attr("value", problemset_id);
        $('table.levelsChoose').addClass('problemsChoose');
    }
}
function run(numProblems) {
    var psid = $("#problemset_id")[0].value;
    if (psid) {
        runProblemset(psid, numProblems);
    } else {
        var path_id = 10030;
        if (/path_id=([0-9]+)/.exec(document.URL) != null) {
            path_id = parseInt(RegExp.$1);
        }
        runPaths(path_id, numProblems);
    }
}
function showContributionButtons() {
    if ($('tr.levelGames div.contributevisible').length == 0) {
        hideEditButtons();
        $('tr.levelGames div.contribute').addClass('contributevisible');
        $('tr.levelGames div.contribute').removeClass('contributehidden');
        $('table.levelGames').addClass('levelGamesContribute');
        $('table.levelGamesContribute').removeClass('levelGames');
    } else {
        hideContributionButtons();
    }
}
function hideContributionButtons() {
    $('tr.levelGames div.contribute').addClass('contributehidden');
    $('tr.levelGames div.contribute').removeClass('contributevisible');
    $('table.levelGamesContribute').addClass('levelGames');
    $('table.levelGames').removeClass('levelGamesContribute');
}
function contributeProblem(problem_id) {
    ajax({
        url: '../jsonapi/problem_contribute',
        data: {problem_id: problem_id, details: 1},
        success: function(result) {
            alert('Contribution is successfully registered. Please wait until your contribution is accepted by the Path Editor');
            hideContributionButtons();
            loadProblemsetDetails(last_problemset_id);
        }
    });
}
function showEditButtons() {
    if ($('tr.levelGames div.editproblemvisible').length == 0) {
        hideContributionButtons();
        $('tr.levelGames div.editproblem').addClass('editproblemvisible');
        $('tr.levelGames div.editproblem').removeClass('editproblemhidden');
        $('table.levelGames').addClass('levelGamesEdit');
        $('table.levelGamesEdit').removeClass('levelGames');
    } else {
        hideEditButtons();
    }
}
function hideEditButtons() {
    $('tr.levelGames div.editproblem').addClass('editproblemhidden');
    $('tr.levelGames div.editproblem').removeClass('editproblemvisible');    
    $('table.levelGamesEdit').addClass('levelGames');
    $('table.levelGames').removeClass('levelGamesEdit');
}
function editProblem(problem_id) {
    window.location = 'createProblem.html?problem_id='+problem_id;
}
function moveProblemUp(problem_id) {
    ajax({
        url: '../jsonapi/move_problem_up',
        data: {problem_id: problem_id},
        success: function(result) {
            if (result['success']) {
                loadProblemsetDetails(last_problemset_id);
            }
        }
    });
}
function moveProblemDown(problem_id) {
    ajax({
        url: '../jsonapi/move_problem_down',
        data: {problem_id: problem_id},
        success: function(result) {
            if (result['success']) {
                loadProblemsetDetails(last_problemset_id);
            }
        }
    });
}
function deleteProblem(problem_id) {
    if (problem_id) {
        $('#delete_button').attr('onClick', 'deleteProblemConfirmed('+problem_id+');');
        $('#popup').show();
    }
}
function deleteProblemConfirmed(problem_id) {
    $('#popup').hide();
    ajax({
        url: '../jsonapi/delete_problem',
        data: {problem_id: problem_id},
        success: function(result) {
            alert('The problem successfully deleted!');
            if (result['success']) {
                loadProblemsetDetails(last_problemset_id);
            }
        }
    });
}
function showEditProblemsets() {
    if ($('table.pathLevelsEdit').length > 0) {
        $('table.pathLevels').removeClass('pathLevelsEdit');
    } else {
        $('table.pathLevels').addClass('pathLevelsEdit');
    }
}
function showEditProblemsetPopup(problemset_id) {
    var problemset = problemsetsById[problemset_id];
    if (problemset) {
        $('#popup_problemset_path').html(path.name);
        $('#popup_problemset_name').val(problemset.name);
        $('#popup_problemset_desc').val(problemset.description);
        $('#popup_save_button').unbind('click');
        $('#popup_save_button').click(
            function(){
                saveEditProblemset(problemset_id);
            }
        );
        $('#showProblemsetPopup').show();
    }
}
function saveEditProblemset(problemset_id) {
    var data = {
        'problemset_id': problemset_id,
        'name': $('#popup_problemset_name').val(),
        'description': $('#popup_problemset_desc').val()
    };
    ajax({
        url: '../jsonapi/edit_problemset',
        data: data,
        success: function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            alert('Problemset successfully modified!');
            $('#showProblemsetPopup').hide();
            var path_id = 10030;
            if (/path_id=([0-9]+)/.exec(document.URL) != null) {
                path_id = parseInt(RegExp.$1);
            }
            loadPathProgressData(path_id);
        }
    });
}
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    var path_id = 10030;
    if (/path_id=([0-9]+)/.exec(document.URL) != null) {
        path_id = parseInt(RegExp.$1);
    }
    //log_access('levels');
    loadPlayerData(function(result){
        current_player_id = result['player_id'];
        is_admin = result['isAdmin'];
        loadPathProgressData(path_id);
    });
    preloadImages(['_images/levelsPage/problemsBoxBg.png']);
    autoPreloadRollsImages();
    loadRankingData(path_id);
    showAdv();
});
