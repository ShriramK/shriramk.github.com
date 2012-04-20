function loadStatisticData() {
    ajax({
        url: '../jsonapi/statistics',
        success: function(statistic) {
            $('#statsPlayingHour').text(statistic.playing_hours + ' hours');
            $('#statsAvgMinPerQuestion').text(statistic.avg_min_per_question + ' mins');
            $('#statsGivenBadges').text(statistic.given_badges);
            $('#statsNPaths').text(statistic.n_paths + ' Paths');
            $('#statsBestLang').text(statistic.best_language);
            $('#statsTotalBestHour').text(statistic.total_best_hour);
            $('#statsNPlayer').text(statistic.n_players + 'th');
            $('#statsLastPlayerCountry').text(statistic.last_player_country);
        }
    });
}

function loadPlayersGravatar() {
    /*
	ajax({
        url: '../jsonapi/current_players',
        success: function(players) {
            for(i in players) {
                $('#friendsTextBoxtext').append($('<img src="' + players[i].gravatar + '" width="46" height="46" alt="gravatar"/>'));
            }
        }
    });
    */
}