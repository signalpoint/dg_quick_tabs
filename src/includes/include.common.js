dg_quick_tabs.get = function(id) {
  return dg._quick_tabs[id] ? dg._quick_tabs[id] : null;
};

dg_quick_tabs.load = function(id) {
  return new DgQuickTabs(id, dg_quick_tabs.get(id));
};

dg_quick_tabs.save = function(id, variables) {
  dg._quick_tabs[id] = variables;
  return dg._quick_tabs[id];
};

dg_quick_tabs.clear = function() {
  dg._quick_tabs = {};
};

dg_quick_tabs.getTabs = function(id) {
  return document.querySelectorAll('#' + id + ' li');
};

/**
 * A little helper object to support multi "page" forms via tabs.
 */
dg_quick_tabs.forms = {
  goToTab: function(id, delta) {
    var tabs = dg_quick_tabs.getTabs(id);
    dg_quick_tabs.forms.disableTabs(id, delta);
    var li = tabs[delta];
    li.classList.remove('disabled');
    li.click();
  },
  disableTabs: function(id, delta) {
    var tabs = dg_quick_tabs.getTabs(id);
    for (var i = delta; i < tabs.length; i++) {
      tabs[i].classList.add('disabled');
    }
  }
};
