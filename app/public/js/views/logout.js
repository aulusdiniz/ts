function deleteCookies()
{
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
      console.log(cookie.substr(++eqPos));
      if (cookie.substr(eqPos+1,eqPos+1)!=";"){
        console.log(name);
        alert(name);
        return true;
      }
  }
}

$(document).ready(function()
{
  checkLogin();
});
