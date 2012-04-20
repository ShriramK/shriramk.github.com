function loadChallenge() {
    var challenge_id = getIdFromURL('challenge_id');
    var player_id = getIdFromURL('player_id');
    if (challenge_id && player_id) {
        ajax({
            url: '/jsonapi/get_challenge_player_message',
            data: {challenge_id: challenge_id, player_id: player_id},
            success: function(result) {
                var challenge = result['challenge'];
                $('#name').html(challenge['name']);
                $('#publicMessage').html(challenge['publicMessage']);
                $('#registeredMessage').html(challenge['registeredMessage']);
                $('#unlockMessage').html(challenge['unlockMessage']);
                $('#privateMessage').html(challenge['privateMessage']);
                $('#challenge_id').val(challenge['challenge_id']);
                
                $('#playerFeedback').html(challenge['playerFeedback']);
                var s = '[No attachment]';
                if (challenge['playerAttachmentID'] && challenge['playerAttachmentID'] > 0) {
                    s = '<a href="/download_file?id='+challenge['playerAttachmentID']+'">download</a>';
                }
                $('#attachment').html(s);
                $('#player_id').val(player_id);
            }
        });
    }
}
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    loadChallenge();
});
