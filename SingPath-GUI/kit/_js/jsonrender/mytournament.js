var result = {};
var skippedProblemIds = [];
var gameid=0;
var current_problem = undefined;
var _tryCount = 0;

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    // player data
    loadPlayerData();
    autoPreloadRollsImages();

    gameid = getParameterByName('gameID');

    $("#game_id").attr("value",gameid);

    // game data
    ajax({
        url: '../jsonapi/game/'+getParameterByName('gameID'),
        skip_display_error: true,
        success: setGameData
    });
    trySetKeypressHandler();
});
function keyPressHandler(evt) {
  evt = evt || window.event;
  if (evt) {
    var keyCode = evt.keyCode || evt.charCode;
    if (keyCode == 116) {
      try {
        e.preventDefault();
      } catch (e) {
      }
      try {
        chkResult();
      } catch (e) {
      }
      try {
        window.event.keyCode = 0;
        window.event.cancelBubble = true;
        window.event.returnValue = false;
        evt.keyCode = 0;
        evt.cancelBubble = true;
        evt.returnValue = false;
        evt.stopPropagation();
      } catch (e) {
      }
      return false;
    }
  }
}
function setKeypressHandler(windowOrFrame, keyHandler) {
  var doc = windowOrFrame.document;
  if (doc) {
    $(doc).keydown(keyHandler);
  }
}
function trySetKeypressHandler() {
  var frame = window.frames['frame_user_code'];
  if (frame) {
    setKeypressHandler(frame, keyPressHandler);
    setKeypressHandler(window, keyPressHandler);
  } else {
    _tryCount++;
    if (_tryCount < 100) {
      window.setTimeout(trySetKeypressHandler, 200);
    }
  }
}
function checkAcceptingSolutions(path) {
  var error = path['error'];
  if (!error &&
      (path['numProblems'] && path['numSolvedProblems'] && path['numSolvedProblems'] < path['numProblems']) &&
      path['status'] && path['status'] != 'ACCEPTING SOLUTIONS') {
      error = "This game is not accepting solutions.";
  }
  if (error) {
    alert(error);
    var loc = 'home.html';
    if (path['tournamentID'] && path['tournamentID'] > 0) {
      loc = "tournamentRanking.html?tournamentID="+path['tournamentID'];
    } else {
      //if all problem is in the same problemset in this game, then redirect to
      //display that problemset rather than go to the home page
      if (path['problems'] && path['problems']['problems']) {
          var problems = path['problems']['problems'];
          var path_id = -1;
          var problemset_id = -1;
          var allSame = true;
          for (var j in problems) {
              var p = problems[j];
              if (path_id == -1) {
                  path_id = p.path_id;
              }
              if (problemset_id == -1) {
                  problemset_id = p.problemset_id;
              }
              if (path_id != p.path_id || problemset_id != p.problemset_id) {
                  allSame = false;
                  break;
              }
          }
          if (allSame) {
              loc = 'levels.html?path_id='+path_id+'&level_id='+problemset_id;
          }
      }
    }
    window.location = loc;
  }
}
function startTimer(result) {
    var game_start = strToDatestamp(result['game_start']);
    var currentTime = strToDatestamp(result['currentTime']);
    var liftoffTime = (game_start / 1000) - (currentTime / 1000);
    $('#tourMBClock').countdown({since: liftoffTime, compact:true, format: 'dHMS', description: ''});
}


