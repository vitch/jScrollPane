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