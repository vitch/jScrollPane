/*!
 * jScrollPane - v2.0.0beta1 - 2010-08-06
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */

// Script: jScrollPane - cross browser customisable scrollbars
//
// *Version: 2.0.0beta1, Last updated: 2010-08-06*
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
// All examples and demos are available through the jScrollPane example site at:
// http://jscrollpane.kelvinluck.com/
//
// About: Support and Testing
//
// This plugin is tested on the browsers below and has been found to work reliably on them. If you run
// into a problem on one of the supported browsers then please visit the support section on the jScrollPane
// website (http://jscrollpane.kelvinluck.com/) for more information on getting support. You are also
// welcome to fork the project on GitHub if you can contribute a fix for a given issue. 
//
// jQuery Versions - 1.4.2
// Browsers Tested - Firefox 3.6.8, Safari 5, Opera 10.6, Chrome 5.0, IE 7, 8
//
// About: Release History
//
// 2.0.0beta1 - (2010-08-06) Rewrite to follow modern best practices and enable horizontal scrolling
// 1.x - (2006-12-31 - 2010-07-31) Initial version, hosted at googlecode, deprecated

(function($,window,undefined){

	$.fn.jScrollPane = function(settings)
	{
		// JScrollPane "class" - public methods are available through $('selector').data('jsp')
		function JScrollPane(elem, s)
		{

			var settings, jsp = this, pane, savedSettings, paneWidth, paneHeight, container, contentWidth, contentHeight,
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

			initialise(s);

			function initialise(s)
			{

				var clonedElem, tempWrapper, firstChild, lastChild;

				settings = s;

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

					// Move any margins from the first and last children up to the container so they can still
					// collapse with neighbouring elements as they would before jScrollPane 
					firstChild = elem.find(':first-child');
					lastChild = elem.find(':last-child');
					container.css(
						{
							'margin-top': firstChild.css('margin-top'),
							'margin-bottom': lastChild.css('margin-bottom')
						}
					);
					firstChild.css('margin-top', 0);
					lastChild.css('margin-bottom', 0);
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
					removeFocusHandler();
					unhijackInternalLinks();
				} else {
					elem.addClass('jspScrollable');

					initialiseVerticalScroll();
					initialiseHorizontalScroll();
					resizeScrollbars();
					initFocusHandler();
					observeHash();
					if (settings.hijackInternalLinks) {
						hijackInternalLinks();
					}
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
					var horizontalTrackHeight = horizontalTrack.outerHeight(),
						verticalTrackWidth = verticalTrack.outerWidth();
					verticalTrackHeight -= horizontalTrackHeight;
					$(horizontalBar).find('>.jspCap:visible,>.jspArrow').each(
						function()
						{
							horizontalTrackWidth += $(this).outerWidth();
						}
					);
					horizontalTrackWidth -= verticalTrackWidth;
					paneHeight -= verticalTrackWidth;
					paneWidth -= horizontalTrackHeight;
					horizontalTrack.parent().append(
						$('<div class="jspCorner" />').css('width', horizontalTrackHeight + 'px')
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
					if (horizontalDragWidth > settings.horizontalDragMaxWidth) {
						horizontalDragWidth = settings.horizontalDragMaxWidth;
					} else if (horizontalDragWidth < settings.horizontalDragMinWidth) {
						horizontalDragWidth = settings.horizontalDragMinWidth;
					}
					horizontalDrag.width(horizontalDragWidth + 'px');
					dragMaxX = horizontalTrackWidth - horizontalDragWidth;
				}
				if (isScrollableV) {
					verticalDragHeight = 1 / percentInViewV * verticalTrackHeight;
					if (verticalDragHeight > settings.verticalDragMaxHeight) {
						verticalDragHeight = settings.verticalDragMaxHeight;
					} else if (verticalDragHeight < settings.verticalDragMinHeight) {
						verticalDragHeight = settings.verticalDragMinHeight;
					}
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
			}

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
			}

			function cancelDrag()
			{
				$('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');
			}

			function positionDragY(destY)
			{
				if (!isScrollableV) {
					return;
				}
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
			}

			function positionDragX(destX)
			{
				if (!isScrollableH) {
					return;
				}
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
			}

			function scrollToY(destY)
			{
				var percentScrolled = destY / (contentHeight - paneHeight);
				positionDragY(percentScrolled * dragMaxY);
			}

			function scrollToX(destX)
			{
				var percentScrolled = destX / (contentWidth - paneWidth);
				positionDragX(percentScrolled * dragMaxX);
			}

			function scrollToElement(ele, stickToTop)
			{
				var e, eleHeight, eleTop = 0, viewportTop, maxVisibleEleTop, destY;

				// Legal hash values aren't necessarily legal jQuery selectors so we need to catch any
				// errors from the lookup...
				try {
					e = $(ele);
				} catch (err) {
					return;
				}
				eleHeight = e.outerHeight();

				container.scrollTop(0);
				
				// loop through parents adding the offset top of any elements that are relatively positioned between
				// the focused element and the jspPane so we can get the true distance from the top
				// of the focused element to the top of the scrollpane...
				while (!e.is('.jspPane')) {
					eleTop += e.position().top;
					e = e.offsetParent();
					if (/^body|html$/i.test(e[0].nodeName)) {
						// we ended up too high in the document structure. Quit!
						return;
					}
				}


				viewportTop = -pane.position().top;
				maxVisibleEleTop = viewportTop + paneHeight;
				if (eleTop < viewportTop || stickToTop) { // element is above viewport
					destY = eleTop - settings.verticalGutter;
				} else if (eleTop + eleHeight > maxVisibleEleTop) { // element is below viewport
					destY = eleTop - paneHeight + eleHeight + settings.verticalGutter;
				}
				if (destY) {
					scrollToY(destY);
				}
				// TODO: Implement automatic horizontal scrolling?
			}

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

			function initFocusHandler()
			{
				elem.find(':input,a').bind(
					'focus.jsp',
					function()
					{
						scrollToElement(this, false);
					}
				);
			}

			function removeFocusHandler()
			{

				elem.find(':input,a').unbind('focus.jsp')
			}

			function observeHash()
			{
				if (location.hash && location.hash.length > 1) {
					var e, retryInt;
					try {
						e = $(location.hash);
					} catch (err) {
						return;
					}

					if (e.length && elem.find(e)) {
						// nasty workaround but it appears to take a little while before the hash has done its thing
						// to the rendered page so we just wait until the container's scrollTop has been messed up.
						if (container.scrollTop() == 0) {
							retryInt = setInterval(
								function()
								{
									if (container.scrollTop() > 0) {
										scrollToElement(location.hash, true);
										$(document).scrollTop(container.position().top);
										clearInterval(retryInt);
									}
								},
								50
							)
						} else {
							scrollToElement(location.hash, true);
							$(document).scrollTop(container.position().top);
						}
					}
				}
			}

			function unhijackInternalLinks()
			{
				$('a[href^=#]').unbind('click.jsp-hijack');
			}

			function hijackInternalLinks()
			{
				$('a[href^=#]').unbind('click.jsp-hijack').bind(
					'click.jsp-hijack',
					function()
					{
						var uriParts = this.href.split('#'), hash;
						if (uriParts.length > 1) {
							hash = uriParts[1];
							if (hash.length > 0 && elem.find('#' + hash).length > 0) {
								scrollToElement('#' + hash, true);
								// Need to return false otherwise things mess up... Would be nice to maybe also scroll
								// the window to the top of the scrollpane?
								return false;
							}
						}
					}
				)
			}

			// Public API
			$.extend(
				jsp,
				{
					reinitialise: function(s)
					{
						s = $.extend({}, s, settings);
						initialise(s);
					},
					scrollToElement: function(ele, stickToTop)
					{
						scrollToElement(ele, stickToTop);
					},
					scrollTo: function(destX, destY)
					{
						scrollToX(destX);
						scrollToY(destY);
					},
					scrollToX: function(destX)
					{
						scrollToX(destX);
					},
					scrollToY: function(destY)
					{
						scrollToY(destY);
					},
					scrollBy: function(deltaX, deltaY)
					{
						jsp.scrollByX(deltaX);
						jsp.scrollByY(deltaY);
					},
					scrollByX: function(deltaX)
					{
						var destX = -pane.position().left + deltaX,
							percentScrolled = destX / (contentWidth - paneWidth);
						positionDragX(percentScrolled * dragMaxX);
					},
					scrollByY: function(deltaY)
					{
						var destY = -pane.position().top + deltaY,
							percentScrolled = destY / (contentHeight - paneHeight);
						positionDragY(percentScrolled * dragMaxY);
					},
					scrollToBottom: function()
					{
						positionDragY(dragMaxY);
					},
					hijackInternalLinks: function()
					{
						hijackInternalLinks();
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
		'showArrows'				: false,
		'verticalDragMinHeight'		: 0,
		'verticalDragMaxHeight'		: 99999,
		'horizontalDragMinWidth'	: 0,
		'horizontalDragMaxWidth'	: 99999,
		'hijackInternalLinks'		: false,
		'verticalGutter'			: 4,
		'horizontalGutter'			: 4,
		'mouseWheelSpeed'			: 10,
		'arrowButtonSpeed'			: 10,
		'arrowRepeatFreq'			: 100
	};

})(jQuery,this);
