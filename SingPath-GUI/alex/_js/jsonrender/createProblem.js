var interfaces = {};
var successNum = 0;
var problem_data = false;

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    log_access('createProblem');
    loadPlayerData();
    initRolls();
    autoPreloadRollsImages();
    loadProblem();
    
    var highlight = 'python';
    showCodeTab(1);
    editAreaLoader.init({
        id: "skeleton_code",
        syntax: highlight,
        start_highlight: true,
        allow_resize: "no",
        font_size: 14,
        replace_tab_by_spaces: 4,
        word_wrap: true
      });
    function initTA() {
        if (editAreas['skeleton_code']['displayed']) {
            showCodeTab(0);
            editAreaLoader.init({
                id: "user_code",
                syntax: highlight,
                start_highlight: true,
                allow_resize: "no",
                font_size: 14,
                replace_tab_by_spaces: 4,
                word_wrap: true
              });
            initExampleCode();
        } else {
            window.setTimeout(initTA, 100);
        }
    }
    initTA();
    function initExampleCode() {
        var good = 0;
        try {
            if (editAreas['user_code']['displayed']) {
                setExampleSolutionAndTest();
                good = 1;
            }
        } catch (e) {
        }
        if (!good) {
            window.setTimeout(initExampleCode, 100);
        }
    }
});
function loadProblem() {
    var problem_id = getIdFromURL('problem_id');
    if (problem_id) {
        $('#create_or_edit_problem').html('Edit Problem');
        ajax({
            url: '/jsonapi/get_problem',
            data: {problem_id: problem_id},
            success: function(result) {
                problem_data = result['problem']; //save problem's data
                //set problem's attributes to controls
                $('#problemName').val(problem_data['name']);
                $('#problemDetails').val(problem_data['description']);
                $('#user_code').val(problem_data['solution']);
                $('#skeleton_code').val(problem_data['skeleton']);
                try {
                    window.frames['frame_skeleton_code'].document.getElementById('textarea').value =
                        problem_data['skeleton'];
                } catch (e) {
                }
                $('textarea#example').val(problem_data['examples']);
                $('textarea#publicTests').val(problem_data['tests']);
                $('textarea#privateTests').val(problem_data['other_tests']);
                
                loadLanguages();
            }
        });
    } else {
        loadLanguages();
    }
}
function loadLanguages() {
    ajax({
        url: '/jsonapi/interfaces',
        success: function(result) {
            var s = '';
            interfaces = {}; //save received interfaces to a global variable
            for (var i in result['interfaces']) {
                var f = result['interfaces'][i];
                var value = f['name'];
                var id = f['id'];
                if (f['singpathSupported']) {
                    s += '<option value="'+id+'">'+value+'</option>';
                }
                
                interfaces[id] = f;
            }
            $('#language').html(s);
            if (problem_data) {
                $('#language option[value='+problem_data['interface_id']+']').attr('selected', '1');
            }
            $('#language').change(function(){
                var interface_id = getSelectedInterfaceId();
                if (interface_id && interfaces[interface_id]) {
                    loadPaths(interface_id);
                    try {
                        setExampleSolutionAndTest();
                        
                        var highlight = interfaces[interface_id]['codeHighlightKey'];
                        highlight = highlight.toLowerCase();
                        window.frames["frame_user_code"].editArea.change_syntax(highlight);
                        window.frames["frame_skeleton_code"].editArea.change_syntax(highlight);
                    } catch (e) {
                        //alert(e);
                    }
                }
                //$('td.language img.checkicon').attr('src',
                //    '_images/createProblem/checkicon_'+(interface_id ? 'on' : 'off')+'.png');
            });
            loadPaths(getSelectedInterfaceId());
        }
    });
}
function getSelectedInterfaceId() {
    var interface_id = $('#language option:selected');
    if (interface_id && interface_id[0]) {
        return interface_id[0].value;
    }
    return undefined;
}
function setExampleSolutionAndTest() {
    var interface_id = getSelectedInterfaceId();
//    if (interface_id && interfaces[interface_id]) {
    var exampleSolution;
    if (problem_data) {
        exampleSolution = problem_data['solution'];
    } else {
        exampleSolution = interfaces[interface_id].exampleSolution;
    }
    window.frames['frame_user_code'].document.getElementById('textarea').value = exampleSolution;
    $('#user_code').val(exampleSolution);

    var exampleTests;
    if (problem_data) {
        exampleTests = problem_data['tests'];
    } else {
        exampleTests = interfaces[interface_id].exampleTests;
    }
    $('textarea#publicTests').val(exampleTests);
    
    window.frames["frame_user_code"].editArea.resync_highlight();
    showPublicTab(1);
//    }
}
function loadPaths(interface_id) {
    ajax({
        url: '/jsonapi/get_my_paths',
        data: {interface_id: interface_id},
        success: function(result) {
            var s = '';
            for (var i in result['paths']) {
                var f = result['paths'][i];
                var value = f['name'];
                var id = f['id'];
                s += '<option value="'+id+'">'+value+'</option>';
            }
            if (!s) {
                s = '<option value="">[Create default Path]</option>';
            }
            $('#path').html(s);
            if (problem_data) {
                $('#path option[value='+problem_data['path_id']+']').attr('selected', '1');
            }
            $('#path').change(function(){
                var path_id = getSelectedPathId();
                if (path_id) {
                    loadLevels(path_id);
                }
            });
            loadLevels(getSelectedPathId());
        }
    });
}
function getSelectedPathId() {
    var path_id = $('#path option:selected');
    if (path_id && path_id[0]) {
        return path_id[0].value;
    }
    return undefined;
}
function loadLevels(path_id) {
    var _loadLevels = function(result) {
        var s = '';
        for (var i in result['problemsets']) {
            var f = result['problemsets'][i];
            var value = f['name'];
            var id = f['id'];
            s += '<option value="'+id+'">'+value+'</option>';
        }
        if (!s) {
            s = '<option value="">[Create default Level]</option>';
        }
        $('#level').html(s);
        if (problem_data) {
            $('#level option[value='+problem_data['problemset_id']+']').attr('selected', '1');
        }
    }
    if (path_id) {
        ajax({
            url: '/jsonapi/problemsets/'+path_id,
            success: _loadLevels
        });
    } else {
        _loadLevels({'problemsets': []});
    }
}
function getSelectedLevelId() {
    var level_id = $('#level option:selected');
    if (level_id && level_id[0]) {
        return level_id[0].value;
    }
    return undefined;
}
function showTab(td, index, firstTab, secondTab, thirdTab) {
    displayTab(td, index);
    if (index == 0) {
        $(secondTab).hide();
        if (thirdTab) {
            $(thirdTab).hide();
        }
        $(firstTab).show();
    } else if (index == 1) {
        $(firstTab).hide();
        if (thirdTab) {
            $(thirdTab).hide();
        }
        $(secondTab).show();
    } else if (index == 2) {
        $(firstTab).hide();
        $(secondTab).hide();
        $(thirdTab).show();
    }
}
function showCodeTab(index) {
    showTab($('table.tourCurrentPathTestPage table.tabHeader td')[0], index, 'div#solution', 'div#skeleton');
}
function showPublicTab(index) {
    showTab($('table.publicExampleBox table.tabHeader td')[0], index, 'div#examples', 'div#publicTests', 'div#publicErrorMessages');
}
function showPrivateTab(index) {
    showTab($('table.privateTestsBox table.tabHeader td')[0], index, 'div#privateTests', 'div#privateErrorMessages');
}
function chkResult(submit) {
    if ((document.getElementById('edit_area_toggle_checkbox_user_code') != null) &&
        document.getElementById('edit_area_toggle_checkbox_user_code').checked) {
      $('#user_code').val(window.frames['frame_user_code'].document.getElementById('textarea').value);
    }
    showCodeTab(0);
    var source_code = $('#user_code').val();
    if (!source_code) {
        alert('Source code cannot be empty!');
        return;
    }
    var publicTests = $('textarea#publicTests').val();
    if (!publicTests) {
        alert('Public tests cannot be empty!');
        showPublicTab(1);
        return;
    }
    successNum = 0;
    check_code_with_interface(source_code, publicTests, 'publicErrorMessages', function(){
        showPublicTab(2);
        check_code_with_interface(source_code, $('textarea#privateTests').val(), 'privateErrorMessages', function(){
            showPrivateTab(1);
            if (successNum == 2) {
                $('table.submit img.submitProblem').attr('src', '_images/createProblem/submit_off.png');
                $('table.submit td.submitButton a')[0].setAttribute('onclick', 'chkResult(1);');
                initRolls();
                if (submit) {
                    submitProblem();
                }
            } else {
                $('table.submit img.submitProblem').attr('src', '_images/createProblem/submit_grey.png');
                $('table.submit a').attr('onclick', '');
            }
        });
    });
}
function check_code_with_interface(source_code, tests, errorMessageID, afterFunc) {
    $('#'+errorMessageID).empty();
    var interface_id = getSelectedInterfaceId();
    ajax({
        url: '/jsonapi/check_code_with_interface?callback=?',
        type: 'GET',
        data: {'source_code': source_code, 'tests': tests, 'interface_id': interface_id}, // data to be submitted
        dataType: 'json', //dataType is json when using POST method!
        skip_display_error: true,
        success: function(response) {
            var color = 'red';
            var msg = '';
            if (response['verification_message']) {
                msg = response['verification_message'];
                if (response['solved']) {
                    color = 'green';
                    successNum++;
                } else if (response['error']) {
                    msg += '<br>'+htmlEscape(response['error']);
                }
            } else if (response['error']) {
                msg = response['error'];
            } else {
                msg = 'Got an invalid response from the server';
            }
            $('#'+errorMessageID).empty();
            if (response['printed']) {
                $('#'+errorMessageID).append(response['printed']+'<br/>');
            }
            $('#'+errorMessageID).append('<font color="'+color+'">'+msg+'</font>');
            if (response['results']) {
                $('#'+errorMessageID).append(formatErrorResult(response['results']));
            }
            
            if (typeof(afterFunc) == 'function') {
                afterFunc(response);
            }
        }
    });
    return false;
}
function formatErrorResult2(results) {
    if (results.length > 0) {
        var html = '<table border="1">'+
                   '<tr>'+
                   '<th>Call</th>'+
                   '<th>Expected</th>'+
                   '<th>Received</th>'+
                   '<th>Correct</th>'+
                   '</tr>';
        for(var i = 0; i < results.length; i++) {
            var r = results[i];
            html += '<tr>'+
                    '<td>'+r.call+'</td>'+
                    '<td>'+formatValue(r.expected)+'</td>'+
                    '<td>'+formatValue(r.received)+'</td>'+
                    '<td class="'+(r.status ? "good" : "bad")+'">' + r.status + '</td>'+
                    '</tr>';
        }
        html += '</table>';
        return html;
    } else {
        return "Error";
    }
}
function formatValue2(value) {
  if (typeof(value) == "boolean") {
    return (value ? "True" : "False");
  }
  return ""+value;
}
function submitProblem() {
    if ((document.getElementById('edit_area_toggle_checkbox_user_code') != null) &&
        document.getElementById('edit_area_toggle_checkbox_user_code').checked) {
      $('#user_code').val(window.frames['frame_user_code'].document.getElementById('textarea').value);
    }
    if ((document.getElementById('edit_area_toggle_checkbox_skeleton_code') != null) &&
        document.getElementById('edit_area_toggle_checkbox_skeleton_code').checked) {
      $('#skeleton_code').val(window.frames['frame_skeleton_code'].document.getElementById('textarea').value);
    }
    
    var problem_id = problem_data ? problem_data['problem_id'] : undefined;
    
    var interface_id = getSelectedInterfaceId();
    var path_id = getSelectedPathId();
    var level_id = getSelectedLevelId();
    var name = $('#problemName').val();
    var details = $('#problemDetails').val();
    var solution_code = $('#user_code').val();
    var skeleton_code = $('#skeleton_code').val();
    var examples = $('textarea#example').val();
    var publicTests = $('textarea#publicTests').val();
    var privateTests = $('textarea#privateTests').val();

    if (!name) {
        alert('Please enter a name for your problem.');
        try {
            $('#problemName')[0].focus();
        } catch (e) {
        }
        return;
    }
    if (!details) {
        alert('Please enter the details for your problem in the "Problem Text" field.');
        try {
            $('#problemDetails')[0].focus();
        } catch (e) {
        }
        return;
    }
    if (!examples) {
        alert('Please enter examples for your problem on the "Example" tab.');
        showPublicTab(0);
        try {
            $('textarea#example')[0].focus();
        } catch (e) {
        }
        return;
    }
    var data = {
        interface_id: interface_id,
        path_id: path_id,
        level_id: level_id,
        name: name,
        details: details,
        solution_code: solution_code,
        skeleton_code: skeleton_code,
        examples: examples,
        publicTests: publicTests,
        privateTests: privateTests
    };
    if (problem_id) {
        data['problem_id'] = problem_id;
    }
    ajax({
        url: '/jsonapi/'+(problem_id ? 'edit' : 'new')+'_problem?callback=?',
        data: data,
        type: 'GET',
        dataType: 'json', //dataType is json when using POST method!
        success: function(result) {
            if (result['path_id'] && result['problemset_id']) {
                window.location = 'levels.html?path_id='+result['path_id']+'&level_id='+result['problemset_id'];
            } else {
                window.location = 'createMain.html';
            }
        }
    });
}
