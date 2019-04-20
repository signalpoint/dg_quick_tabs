# dg_quick_tabs

The Quick Tabs widget for DrupalGap 8. A must have widget for tabbed content and navigation.

With a `quick_tabs` widget, you can easily render a list of tabs that when clicked each render their own custom content.

Also check out the `quick_select` widget below, to use a select list and options instead of tabs.

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

    },

    // Optional, click handler for when a tab is clicked, after any workers get called.
    _click: function(quickTabs, delta, previousDelta) {

      console.log('click!', delta);

    },
    
    // Optional, specify the default active tab. Defaults to 0.
    //_delta: 1,
    
    // Optional, force reload the active tab's html each time it is shown, defaults to false.
    //_refresh: true,

  });
```

The `_tabs` property is simply a [list widget](http://docs.drupalgap.org/8/Widgets/List_Widget).

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

## Quick Select

If you'd like to use a select list with options instead of tabs, it has almost the exact same usage, except:

- replace `quick_tabs` with `quick_select`
- replace the usage of `_tabs` with a [select widget](http://docs.drupalgap.org/8/Widgets/Select_List_Widget) instead of a [list widget](http://docs.drupalgap.org/8/Widgets/List_Widget)

```
element.foo = {
  _theme: 'quick_select',
  _tabs: {
    /* ... */
    _options: {
      123: dg.t('Option 1'),
      456: dg.t('Option 2'),
      789: dg.t('Option 3')
    }
  },
  _panes: { /* ... */ }
};
```

## Multi Page Forms

We can easily simulate a multi page form with quick tabs using the `_tabs`, `_panes` and `_click` properties. First,
make sure your quick tabs has a unique id and then set up the tabs, with only the first tab enabled:

```
_tabs: {

  _attributes: {
    id: 'example-form-tabs',
    class: ['nav', 'nav-tabs']
  },

  _items: [
    {
      _text: dg.l('Step 1', null),
      _attributes: {
        title: dg.t('Step 1 text...')
      }
    },
    {
      _text: dg.l('Step 2', null),
      _attributes: {
        title: dg.t('Step 2 text...'),
        class: ['disabled']
      }
    },
    {
      _text: dg.l('Step 3', null),
      _attributes: {
        title: dg.t('Step 3 text...'),
        class: ['disabled']
      }
    },
    {
      _text: dg.l('Step 4', null),
      _attributes: {
        title: dg.t('Step 4 text...'),
        class: ['disabled']
      }
    }
  ]
},
```

Next, create a custom form for each page/tab:

```
dg.createForm('ExampleForm0', function() { /* ... */ }); // Page/Tab 1's form.
dg.createForm('ExampleForm1', function() { /* ... */ }); // Page/Tab 2's form.
dg.createForm('ExampleForm2', function() { /* ... */ }); // Page/Tab 3's form.
```

Next, tell your quick tabs `_panes` to render the appropriate form dynamically:

```
_panes: function(quickTabs, delta) {
  var formId = 'ExampleForm' + delta;
  var element = {};
  element.form = {
    _theme: 'form',
    _id: formId
  };
  return element;
}
```

Then as each tab is clicked, the above code will render the right form into the tab's pane:

To move from `ExampleForm0` to `ExampleForm1`, we can do this in `ExampleForm0`'s submit handler:

```
dg_quick_tabs.forms.goToTab('example-form-tabs', 1);
```

We could then retrieve the form state values from `ExampleForm0` while in the build of `ExampleForm1` like so:

```
var formState0 = dg.getFormState('ExampleForm0');
var fooValue = formState0.getValue('foo');
```

We would do something similar in `ExampleForm1`'s submit handler to move along to `ExampleForm2`, and so on.

To handle the user moving backwards through the forms, we can add this to our quick tabs `_click` handler:

```
_click: function(quickTabs, delta, previousDelta) {

  // If we've moved backwards...
  if (previousDelta > delta) {

    // Disable future tabs.
    dg_quick_tabs.forms.disableTabs('incidents-publish-tabs', delta + 1);

    // Re-enable form submit button here and each one in the future that has already been loaded.
    var totalTabs = quickTabs._tabs._items.length;
    for (var i = delta; i < totalTabs; i++) {
      var form = dg.loadForm('PublishIncidentsForm' + i);
      if (form) { form.enableSubmitButton(); }
    }

  }

}
```

That's it, not too bad, and pretty powerful stuff.
