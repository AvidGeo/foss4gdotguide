  $(document).ready(function() {
    var $input = $('#person-search')
    $input.on('input', function () {
      makeSureAllShowing()
      var value = $input.val();
      if (!value) {
        return showAll();
      }
      filternew(value)
    })
    function showAll() {
      $('.calvin_member_link').each(function (i, item) {
        var $item = $(item);
        $item.show();
      })
    }
    function filternew(value) {
      const values = value.split(' ').filter(function (item) {
        return item && typeof item === 'string' && item.trim();
      })
      $('.calvin_member_link').each(function (i, item) {
        var $item = $(item);
        if (values.every(function (value) {
          var $item = $(item);
          var matchedLast = match(value, $item.data('lname'))
          var matchedFirst = match(value, $item.data('fname'))
          return matchedFirst || matchedLast
        })) {
            $item.show();
        } else {
          $item.hide();
        }
      })
    }
    function match(test, value) {
      if (!value || value.length < test.length) {
        return false;
      }
      var trimed = value.slice(0, test.length).toLowerCase();
      return trimed === test;
    }
    function makeSureAllShowing() {
      if ($('.speaker_list_calvin .trunc-wrapper-opened').length === 0) {
        $('.speaker_list_calvin ~ a.uv-button--card-control').click()
      }
    }
  })
