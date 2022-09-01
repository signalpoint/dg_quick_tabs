DgQuickTabs = function(id, vars) {
  this._id = id;
  this._qt = vars;
};

DgQuickTabs.prototype.getDelta = function() {
  return this._qt._delta;
};

DgQuickTabs.prototype.getTabs = function() {
  return this._qt._tabs;
};

DgQuickTabs.prototype.getTabsCount = function() {
  return this.getTabs()._items.length;
};

DgQuickTabs.prototype.getTab = function(delta) {
  return this.getTabs()._items[delta];
};

DgQuickTabs.prototype.getTabsElement = function() {
  return dg.qs('#' + this.getTabs()._attributes.id);
};

DgQuickTabs.prototype.getTabElements = function() {
  return this.getTabsElement().querySelectorAll('li');
};

DgQuickTabs.prototype.getTabElement = function(delta) {
  return this.getTabElements()[delta];
};
