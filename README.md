# dg_quick_tabs

The Quick Tabs widget for DrupalGap 8. A must have widget for tabbed content and navigation.

With a `quick_tabs` widget, you can easily render a list of tabs that when clicked each render their own custom content.

```
var html = dg.theme('quick_tabs', {
    _tabs: {

      // Add any attributes to the container.
      _attributes: {
        class: ['foo']
      },

      // Build the tabs.
      _items: [
        {
          _text: dg.l('Bar', null),
          _attributes: {
            title: dg.t('123')
          }
        },
        {
          _text: dg.l('Baz', null),
          _attributes: {
            title: dg.t('456')
          }
        },
        {
          _text: dg.l('Boo', null),
          _attributes: {
            title: dg.t('789')
          }
        }
      ]
    },

    // Add content to pane when tabs are clicked.
    _panes: function(quickTabs, delta) {
      var element = {};
      switch (delta) {

        case 0:
          element.stuff = {
            _markup: 'bar markup'
          };
          break;

        case 1:
            element = 'baz text';
          break;

        case 2:
          element.stuff = {
            _theme: 'bucket',
            _grab: function() {
              return new Promise(function(ok, err) {
                // Make a call to the server...
                ok('Boo result');
              });
            }
          };
          break;

      }
      return element;
    },
    
    // Optional, click handler for when a tab is clicked, before any workers get called.
    _preClick: function(quickTabs, delta, previousDelta) {

      console.log('pre click!', delta);

    }

    // Optional, click handler for when a tab is clicked, after any workers get called.
    _click: function(quickTabs, delta, previousDelta) {

      console.log('click!', delta);

    }

  });
```

Like all widgets, a `quick_tabs` can easily be ran through the DrupalGap render element system as well:

```
var element = {};
element.foo = {
  _theme: 'quick_tabs',
  _tabs: { /* ... */ },
  _panes: { /* ... */ }
};
return element;
```

## Using with Bootstrap

```
// @see http://getbootstrap.com/components/#nav
element.foo = {
  _theme: 'quick_tabs',
  _tabs: {
    _attributes: {
      class: ['nav', 'nav-tabs']
    },
    /* ... */
  },
  _panes: { /* ... */ }
};
```

## Stick Tabs at Top After Scroll

```
.quick-tabs-wrapper .quick-tabs {
    position: fixed;
    top: 50px;
    width: 100%;
    background-color: white;
}
.quick-tabs-wrapper .quick-tabs-panes {
    margin-top: 54px;
}
```

Credit goes to [this answer on Stack Overflow](https://stackoverflow.com/a/1216130/763010). 
