var initembed = function() {
  
	var langs = ['de', 'fr', 'it', 'en'];
	var permalink = addPermalink();

	// Load the language
	var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 
	window.translator = $('html').translate({
	lang: lang,
	t: sdTranslations // Object defined in tranlations.js
	});

}