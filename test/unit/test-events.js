var menuOpenCounter = 0;
var menuCloseCounter = 0;
var itemSelectedCounter = 0;
var menuRuntime = null;

function testQUnit(name, itemClickEvent, triggerEvent) {
  QUnit.module(name);
  // before each test
  function createContextMenu(items) {
    var $fixture = $('#qunit-fixture');

    // ensure `#qunit-fixture` exists when testing with karma runner
    if ($fixture.length === 0) {
      $('<div id="qunit-fixture">').appendTo("body");
      $fixture = $('#qunit-fixture');
    }

    $fixture.append("<div class='context-menu'>right click me!</div>");

    if(!items){
      items = {
        copy: {name: 'Copy', icon: 'copy'},
        paste: {name: 'Paste', icon: 'paste'}
      };
    }

    $.contextMenu({
      selector: '.context-menu',
      events: {
        show: function(opt) {
          menuRuntime = opt;
          menuOpenCounter = menuOpenCounter + 1;
        },
        hide: function() {
          menuCloseCounter = menuCloseCounter + 1;
        }
      },
      callback: function(key, options) {
        itemSelectedCounter = itemSelectedCounter + 1;
      },
      items: items,
      itemClickEvent: itemClickEvent
    });
  }

  // after each test
  function destroyContextMenuAndCleanup() {
    $.contextMenu('destroy');

    // clean up `#qunit-fixture` when testing in karma runner
    var $fixture = $('#qunit-fixture');
    if ($fixture.length) {
      $fixture.html('');
    }

    // reset vars
    menuOpenCounter = 0;
    menuCloseCounter = 0;
    itemSelectedCounter = 0;
    menuRuntime = null;
  }



  QUnit.test('$.contextMenu object exists', function(assert) {
    assert.ok($.contextMenu, '$.contextMenu plugin is loaded');
    assert.notEqual($.contextMenu, undefined, '$.contextMenu is not undefined');
  });


  QUnit.test('open contextMenu', function(assert) {
    createContextMenu();
    $(".context-menu").contextMenu();
    assert.equal(menuOpenCounter, 1, 'contextMenu was opened once');
    destroyContextMenuAndCleanup();
  });


  QUnit.test('open contextMenu at 0,0', function(assert) {
    createContextMenu();
    $(".context-menu").contextMenu({x: 0, y: 0});
    assert.equal(menuOpenCounter, 1, 'contextMenu was opened once');
    destroyContextMenuAndCleanup();
  });


  QUnit.test('close contextMenu', function(assert) {
    createContextMenu();
    $(".context-menu").contextMenu();
    $(".context-menu").contextMenu('hide');
    assert.equal(menuCloseCounter, 1, 'contextMenu was closed once');
    destroyContextMenuAndCleanup();
  });


  QUnit.test('navigate contextMenu items', function(assert) {
    createContextMenu();
    var itemWasFocused = 0;
    var itemWasBlurred = 0;

    // listen to focus and blur events
    $(document.body)
      .on("contextmenu:focus", ".context-menu-item", function(e) {
        itemWasFocused = itemWasFocused + 1;
      })
      .on("contextmenu:blur", ".context-menu-item", function(e) {
        itemWasBlurred = itemWasBlurred + 1;
      });

    $(".context-menu").contextMenu();
    menuRuntime.$menu.trigger('nextcommand'); // triggers contextmenu:focus
    assert.equal(itemWasFocused, 1, 'first menu item was focused once');
    itemWasFocused = 0;

    menuRuntime.$menu.trigger('nextcommand'); // triggers contextmenu:blur & contextmenu:focus
    assert.equal(itemWasFocused, 1, 'first menu item was blurred');
    assert.equal(itemWasBlurred, 1, 'second menu item was focused');
    destroyContextMenuAndCleanup();
  });


  QUnit.test('activate contextMenu item', function(assert) {
    createContextMenu();
    $(".context-menu").contextMenu();
    menuRuntime.$menu.trigger('nextcommand');
    menuRuntime.$selected.trigger(triggerEvent);

    assert.equal(itemSelectedCounter, 1, 'selected menu item was clicked once');
    destroyContextMenuAndCleanup();
  });



  QUnit.test('do not open context menu with no visible items', function(assert) {
    createContextMenu({
      copy: {name: 'Copy', icon: 'copy', visible: function(){return false;}},
      paste: {name: 'Paste', icon: 'paste', visible: function(){return false;}}
    });
    $(".context-menu").contextMenu();

    assert.equal(menuOpenCounter, 0, 'selected menu wat not opened');
    destroyContextMenuAndCleanup();
  });

  QUnit.test('items in seconds submenu to not override callbacks', function (assert) {
    var firstCallback = false, firstSubCallback = false, secondSubCallback = false;
    createContextMenu({
      firstitem: {
        name: 'firstitem',
        icon: 'copy',
        callback : function(){
          firstCallback = true;
        }
      },
      firstsubmenu: {
        name: 'Copy',
        icon: 'copy',
        items: {
          firstitem : {
            name : "firstitem",
            icon : "copy",
            callback : function(){
              firstSubCallback = true;
            }
          }
        }
      },
      secondsubmenu: {
        name: 'Copy',
        icon: 'copy',
        items: {
          firstitem : {
            name : "firstitem",
            icon : "copy",
            callback : function(){
              secondSubCallback = true;
            }
          }
        }
      }
    });
    $('.context-menu-item').first().trigger(triggerEvent);
    $('.context-menu-submenu .context-menu-item').each(function(i,e){
      $(e).trigger(triggerEvent)
    });

    assert.equal(firstCallback, 1);
    assert.equal(firstSubCallback, 1);
    assert.equal(secondSubCallback, 1);
  })
};

testQUnit('contextMenu events', '', 'mouseup')
testQUnit('contextMenu events - click handler', 'click', 'click')