if(!window.jQuery){throw("jQuery must be referenced before using the 'onImagesLoad' plugin.");}
/* 
* jQuery 'onImagesLoaded' plugin 1.0.5
* Fires a callback function when all images have loaded within a particular selector.
*
* Copyright (c) Cirkuit Networks, Inc. (http://www.cirkuit.net), 2008.
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* For documentation and usage, visit "http://includes.cirkuit.net/js/jquery/plugins/onImagesLoad/1.0/documentation/"
*/
(function($){
  $.fn.onImagesLoad = function(options){
    var opts = $.extend({}, $.fn.onImagesLoad.defaults, options);

    return this.each(function(){
      var container = this;
      var $imgs = $('img', container);
      if($imgs.length === 0 && opts.callbackIfNoImagesExist && opts.callback){
        opts.callback(container); //call callback immediately if no images were in selection
      }
      var loadedImages = [];
      $imgs.each(function(i, val){
        $(this).bind('load', function(){
          if(jQuery.inArray(i, loadedImages) == -1){ //don't double count images
            loadedImages.push(i); //keep a record of images we've seen
            if(loadedImages.length == $imgs.length){
              if(opts.callback){ opts.callback(container); }
            }
          }
        }).each(function(){
          if(this.complete || this.complete===undefined){ this.src = this.src; } //needed for potential cached images
        });
      });
    });
  };
  
  $.fn.onImagesLoad.defaults = {
    callback: null, //the function you want called when all images within $(yourSelector) have loaded
    callbackIfNoImagesExist: true //if no images exist within $(yourSelector), should the callback be called?
  };
  
})(jQuery);