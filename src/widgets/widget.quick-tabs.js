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
  if (!attrs.id) { attrs.id = 'quick-tabs-' + dg.userPassword(); }
  var id = attrs.id;

  variables._attributes.class.push('quick-tabs-wrapper');

  // Set the quick tabs aside.
  dg._quick_tabs[id] = variables;
  var quickTabs = dg._quick_tabs[id];

  // Open the wrapper.
  var html = '<div ' + dg.attrs(variables) + '>';

  // Render the tabs.
  dg.attributesInit(tabs);
  tabs._attributes.class.push('quick-tabs');
  html += dg.theme('item_list', tabs);

  // Open the panes container.
  html += '<div class="quick-tabs-panes">';

  // Render the panes empty and hidden
  for (var i = 0; i < tabs._items.length; i++) {
    var tab = tabs._items[i];
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

        // The clicked element won't necessarily be the <li> housing the item, so we traverse up the DOM from the
        // target clicked element in search of the <li> around it. When we find the list item, grab a reference to the
        // list itself.
        var _list = null;
        var _listItem = null;
        if (_item.tagName != 'LI') {
          for (var j = 0; j < event.path.length; j++) {
            var path = event.path[j];
            if (path.tagName == 'LI') {
              _list = event.path[j+1];
              _listItem = path;
              break;
            }
          }
        }
        else {
          _list = event.path[1];
          _listItem = event.path[0];
        }

        if (!_listItem || !_list) { return; } // Bail out if we couldn't find the list item or the list.

        // Figure out the delta of the clicked item.
        var delta = Array.prototype.indexOf.call(_list.childNodes, _listItem);
        //var pane = quickTabs._panes[delta];
        //if (!pane) { return; }

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

      });
    }

    // If there is a default delta, simulate a click on it to set the default tab.
    if (typeof variables._delta === 'undefined') { variables._delta = 0; }
    var defaultDelta = variables._delta;
    if (listItems[defaultDelta]) { listItems[defaultDelta].click(); }

  }, 1);

  // Close the panes and the wrapper, and return.
  return html + '</div></div>';

};
