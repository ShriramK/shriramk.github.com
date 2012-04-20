function loadChallenge() {
    var challenge_id = getIdFromURL('challenge_id');
    if (challenge_id) {
        ajax({
            url: '/jsonapi/get_challenge',
            data: {challenge_id: challenge_id},
            success: function(result) {
                var challenge = result['challenge'];
                $('#name').html(challenge['name']);
                $('#publicMessage').html(challenge['publicMessage']);
                $('#registeredMessage').html(challenge['registeredMessage']);
                $('#unlockMessage').html(challenge['unlockMessage']);
                $('#privateMessage').html(challenge['privateMessage']);
                $('#challenge_id').val(challenge['challenge_id']);
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
