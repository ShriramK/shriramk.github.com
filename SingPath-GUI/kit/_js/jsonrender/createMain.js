var interfaces;

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    log_access('createMain');
    loadPlayerData();
    loadInterfaces();
    autoPreloadRollsImages();
});
function loadInterfaces() {
    ajax({
        url: '/jsonapi/interfaces',
        success: function(result) {
            interfaces = result.interfaces;
            var s = '';
            for (var i in interfaces) {
                var iface = interfaces[i];
                s += '<option value="'+iface.id+'">'+iface.name+'</option>';
            }
            $('select#popup_path_language').html(s);
        }
    });
}
function showEditPathPopup() {
    $('select#popup_path_language').val(0);
    $('#popup_path_name').val('');
    $('#popup_path_desc').val('');
    $('#showProfilePopup').show();
}
function savePath() {
    var data = {
        'interface_id': $('select#popup_path_language').val(),
        'name': $('#popup_path_name').val(),
        'description': $('#popup_path_desc').val()
    };
    ajax({
        url: '/jsonapi/new_path',
        data: data,
        success: function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            alert('Path successfully created!');
            $('#showProfilePopup').hide();
        }
    });
}
function showProblemsetPopup() {
    $('#popup_problemset_path').html('<option>--</option>');
    loadMyPaths();
    $('#popup_problemset_name').val('');
    $('#popup_problemset_desc').val('');
    $('#showProblemsetPopup').show();
}
function loadMyPaths() {
    ajax({
        url: '/jsonapi/get_my_paths', //no need for interface_id, we need all of my paths
        success: function(result) {
            var paths = result.paths;
            var s = '';
            for (var i in paths) {
                var path = paths[i];
                s += '<option value="'+path.id+'">'+path.name+'</option>';
            }
            $('#popup_problemset_path').html(s);
        }
    });
}
function saveProblemset() {
    var data = {
        'path_id': $('#popup_problemset_path').val(),
        'name': $('#popup_problemset_name').val(),
        'description': $('#popup_problemset_desc').val()
    };
    ajax({
        url: '/jsonapi/new_problemset',
        data: data,
        success: function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            alert('Problemset successfully created!');
            $('#showProblemsetPopup').hide();
        }
    });
}
