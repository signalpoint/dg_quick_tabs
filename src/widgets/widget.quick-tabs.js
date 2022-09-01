/**
 * Renders a quick tabs widget.
 * @param variables
 *  _tabs {Object} An item_list widget that will be used to render the tabs. @see Item List Widget
 *  _delta {Number} Optional, the index of the tab to set as the default. Defaults to 0.
 *  _refresh {Boolean} Optional, set to true to force reload the pane's html each time. Defaults to false.
 *  _panes {Function} A function to handle what content to display, it will be passed two arguments:
 *      %param quickTabs {Object} Contains all data about the quick tabs widget.
 *      %param delta {Number} The index of the tab that was clicked.
 *      %return {Promise|String} Return a Promise and resolve it with an html string, or just return an html string.
 *  _panesAttrs {Object} An attributes object for the panes container element.
 * @return {String} The html string of a rendered quick tabs widget.
 */
dg.theme_quick_tabs = function(variables) {

  var attrs = variables._attributes;

  // Grab the container id, or generate a random one.
  var id = dg.qtContainerId(attrs);

  // Extract the tabs, and skip rendering if there aren't any.
  var tabs = variables._tabs;
  if (!tabs || !tabs._items) { return ''; }
  // WARNING: Do not use the "tabs" variable below for any modifications, use variables._tabs instead, or your
  // modifications will be lost upon reload.

  // Have these tabs been loaded before?
  var quickTabs = dg_quick_tabs.get(id);
  var loadedBefore = dg.qtLoadedBefore(id);

  // If they've been loaded before, use them instead of starting fresh. Otherwise add the wrapper class.
  if (loadedBefore) { variables = quickTabs; }
  else { attrs.class.push('quick-tabs-wrapper'); }

  // Figure out the default tab delta.
  var defaultDelta = dg.qtGetDefaultDelta(variables);

  // Open the wrapper. If bootstrap is present, add a nice css class for the wrapper.
  var html = dg.qtWrapperOpener(variables);

  // If the tabs haven't been loaded before...
  if (!loadedBefore) {

    // Initialize the attributes for the tabs.
    dg.attributesInit(variables._tabs);
    variables._tabs._attributes.class.push('quick-tabs');

    // Indicate the tabs are not yet ready.
    variables._ready = false;

    // Set the quick tabs aside.
    quickTabs = dg_quick_tabs.save(id, variables);

  }

  // Render the tabs (or select list).
  html += dg.theme('item_list', variables._tabs);

  // Open the panes container.
  html += dg.qtPanesOpener(dg.qtPanesAttributes(variables));

  // Render the panes empty and hidden
  html += dg.qtPanesEmptyAndHidden(variables);

  // After the html is returned and rendered on the page...
  setTimeout(function() {

    // TABS ONLY...

    // TAB CLICK LISTENERS
    // Grab the tabs and attach a click listener to each.
    var listItems = document.querySelectorAll('#' + id + ' .quick-tabs li');
    for (var i = 0; i < listItems.length; i++) {
      var item = listItems[i];
      item.addEventListener('click', function(event) {

        // Grab the element that was clicked.
        var _item = event.target;

        //console.log('click', _item);

        // The clicked element won't necessarily be the <li> housing the item, so we traverse up the DOM from the
        // target clicked element in search of the <li> around it. When we find the list item, also grab a reference to
        // the list itself (typically an unordered list).
        // @TODO iOS device web applications don't seem to support "event.path" so we fall back to "parentNode" here.
        // This could use some clean up and more thorough testing.
        var _list = null;
        var _listItem = null;
        if (_item.tagName != 'LI') {
          if (event.path) {
            for (var j = 0; j < event.path.length; j++) {
              var path = event.path[j];
              if (path.tagName == 'LI') {
                _list = event.path[j+1];
                _listItem = path;
                break;
              }
            }
          }
          else { // iOS web app special case.
            _listItem = _item.parentNode;
            _list = _listItem.parentNode;
          }
        }
        else {
          //console.log('event: ' + _item.tagName, event);
          //console.log('target', event.target);
          if (event.path) {
            _list = event.path[1];
            _listItem = event.path[0];
          }
          else { // iOS web app special case.
            _list = _item.parentNode;
            _listItem = _item;
            //console.log('_list', _list);
            //console.log('_listItem', _listItem);
            //console.log('_list.childNodes', _list.childNodes);
          }

        }

        if (!_listItem || !_list) { return; } // Bail out if we couldn't find the list item or the list.

        if (_listItem.classList.contains('disabled')) { return; } // Bail out if the tab is disabled.

        // Figure out the delta of the clicked item.
        var delta = Array.prototype.indexOf.call(_list.childNodes, _listItem);

        // Hold onto the previous delta.
        var previousDelta = quickTabs._delta;

        dg.qtInvokePreClick(quickTabs, delta, previousDelta);

        // Remove active class from previous active tab.
        for (var l = 0; l < listItems.length; l++) {
          if (dg.hasClass(listItems[l], 'active')) {
            dg.removeClass(listItems[l], 'active');
            var link = listItems[l].querySelector('a');
            if (link) { link.classList.remove('active'); }
          }
        }

        // Add an active class to the list item.
        if (!dg.hasClass(listItems[delta], 'active')) {
          dg.addClass(listItems[delta], 'active');
          var link = listItems[delta].querySelector('a');
          if (link) { link.classList.add('active') }
        }

        // @TODO Abstract most everything after here...

        // Hide all sibling panes.
        // @TODO use/improve the include.spaghetti.js here.
        for (var k = 0; k < _list.childNodes.length; k++) {
          if (k == delta) { continue; }
          var selector = '#' + id + ' div[data-quick-tabs-pane="' + k + '"]';
          var otherPane = dg.qs(selector);
          dg.addClass(otherPane, 'hidden');
        }

        // Grab the corresponding pane for the clicked tab's delta.
        var paneDiv = dg.qtGetPaneDiv(id, delta);

        dg.qtRenderPane(paneDiv, quickTabs, delta);

        // Show the active pane.
        dg.removeClass(paneDiv, 'hidden');

        dg.qtInvokePostClick(quickTabs, delta, previousDelta);

        // Track which delta was clicked, so when navigating back to the route that hosts the widget, we can set the
        // default tab to the one the user left off on.
        quickTabs._delta = delta;

      });
    }

    // If there is a default delta, simulate a click on it to set the default tab.
    if (listItems[defaultDelta]) { listItems[defaultDelta].click(); }

    // Indicate the tabs are ready.
    quickTabs._ready = true;

  }, 1);

  // Close the panes and the wrapper, and return.
  return html + '</div></div>';

};
