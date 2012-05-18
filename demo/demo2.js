function testDirs() {

  var dir = new Directory({
    name: 'main',
    parent: 'test'
  });

  dir.addDir({name: 'stuff'})
     .addDir({name: 'goat'})
     .addDir({name: 'rob'});

  dir.addDir({name: 'bing'});
  dir.addFile({name: 'file.png'});

  return dir;
}

function source() {

  var dir = testDirs();

  var fileExplorer = new FileExplorer({
    el:                $('#source'),
    directory:         dir,
    levelTemplate:     $('#template-dir-level').html(),
    entryTemplate:     $('#template-dir-entry').html(),
    closeDirsByDefault: false,
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
  });

  return fileExplorer;
}

function dest() {

  var dir = testDirs();

  var fileExplorer = new FileExplorer({
    el:                $('#dest'),
    directory:         dir,
    levelTemplate:     $('#template-dir-level').html(),
    entryTemplate:     $('#template-dir-entry').html(),
    closeDirsByDefault: false,
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
  });

  return fileExplorer;
}
