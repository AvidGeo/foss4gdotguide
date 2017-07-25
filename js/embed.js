if (typeof AttendifyWebsitesWidget === 'undefined' ){
/**
* Embed single/multiple widgets to page.
*
* Features: create container, create single or multiple widgets,
* resize each widget, set feature details,
* set feature loader, return scroll position
*
* @class
* @param {string} appkey
* @param {string} featureType
* @returns {object} interface
*/
var AttendifyWebsitesWidget = function () {

  /**
    * global variable - config:
    * args - arguments from older widget version - feature, appkey
    * iframeContainerId, iframeContainerClass - selectors for widget container
    * iframeAttributes - attributes to apply directly to widget
    */
  var g = {

    /**
      * Arguments from class initialization function. Empty or appkey/featureType (older)
      *
      */
    args: arguments[0],

    /**
      * Iframe container ID (older). Only one element on page.
      *
      */
    iframeContainerId: '#attendify-pages-widget',

    /**
      * Iframe container class (newer). Multiple elements on page.
      *
      */
    iframeContainerClass: '.attendify-pages-widget',

    /**
      * Attributes to append to iframe
      *
      */
    iframeAttributes: {
      width: '100%',
      scrolling: 'no'
    },

    /**
      * URL parts. Setup url to pass to iframe
      *
      */
    urlConf: {
      base: '.attendify.io/',
      ext: '.html'
    },

    /**
      * ping. just ping
      *
      * @returns {function}
      */
    p: function (input) {
      return console.log(input === undefined ? 'ping' : input);
    }

  };

  //URL_SWITCHER
  g.urlConf.LOCAL_ENV = false;
  //END_URL_SWITCHER

  /**
    * set of reusable functions
    */
  var helpers = {

    /**
      * merge objects
      *
      * @param {object} targetObject
      * @param {object} sourceObject
      * @returns {object} resultingObject
      */
    mergeObjects: function (obj, src) {
      var keys = Object.keys(src);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (src.hasOwnProperty(key)) {
          obj[key] = src[key];
        }
      };
      return obj;
    },


    /**
      * retrieve top position of element
      *
      * @param {object} element
      * @returns {integer} position
      */
    positionOf: function (element) {
      return element.getBoundingClientRect().top;
    },

    /**
      * parse numeric part of id
      *
      * @param {string} id
      * @returns {integer} id
      */
    getId: function (id) {
      return parseInt(/\d+/g.exec(id));
    },

    makeArray: function(obj) {
      return Object.keys(obj).map(function (key) {return obj[key]});
    }

  };

  /**
    * set top position of element
    *
    * @returns {boolean} nothing
    */
  helpers.scrollTo = function() {
    var pos = 0;
    var args = helpers.makeArray(arguments);
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      pos = pos + arg;
    }
    window.scrollTo(0, pos);
    return false;
  };

  /**
    * Build url for local/global usage
    *
    * @param {string} appkey
    * @param {string} featureType
    * @returns {string} url
    */
  var buildURL = function (appkey, featureType) {
    var ftr = featureType === undefined ? 'index' : featureType;
    return '//' + appkey + g.urlConf.base + ftr + g.urlConf.ext;
  };

  /**
    * Create iFrame and set attributes for it
    *
    * @param {string} appkey
    * @param {string} featureType
    * @returns {object} iframe
    */
  var createIframe = function () {
    var iframe = document.createElement('iframe');
    g.iframeAttributes.src = buildURL(arguments[0], arguments[1]);
    helpers.mergeObjects(iframe, g.iframeAttributes);
    // inject specially for safari!
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('style', 'border:none');
    //
    return iframe;
  };

  /**
    * Get values from data attributes of parent element of iframe
    *
    * @param {object} element
    * @returns {object} data appkey and featureType
    */
  var retrieveDataAttributes = function (element) {
    var dset = element.dataset;
    return [dset.appkey, dset.feature];
  };

  /**
    * Set main attributes (id, height) by message from each widget
    *
    * @param {object} iframe
    * @param {integer} id
    * @param {integer} height
    * @returns {boolean} nothing
    */
  var applyPrimarySettings = function (iframe, id, height) {
    iframe.id = id;
    iframe.setAttribute('height', height);
    return false;
  };

  /**
  * Core. Append iframe, initialize, set message channel.
  *
  * @param {string} iframeContainerSel
  * @param {array} dataInput
  * @returns {boolean} nothing
  */
  var appendIframe = function (iframeContainerSel, dataInput) {
    var singleIframe;
    var iframeContainer = document.querySelectorAll(iframeContainerSel); // find all containers with iframes
    iframeContainer = helpers.makeArray(iframeContainer);
    for (var i = 0; i < iframeContainer.length; i++) {
      var container = iframeContainer[i];
      var data = dataInput === undefined ? retrieveDataAttributes(container) : dataInput; // set data - from attribute or from parameter
      singleIframe = createIframe(data[0], data[1]); // init single iframe element

      container.appendChild(singleIframe); // append iframe to container
      /**
        * Set iframe parameters of iframe when its fully loaded. Set message channel
        */
      singleIframe.addEventListener('load', function () {
        var channel = new MessageChannel();
        var that = this;
        this.contentWindow.postMessage([''], '*', [channel.port2]); // send message to iframe
        /**
          function on message received
          */
        channel.port1.onmessage = function (event) {
          applyPrimarySettings(that, event.data[0], event.data[1]);
          setMessageListener(that);
          return false;
        };
      });
    };
    return false;
  };

  /**
    * Resize document on message from iframe.
    *
    * @param {object} iframe
    * @param {function} callabck function to execute asynchronously with current
    * @returns {boolean} nothing
    */
  var setMessageListener = function (iframe) {
    window.addEventListener('message', function (event) {
      var height;
      if (parseInt(event.data[2]) === helpers.getId(iframe.id)) {
        switch (event.data[0]) {
          case 'scroll-to-initial':
            helpers.scrollTo(retrievePosition(iframe));
            break;
          case 'scroll-to-link':
            helpers.scrollTo(retrievePosition(iframe), event.data[1], -100);
            break;
          case 'scroll-to-defined':
            helpers.scrollTo(retrievePosition(iframe), event.data[1]);
            break;
          case 'setFrameHeight':
            height = event.data[1];
            iframe.setAttribute('height', height);
            break;
        }
      }
      return false;
    });
    return false;
  };

  /**
    * Get correct position by comparing scrollTop position of body and target element
    *
    * @param {object} iframeContainer
    * @returns {integer} position
    */
  var retrievePosition = function (iframeContainer) {
    return helpers.positionOf(iframeContainer) - helpers.positionOf(document.body);
  };

  /**
    * Append iframe, initialize
    *
    * @param {array} data appkey and featureType
    * @returns {function} appendIframe
    */
  var setWidgets = function () {
    var isOlderVersion = arguments[0] !== undefined && arguments.length >= 1;
    var args = !isOlderVersion ? [g.iframeContainerClass] : [g.iframeContainerId, arguments[0]];
    return appendIframe.apply(this, args);
  };

  return {
    /**
      * Initialization function
      *
      * @returns {boolean} nothing
      */
    init: function () {
      setWidgets(g.args);
      return false;
    },
    /**
      * Widget version indicator
      *
      */
    useUpdated: true
  };

};

/**
  * Initialize widget with arguments as a parameters (older)
  *
  * @param {array} arguments appkey and featureType
  * @returns {object} AttendifyWebsitesWidget main instance of widget
  */
var AttendifyPagesWidget = function () {
  AttendifyWebsitesWidget.useUpdated = false;
  return new AttendifyWebsitesWidget(arguments).init();
};

/**
  * Initialize widget with parameters taken from data attributes (newer)
  *
  * @returns {boolean} nothing
  */
function AttendifyWidgetRunner() {
  var state = AttendifyWebsitesWidget.useUpdated;
  if (state || state === undefined) {
    new AttendifyWebsitesWidget().init();
  }
  return false;
};

var _readyState = (document.readyState || 'not supported');
if (_readyState === 'interactive' || _readyState === 'complete') {
  AttendifyWidgetRunner();
} else {
  window.addEventListener('load', AttendifyWidgetRunner);
}

}
