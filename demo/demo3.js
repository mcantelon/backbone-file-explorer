function testDirs() {

  var dir = new fileBrowser.Directory({
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

function moveHandler(move) {
  // only allow files to be dropped onto the #dest instance
  if (move.self.id == 'dest') {
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
  } else {
    alert("You're only allowed to drop into the rightmost file explorer.");
  }
}

function source() {

  var dir = testDirs();

  var fileExplorer = new fileBrowser.FileExplorer({
    el:                $('#source'),
    directory:         dir,
    levelTemplate:     $('#template-dir-level').html(),
    entryTemplate:     $('#template-dir-entry').html(),
    closeDirsByDefault: true,
    moveHandler: moveHandler
  });

  return fileExplorer;
}

function dest() {

  var dir = testDirs();

  var fileExplorer = new fileBrowser.FileExplorer({
    el:                $('#dest'),
    directory:         dir,
    levelTemplate:     $('#template-dir-level').html(),
    entryTemplate:     $('#template-dir-entry').html(),
    closeDirsByDefault: true,
    moveHandler: moveHandler
  });

  return fileExplorer;
}
