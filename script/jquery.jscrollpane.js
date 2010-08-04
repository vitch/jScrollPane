/*!
 * jScrollPane - v2.0.0beta1 - 2010-08-03
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */

// Script: jScrollPane - cross browser customisable scrollbars
//
// *Version: 2.0.0beta1, Last updated: 2010-08-03*
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
// jQuery Versions - 1.4.2
// Browsers Tested - Firefox 3.6.8, Safari 5, Opera 10.6, Chrome 5.0, IE 7, 8
//
// About: Release History
//
// 2.0.0beta1 - (2010-08-03) Rewrite to follow modern best practices and enable horizontal scrolling
// 1.x - (2006-12-31 - 2010-07-31) Initial version, hosted at googlecode, deprecated

(function($,window,undefined){

	$.fn.jScrollPane = function(settings)
	{
		// JScrollPane "class" - public methods are available through $('selector').data('jsp')
		function JScrollPane(elem, settings)
		{

			var jsp = this, pane, savedSettings, paneWidth, paneHeight, container, contentWidth, contentHeight,
				percentInViewH, percentInViewV, isScrollableV, isScrollableH, verticalDrag, dragMaxY,
				verticalDragPosition, horizontalDrag, dragMaxX, horizontalDragPosition,
				verticalBar, verticalTrack, scrollbarWidth, verticalTrackHeight, verticalDragHeight, arrowUp, arrowDown,
				horizontalBar, horizontalTrack, horizontalTrackWidth, horizontalDragWidth, arrowLeft, arrowRight
				;

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

			initialise(settings);

			function initialise(settings)
			{

				var clonedElem, tempWrapper;

				if (pane == undefined) {

					elem.css('overflow', 'hidden'); // So we are measuring it without scrollbars
					// TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
					// come back to it later and check once it is unhidden...
					paneWidth = elem.innerWidth();
					paneHeight = elem.innerHeight();
					pane = $('<div class="jspPane" />').wrap(
						$('<div class="jspContainer" />')
							.css({
								'width': paneWidth + 'px',
								'height': paneHeight + 'px'
							}
						)
					);
					elem.css('overflow', 'visible');
					elem.wrap(pane.parent());
					// Need to get the vars after being added to the document, otherwise they reference weird
					// disconnected orphan elements...
					pane = elem.parent();
					container = pane.parent();

					// Add classes to allow us to trim relevant margins from top and bottom of element which cause
					// problems when measuring height of elements.
					elem.find(':first-child').addClass('jspFirst');
					elem.find(':last-child').addClass('jspLast');
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
				clonedElem = elem.clone().css('position', 'absolute');
				tempWrapper = $('<div style="width:1px; position: relative;" />').append(clonedElem);
				$('body').append(tempWrapper);
				contentWidth = Math.max(elem.outerWidth(), clonedElem.outerWidth());
				tempWrapper.remove();

				contentHeight = elem.outerHeight();
				percentInViewH = contentWidth / paneWidth;
				percentInViewV = contentHeight / paneHeight;
				isScrollableV = percentInViewV > 1;
				isScrollableH = percentInViewH > 1;

				//console.log(paneWidth, paneHeight, contentWidth, contentHeight, percentInViewH, percentInViewV, isScrollableH, isScrollableV);

				if (!(isScrollableH || isScrollableV)) {
					elem.removeClass('jspScrollable');
					pane.css('top', 0);
					removeMousewheel();
				} else {
					elem.addClass('jspScrollable');

					initialiseVerticalScroll();
					initialiseHorizontalScroll();
					resizeScrollbars();
				}
			}

			function initialiseVerticalScroll()
			{
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

					verticalBar = container.find('>.jspVerticalBar');
					verticalTrack = verticalBar.find('>.jspTrack');
					verticalDrag = verticalTrack.find('>.jspDrag');

					if (settings.showArrows) {
						arrowUp = $('<a href="#" class="jspArrow jspArrowUp">Scroll up</a>').bind(
							'mousedown.jsp', getArrowScroll(0, -1)
						).bind('click.jsp', nil);
						arrowDown = $('<a href="#" class="jspArrow jspArrowDown">Scroll down</a>').bind(
							'mousedown.jsp', getArrowScroll(0, 1)
						).bind('click.jsp', nil);
						verticalTrack.before(arrowUp).after(arrowDown);
					}

					verticalTrackHeight = paneHeight;
					container.find('>.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow').each(
						function()
						{
							verticalTrackHeight -= $(this).outerHeight();
						}
					);


					verticalDrag.hover(
						function()
						{
							verticalDrag.addClass('jspHover');
						},
						function()
						{
							verticalDrag.removeClass('jspHover');
						}
					).bind(
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
									positionDragY(e.pageY - startY);
								}
							).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					sizeVerticalScrollbar();
					initMousewheel();
				} else {
					// no vertical scroll
					removeMousewheel();
				}
			}

			function sizeVerticalScrollbar()
			{
				verticalTrack.height(verticalTrackHeight + 'px');
				verticalDragPosition = 0;
				scrollbarWidth = settings.verticalGutter + verticalTrack.outerWidth();

				// Make the pane thinner to allow for the vertical scrollbar
				pane.width(paneWidth - scrollbarWidth);

				// Add margin to the left of the pane if scrollbars are on that side (to position
				// the scrollbar on the left or right set it's left or right property in CSS)
				if (verticalBar.position().left == 0) {
					pane.css('margin-left', scrollbarWidth + 'px');
				}
			}

			function initialiseHorizontalScroll()
			{
				if (isScrollableH) {

					container.append(
						$('<div class="jspHorizontalBar" />').append(
							$('<div class="jspCap jspCapLeft" />'),
							$('<div class="jspTrack" />').append(
								$('<div class="jspDrag" />').append(
									$('<div class="jspDragLeft" />'),
									$('<div class="jspDragRight" />')
								)
							),
							$('<div class="jspCap jspCapRight" />')
						)
					);

					horizontalBar = container.find('>.jspHorizontalBar');
					horizontalTrack = horizontalBar.find('>.jspTrack');
					horizontalDrag = horizontalTrack.find('>.jspDrag');

					if (settings.showArrows) {
						arrowLeft = $('<a href="#" class="jspArrow jspArrowLeft">Scroll left</a>').bind(
							'mousedown.jsp', getArrowScroll(-1, 0)
						).bind('click.jsp', nil);
						arrowRight = $('<a href="#" class="jspArrow jspArrowRight">Scroll right</a>').bind(
							'mousedown.jsp', getArrowScroll(1, 0)
						).bind('click.jsp', nil);
						horizontalTrack.before(arrowLeft).after(arrowRight);
					}

					horizontalDrag.hover(
						function()
						{
							horizontalDrag.addClass('jspHover');
						},
						function()
						{
							horizontalDrag.removeClass('jspHover');
						}
					).bind(
						'mousedown.jsp',
						function(e)
						{
							// Stop IE from allowing text selection
							$('html').bind('dragstart.jsp selectstart.jsp', function() { return false; });

							var startX = e.pageX - horizontalDrag.position().left;

							$('html').bind(
								'mousemove.jsp',
								function(e)
								{
									positionDragX(e.pageX - startX);
								}
							).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					horizontalTrackWidth = container.innerWidth();
					sizeHorizontalScrollbar();
				} else {
					// no horizontal scroll
				}
			}

			function sizeHorizontalScrollbar()
			{

				pane.height(paneHeight - settings.horizontalGutter - horizontalTrack.outerHeight());

				container.find('>.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow').each(
					function()
					{
						horizontalTrackWidth -= $(this).outerWidth();
					}
				);

				horizontalTrack.width(horizontalTrackWidth + 'px');
				horizontalDragPosition = 0;
			}

			function resizeScrollbars()
			{
				if (isScrollableH && isScrollableV) {
					var verticalScrollWidth = horizontalTrack.outerHeight(),
						horizontalScrollHeight = verticalTrack.outerWidth();
					verticalTrackHeight -= verticalScrollWidth;
					horizontalTrackWidth -= horizontalScrollHeight;
					paneHeight -= horizontalScrollHeight;
					paneWidth -= verticalScrollWidth;
					horizontalTrack.parent().append(
						$('<div class="jspCorner" />').css('width', verticalScrollWidth + 'px')
					);
					sizeVerticalScrollbar();
					sizeHorizontalScrollbar();
				}
				// reflow content
				if (isScrollableH) {
					pane.width(container.outerWidth() + 'px');
				}
				contentHeight = elem.outerHeight();
				percentInViewV = contentHeight / paneHeight;

				if (isScrollableH) {
					horizontalDragWidth = 1 / percentInViewH * horizontalTrackWidth;
					horizontalDrag.width(horizontalDragWidth + 'px');
					dragMaxX = horizontalTrackWidth - horizontalDragWidth;
				}
				if (isScrollableV) {
					verticalDragHeight = 1 / percentInViewV * verticalTrackHeight;
					verticalDrag.height(verticalDragHeight + 'px');
					dragMaxY = verticalTrackHeight - verticalDragHeight;
				}
			}

			function getArrowScroll(dirX, dirY) {
				return function()
				{
					arrowScroll(dirX, dirY);
					this.blur();
					return false;
				}
			};

			function arrowScroll(dirX, dirY)
			{
				var scrollInt = setInterval(
					function()
					{
						if (dirX != 0) {
							positionDragX(horizontalDragPosition + dirX * settings.arrowButtonSpeed);
						}
						if (dirY != 0) {
							positionDragY(verticalDragPosition + dirY * settings.arrowButtonSpeed);
						}
					},
					settings.arrowRepeatFreq
				)
				$('html').bind(
					'mouseup.jsp',
					function()
					{
						clearInterval(scrollInt);
						$('html').unbind('mouseup.jsp');
					}
				);
			};

			function cancelDrag()
			{
				$('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');
			}

			function positionDragY(destY)
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
				pane.css(
					'top',
					-percentScrolled * (contentHeight - paneHeight)
				);
			};

			function positionDragX(destX)
			{
				if (destX < 0) {
					destX = 0;
				} else if (destX > dragMaxX) {
					destX = dragMaxX;
				}
				horizontalDragPosition = destX;
				horizontalDrag.css('left', destX);
				container.scrollTop(0);
				var percentScrolled = destX / dragMaxX;
				pane.css(
					'left',
					-percentScrolled * (contentWidth - paneWidth)
				);
			};

			function initMousewheel()
			{
				container.bind(
					'mousewheel.jsp',
					function (event, delta) {
						var d = verticalDragPosition;
						positionDragY(verticalDragPosition - delta * settings.mouseWheelSpeed);
						// return true if there was no movement so rest of screen can scroll
						return d == verticalDragPosition;
					}
				);
			}

			function removeMousewheel()
			{
				container.unbind('mousewheel.jsp');
			}

			function nil()
			{
				return false;
			}

			// Public API
			$.extend(
				jsp,
				{
					reinitialise: function(settings)
					{
						// TODO: In this case, any settings set originally should override any defaults...
						// Need to make sure that this is happening...
						initialise(settings);
					}
				}
			);
		}

		// Pluginifying code...

		settings = $.extend({}, $.fn.jScrollPane.defaults, settings);

		var ret;
		this.each(
			function()
			{
				var elem = $(this), jspApi = elem.data('jsp');
				if (jspApi) {
					jspApi.reinitialise(settings);
				} else {
					jspApi = new JScrollPane(elem, settings);
					elem.data('jsp', jspApi);
				}
				ret = ret ? ret.add(elem) : elem;
			}
		)
		return ret;
	};

	$.fn.jScrollPane.defaults = {
		'showArrows'		: false,
		'verticalGutter'	: 4,
		'horizontalGutter'	: 4,
		'mouseWheelSpeed'	: 10,
		'arrowButtonSpeed'	: 10,
		'arrowRepeatFreq'	: 100
	};

})(jQuery,this);
