function deleteCookies()
{
  document.cookie = "";
  $('#menu_upper_logged').hide();
  $('#menu_upper_content').show();
  console.log(document.cookie);
  var allcookies = document.cookie.split(";");

  for (var i = 0; i < allcookies.length; i++) {
      var cookie = allcookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function checkLogin()
{
  console.log(document.cookie);
  var allcookies = document.cookie.split(";");

  for (var i = 0; i < allcookies.length; i++) {
      var cookie = allcookies[i];
      var eqPos = cookie.indexOf("=");
      var fPos = cookie.indexOf(";");
      console.log(cookie);
      console.log(cookie[eqPos+1]);
      if (cookie[eqPos+1]!=";" && cookie[eqPos+1]!=undefined){
        $('#menu_upper_logged').show();
        $('#menu_upper_content').hide();
        return true;
      }else{
        return false;
      }
  }
}

$(document).ready(function()
{
  checkLogin();
  $('#sair_btn').click(function(){ deleteCookies(); });
});
