var keyString = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var problem_data = {}
var result = {}
var postLines = 0;

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show()
    })
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide()
    })
    // player data
    loadPlayerData()
    autoPreloadRollsImages()

    $('input.auto_next').change(function(evt){
        $('input.auto_next').each(function(){
            this.checked = evt.target.checked
            if (this.checked) {
                checkSolution()
                $('table.mobilePlaySolution span.emptyLargeButton').addClass('disabled').fadeTo(400, 0.4)
            } else {
                $('table.mobilePlaySolution span.emptyLargeButton').removeClass('disabled').fadeTo(400, 1.0)
            }
        })
    })

    gameid = getIdFromURL('gameID')

    $("#game_id").attr("value",gameid)

    // game data
    ajax({
        url: '/jsonapi/game/'+getIdFromURL('gameID'),
        skip_display_error: true,
        success: setGameData
    })
})
function getCurrentProblem(result) {
    var res = null
    if (result && result.problems && result.problems.problems) {
        var solvedProblems = {}
        for (var i = 0, len = result.solvedProblemIDs.length; i < len; i++) {
            var id = result.solvedProblemIDs[i]
            solvedProblems[id] = id
        }
        for (var i = 0, len = result.problems.problems.length; i < len; i++) {
            var problem = result.problems.problems[i]
            if (!solvedProblems[problem.id]) {
                res = problem
                res['index'] = i
                break
            }
        }
    }
    return res
}
function startTimer(result) {
    var game_start = strToDatestamp(result['game_start']);
    var currentTime = strToDatestamp(result['currentTime']);
    var liftoffTime = (game_start / 1000) - (currentTime / 1000);
    $('#tourMBClock').countdown({since: liftoffTime, compact:true, format: 'dHMS', description: ''});
}
function setGameData(json_result) {
    result = json_result
    log_access('mobilePlay')
    startTimer(result)
    problem_data = getCurrentProblem(result)
    if (problem_data) {
        var showNewProblem = function() {
            showScrambledLines(problem_data)
            initLists()
            checkSolution()
            var examples = problem_data.examples
            examples = examples.replace(/</g, '&lt;')
            examples = examples.replace(/\n/g, '<br>')
            $('#examples').html(examples)
        }
        $('div.pEMText').css('position', 'relative')
        $('div.user_code').css('position', 'relative')
        $('div.pEMText').animate({left: "-400"});
        $('div.user_code').animate({left: "-500"}, function(){
            showNewProblem()
            $('div.pEMText').css('left', '400px')
            $('div.user_code').css('left', '500px')
            $('div.pEMText').animate({left: "0"})
            $('div.user_code').animate({left: "0"}, function() {
                $('div.pEMText').css('position', 'static')
                $('div.user_code').css('position', 'static')
            })
        })
    } else {
        gameFinished()
    }
}
function gameFinished() {
    var loc = 'home.html'
    //if all problems are on the same path (or in same problemset), then
    //go to that path (or problemset)
    var path_id = undefined
    var problemset_id = undefined
    for (var i in result.problems.problems) {
        var problem = result.problems.problems[i]
        if (problem.path_id && (path_id == undefined || path_id == problem.path_id)) {
            path_id = problem.path_id
        } else {
            path_id = 0
        }
        if (problem.problemset_id && (problemset_id == undefined ||
                problemset_id == problem.problemset_id)) {
            problemset_id = problem.problemset_id
        } else {
            problemset_id = 0
        }
    }
    if (path_id > 0) {
        loc = 'levels.html?path_id=' + path_id
        if (problemset_id > 0) {
            loc += '&level_id=' + problemset_id
        }
    }
    window.location = loc
}
function myChangeListener(event, ui) {
//    if ($('ul.solution li').length == 0) {
//        $('ul.solution').addClass('empty-ul')
//    } else {
//        $('ul.solution').removeClass('empty-ul')
//    }
//    if ($('ul.lines li').length == 0) {
//        $('ul.lines').addClass('empty-ul')
//    } else {
//        $('ul.lines').removeClass('empty-ul')
//    }
    var needEmpty = ($('ul.lines li').length > 0) ? 1 : 0
    if (postLines > 0) {
        $('ul.solution').attr('style', 'height: '+(36 * ($('ul.solution li').length + needEmpty) - 5)+'px')
    } else {
        $('ul.solution').attr('style', 'height: 432px')
    }
    checkSolution()
}
function checkSolution(goNextIfCorrect) {
    var lis = $('ul.solution li, ul.solution2 li')
    var code = ''
    for (var i = 0; i < lis.length; i++) {
        var li = lis[i]
        code += keyString[parseInt(li.id)]
    }
    var status = 'Empty solution code'
    var img = 'lights_red.png'
    var execution_results = undefined
    //if we don't have any non-erroneous result, this problem needs to increase depth
    if (JSON.stringify(problem_data.nonErrorResults) == '{}') {
        status = 'This problem is under development.'
        img = 'lights_green.png'
        $("#execution_results").html(status)
        if (isAutoNext() || goNextIfCorrect == true) {
            goToNextProblem()
            return
        }
    } else {
        if (code != '') {
            status = 'This solution does not compile'
            if (problem_data.nonErrorResults[code]) {
                var res = problem_data.nonErrorResults[code]
                if (res.solved == true) {
                    status = 'Correct'
                    img = 'lights_green.png'
                    if (isAutoNext() || goNextIfCorrect == true) {
                        goToNextProblem()
                        return
                    }
                    execution_results = formatErrorResult(res.results)
                } else {
                    status = 'Can compile'
                    execution_results = formatErrorResult(res.results)
                }
            }
        }
    }
    $("#execution_results").html(execution_results == undefined ? status : execution_results)
    $('#tourMBText').html(problem_data['index']+' out of '+result.numProblems+
        ' problems solved')
    $('img.light').attr('src', '_images/mobilePlay/'+img)
    $('img.light').attr('title', status)
}
function isAutoNext() {
    return $('input.auto_next').attr('checked')
}
function goToNextProblem() {
    if (result && result.solvedProblemIDs) {
        var lis = $('ul.solution li, ul.solution2 li')
        var code = ''
        for (var i = 0; i < lis.length; i++) {
            var li = lis[i]
            if (i > 0) {
                code += '\n'
            }
            code += problem_data.lines[parseInt(li.id)]
        }
        if (!code) {
            return
        }
        (function(gameid, problem_data){
            ajax({
                url   : '/jsonapi/verify_solution.php?callback=?',
                type: 'POST',
                data: {user_code: code, game_id: gameid, problem_id: problem_data.id},
                dataType: 'json', //dataType is json when using POST method!
                skip_display_error: true,
                success: function(response) {
                    //try again, if there was an error
                    if (response && response.error) {
                        ajax({
                            url   : '/jsonapi/verify_solution.php?callback=?',
                            type: 'POST',
                            data: {user_code: code, game_id: gameid, problem_id: problem_data.id},
                            dataType: 'json', //dataType is json when using POST method!
                            skip_display_error: true,
                            success: function(response) {
                                //no need to do anything, this ajax call just registered
                                //that the player solved the problem. It doesn't matter if
                                //there was a communication error.
                                //Since the player tries to solve an other problem now, we
                                //cannot display an error, it would just confuse the player
                            }
                        });
                    }
                }
            });
        })(gameid, problem_data);
        result.solvedProblemIDs.push(problem_data.id)
        setGameData(result)

    }
}
function initLists() {
    $("#execution_results").empty()
    $('ul.solution, ul.lines').sortable({
        connectWith: '.connectedSortable',
        placeholder: 'placeholder',
        stop: myChangeListener,
        items: 'li.line',
        revert: 400
    }).disableSelection()
}
function randomize(arr) {
    var res = []
    while (arr.length > 0) {
        var i = parseInt(Math.random() * arr.length)
        var elem = arr.splice(i, 1)
        res.push(elem[0])
    }
    return res
}
function rtrim(s) {
    return ('' + s).replace(/ +$/, '')
}
function generateLines(codelines, idx, count, clazz) {
//    var max = 0
//    for (var j = 0; j < codelines.length; j++) {
//        var s = rtrim(codelines[j])
//        if (s.length > max) {
//            max = s.length
//        }
//    }
    var lines = []
    while (count > 0) {
        var line = rtrim(codelines[idx])
//        while (line.length < max) {
//            line += ' '
//        }
        lines.push('<li class="'+clazz+'" id="'+idx+'"><pre>'+htmlEscape(line)+'</pre></li>')
        idx++
        count--
    }
    if (clazz == 'line') {
        lines = randomize(lines)
    }
    var html = ''
    for (var i = 0; i < lines.length; i++) {
        html += lines[i]
    }
    return html
}
function showScrambledLines(data) {
    $('div.user_code').html('<ul class="solution connectedSortable"></ul><ul class="solution2 connectedSortable"></ul>')
    $('div#code_lines').html('<ul class="lines connectedSortable"></ul>')
    for (var i in data.nonErrorResults) {
        if (typeof(data.nonErrorResults[i]) == 'string') {
            data.nonErrorResults[i] = JSON.parse(data.nonErrorResults[i])
        }
    }

    var depth = parseInt(data.depth)
    if (depth == 1) {
        depth = 0
    }
    var codelines = data.lines
    if (codelines == undefined) {
        return;
    }

    var extraLines = 0
    if (codelines.length > depth) {
        extraLines = codelines.length - depth
    }
    postLines = parseInt(extraLines / 2)
    var preLines = extraLines - postLines

    //add fix lines to the left list, if needed
    $('ul.solution').html(generateLines(codelines, 0, preLines, 'fixline'))
    //add the lines to the right
    $('ul.lines').html(generateLines(codelines, preLines, depth, 'line'))
    //add fix lines to the bottom left list, if needed
    $('ul.solution2').html(generateLines(codelines, preLines + depth, postLines, 'fixline'))

    //set the height of the solution lists if there are any postLines
    if (postLines > 0) {
        var needEmpty = depth > 0 ? 1 : 0
        $('ul.solution').attr('style', 'height: '+(36 * (preLines + needEmpty) - 5)+'px')
        $('ul.solution2').attr('style', 'height: '+(36 * postLines)+'px')
    } else {
        $('ul.solution').attr('style', 'height: 432px')
        $('ul.solution2').attr('style', 'height: 0px')
    }

    $('.tourCPTextTitle').html(data.name)
    $('.tourCPText').html(data.description)
}
function showTab(index) {
    displayTab($('table.pExampleMessage table.tabHeader td')[0], index)
    if (index == 0) {
        $('#examples').hide()
        $('#code_lines').show()
    } else {
        $('#code_lines').hide()
        $('#examples').show()
    }
}
function skipProblem() {
    if (problem_data && result) {
        result.solvedProblemIDs.push(problem_data.id);
        setGameData(result);
    }
}
