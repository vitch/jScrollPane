/*!
 * jScrollPane - v2.0.0beta1 - 2010-08-02
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */

// Script: jScrollPane - cross browser customisable scrollbars
//
// *Version: 2.0.0beta1, Last updated: 2010-08-02*
//
// Project Home - http://jscrollpane.kelvinluck.com/
// GitHub       - http://github.com/vitch/jScrollPane
// Source       - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.js
// (Minified)   - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.min.js
//
// About: License
//
// Copyright (c) 2010 Kelvin Luck
// Dual licensed under the MIT and GPL licenses.
//
// About: Examples
//
// All examples are available through the jScrollPane example site at:
// http://jscrollpane.kelvinluck.com/
//
// About: Support and Testing
//
// TBC
//
// jQuery Versions - TBC
// Browsers Tested - TBC
//
// About: Release History
//
// 2.0.0beta - (2010-08-02) Rewrite to follow modern best practices and enable horizontal scrolling
// 1.x - (2006-12-31 - 2010-07-31) Initial version, hosted at googlecode, deprecated

(function($,window,undefined){

	$.fn.jScrollPane = function(settings)
	{
		settings = $.extend({}, $.fn.jScrollPane.defaults, settings);

		return this.each(
			function()
			{

			}
		)
	};

	/*
	$.fn.jScrollPaneRemove = function()
	{
		$(this).each(
			function()
			{

			}
		);
	}
	*/

	$.fn.jScrollPane.defaults = {
	};

})(jQuery,this);
