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
				var elem = $(this);
				var paneWidth, paneHeight;

				var savedSettings = elem.data('jsp');
				if (savedSettings == undefined) {
					savedSettings = {
						/*
						'originalPadding' : elem.css('paddingTop') + ' ' +
											elem.css('paddingRight') + ' ' +
											elem.css('paddingBottom') + ' ' +
											elem.css('paddingLeft'),
						'originalSidePaddingTotal' : (parseInt(elem.css('paddingLeft')) || 0) +
														(parseInt(elem.css('paddingRight')) || 0)
						*/
					};
					elem.data('jsp', savedSettings);
				}
				var container = elem.parent('.jScrollPaneContainer');
				if (container.length == 0) {
					elem.css('overflow', 'hidden'); // So we are measuring it without scrollbars
					// TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
					// come back to it later and check once it is unhidden...
					paneWidth = elem.innerWidth();
					paneHeight = elem.innerHeight();
					elem.css('overflow', 'visible');
					container = $('<div />')
									.addClass('jScrollPaneContainer')
									.css({
										'width': paneWidth + 'px',
										'height': paneHeight + 'px'
									});
					elem.wrap(container);
				} else {
					paneWidth = container.outerWidth();
					paneHeight = container.outerHeight();
				}

				elem.css({
					'width': 'auto',
					'height': 'auto'
				});

				// Unfortunately it isn't that easy to find out the width of the element as it will always report the
				// width as allowed by its container, regardless of overflow settings.
				// A cunning workaround is to clone the element, set its position to absolute and place it in a narrow
				// container. Now it will push outwards to its maxium real width...
				var clonedElem = elem.clone().css('position', 'absolute');
				var tempWrapper = $('<div style="width:1px; position: relative;" />').append(clonedElem);
				$('body').append(tempWrapper);
				var contentWidth = Math.max(elem.outerWidth(), clonedElem.outerWidth());
				tempWrapper.remove();

				var contentHeight = elem.outerHeight();
				var percentInViewH = contentWidth / paneWidth;
				var percentInViewV = contentHeight / paneHeight;
				var isScrollableV = percentInViewV > .99;
				var isScrollableH = percentInViewH > 1;

				//console.log(contentWidth, contentHeight, paneWidth, paneHeight, isScrollableH, isScrollableV);

				if (!(isScrollableH || isScrollableV)) {
					elem.removeClass('scrollable');
				} else {
					elem.addClass('scrollable');
				}
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
		'showArrows'		: false
	};

})(jQuery,this);
