//var singpath_server_name = "http://singpath.appspot.com"
//var singpath_server_name = "http://pivot.appspot.com"
//var singpath_server_name = "http://localhost:8080"
var singpath_server_name = ''

function addSingpathServerNameToForm(formid) {
  if (singpath_server_name.length > 0) {
    var formNode = document.getElementById(formid);
    if (formNode != null) {
      var s = formNode.action;
      if (/^file:\/\//.test(s)) {
        s = s.substring(7);
      } else if (/^(http:\/\/[^\/]+)\//.exec(s) != null) {
        s = s.substring(RegExp.$1.length);
      }
      formNode.action = singpath_server_name + s;
    } else {
      //alert("No object with id "+formid);
    }
  }
}
