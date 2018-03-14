dg_quick_tabs.load = function(id) {
  return dg._quick_tabs[id] ? dg._quick_tabs[id] : null;
};

dg_quick_tabs.save = function(id, variables) {
  dg._quick_tabs[id] = variables;
  return dg._quick_tabs[id];
};

dg_quick_tabs.clear = function() {
  dg._quick_tabs = {};
};

dg_quick_tabs.removePagerEvents = function(pagerId) {
  var pager = dg_pager.load(pagerId);
  if (pager) { pager.removeEvents(); }
};

dg_quick_tabs.addPagerEvents = function(pagerId) {
  var pager = dg_pager.load(pagerId);
  if (pager && !pager.eventsAdded()) { pager.addEvents(); }
};
