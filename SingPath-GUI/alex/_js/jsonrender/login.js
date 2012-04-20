$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
});


// temp function to emulate user login
//$.session("var1", "value1");
function usrLogin() {

     if($.session("playername"))
                        {
                            //user already logged in and exist in session
                            window.location.replace("home.html");
                        }
                        else
                            {
                                //user not logged in 
                                $.ajax({

           //{"countryFlagURL": "/static/flags/SG.gif", "rankings": [], "gravatar": "http://www.gravatar.com/avatar/6e64bb2cab5367fd6e201df2aa722512/?default=&amp;s=80",
            //    "country": "Singapore", "nickname": "Chris", "badges": []}

		url: '/jsonapi/player?callback=?',
		dataType: 'json',
		success: function(player) {

                    setSession("playername", player.nickname);
			window.location.replace("home.html");
		}
	});

                            }


	
	
}

function setSession(name,value)
{
    
    $.session(name,value);


}