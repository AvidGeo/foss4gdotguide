(function() {
  var AVAILABLE_ICONS, AttendifyCardDetails, AttendifySchedule, AttendifySessionsTruncater, CollapsingSchedule, FeatureGMap, ItemsTruncater, MediaQuery, TargetBlankSetter, Utils, media, utils;

  Utils = (function() {
    function Utils() {
      if (window.self !== window.top) {
        this.globID = this.generateID(16);
        this.sendIncomeMessageListener(this.globID);
      }
    }

    Utils.prototype.generateID = function(len) {
      var arr, i;
      arr = [];
      i = 0;
      while (i < len) {
        arr.push(Math.floor(Math.random() * 10));
        i++;
      }
      return arr.join('');
    };

    Utils.prototype.sendIncomeMessageListener = function(id) {
      return window.addEventListener('message', (function(_this) {
        return function(e) {
          return e.ports[0].postMessage([id, $('body').height()]);
        };
      })(this));
    };

    Utils.prototype.setPostMsg = function() {
      var arr;
      arr = jQuery.makeArray(arguments);
      return window.parent.postMessage(arr, '*');
    };

    Utils.prototype.setFrameHeight = function(src) {
      if (src === void 0) {
        src = $('body');
      }
      return this.setPostMsg('setFrameHeight', src.height(), this.globID);
    };

    Utils.prototype.setScrollMsg = function(msg, posY) {
      if (posY === void 0) {
        posY = false;
      }
      return this.setPostMsg(msg, posY, this.globID);
    };

    return Utils;

  })();

  utils = new Utils;

  MediaQuery = (function() {
    function MediaQuery() {
      var bp, pattern;
      this.bp = {};
      bp = {
        xs: [0, 480],
        sm: [481, 768],
        md: [769, 960],
        lg: [961, 1200]
      };
      this.bp = $.extend(this.bp, bp);
      pattern = function(state, val) {
        return 'and (' + state + '-width: ' + val + 'px) ';
      };
      this.query = {
        xs: 'screen ' + pattern('max', bp.xs[1]),
        sm: 'screen ' + pattern('min', bp.sm[0]) + pattern('max', bp.sm[1]),
        md: 'screen ' + pattern('min', bp.md[0]) + pattern('max', bp.md[1]),
        lg: 'screen ' + pattern('min', bp.lg[0]),
        fromSm: 'screen ' + pattern('min', bp.xs[1]),
        fromMd: 'screen ' + pattern('min', bp.sm[1]),
        toLg: 'screen ' + pattern('max', bp.lg[0]),
        toMd: 'screen ' + pattern('max', bp.md[0])
      };
    }

    MediaQuery.prototype.test = function() {
      return console.log('test');
    };

    MediaQuery.prototype.matchRange = function(fn) {
      enquire.register(this.query['xs'], {
        match: function() {
          return fn('xs');
        }
      });
      enquire.register(this.query['sm'], {
        match: function() {
          return fn('sm');
        }
      });
      enquire.register(this.query['md'], {
        match: function() {
          return fn('md');
        }
      });
      return enquire.register(this.query['lg'], {
        match: function() {
          return fn('lg');
        }
      });
    };

    return MediaQuery;

  })();

  media = new MediaQuery;

  $(document).ready(function() {
    var setBrowserClassname;
    return (setBrowserClassname = function() {
      var classname;
      classname = jQBrowser.uaMatch().name;
      return $('html').addClass(classname);
    })();
  });

  AttendifyCardDetails = (function() {
    function AttendifyCardDetails(config) {
      var id, j, len1, link, ref;
      this.link = $('.details_link');
      this.closeIconClassname = '.uv-card__close-icon';
      this.detailsClassname = '.details';
      this.details = $(this.detailsClassname);
      this.content = $('.content');
      this.backButtonClassname = '.back_button';
      this.idsArray = [];
      this.idsComparisonList = [];
      ref = this.link;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        link = ref[j];
        id = $(link).data('link');
        this.idsComparisonList.push(id);
      }
    }

    AttendifyCardDetails.prototype.idExists = function(currentid) {
      var j, len1, oneFromList, ref;
      if (currentid[0] === '#') {
        currentid = currentid.slice(1, currentid.length);
      }
      ref = this.idsComparisonList;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        oneFromList = ref[j];
        if (currentid === oneFromList) {
          return true;
        }
      }
      return false;
    };

    AttendifyCardDetails.prototype.addCloseListener = function(details, posy) {
      return details.click((function(_this) {
        return function(event) {
          var closeIcon, isCloseIcon, isMaskBody;
          closeIcon = details.find(_this.closeIconClassname);
          isCloseIcon = $(event.target)[0] === closeIcon[0];
          isMaskBody = $(event.target)[0] === details[0];
          if (isCloseIcon || isMaskBody) {
            details.removeClass('is-active');
            $('body').removeClass('no-overflow');
            location.hash = '';
            return $(window).scrollTop(posy);
          }
        };
      })(this));
    };

    AttendifyCardDetails.prototype.closePreviousDetails = function() {
      var details;
      details = $(this.detailsClassname + '.is-active');
      if (details.length > 0) {
        return details.removeClass('is-active');
      }
    };

    AttendifyCardDetails.prototype.setLocationHash = function(anchor) {
      return location.hash = anchor;
    };

    AttendifyCardDetails.prototype.getScrollPos = function() {
      var posY;
      return posY = $(window).scrollTop();
    };

    AttendifyCardDetails.prototype.setHashChange = function(link) {
      return link.each((function(_this) {
        return function(index, item) {
          var currentLink, detailsOpener, hasChildren, isSession;
          currentLink = $(item);
          isSession = currentLink.hasClass('session');
          hasChildren = currentLink.children().length > 0;
          detailsOpener = isSession || !hasChildren ? currentLink : currentLink.children();
          return detailsOpener.click(function(event) {
            var anchor, data, linkParent, linkToDetails;
            event.stopPropagation();
            linkToDetails = $(event.currentTarget);
            linkParent = linkToDetails.parent();
            data = linkToDetails.data('link');
            anchor = data !== void 0 ? data : linkParent.data('link');
            return _this.setLocationHash(anchor);
          });
        };
      })(this));
    };

    AttendifyCardDetails.prototype.showDetailsOnload = function() {
      var id;
      id = location.hash;
      if (id.length > 1 && this.idExists(id)) {
        return this.showDetails(id);
      }
    };

    AttendifyCardDetails.prototype.watchHashChange = function() {
      return window.onhashchange = (function(_this) {
        return function() {
          var id;
          id = location.hash;
          if (id.length > 1 && _this.idExists(id)) {
            return _this.showDetails(id);
          } else {
            _this.closePreviousDetails();
            return $('body').removeClass('no-overflow');
          }
        };
      })(this);
    };

    AttendifyCardDetails.prototype.showDetails = function(id) {
      var currentDetails, posy;
      posy = this.getScrollPos();
      this.closePreviousDetails();
      currentDetails = $(id);
      currentDetails.addClass('is-active');
      $('body').addClass('no-overflow');
      utils.setFrameHeight();
      this.addCloseListener(currentDetails, posy);
      return $(id).scrollTop(0);
    };

    AttendifyCardDetails.prototype.setBackButton = function(ids) {
      var button, currentDetails, entryLink, entryLinkOffset, idn;
      idn = ids[ids.length - 1];
      currentDetails = $(idn + '.is-active');
      entryLink = this.content.find('[data-link="' + ids[0].substr(1, ids[0].length) + '"]');
      entryLinkOffset = entryLink.offset().top;
      button = currentDetails.find(this.backButtonClassname);
      button.off('click');
      return button.on('click', (function(_this) {
        return function(event) {
          var previousDetails, previousId;
          event.stopPropagation();
          ids.pop();
          currentDetails.removeClass('is-active');
          if (ids.length > 0) {
            previousId = ids[ids.length - 1];
            previousDetails = $(previousId);
            previousDetails.addClass('is-active');
            utils.setFrameHeight(previousDetails);
            return utils.setScrollMsg('scroll-to-initial');
          } else {
            _this.content.css({
              'position': 'static',
              'visibility': 'visible',
              'opacity': 1
            });
            utils.setFrameHeight(_this.content);
            return utils.setScrollMsg('scroll-to-link', entryLinkOffset);
          }
        };
      })(this));
    };

    AttendifyCardDetails.prototype.showDetailsFrame = function(link) {
      return link.each((function(_this) {
        return function(index, item) {
          var currentLink, detailsLink;
          currentLink = $(item);
          detailsLink = currentLink.children();
          return detailsLink.click(function(event) {
            var details, id;
            utils.setScrollMsg('scroll-to-initial');
            event.stopPropagation();
            _this.closePreviousDetails();
            id = '#' + currentLink.data('link');
            _this.idsArray.push(id);
            details = $(id);
            details.addClass('is-active');
            _this.content.css({
              'position': 'absolute',
              'z-index': -1,
              'visibility': 'hidden',
              'opacity': 0
            });
            utils.setFrameHeight(details);
            return _this.setBackButton(_this.idsArray);
          });
        };
      })(this));
    };

    AttendifyCardDetails.prototype.init = function() {
      if (self === top) {
        this.showDetailsOnload();
        this.setHashChange(this.link);
        return this.watchHashChange();
      } else {
        return this.showDetailsFrame(this.link);
      }
    };

    return AttendifyCardDetails;

  })();

  window.attendifyCardDetails = new AttendifyCardDetails();

  $(window).load(function() {
    return attendifyCardDetails.init();
  });

  AVAILABLE_ICONS = {
    __default__: 'venue.svg',
    venue: 'venue.svg',
    restaurant: 'restaurant.svg',
    lodging: 'lodging.svg',
    hotel: 'hotel.svg',
    poi: 'place-of-interest.svg',
    attraction: 'local-attraction.svg',
    'Arts': 'arts.svg',
    'Bar': 'bar.svg',
    'Coffee': 'coffee.svg',
    'Fast Food': 'fast_food.svg',
    'Hotel': 'hotel.svg',
    'Local Attraction': 'local_attraction.svg',
    'Nightlife': 'night_life.svg',
    'Health and Wellness': 'medicine.svg',
    'Restaurant': 'restaurant.svg',
    'Sights': 'sights.svg',
    'Transport': 'transport.svg',
    'Venue': 'venue.svg'
  };

  FeatureGMap = (function() {
    function FeatureGMap(maps, places) {
      var center, lats, lngs, map, ref;
      places = places.filter(function(p) {
        return !!p.id;
      });
      center = places.length === 1 ? places[0] : {
        lat: 0,
        lng: 0
      };
      map = $(maps);
      if (map.length) {
        this.map = new google.maps.Map(map.get(0), {
          center: new google.maps.LatLng(center.lat, center.lng),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            style: google.maps.ZoomControlStyle.LARGE
          },
          scrollwheel: false,
          styles: [
            {
              featureType: 'all',
              stylers: [
                {
                  saturation: -100
                }
              ]
            }
          ]
        });
        if (places.length) {
          this.places = places.map((function(_this) {
            return function(p) {
              return _this.addPlace(p);
            };
          })(this));
          if (places.length > 1) {
            ref = places.reduce(function(acc, p, i, col) {
              if (p.id) {
                acc.lats.push(p.lat);
                acc.lngs.push(p.lng);
              }
              return acc;
            }, {
              lats: [],
              lngs: []
            }), lats = ref.lats, lngs = ref.lngs;
            this.map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(Math.min.apply(Math, lats), Math.min.apply(Math, lngs)), new google.maps.LatLng(Math.max.apply(Math, lats), Math.max.apply(Math, lngs))));
          }
        }
      }
    }

    FeatureGMap.prototype.addPlace = function(p) {
      var addr, content, img, info, marker;
      addr = [p.address, p.city, p.state, p.zip].filter(function(s) {
        return s !== "";
      }).join(", ");
      content = '<div class="uv-map__popup"> <h5 class="uv-map__title">' + p.name + '</h5> <p>' + addr + '</p> </div>';
      info = new google.maps.InfoWindow({
        content: content
      });
      img = AVAILABLE_ICONS[p.group] || AVAILABLE_ICONS['__default__'];
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(p.lat, p.lng),
        map: this.map,
        title: p.name,
        icon: 'gmap/' + img
      });
      info.addListener('closeclick', (function(_this) {
        return function() {
          if ((_this.openInfo != null) && _this.openInfo === info) {
            return _this.openInfo = null;
          }
        };
      })(this));
      return marker.addListener('click', (function(_this) {
        return function() {
          if (_this.openInfo != null) {
            _this.openInfo.close();
            _this.openInfo = null;
          }
          info.open(_this.map, marker);
          return _this.openInfo = info;
        };
      })(this));
    };

    return FeatureGMap;

  })();

  window.FeatureGMap = FeatureGMap;

  CollapsingSchedule = (function() {
    function CollapsingSchedule(schedule) {
      this.dateClassname = '.iframe_schedule_item';
      this.dayClassname = '.iframe_schedule_day';
      this.schedule = schedule;
      this.dates = this.schedule.find(this.dateClassname);
      this.days = this.schedule.find(this.dayClassname);
      this.dateWidth = 0;
      this.maxWidth = 960;
    }

    CollapsingSchedule.prototype.setDatesSwitching = function() {
      $(this.dates[0]).addClass('is-active');
      $(this.days[0]).addClass('is-active');
      return this.dates.click((function(_this) {
        return function(event) {
          var date, dateId;
          date = $(event.target);
          if (!date.hasClass('is-active')) {
            _this.dates.each(function(index) {
              var current, previousDateId;
              current = $(this);
              if (current.hasClass('is-active')) {
                current.removeClass('is-active');
                previousDateId = '#' + current.data('date');
                return $(previousDateId).removeClass('is-active');
              }
            });
            dateId = '#' + date.data('date');
            date.addClass('is-active');
            $(dateId).addClass('is-active');
            return utils.setFrameHeight();
          }
        };
      })(this));
    };

    CollapsingSchedule.prototype.setHeaderAppearance = function() {
      var date, index, j, len1, ref;
      ref = this.dates;
      for (index = j = 0, len1 = ref.length; j < len1; index = ++j) {
        date = ref[index];
        this.dateWidth += $(date).outerWidth(true);
      }
      if (this.dateWidth >= this.maxWidth) {
        this.schedule.addClass('is-opened');
        return utils.setFrameHeight();
      } else {
        this.schedule.removeClass('is-opened');
        return utils.setFrameHeight();
      }
    };

    CollapsingSchedule.prototype.onWindowResize = function() {
      var bp;
      bp = "screen and (max-width: " + this.maxWidth + "px)";
      if (this.dateWidth < this.maxWidth) {
        return enquire.register(bp, {
          match: (function(_this) {
            return function() {
              _this.schedule.addClass('is-opened');
              return utils.setFrameHeight();
            };
          })(this),
          unmatch: (function(_this) {
            return function() {
              _this.schedule.removeClass('is-opened');
              return utils.setFrameHeight();
            };
          })(this)
        });
      }
    };

    CollapsingSchedule.prototype.init = function() {
      this.setHeaderAppearance();
      this.setDatesSwitching();
      return this.onWindowResize();
    };

    return CollapsingSchedule;

  })();

  $(document).ready(function() {
    $('.iframe_schedule').each(function() {
      return new CollapsingSchedule($(this)).init();
    });
    return utils.setFrameHeight();
  });


  /*
  Todo:
    make .reload() method
    reload on breakpoints: with various limits
    extract common functionality with TextTruncater (text-loader.coffee) to Truncater class
   */

  ItemsTruncater = (function() {
    var defaults;

    defaults = {
      textWhenTrunced: 'Show All',
      textWhenFull: 'Show Less',
      parent: '.uv-section',
      speed: 500,
      displayMode: 'flex',
      wrapperClass: 'trunc-wrapper'
    };

    function ItemsTruncater(elem) {
      this.elem = elem;
      $.extend(this, defaults);
      this.grid = this.setupResponsiveGrid();
      this.listeners = 0;
      this.items = this.elem.children();
      this.init();
      this.maketest();
    }

    ItemsTruncater.prototype.test = function(fn) {
      var args, err;
      args = Array.prototype.slice.call(arguments);
      args.shift();
      console.log('Returned for value is: ->');
      try {
        console.log(fn.apply(null, args));
      } catch (error) {
        err = error;
        console.log('Found error: ->');
        console.error(err);
      }
      return false;
    };

    ItemsTruncater.prototype.maketest = function() {
      return false;
    };


    /*
    RESPONSIVE GRID SETUP
     */

    ItemsTruncater.prototype.setDefaultGrid = function() {
      var defaultGrid;
      return defaultGrid = {
        xs: {
          rows: 6,
          columns: 1
        },
        sm: {
          rows: 3,
          columns: 3
        },
        md: {
          rows: 3,
          columns: 4
        },
        lg: {
          rows: 3,
          columns: 4
        }
      };
    };

    ItemsTruncater.prototype.setupResponsiveGrid = function() {
      var data, defaultGrid, dim, grid, j, len1, prop, ref, size;
      defaultGrid = this.setDefaultGrid();
      grid = {};
      for (size in media.bp) {
        grid[size] = {};
        ref = ['rows', 'columns'];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          dim = ref[j];
          data = this.elem.data(dim + '-' + size);
          prop = data === void 0 ? defaultGrid[size][dim] : data;
          grid[size][dim] = prop;
        }
      }
      return grid;
    };

    ItemsTruncater.prototype.getLimit = function(grid, size) {
      var dim, dims, i, j, len1, ref;
      dims = [];
      ref = ['rows', 'columns'];
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        dim = ref[i];
        dims[i] = grid[size][dim];
      }
      return dims[0] * dims[1];
    };

    ItemsTruncater.prototype.applyGrid = function(grid, size) {
      var cls;
      cls = 'cards-grid-' + grid[size]['columns'];
      this.checkClasses();
      return this.elem.addClass(cls);
    };

    ItemsTruncater.prototype.checkClasses = function() {
      var arr, classes, cls, j, len1, pattern, results;
      classes = this.elem.attr('class');
      arr = classes.split(' ');
      results = [];
      for (j = 0, len1 = arr.length; j < len1; j++) {
        cls = arr[j];
        pattern = /cards-grid-*/;
        if (pattern.test(cls)) {
          results.push(this.elem.removeClass(cls));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };


    /*
    CONTAINER/WRAPPER SETUP
     */

    ItemsTruncater.prototype.setupWrapper = function() {
      var wrp;
      wrp = $(document.createElement('div'));
      wrp.addClass(this.wrapperClass + ' uv-shortcard__truncater');
      return wrp;
    };

    ItemsTruncater.prototype.wrapHiddenItems = function(wrapper, limit) {
      var hiddenItems, i;
      i = limit;
      hiddenItems = [];
      while (i < this.items.length) {
        hiddenItems.push(this.items[i]);
        i++;
      }
      $(hiddenItems).wrapAll(wrapper);
      return false;
    };

    ItemsTruncater.prototype.setupContainer = function(wrapHidden, limit) {
      var wrapper;
      if (wrapHidden) {
        wrapper = this.setupWrapper();
        this.wrapHiddenItems(wrapper, limit);
      }
      this.elem.css('display', this.displayMode);
      return false;
    };


    /*
    TRIGGER SETUP
     */

    ItemsTruncater.prototype.createTrigger = function(txt) {
      this.trigger = $(document.createElement('a')).text(txt).insertAfter(this.elem);
      this.trigger.addClass('uv-button uv-button--card-control clr-bg clr-text clr-bc-inv-pseudo');
      return false;
    };

    ItemsTruncater.prototype.onTriggerClick = function() {
      if (this.listeners < 1) {
        this.trigger.off('click').on('click', (function(_this) {
          return function(e) {
            e.preventDefault();
            _this.listeners++;
            if (_this.isTruncated) {
              return _this.restore();
            } else {
              _this.truncate(_this.speed);
              return _this.revertScrollPos();
            }
          };
        })(this));
      }
      return false;
    };

    ItemsTruncater.prototype.shouldRemoveTrigger = function(trigger, isUnderLimit) {
      if (isUnderLimit && trigger !== void 0) {
        trigger.remove();
        return false;
      } else {

      }
    };

    ItemsTruncater.prototype.shouldCreateTrigger = function(trigger, txt) {
      if (trigger === void 0) {
        this.createTrigger(txt);
        return false;
      } else {

      }
    };

    ItemsTruncater.prototype.shouldResetTrigger = function(trigger, txt) {
      if (trigger !== void 0 && trigger.hasClass('is-active')) {
        return trigger.removeClass('is-active').text(txt);
      }
    };

    ItemsTruncater.prototype.setTriggerState = function(trigger, txt) {
      return trigger.text(txt).toggleClass('is-active');
    };


    /*
    describe
     */

    ItemsTruncater.prototype.revertScrollPos = function() {
      var oldScrollPos;
      oldScrollPos = this.elem.closest(this.parent).offset().top;
      $('body').animate({
        scrollTop: oldScrollPos
      }, this.speed, (function(_this) {
        return function() {
          return utils.setScrollMsg('scroll-to-defined', oldScrollPos);
        };
      })(this));
      return false;
    };


    /*
    SETUP DEFAULT TRUNCATION
     */

    ItemsTruncater.prototype.setupTruncation = function() {
      var height;
      height = this.elem.outerHeight(true);
      this.isTruncated = true;
      this.elem.css('height', 'auto');
      return height;
    };


    /*
    INIT TRUNCATE/RESTORE METHODS
     */

    ItemsTruncater.prototype.truncate = function(speed) {
      this.elem.animate({
        height: this.shortHeight
      }, speed, (function(_this) {
        return function() {
          utils.setFrameHeight();
          _this.wrapper.removeClass('trunc-wrapper-opened');
          _this.wrapper.addClass('trunc-wrapper-closed');
          return _this.elem.css('height', 'auto');
        };
      })(this));
      this.setTriggerState(this.trigger, this.textWhenTrunced);
      this.isTruncated = true;
      return false;
    };

    ItemsTruncater.prototype.restore = function() {
      var hgt, wrapper;
      wrapper = this.elem.find('.trunc-wrapper');
      this.wrapper.removeClass('trunc-wrapper-closed');
      this.wrapper.addClass('trunc-wrapper-opened');
      hgt = this.shortHeight + wrapper.outerHeight(true);
      this.elem.css('height', this.shortHeight).animate({
        height: hgt
      }, this.speed, (function(_this) {
        return function() {
          _this.elem.css('height', 'auto');
          return utils.setFrameHeight();
        };
      })(this));
      this.setTriggerState(this.trigger, this.textWhenFull);
      this.isTruncated = false;
      return false;
    };


    /*
    SET DESTROY/SETUP TRUNCATER METHODS
     */

    ItemsTruncater.prototype.destroyTruncater = function() {
      var wrapper;
      wrapper = this.elem.find('.' + this.wrapperClass);
      if (wrapper.length > 0) {
        wrapper.children().unwrap();
      }
      this.shouldResetTrigger(this.trigger, this.textWhenTrunced);
      return false;
    };

    ItemsTruncater.prototype.setupContainerOnly = function(screenSize) {
      var isUnderLimit, limit;
      limit = this.getLimit(this.grid, screenSize);
      isUnderLimit = this.items.length <= limit;
      this.shouldRemoveTrigger(this.trigger, isUnderLimit);
      this.setupContainer(!isUnderLimit, limit);
      this.applyGrid(this.grid, screenSize);
      return isUnderLimit;
    };

    ItemsTruncater.prototype.setupTruncater = function() {
      this.wrapper = this.elem.find('.trunc-wrapper');
      this.shortHeight = this.setupTruncation();
      this.shouldCreateTrigger(this.trigger, this.textWhenTrunced);
      this.onTriggerClick();
      this.elem.css({
        overflow: 'hidden'
      });
      return false;
    };

    ItemsTruncater.prototype.setupComponent = function(screenSize) {
      var isUnderLimit;
      this.elem.addClass('truncater-ready');
      isUnderLimit = this.setupContainerOnly(screenSize);
      if (isUnderLimit) {
        return false;
      } else {
        this.setupTruncater();
        return false;
      }
    };


    /*
    MAIN INITIALIZE METHOD
     */

    ItemsTruncater.prototype.init = function() {
      var reload;
      reload = (function(_this) {
        return function(size) {
          _this.destroyTruncater();
          return _this.setupComponent(size);
        };
      })(this);
      media.matchRange(reload);
      return false;
    };

    return ItemsTruncater;

  })();

  $(document).ready(function() {
    return $('.js-items-truncater').each(function() {
      return new ItemsTruncater($(this));
    });
  });

  AttendifySessionsTruncater = (function() {
    function AttendifySessionsTruncater(config, index) {
      this.container = config.element.eq(index);
      this.items = this.container.find(config.item);
      this.visible = config.visible;
      this.appearanceDuration = 30;
      this.scrollTopDuration = 400;
      this.scrollTopGap = 120;
      this.buttonTextShow = 'Show All';
      this.buttonTextHide = 'Show Less';
      this.container.height('auto');
      this.containerHeight = this.container.outerHeight();
      this.init();
    }

    AttendifySessionsTruncater.prototype.appendButton = function() {
      this.container.append('<a data-truncate="button"></a>');
      this.button = this.container.find('[data-truncate="button"]');
      this.button.text(this.buttonTextShow);
      return this.button.addClass('uv-button uv-button--card-control clr-bg clr-text clr-bc-inv-pseudo');
    };

    AttendifySessionsTruncater.prototype.animateItemsAppearance = function(state, index) {
      return ((function(_this) {
        return function(index) {
          return setTimeout(function() {
            var self;
            self = _this;
            if (state === 'hide') {
              return _this.items.eq(index).hide(0, function() {
                return $(this).animate({
                  'opacity': 0
                }, self.appearanceDuration, 'linear');
              });
            } else if (state === 'show') {
              return _this.items.eq(index).show(0, function() {
                return $(this).animate({
                  'opacity': 1
                }, self.appearanceDuration, 'linear');
              });
            }
          }, _this.appearanceDuration * (index - _this.visible));
        };
      })(this))(index);
    };

    AttendifySessionsTruncater.prototype.toggleItems = function(state) {
      var index, results;
      index = this.visible;
      results = [];
      while (index < this.items.length) {
        if (state === 'hideOnStart') {
          this.items.eq(index).hide(0, function() {
            return $(this).css('opacity', 0);
          });
        } else if (state === 'hide') {
          this.animateItemsAppearance(state, index);
        } else if (state === 'show') {
          this.animateItemsAppearance(state, index);
        }
        results.push(index++);
      }
      return results;
    };

    AttendifySessionsTruncater.prototype.hideItems = function() {
      if (this.items.length > this.visible) {
        this.toggleItems('hide');
        this.button.text(this.buttonTextShow).removeClass('is-active');
        return this.container.removeClass('is-opened');
      }
    };

    AttendifySessionsTruncater.prototype.showItems = function() {
      this.toggleItems('show');
      this.button.text(this.buttonTextHide).addClass('is-active');
      return this.container.addClass('is-opened');
    };

    AttendifySessionsTruncater.prototype.scrollToTop = function() {
      return setTimeout((function(_this) {
        return function() {
          return $('body,html').animate({
            scrollTop: _this.containerOffset - _this.scrollTopGap
          }, _this.scrollTopDuration);
        };
      })(this), this.scrollTopDuration / 2);
    };

    AttendifySessionsTruncater.prototype.setButtonClickEvent = function() {
      return this.button.on('click', (function(_this) {
        return function(event) {
          if (_this.container.hasClass('is-opened')) {
            _this.hideItems();
            return _this.scrollToTop();
          } else {
            _this.showItems();
            return _this.containerOffset = _this.container.offset().top;
          }
        };
      })(this));
    };

    AttendifySessionsTruncater.prototype.init = function() {
      if (this.items.length > this.visible) {
        this.container.addClass('is-extendable');
        this.toggleItems('hideOnStart');
        this.appendButton();
        return this.setButtonClickEvent();
      }
    };

    return AttendifySessionsTruncater;

  })();

  AttendifySchedule = (function() {
    var bxConfig, mediaLgConfig, mediaXsConfig;

    bxConfig = {
      pager: false,
      slideWidth: 165,
      speed: 600,
      infiniteLoop: false,
      hideControlOnEnd: true,
      minSlides: 1,
      maxSlides: 3,
      moveSlides: 1,
      slideMargin: 50,
      carousel: true,
      carouselCtr: true,
      responsive: true,
      touchEnabled: true,
      swipeTreshold: 50,
      touchEnabled: false,
      nextText: '',
      prevText: '',
      wrapperClass: 'uv-slider__pager-wrapper'
    };

    mediaXsConfig = {
      maxSlides: 1,
      moveSlides: 0,
      slideWidth: 200,
      slideMargin: 20,
      touchEnabled: true
    };

    mediaLgConfig = {
      maxSlides: 3,
      moveSlides: 1,
      slideWidth: 165,
      slideMargin: 50,
      touchEnabled: false
    };

    function AttendifySchedule(config) {
      this.datesContainer = config.sched.find('.schedule-dates');
      this.daysContainer = config.sched.find('.schedule-days');
      this.datesSelector = '[data-slider="date"]';
      this.daysSelector = '[data-slider="day"]';
      this.sessionSelector = '.session';
      this.dates = this.datesContainer.find(this.datesSelector);
      this.days = this.daysContainer.find(this.daysSelector);
      this.visible = config.visibleSessions;
      this.firstIndex = config.firstIndex;
      this.controls = [config.sched.find(".schedule-dates-prev"), config.sched.find(".schedule-dates-next")];
      this.mq = {
        xs: "screen and (max-width: 768px)"
      };
      this.sessionsTruncater = {};
      this.daysContainerHeight = 0;
      this.init();
    }

    AttendifySchedule.prototype.setDatesSlider = function() {
      var _bxConfig, sels;
      sels = {
        prevSelector: this.controls[0],
        nextSelector: this.controls[1]
      };
      _bxConfig = jQuery.extend(bxConfig, sels);
      if (this.dates.length > 3) {
        return this.datesSlider = this.datesContainer.bxSlider(_bxConfig);
      }
    };

    AttendifySchedule.prototype.setSessionTruncater = function(index) {
      if (!(index in this.sessionsTruncater)) {
        return this.sessionsTruncater[index] = new AttendifySessionsTruncater({
          container: this.daysSelector,
          element: this.days,
          item: '.session',
          visible: this.visible
        }, index);
      }
    };

    AttendifySchedule.prototype.setFirstActiveElements = function() {
      var index;
      index = this.firstIndex;
      this.dates.eq(index).addClass('is-active');
      this.days.eq(index).addClass('is-active');
      return this.setSessionTruncater(index);
    };

    AttendifySchedule.prototype.setDatesChange = function(activeDate) {
      var date, j, len1, previous, ref;
      previous = 0;
      ref = this.dates;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        date = ref[j];
        if ($(date).hasClass('is-active')) {
          previous = $(date).index();
          $(date).removeClass('is-active');
        }
      }
      activeDate.addClass('is-active');
      return previous;
    };

    AttendifySchedule.prototype.setDaysChange = function(index) {
      var day, j, len1, ref;
      ref = this.days;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        day = ref[j];
        if ($(day).hasClass('is-active')) {
          $(day).removeClass('is-active');
        }
      }
      return this.days.eq(index).addClass('is-active');
    };

    AttendifySchedule.prototype.changeActiveElements = function(activeDate) {
      var activeIndex, gap, nextHeight, previous, previousHeight;
      previous = this.setDatesChange(activeDate);
      gap = 0;
      previousHeight = this.days.eq(previous).outerHeight(true) + gap;
      this.daysContainer.css('height', previousHeight);
      activeIndex = activeDate.index();
      this.setDaysChange(activeIndex);
      nextHeight = this.days.eq(activeIndex).outerHeight(true) + gap;
      this.daysContainer.animate({
        'height': nextHeight
      }, 400, 'swing', function() {
        if ($(this).find('.is-active[data-slider="day"]').hasClass('is-extendable')) {
          return $(this).css('height', 'auto');
        }
      });
      if (this.dates.length > 3) {
        this.datesSlider.goToSlide(activeIndex);
      }
      this.setSessionTruncater(activeIndex);
      return this.sessionsTruncater[previous].hideItems();
    };

    AttendifySchedule.prototype.setDateClickEvent = function() {
      var control, j, len1, ref, results;
      this.dates.on('click', (function(_this) {
        return function(event) {
          return _this.changeActiveElements($(event.target));
        };
      })(this));
      ref = this.controls;
      results = [];
      for (j = 0, len1 = ref.length; j < len1; j++) {
        control = ref[j];
        results.push(control.on('click', (function(_this) {
          return function() {
            var activeDate, activeElement;
            activeElement = _this.datesSlider.getCurrentSlide();
            activeDate = $(_this.dates.eq(activeElement));
            return _this.changeActiveElements(activeDate);
          };
        })(this)));
      }
      return results;
    };

    AttendifySchedule.prototype.modifySliderConfig = function(config, state) {
      var prop;
      for (prop in config) {
        bxConfig[prop] = config[prop];
      }
      return bxConfig.onSlideBefore = (function(_this) {
        return function(item, current, next) {
          if (state === 'preventOnBefore') {
            _this.setDatesChange(_this.dates.eq(next));
            return _this.setDaysChange(next);
          } else {
            return false;
          }
        };
      })(this);
    };

    AttendifySchedule.prototype.setResponsive = function() {
      return enquire.register(this.mq.xs, {
        match: (function(_this) {
          return function() {
            _this.modifySliderConfig(mediaXsConfig, 'preventOnBefore');
            if (_this.dates.length > 3) {
              return _this.datesSlider.reloadSlider(bxConfig);
            } else if (_this.dates.length > 1 && _this.dates.length <= 3) {
              return _this.datesSlider = _this.datesContainer.bxSlider(bxConfig);
            }
          };
        })(this),
        unmatch: (function(_this) {
          return function() {
            _this.modifySliderConfig(mediaLgConfig);
            if (_this.dates.length > 3) {
              return _this.datesSlider.reloadSlider(bxConfig);
            } else if (_this.dates.length > 1 && _this.dates.length <= 3) {
              return _this.datesSlider.destroySlider();
            }
          };
        })(this)
      });
    };

    AttendifySchedule.prototype.init = function() {
      this.setDatesSlider();
      this.setFirstActiveElements();
      this.setDateClickEvent();
      return this.setResponsive();
    };

    return AttendifySchedule;

  })();

  $('.super-slider').each((function(_this) {
    return function(i, item) {
      return new AttendifySchedule({
        sched: $(item),
        visibleSessions: 8,
        firstIndex: 0
      });
    };
  })(this));


  /*
  DESCRIPTION
  Component sets attribute target:_blank for all links in text with not escaped html tags. In widget all links must have this atttibute, unless they will not open.
   */

  TargetBlankSetter = (function() {
    function TargetBlankSetter(text) {
      this.links = text.find('a');
      this.init();
    }

    TargetBlankSetter.prototype.setTargetAttribute = function() {
      return this.links.each(function() {
        if ($(this).attr('target') === void 0) {
          return $(this).attr('target', '_blank');
        }
      });
    };

    TargetBlankSetter.prototype.init = function() {
      return this.setTargetAttribute();
    };

    return TargetBlankSetter;

  })();

  $('.safe-description').each(function() {
    return new TargetBlankSetter($(this));
  });

}).call(this);
