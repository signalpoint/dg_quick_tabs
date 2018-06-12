/**
 * Renders a quick select widget.
 * @param variables
 *  _tabs {Object} An select widget that will be used to render the options. @see Select Widget
 *  _delta {Number} Optional, the index of the tab to set as the default. Defaults to 0.
 *  _panes {Function} A function to handle what content to display, it will be passed two arguments:
 *      %param quickTabs {Object} Contains all data about the quick tabs widget.
 *      %param delta {Number} The index of the option that was clicked.
 *      %return {Promise|String} Return a Promise and resolve it with an html string, or just return an html string.
 * @return {String} The html string of a rendered quick select widget.
 */
dg.theme_quick_select = function(variables) {
  //console.log('theme_quick_select', variables);
  var attrs = variables._attributes;
  var id = dg.qtContainerId(attrs);
  var tabs = variables._tabs;
  if (!tabs || !tabs._options) { return ''; }

  // Have these tabs been loaded before?
  //var loadedBefore = dg.qtLoadedBefore(id);

  // Prep the quick tabs.
  variables = dg.qtGetReady(id, variables);

  // @TODO Figure out the default tab delta like we do with quick tabs?

  // Open the wrapper.
  var html = dg.qtWrapperOpener(variables);

  // Render the select list.
  html += dg.theme('select', variables._tabs);

  // Open the panes container.
  html += dg.qtPanesOpener();

  // Render the panes empty and hidden.
  html += dg.qtPanesEmptyAndHidden(variables);

  // After the html is returned and rendered on the page...
  setTimeout(function() {

    dg.qtGetSelect(id).dispatchEvent(new Event('change', { 'bubbles': true }));

  }, 1);

  // Close the panes and the wrapper, and return.
  return html + '</div></div>';
};


dg.qtSelectOnchange = function(select) {
  var id = select.getAttribute('data-id');
  var quickTabs = dg_quick_tabs.load(id);

  //console.log('dg.qtSelectOnchange', quickTabs);

  // Figure out the delta of the selected item.
  var delta = select.selectedIndex;

  var selectedValue = select.options[delta].value;
  if (selectedValue != '') { selectedValue = parseInt(selectedValue); } // Convert to int.
  //console.log(delta, selectedValue);

  // Hold onto the previous delta.
  var previousDelta = quickTabs._delta;

  dg.qtInvokePreClick(quickTabs, delta, previousDelta);

  dg.qtHideAllSiblingPanes(id, delta);

  // Grab the corresponding pane for the clicked tab's delta.
  var paneDiv = dg.qtGetPaneDiv(id, delta);

  dg.qtRenderPane(paneDiv, quickTabs, delta);

  // Show the active pane.
  dg.removeClass(paneDiv, 'hidden');

  dg.qtInvokePostClick(quickTabs, delta, previousDelta);

  quickTabs._delta = delta;

};
