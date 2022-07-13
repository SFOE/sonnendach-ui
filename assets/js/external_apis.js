function getMunicipality(coordx, coordy) {

  resetTarifInfo();
  resetGemeindePotentialInfo();

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
            MunicipalityName = val.attributes.label;

	        });
        
	    }
	    //kick off whatever needs the value once you have it...which is when the server responds with data.
	    
	    getEVUs(MunicipalityNumber);
      getPotentialOfMunicipality(MunicipalityNumber, MunicipalityName);

    });

  }

}


function getEVUs(MunicipalityNumber) {

  var EvuData = new Array();

  if (MunicipalityNumber) {

	query = "https://bfe-cors.geotest.ch/https://opendata.vese.ch/pvtarif/api/getData/muni?idofs=" + MunicipalityNumber + "&licenseKey=110xketkdbydpa8ph7s36nmeqxrq5eg8f1xbzz1g";

    $.getJSON(query).then(function(data) {

     	if (data.evus && data.evus.length > 0) {

        EvuData = data.evus;
        
	    }
	    getTarifData(EvuData);
        
    });

  }

}


function getTarifData(EvuData) {
	console.log(EvuData[0])
	
	if ("nrElcom" in EvuData[0]) {
		console.log("asdf")

		query = "https://bfe-cors.geotest.ch/https://opendata.vese.ch/pvtarif/api/getData/evu?evuId=" + EvuData[0].nrElcom + "&year=22&licenseKey=110xketkdbydpa8ph7s36nmeqxrq5eg8f1xbzz1g";

		$.getJSON(query).then(function(data) {

		  if (data.valid) {

			fillContent1(data)

		  } else {
			
			if ($.contains(document.body, document.getElementById("stromtarifEWZahl1"))) {     

			  document.getElementById("stromtarifEWZahl1").innerHTML = "";

			}

		  }

		});
		
	}

	if ("nrElcom" in EvuData[1]) {

		query = "https://bfe-cors.geotest.ch/https://opendata.vese.ch/pvtarif/api/getData/evu?evuId=" + EvuData[1].nrElcom + "&year=22&licenseKey=110xketkdbydpa8ph7s36nmeqxrq5eg8f1xbzz1g";

		$.getJSON(query).then(function(data) {

		  if (data.valid) {

			fillContent2(data)

		  } else {
			
			if ($.contains(document.body, document.getElementById("stromtarifEWZahl2"))) {     

			  document.getElementById("stromtarifEWZahl2").innerHTML = "";

			}

		  }

		});
		
	}	


}

function fillContent1(data) {

	if ($.contains(document.body, document.getElementById("stromtarifEWZahl1"))) {

	  if (Number(document.getElementById("stromtarifEWZahl1").innerHTML) < (Number(data.energy1) + Number(data.eco1))) {
		document.getElementById("stromtarifEWZahl1").innerHTML = (Number(data.energy1) + Number(data.eco1));
		document.getElementById("stromtarifEWEinheit1").innerHTML = " " + translator.get('stromtarifEWEinheit');
		document.getElementById("stromtarifEW1").innerHTML = data.nomEw;
		document.getElementById("stromtarifEWlink1").href = data.link;
	  }   

	}
}

function fillContent2(data) {

	if ($.contains(document.body, document.getElementById("stromtarifEWZahl2"))) {
		
		document.getElementById('tarif2').style = "visibility: visible;"

	  if (Number(document.getElementById("stromtarifEWZahl2").innerHTML) < (Number(data.energy1) + Number(data.eco1))) {
		document.getElementById("stromtarifEWZahl2").innerHTML = (Number(data.energy1) + Number(data.eco1));
		document.getElementById("stromtarifEWEinheit2").innerHTML = " " + translator.get('stromtarifEWEinheit');
		document.getElementById("stromtarifEW2").innerHTML = data.nomEw;
		document.getElementById("stromtarifEWlink2").href = data.link;
	  }   

	}
}

