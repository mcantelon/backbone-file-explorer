function demo() {
  var dir = new fileBrowser.Directory({
    name: 'main',
    parent: 'test'
  });

  /* Directory data can be defind in two ways. One is using an API as
   * shown below.
   */

  dir.addDir({name: 'stuff'})
     .addDir({name: 'goat'})
     .addDir({name: 'rob'});

  dir.addDir({name: 'bing'});
  dir.addFile({name: 'file.png'});

  /* Directory data can also be defined by feeding the explorer a JSON
   * representation of a directory structure.
   *
   * The below representation is similar to the structure above, except
   * "file.png" has been removed.
   */

  var dirSlightlyAlteredAndInJSON = {
    name: 'main',
    parent: 'test',
    children: [
      {
        name: 'stuff',
        children: [
          {
            name: 'goat',
            children: [
              {
                name: 'rob',
                children: []
              }
            ]
          }
        ]
      },
      {
        name: 'bing',
        children: []
      }
    ]
  };

  var fileExplorer = new fileBrowser.FileExplorer({
    el:                $('#explorer'),
    directory:         dir,
    levelTemplate:     $('#template-dir-level').html(),
    entryTemplate:     $('#template-dir-entry').html(),
    closeDirsByDefault: false,
    entryClickHandler: function(event) {
      var explorer = event.data.self.explorer
        , explorerId = explorer.id
        , entryEl = this
        , entryId = $(this).attr('id');

      $('#' + explorerId).find('.backbone-file-explorer-entry').click(function() {
        // take note of selected entry
        explorer.selectedEntryId = $(entryEl).attr('id');

        // remove highlighting of existing entries
        $('#' + explorerId).find('.backbone-file-explorer-entry').css('border', '');

        // highlight selected entry
        $(entryEl).css('border', '1px solid blue');
      });
    },
    nameClickHandler: function(result) {
      fileExplorer.busy();
      $('#message').text(
        'User clicked name of ' + result.type + ' at path ' + result.path
      );
      setTimeout(function() {
        $('#message').text('');
        fileExplorer.idle();
      }, 2000);
    },
    moveHandler: function(move) {
      if (move.allowed) {
        move.self.busy();
        $('#message').text(
          'Dropped ID ' + move.droppedPath + ' onto ' + move.containerPath
        );
        setTimeout(function() {
          move.self.idle();
          $('#message').text('');
        }, 2000);
      } else {
        alert("You can't move a directory into its subdirectory.");
      }
    }
  });

  // example of how the explorer can be updated
  $('#updateLink').click(function() {
    fileExplorer.busy();
    $('#message').text('User clicked update link.');
    setTimeout(function() {
      // render new directory structure
      fileExplorer.structure = dirSlightlyAlteredAndInJSON;
      fileExplorer.render();

      // re-bind drag-and-drop behavior
      fileExplorer.initDragAndDrop();

      fileExplorer.idle();
      $('#message').text('');
    }, 1000);
  });

  return fileExplorer;
}
