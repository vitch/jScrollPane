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
				var container = elem.parent('.jspContainer');
				if (container.length == 0) {
					elem.css('overflow', 'hidden'); // So we are measuring it without scrollbars
					// TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
					// come back to it later and check once it is unhidden...
					paneWidth = elem.innerWidth();
					paneHeight = elem.innerHeight();
					elem.css('overflow', 'visible');
					elem.wrap(
						$('<div />')
							.addClass('jspContainer')
							.css({
								'width': paneWidth + 'px',
								'height': paneHeight + 'px'
							}
						)
					);
					container = elem.parent();
				} else {
					paneWidth = container.outerWidth();
					paneHeight = container.outerHeight();
					container.find('.jspVerticalBar,.jspHorizontalBar').remove().end();
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

				if (!(isScrollableH || isScrollableV)) {
					elem.removeClass('jspScrollable');
					elem.css('top', 0);
				} else {
					elem.addClass('jspScrollable');
					
					var getArrowScroll = function(dirX, dirY) {
						return function()
						{
							arrowScroll(dirX, dirY);
							this.blur();
							return false;
						}
					};

					if (isScrollableV) {

						container.append(
							$('<div class="jspVerticalBar" />').append(
								$('<div class="jspCap jspCapTop" />'),
								$('<div class="jspTrack" />').append(
									$('<div class="jspDrag" />').append(
										$('<div class="jspDragTop" />'),
										$('<div class="jspDragBottom" />')
									)
								),
								$('<div class="jspCap jspCapBottom" />')
							)
						);

						var verticalBar = container.find('>.jspVerticalBar');
						var verticalTrack = verticalBar.find('>.jspTrack');
						var verticalDrag = verticalTrack.find('>.jspDrag');

						// Add margin to the relevant side of the content to make space for the scrollbar (to position
						// the scrollbar on the left or right set it's left or right property in CSS)
						var scrollbarSide = verticalBar.position().left > 0 ?
								'right' :
								'left';
						elem.css('margin-' + scrollbarSide, (settings.gutter + verticalTrack.outerWidth()) + 'px');

						// Now we have reflowed the content we need to update the percentInView
						contentHeight = elem.outerHeight();
						percentInViewV = contentHeight / paneHeight;

						if (settings.showArrows) {
							var arrowUp = $('<a href="#" class="jspArrow jspArrowUp">Scroll up</a>').bind(
								'click', getArrowScroll(0, -1)
							);
							var arrowDown = $('<a href="#" class="jspArrow jspArrowDown">Scroll down</a>').bind(
								'click', getArrowScroll(0, 1)
							);
							verticalTrack.before(arrowUp).after(arrowDown);
						}

						var verticalTrackHeight = paneHeight;
						container.find('>.jspVerticalBar>.jspCap,>.jspVerticalBar>.jspArrow').each(
							function()
							{
								verticalTrackHeight -= $(this).outerHeight();
							}
						);

						verticalTrack.height(verticalTrackHeight + 'px');
						var verticalDragHeight = 1 / percentInViewV * verticalTrackHeight;
						verticalDrag.height(verticalDragHeight + 'px');
						var dragMaxY = verticalTrackHeight - verticalDragHeight;
						var verticalDragPosition = 0;

						verticalDrag.bind(
							'mousedown.jsp',
							function(e)
							{
								// Stop IE from allowing text selection
								$('html').bind('dragstart.jsp selectstart.jsp', function() { return false; });

								var startY = e.pageY - verticalDrag.position().top;

								$('html').bind(
									'mousemove.jsp',
									function(e)
									{
										positionDrag(e.pageY - startY);
									}
								).bind(
									'mouseup.jsp mouseleave.jsp',
									function()
									{
										$('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');
									}
								);
								return false;
							}
						);

						var positionDrag = function(destY)
						{
							if (destY < 0) {
								destY = 0;
							} else if (destY > dragMaxY) {
								destY = dragMaxY;
							}
							verticalDragPosition = destY;
							verticalDrag.css('top', destY);
							container.scrollTop(0);
							var percentScrolled = destY / dragMaxY;
							elem.css(
								'top',
								-percentScrolled * (contentHeight - paneHeight)
							);
						};


						container.bind(
							'mousewheel',
							function (event, delta) {
								var d = verticalDragPosition;
								positionDrag(verticalDragPosition - delta * settings.mouseWheelSpeed);
								// return true if there was no movement so rest of screen can scroll
								return d == verticalDragPosition;
							}
						);

					}
					var arrowScroll = function(dirX, dirY)
					{
						// TODO:
					};
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
		'showArrows'		: false,
		'gutter'			: 4,
		'mouseWheelSpeed'	: 10
	};

})(jQuery,this);
