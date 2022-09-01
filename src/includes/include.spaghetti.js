dg.qtContainerId = function(attrs) {
  if (!attrs.id) { attrs.id = 'quick-tabs-' + dg.salt(); }
  return attrs.id;
};

dg.qtWrapperOpener = function(variables) {
  if (!!dg_bootstrap) { variables._attributes.class.push('form-group'); }
  return '<div ' + dg.attrs(variables) + '>';
};

dg.qtLoadedBefore = function(id) {
  var quickTabs = dg_quick_tabs.get(id);
  return !!quickTabs;
};

dg.qtAddWrapperClass = function(attrs) {
  attrs.class.push('quick-tabs-wrapper');
};

dg.qtGetReady = function(id, variables) {
  var quickTabs = null;

  // If they've been loaded before, use them instead of starting fresh.
  if (dg.qtLoadedBefore(id)) {
    quickTabs = dg_quick_tabs.get(id);
    variables = quickTabs; // Overwrite the incoming variables!
  }
  else { // They have not been loaded before.

    var isTabs = dg.qtIsTabs(variables);

    //  Add the wrapper class.
    dg.qtAddWrapperClass(variables._attributes);

    // Initialize the attributes for the tabs.
    dg.attributesInit(variables._tabs);
    variables._tabs._attributes.class.push('quick-' + (isTabs ? 'tabs' : 'select'));

    // For select lists...
    if (!isTabs) {

      // Add bootstrap classes to select lists if necessary.
      if (!!dg_bootstrap) { variables._tabs._attributes.class.push('form-control'); }

      // Attach our onchange handler to the select list.
      variables._tabs._attributes.onchange = 'dg.qtSelectOnchange(this)';

      variables._tabs._attributes['data-id'] = id;

    }

    // Set the quick tabs aside.
    quickTabs = dg_quick_tabs.save(id, variables);

  }

  return quickTabs;

};

dg.qtRenderPane = function(paneDiv, quickTabs, delta) {
  var refresh = !!quickTabs._refresh;

  // Only render the pane if it is empty (aka render it once the first time).
  // @TODO use memory to capture innerHTML so revisiting a QT on the same route later can be loaded from memory
  // instead of making a potentially unnecessary round trip to Drupal. Make this configurable, e.g. _cache.
  if (!refresh && paneDiv.innerHTML != '') { return; }

  // Call the quick tabs panes handler, and inject its html into the correct pane. If the developer returns a
  // Promise, wait until it is resolved to inject its html into the pane.
  var pane = quickTabs._panes(quickTabs, delta);
  if (jDrupal.isPromise(pane)) {
    pane.then(function(_html) {
      paneDiv.innerHTML = dg.render(_html, true);
    });
  }
  else { paneDiv.innerHTML = dg.render(pane, true); }

};

dg.qtInvokePreClick = function(qt, delta, previousDelta) {
  // Invoke the developer's pre-click handler, if any.
  if (qt._preClick) { qt._preClick(qt, delta, previousDelta); }
};

dg.qtInvokePostClick = function(qt, delta, previousDelta) {
  // Invoke the developer's click handler, if any.
  if (qt._click) { qt._click(qt, delta, previousDelta); }
};

dg.qtGetPaneDiv = function(id, delta) {
  return dg.qs('#' + id + ' div[data-quick-tabs-pane="' + delta + '"]');
};

dg.qtHideAllSiblingPanes = function(id, delta) {
  var _list = dg.qtGetSelect(id);
  // Hide all sibling panes.
  for (var k = 0; k < _list.options.length; k++) {
    if (k == delta) { continue; }
    var otherPane = dg.qs('#' + id + ' div[data-quick-tabs-pane="' + k + '"]');
    dg.addClass(otherPane, 'hidden');
  }
};

dg.qtPanesOpener = function(attrs) {
  var className = 'quick-tabs-panes';
  if (!jDrupal.inArray(className, attrs.class)) { attrs.class.push(className); }
  return '<div ' + dg.attributes(attrs) + '>';
};

dg.qtPanesAttributes = function(variables) {
  var attrs = variables._panesAttrs ? variables._panesAttrs : null;
  if (!attrs) {
    var el = {};
    dg.attributesInit(el);
    attrs = el._attributes;
  }
  return attrs;
};

dg.qtPaneDiv = function(attrs, i) {
  if (!jDrupal.inArray('quick-tabs-pane', attrs.class)) { attrs.class.push('quick-tabs-pane'); }
  if (!jDrupal.inArray('hidden', attrs.class)) { attrs.class.push('hidden'); }
  attrs['data-quick-tabs-pane'] = '' + i;
  return '<div ' + dg.attributes(attrs) + '></div>';
};

dg.qtPaneAttributes = function(variables) {
  var attrs = variables._paneAttrs ? variables._paneAttrs : null;
  if (!attrs) {
    var el = {};
    dg.attributesInit(el);
    attrs = el._attributes;
  }
  return attrs;
};

/**
 * Render the panes empty and hidden.
 */
dg.qtPanesEmptyAndHidden = function(variables) {
  var html = '';
  var itemCount = 0;
  if (dg.qtIsTabs(variables)) { itemCount = variables._tabs._items.length; }
  else {
    for (var option in variables._tabs._options) {
      if (!variables._tabs._options.hasOwnProperty(option)) { continue; }
      itemCount ++;
    }
  }
  //console.log('itemCount', itemCount);
  //console.log(variables);
  for (var i = 0; i < itemCount; i++) {
    html += dg.qtPaneDiv(dg.qtPaneAttributes(variables), i);
  }
  return html;
};

dg.qtIsTabs = function(variables) {
  return !!variables._tabs._items;
};

dg.qtIsSelect = function(variables) {
  return !!variables._tabs._options;
};

dg.qtGetSelect = function(id) {
  return dg.qs('#' + id + ' select');
};

dg.qtGetDefaultDelta = function(variables) {
  if (typeof variables._delta === 'undefined') { variables._delta = 0; }
  return variables._delta;
};
