/**
 * Renders a quick tabs widget.
 * @param variables
 *  _tabs {Object} An item_list widget that will be used to render the tabs. @see Item List Widget
 *  _delta {Number} Optional, the index of the tab to set as the default. Defaults to 0.
 *  _panes {Function} A function to handle what content to display, it will be passed two arguments:
 *      %param quickTabs {Object} Contains all data about the quick tabs widget.
 *      %param delta {Number} The index of the tab that was clicked.
 *      %return {Promise|String} Return a Promise and resolve it with an html string, or just return an html string.
 * @return {String} The html string of a rendered quick tabs widget.
 */
dg.theme_quick_tabs = function(variables) {

  // Extract the tabs, and skip rendering if there aren't any.
  var tabs = variables._tabs;
  if (!tabs || !tabs._items) { return ''; }

  var attrs = variables._attributes;

  // Grab the container id, or generate a random one.
  if (!attrs.id) { attrs.id = 'quick-tabs-' + dg.salt(); }
  var id = attrs.id;

  variables._attributes.class.push('quick-tabs-wrapper');

  // Set the quick tabs aside.
  dg._quick_tabs[id] = variables;
  var quickTabs = dg._quick_tabs[id];

  // Figure out the default tab delta.
  if (typeof variables._delta === 'undefined') { variables._delta = 0; }
  var defaultDelta = variables._delta;

  // Open the wrapper.
  var html = '<div ' + dg.attrs(variables) + '>';

  // Initialize the attributes for the tabs and then render them.
  dg.attributesInit(tabs);
  tabs._attributes.class.push('quick-tabs');
  html += dg.theme('item_list', tabs);

  // Open the panes container.
  html += '<div class="quick-tabs-panes">';

  // Render the panes empty and hidden
  for (var i = 0; i < tabs._items.length; i++) {
    html += '<div class="quick-tabs-pane hidden" data-quick-tabs-pane="' + i + '"></div>';
  }

  // After the html is returned and rendered on the page...
  setTimeout(function() {

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

        // Remove active class from previous active tab.
        for (var l = 0; l < listItems.length; l++) {
          if (dg.hasClass(listItems[l], 'active')) {
            dg.removeClass(listItems[l], 'active');
          }
        }

        // Figure out the delta of the clicked item.
        var delta = Array.prototype.indexOf.call(_list.childNodes, _listItem);

        // Add an active class to the list item.
        if (!dg.hasClass(listItems[delta], 'active')) { dg.addClass(listItems[delta], 'active'); }

        // Hide all sibling panes.
        for (var k = 0; k < _list.childNodes.length; k++) {
          if (k == delta) { continue; }
          var otherPane = document.querySelector('#' + id + ' div[data-quick-tabs-pane="' + k + '"]');
          dg.addClass(otherPane, 'hidden');
        }

        // Grab the corresponding pane for the clicked tab's delta.
        var paneDiv = document.querySelector('#' + id + ' div[data-quick-tabs-pane="' + delta + '"]');

        // Only render the pane if it is empty (aka render it once the first time), then no matter what un hide it.
        if (paneDiv.innerHTML == '') {

          // Call the quick tabs panes handler, and inject its html into the correct pane. If the developer returns a
          // Promise, wait until it is resolved to inject its html into the pane.
          var pane = quickTabs._panes(quickTabs, delta);
          if (jDrupal.isPromise(pane)) {
            pane.then(function(_html) {
              paneDiv.innerHTML = dg.render(_html, true);
            });
          }
          else { paneDiv.innerHTML = dg.render(pane, true); }

        }

        // Show the active pane.
        dg.removeClass(paneDiv, 'hidden');

        // Invoke the developer's click handler, if any.
        if (quickTabs._click) { quickTabs._click(quickTabs, delta); }

      });
    }

    // If there is a default delta, simulate a click on it to set the default tab.
    if (listItems[defaultDelta]) { listItems[defaultDelta].click(); }

  }, 1);

  // Close the panes and the wrapper, and return.
  return html + '</div></div>';

};
