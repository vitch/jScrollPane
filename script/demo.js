/*!
 * Scripts for the demo pages on the jScrollPane website.
 *
 * You do not need to include this script or use it on your site.
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */

$(function()
{
	// Copy the pages javascript sourcecode to the display block on the page for easy viewing...
	$('#sourcecode-display').empty().append(
		$('<code />').append(
			$('<pre />').html(
				$('#sourcecode').html().replace(/\n\t\t\t/gm, '\n')
			)
		)
	);
});



// Google analytics tracking code for demo site 
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-17828883-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();