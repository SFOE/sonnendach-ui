function getMunicipality(coordx, coordy) {

  resetTarifInfo();

  var MunicipalityNumber = 0;

  if (coordx && coordy) {

    var query = '//api3.geo.admin.ch/rest/services/api/MapServer/identify?' +
            'geometryType=esriGeometryPoint' +
            '&returnGeometry=false' +
            '&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill' +
            '&geometry=' + coordy + ',' + coordx + 
            '&mapExtent=' + coordy + ',' + coordx + ',' + coordy + ',' + coordx +
            '&imageDisplay=100,100,96' +
            '&tolerance=0' + 
            '&lang=de';

    $.getJSON(query).then(function(data) { //success(data)
      	if (data.results && data.results.length > 0) {

	        $.each(data.results, function(key, val) {
	    
	          MunicipalityNumber = val.featureId;

	        });
        
	    }
	    //kick off whatever needs the value once you have it...which is when the server responds with data.
	    
	    getEVUs(MunicipalityNumber);

    });

  }

}


function getEVUs(MunicipalityNumber) {

  var EvuData = new Array();

  if (MunicipalityNumber) {

	query = "https://opendata.vese.ch/pvtarif/api/getData/muni?idofs=" + MunicipalityNumber + "&licenseKey=110xketkdbydpa8ph7s36nmeqxrq5eg8f1xbzz1g";

    $.getJSON(query).then(function(data) {

     	if (data.evus && data.evus.length > 0) {

        EvuData = data.evus;
        
	    }
	    getTarifData(EvuData);
        
    });

  }

}


function getTarifData(EvuData) {

  for (var i = 0; i < EvuData.length; i++) {

    query = "https://opendata.vese.ch/pvtarif/api/getData/evu?evuId=" + EvuData[i].nrElcom + "&year=18&licenseKey=110xketkdbydpa8ph7s36nmeqxrq5eg8f1xbzz1g";

    $.getJSON(query).then(function(data) {

      if (data.valid) {

        if ($.contains(document.body, document.getElementById("stromtarifEWZahl"))) {

          if (Number(document.getElementById("stromtarifEWZahl").innerHTML) < Number(data.energyAuto1)) {
            document.getElementById("stromtarifEWZahl").innerHTML = data.energyAuto1;
            document.getElementById("stromtarifEWEinheit").innerHTML = " " + translator.get('stromtarifEWEinheit');
            document.getElementById("stromtarifEW").innerHTML = data.nomEw;
            document.getElementById("stromtarifEWlink").href = data.link;
          }   

        }

      } else {
        
        if ($.contains(document.body, document.getElementById("stromtarifEWZahl"))) {     

          document.getElementById("stromtarifEWZahl").innerHTML = "";

        }

      }
      
 
     
    });

  }

}

function resetTarifInfo() {

  if ($.contains(document.body, document.getElementById("stromtarifEWZahl"))) {
    document.getElementById('stromtarifEWZahl').innerHTML = "0.00";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWEinheit"))) {
    document.getElementById('stromtarifEWEinheit').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEW"))) {
    document.getElementById('stromtarifEW').innerHTML = translator.get('stromtarifNO');
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWlink"))) {
    document.getElementById('stromtarifEWlink').href = "http://www.pvtarif.ch";
  }

}