function resetTarifInfo() {

  if ($.contains(document.body, document.getElementById("stromtarifEWZahl1"))) {
    document.getElementById('stromtarifEWZahl1').innerHTML = "0.00";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWEinheit1"))) {
    document.getElementById('stromtarifEWEinheit1').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEW1"))) {
    document.getElementById('stromtarifEW1').innerHTML = translator.get('stromtarifNO');
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWlink1"))) {
    document.getElementById('stromtarifEWlink1').href = "http://www.pvtarif.ch";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWZahl2"))) {
    document.getElementById('stromtarifEWZahl2').innerHTML = "0.00";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWEinheit2"))) {
    document.getElementById('stromtarifEWEinheit2').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("stromtarifEW2"))) {
    document.getElementById('stromtarifEW2').innerHTML = translator.get('stromtarifNO');
  }

  if ($.contains(document.body, document.getElementById("stromtarifEWlink2"))) {
    document.getElementById('stromtarifEWlink2').href = "http://www.pvtarif.ch";
  }
  
  document.getElementById('tarif2').style = "visibility: hidden;"

}


function getPotentialOfMunicipality(MunicipalityNumber, MunicipalityName) {

  if (MunicipalityNumber) {

  url = "//www.uvek-gis.admin.ch/BFE/ogd/52/Solarenergiepotenziale_Gemeinden_Daecher_und_Fassaden_Version_Sonnendach.json";

    $.getJSON(url).then(function(data) {

      $.each(data, function (key, val) {

        if (val.MunicipalityNumber == MunicipalityNumber) {

          if ($.contains(document.body, document.getElementById("GemeindepotentialGemeinde"))) {
            document.getElementById('GemeindepotentialGemeinde').innerHTML = MunicipalityName;
          }

          if ($.contains(document.body, document.getElementById("Gemeindepotential1strom"))) {
            document.getElementById('Gemeindepotential1strom').innerHTML = val.Scenario3_RoofsFacades_PotentialSolarElectricity_GWh;
          }

          if ($.contains(document.body, document.getElementById("Gemeindepotential2strom"))) {
            document.getElementById('Gemeindepotential2strom').innerHTML = val.Scenario4_RoofsFacades_PotentialSolarElectricity_GWh;
          }

          if ($.contains(document.body, document.getElementById("Gemeindepotential2waerme"))) {
            document.getElementById('Gemeindepotential2waerme').innerHTML = val.Scenario4_RoofsFacades_PotentialSolarHeat_GWh;
          }          

          if ($.contains(document.body, document.getElementById("GemeindepotentialEinheit"))) {
            document.getElementById('GemeindepotentialEinheit').innerHTML = translator.get('GemeindepotentialEinheit');
          }

          if ($.contains(document.body, document.getElementById("GemeindepotentialEinheit2"))) {
            document.getElementById('GemeindepotentialEinheit2').innerHTML = translator.get('GemeindepotentialEinheit');
          }

          if ($.contains(document.body, document.getElementById("GemeindepotentialEinheit3"))) {
            document.getElementById('GemeindepotentialEinheit3').innerHTML = translator.get('GemeindepotentialEinheit');
          }          

          if ($.contains(document.body, document.getElementById("GemeindepotentialLink"))) {
            document.getElementById('GemeindepotentialLink').href = "https://www.uvek-gis.admin.ch/BFE/storymaps/ECH_SolarpotGemeinden/pdf/" + val.MunicipalityNumber + ".pdf";
          }

          if ($.contains(document.body, document.getElementById("GemeindepotentialLinkText"))) {
            document.getElementById('GemeindepotentialLinkText').innerHTML = translator.get('GemeindepotentialLinkText');
          }
          
        }        

      });
        
    });

  }

}


function resetGemeindePotentialInfo() {

  if ($.contains(document.body, document.getElementById("GemeindepotentialGemeinde"))) {
    document.getElementById('GemeindepotentialGemeinde').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("Gemeindepotential1strom"))) {
    document.getElementById('Gemeindepotential1strom').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("Gemeindepotential2strom"))) {
    document.getElementById('Gemeindepotential2strom').innerHTML = "";
  }

  if ($.contains(document.body, document.getElementById("Gemeindepotential2waerme"))) {
    document.getElementById('Gemeindepotential2waerme').innerHTML = "";
  }         

  if ($.contains(document.body, document.getElementById("GemeindepotentialLink"))) {
    document.getElementById('GemeindepotentialLink').href = "";
  }

}