/**
 * @projectDescription Monitor Font Size Changes with jQuery
 *
 * @version 1.0
 * @author Dave Cardwell
 *
 * jQuery-Em - $Revision: 24 $ ($Date: 2007-08-19 11:24:56 +0100 (Sun, 19 Aug 2007) $)
 * http://davecardwell.co.uk/javascript/jquery/plugins/jquery-em/
 *
 * Copyright ©2007 Dave Cardwell <http://davecardwell.co.uk/>
 *
 * Released under the MIT licence:
 * http://www.opensource.org/licenses/mit-license.php
 */

// Upon $(document).ready()…
jQuery(function($) {
    // Configuration…
    var eventName = 'emchange';
    
    
    // Set up default options.
    $.em = $.extend({
        /**
         * The jQuery-Em version string.
         *
         * @example $.em.version;
         * @desc '1.0a'
         *
         * @property
         * @name version
         * @type String
         * @cat Plugins/Em
         */
        version: '1.0',
        
        /**
         * The number of milliseconds to wait when polling for changes to the
         * font size.
         *
         * @example $.em.delay = 400;
         * @desc Defaults to 200.
         *
         * @property
         * @name delay
         * @type Number
         * @cat Plugins/Em
         */
        delay: 200,
        
        /**
         * The element used to detect changes to the font size.
         *
         * @example $.em.element = $('<div />')[0];
         * @desc Default is an empty, absolutely positioned, 100em-wide <div>.
         *
         * @private
         * @property
         * @name element
         * @type Element
         * @cat Plugins/Em
         */
        element: $('<div />').css({ left:     '-100em',
                                    position: 'absolute',
                                    width:    '100em' })
                             .prependTo('body')[0],
        
        /**
         * The action to perform when a change in the font size is detected.
         *
         * @example $.em.action = function() { ... }
         * @desc The default action is to trigger a global “emchange” event.
         * You probably shouldn’t change this behaviour as other plugins may
         * rely on it, but the option is here for completion.
         *
         * @example $(document).bind('emchange', function(e, cur, prev) {...})
         * @desc Any functions triggered on this event are passed the current
         * font size, and last known font size as additional parameters.
         *
         * @private
         * @property
         * @name action
         * @type Function
         * @cat Plugins/Em
         * @see current
         * @see previous
         */
        action: function() {
            var currentWidth = $.em.element.offsetWidth / 100;
            
            // If the font size has changed since we last checked…
            if ( currentWidth != $.em.current ) {
                /**
                 * The previous pixel value of the user agent’s font size. See
                 * $.em.current for caveats. Will initially be undefined until
                 * the “emchange” event is triggered.
                 *
                 * @example $.em.previous;
                 * @result 16
                 *
                 * @property
                 * @name previous
                 * @type Number
                 * @cat Plugins/Em
                 * @see current
                 */
                $.em.previous = $.em.current;
                
                /**
                 * The current pixel value of the user agent’s font size. As
                 * with $.em.previous, this value *may* be subject to minor
                 * browser rounding errors that mean you might not want to
                 * rely upon it as an absolute value.
                 *
                 * @example $.em.current;
                 * @result 14
                 *
                 * @property
                 * @name current
                 * @type Number
                 * @cat Plugins/Em
                 * @see previous
                 */
                $.em.current = currentWidth;
                
                $.event.trigger(eventName, [$.em.current, $.em.previous]);
            }
        }
    }, $.em );
    
    
    /**
     * Bind a function to the emchange event of each matched element.
     *
     * @example $("p").emchange( function() { alert("Hello"); } );
     *
     * @name emchange
     * @type jQuery
     * @param Function fn A function to bind to the emchange event.
     * @cat Plugins/Em
     */

    /**
     * Trigger the emchange event of each matched element.
     *
     * @example $("p").emchange()
     *
     * @name emchange
     * @type jQuery
     * @cat Plugins/Em
     */
    $.fn[eventName] = function(fn) { return fn ? this.bind(eventName, fn)
                                               : this.trigger(eventName); };
    
    
    // Store the initial pixel value of the user agent’s font size.
    $.em.current = $.em.element.offsetWidth / 100;
    
    /**
     * While polling for font-size changes, $.em.iid stores the intervalID in
     * case you should want to cancel with clearInterval().
     *
     * @example window.clearInterval( $.em.iid );
     * 
     * @property
     * @name iid
     * @type Number
     * @cat Plugins/Em
     */
    $.em.iid = setInterval( $.em.action, $.em.delay );
});
