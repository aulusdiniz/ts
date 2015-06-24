function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

$(document).ready(function(){

  var visor = getURLParameter("visor");
  var latitude = getURLParameter("latitude");
  var longitude = getURLParameter("longitude");
  var altitude = getURLParameter("altitude");
  var time = getURLParameter("time");

  $("#hello").html("<h1>"+"Visor = "+visor+
  "<br> Latitude = "+latitude+
  "<br> Longitude = "+longitude+
  "<br> Altitude = "+altitude+
  "<br> Time = "+time+"</h1>"
  );

});