function setGameData(path) {
  result = path;
  //log_access('play');
  var vsolvedproblemIDs = {};
  for (var idx in path.solvedProblemIDs) {
    var problemId = path.solvedProblemIDs[idx];
    vsolvedproblemIDs[problemId] = problemId;
  }
  var numSolvedProblems = parseInt(path.numSolvedProblems);
  for (var idx in skippedProblemIds) {
    var problemId = skippedProblemIds[idx];
    if (!vsolvedproblemIDs[problemId]) {
      vsolvedproblemIDs[problemId] = problemId;
      numSolvedProblems++;
    }
  }
  checkAcceptingSolutions(path);
  startTimer(path);
  $('#pEMText').empty();
  showTab(0);
  if (path.problems && path.problems.problems) {
    var problems = path.problems.problems;
    var found = 0;
    for (var key in problems) {
      var problem = problems[key];
      if (!vsolvedproblemIDs[problem.id]) {
        current_problem = problem;
        if (problem['is_mobile_problem'] == true) {
          window.location.replace('mobilePlay.html?gameID='+gameid); //replace() is good here
          return;
        }
        $("#problem_id").attr("value", problem.id);
        $('#tourCPTextTitle').empty();
        $('#tourCPTextTitle').append(problem.name);
        $('#tourCPText').empty();
        $('#tourCPText').append(problem.description);

        var examples = problem.examples || '';
        examples = examples.replace(/</g, '&lt;');
        examples = examples.replace(/\n/g, '<br>');
        $('#pEMText').html(examples);

        var highlight = 'python';
        if (problem['interface'] && problem['interface']['codeHighlightKey']) {
          highlight = problem['interface']['codeHighlightKey'];
        }

        createEditor(problem.skeleton, highlight);
        
        //display game progress
        if (numSolvedProblems != undefined && path['numProblems'] != undefined) {
          $('#tourMBText').html(numSolvedProblems+' of '+path['numProblems']+' Complete');
        }
        
        found = 1;
        break;
      }
    }
    if (found == 0) {
      var loc = 'home.html';
      if (path['tournamentID'] && path['tournamentID'] > 0) {
        loc = "tournamentRanking.html?tournamentID="+path['tournamentID'];
      } else {
        //if all problem is in the same problemset in this game, then redirect to
        //display that problemset rather than go to the home page
        var path_id = -1;
        var problemset_id = -1;
        var allSame = true;
        for (var j in problems) {
            var p = problems[j];
            if (path_id == -1) {
                path_id = p.path_id;
            }
            if (problemset_id == -1) {
                problemset_id = p.problemset_id;
            }
            if (path_id != p.path_id || problemset_id != p.problemset_id) {
                allSame = false;
                break;
            }
        }
        if (allSame) {
            loc = 'levels.html?path_id='+path_id+'&level_id='+problemset_id;
        }
      }
      window.location = loc;
    }
  }
}

function createEditor(skeleton, language){
    skeleton = skeleton || '\n';
    $LAB.script("_js/ace/src/mode-" + language + ".js").wait(function(){
        var editor = ace.edit('user_code_editor');
        editor.commands.addCommand({
           name: "run",
           bindKey: {
               win: "Ctrl-Return",
               mac: "Ctrl-Return",
               sender: "editor"
           },
           exec: function(){
               $('.tourRunCodeTopButton a').trigger('click');
           }
        });
        var Mode = require("ace/mode/" + language).Mode;
        editor.getSession().setMode(new Mode());
        editor.getSession().on('change', function(){
            $("#user_code").val(editor.getSession().getValue());
        });

        editor.getSession().setValue(skeleton);
        return true;
    });
}


function chkResult() {
    if ((document.getElementById('edit_area_toggle_checkbox_user_code') != null) &&
        document.getElementById('edit_area_toggle_checkbox_user_code').checked) {
      $('#user_code').val(window.frames['frame_user_code'].document.getElementById('textarea').value);
    }
    if (!$('#user_code').val()) {
        alert('Please enter some text into the code area');
        return;
    }
    $("#pErMText").empty();
    showTab(1);
    var form = $("#frmverify");
    ajax({
        url   : '../jsonapi/verify_solution.php?callback=?',
        type: 'POST',
        data: form.serialize(), // data to be submitted
        dataType: 'json', //dataType is json when using POST method!
        skip_display_error: true,
        success: function(response) {
            checkAcceptingSolutions(response);
            if(response.last_solved == null) {
                if(response.errors!=null) {
                    $("#pErMText").empty();
                    $("#pErMText").append(htmlEscape(response.errors));
                }
                if (response.other_tests_result && response.other_tests_result.indexOf('All the public tests passed but') >= 0) {
                    $("#pErMText").append(response.other_tests_result);
                }
            } else {
                if(response.last_solved == true) {
                    $("#pErMText").empty();
                    nextQuestion();
                } else {
                    $("#pErMText").empty();
                    $("#pErMText").append(formatErrorResult(response.results));
                    if (response.other_tests_result && response.other_tests_result.indexOf('All the public tests passed but') >= 0) {
                        $("#pErMText").append(response.other_tests_result);
                    } else if (response['printed']) {
                        $("#pErMText").append(response['printed']);
                    }
                    //tries to scroll to the upper right position
                    try {
                        $("#pErMText")[0].scrollLeft = 9999;
                    } catch (e) {
                    }
                }
            }
        }
    });
}
function nextQuestion() {
    ajax({
        url: '../jsonapi/game/'+getParameterByName('gameID'),
        skip_display_error: true,
        success: setGameData
    });
}
function getParameterByName( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}
function showTab(index, problemset_id) {
    displayTab($('table.pExampleMessage table.tabHeader td')[0], index);
    if (index == 0) {
        $('#pErMText').hide();
        $('#pEMText').show();
    } else {
        $('#pEMText').hide();
        $('#pErMText').show();
    }
}
function skipProblem() {
    if (current_problem && result) {
        skippedProblemIds.push(current_problem.id);
        setGameData(result);
    }
}
