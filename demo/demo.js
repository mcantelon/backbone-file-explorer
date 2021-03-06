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
    },
    actionHandlers: [
      {
        name: 'Archive',
        description: 'Archive file or directory',
        iconHtml: '<img src="demo/img/icon_archive.gif" alt="Archive" title="Archive" />',
        logic: function(result) {
          fileExplorer.busy();
          $('#message').text(
            'User clicked archive icon for ' + result.type + ' at path ' + result.path
          );
          setTimeout(function() {
            fileExplorer.idle();
            $('#message').text('');
          }, 2000);
        }
      },
      {
        name: 'Delete',
        description: 'Delete file or directory',
        iconHtml: '<img src="demo/img/trash.jpg" alt="Delete" title="Delete" />',
        logic: function(result) {
          fileExplorer.busy();
          $('#message').text(
            'User clicked trash icon for ' + result.type + ' at path ' + result.path
          );
          setTimeout(function() {
            fileExplorer.idle();
            $('#message').text('');
          }, 2000);
        }
      }
    ]
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
