(function(exports) {

  exports.Data = {
    idPaths: {},
    startX: {},
    startY: {}
  };

  exports.File = Backbone.Model.extend({

    // generate id without slashes
    id: function() {
      return this.path().replace(/\//g, '_');
    },

    path: function() {
      return this.get('parent') + '/' + this.get('name');
    },

    type: function() {
      return (this.children == undefined) ? 'file' : 'directory';
    }
  });

  exports.Directory = exports.File.extend({
    initialize: function() {
      this.children = [];
      this.cssClass = 'backbone-file-explorer-directory';
    },

    addChild: function(options, Type) {
      var child = new Type(options)
        , parent = this.get('parent');

      parent = (parent != undefined)
        ? parent + '/' + this.get('name')
        : this.get('name');

      child.set({parent: parent});

      this.children.push(child);
      return child;
    },

    addFile: function(options) {
      return this.addChild(options, exports.File);
    },

    addDir: function(options) {
      return this.addChild(options, exports.Directory);
    }
  });

  exports.EntryView = Backbone.View.extend({

    initialize: function() {
      this.model = this.options.entry;
      this.parentId = this.options.parentId;
      this.className = (this.model.children != undefined)
        ? 'backbone-file-explorer-directory'
        : 'directory-file';
      this.template = this.options.template;
      this.nameClickHandler = this.options.nameClickHandler;
      this.actionHandlers = this.options.actionHandlers;
    },

    context: function() {
      var context = this.model.toJSON();
      context.className = this.className;
      return context;
    },

    render: function() {
      var context = this.context()
        , html = this.template(context);

      this.el = $(html);
      $(this.el).addClass(this.className);

      // set CSS ID for entries (used to capture whether directory is
      // open/closed by user between data refreshes, etc.)
      var id = (this.parentId) ? this.parentId + '_' : '';
      $(this.el).attr('id', id + this.model.id());

      // add click handler if specified
      if (this.nameClickHandler) {
        var self = this;
        $(this.el).children('.backbone-file-explorer-directory_entry_name').click(function() {
          self.nameClickHandler({
            path: self.model.path(),
            type: self.model.type()
          });
        });
      }

      // add action handlers
      if (this.actionHandlers) {
        for(var index in this.actionHandlers) {
          var handler = this.actionHandlers[index];
          var actionEl = $("<a class='actionHandler' href='#'>" + handler.iconHtml + "</a>")
            , self = this;
          // use closure to isolate handler logic
          (function(handler) {
            actionEl.click(function() {
              handler.logic({
                path: self.model.path(),
                type: self.model.type()
              });
            });
          })(handler);
          $(this.el).children('.backbone-file-explorer-directory_entry_actions').append(actionEl);
        }
      }

      if (this.model.children == undefined) {
        // remove directory button class for file entries
        $(this.el).children('.backbone-file-explorer-directory_icon_button').removeClass('backbone-file-explorer-directory_icon_button');
      } else {
        // add click handler to directory icon
        var self = this;
        $(this.el).children('.backbone-file-explorer-directory_icon_button').click(function() {
          $(self.el).next().toggle();
          if ($(self.el).next().is(':visible')) {
            $(self.el).addClass('backbone-file-explorer-directory_open');
          } else {
            $(self.el).removeClass('backbone-file-explorer-directory_open');
          }
        });
      }

      return this;
    }
  });

  exports.DirectoryView = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {
      this.model = this.options.directory;
      this.parentId = this.options.parentId;
      this.levelTemplate    = _.template(this.options.levelTemplate);
      this.entryTemplate    = _.template(this.options.entryTemplate);
      this.closeDirsByDefault = this.options.closeDirsByDefault;
      this.hideFiles        = this.options.hideFiles;
      this.nameClickHandler = this.options.nameClickHandler;
      this.actionHandlers   = this.options.actionHandlers;
    },

    renderChildren: function (self, entry, levelEl, level) {
      // if entry is a directory, render children to directory level
      if (entry.children != undefined) {

        for (var index in entry.children) {
          var child = entry.children[index];

          // if child is a directory or not hiding files, do
          if (child.children != undefined || self.hideFiles != true) {
            // take note of file paths that correspond to CSS IDs
            // so they can be referenced by any external logic
            var id = (this.parentId) ? this.parentId + '_' : '';
            id = id + child.id();
            exports.Data.idPaths[id] = child.path();

            // render entry
            var entryView = new exports.EntryView({
              parentId: self.parentId,
              entry: child,
              template: self.entryTemplate,
              nameClickHandler: self.nameClickHandler,
              actionHandlers: self.actionHandlers
            });

            var entryEl = entryView.render().el;

            // open directory, if applicable
            if (child.children != undefined && !self.closeDirsByDefault) {
              $(entryEl).addClass('backbone-file-explorer-directory_open');
            }

            // add entry to current directory livel
            $(levelEl).append(entryEl);

            // render child directories
            self.renderDirectoryLevel(levelEl, child, level + 1);

            // work around issue with certain edge-case
            if (
              self.closeDirsByDefault
              && child.children != undefined
              && (child.children.length == 0 || self.hideFiles)
            ) {
              $(entryEl).next().hide();
            }
          }
        }
      }
    },

    renderDirectoryLevel: function(destEl, entry, level) {
      var level = level || 1
        , levelEl = $(this.levelTemplate());

      $(destEl).append(levelEl);

      // if not the top-level directory and everything's closed by default, then
      // hide this directory level
      if (level > 1 && this.closeDirsByDefault) {
        $(destEl).hide();
      }

      // if directories are closed by default, be lazy and only load child
      // entries when user hovers over entry, indicating they might open it
      if (this.closeDirsByDefault) {
        var self = this
          , rendered = false;
        $(destEl).hover(function() {
          if (!rendered) {
            self.renderChildren(self, entry, levelEl, level);
            rendered = true;
          }
        });
      } else {
        this.renderChildren(this, entry, levelEl, level);
      }
    },

    render: function() {
      var entryView = new exports.EntryView({
        parentId: this.parentId,
        entry: this.model,
        template: this.entryTemplate
      });

      var entryEl = entryView.render().el;

      if (!this.closeDirsByDefault) {
        $(entryEl).addClass('backbone-file-explorer-directory_open');
      }

      $(this.el)
        .empty()
        .append(entryEl);

      this.renderDirectoryLevel(this.el, this.model);

      return this;
    }
  });

  exports.FileExplorer = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {
      this.directory = this.options.directory;
      this.structure = this.options.structure;
      this.moveHandler = this.options.moveHandler;

      this.id = $(this.el).attr('id');
      this.render();
      this.initDragAndDrag();
    },

    initDragAndDrag: function() {
      if (this.moveHandler) {
        // bind drag-and-drop functionality
        var self = this;
        $(this.el)
          .find('.backbone-file-explorer-directory:not(:first)')
          .bind('drag', {'self': self}, self.dragHandler);

        $(this.el)
          .find('.backbone-file-explorer-directory:not(:first)')
          .bind('drop', {'self': self}, self.dropHandler);
      }
    },

    // convert JSON structure to entry objects
    structureToObjects: function(structure, base) {
      if (structure.children != undefined) {
        base.set({name: structure.name});
        if (structure.parent != undefined) {
          base.set({parent: structure.parent});
        }
        for (var index in structure.children) {
          var child = structure.children[index];
          if (child.children != undefined) {
            var parent = base.addDir({name: child.name});
            parent = this.structureToObjects(child, parent);
          } else {
            base.addFile({name: child.name});
          }
        }
      } else {
        base.addFile(structure.name);
      }

      return base;
    },

    busy: function() {
      $(this.el).append('<span id="backbone-file-explorer-busy-text">Loading...</span>');
      $(this.el).addClass('backbone-file-explorer-busy');
      $(this.el).removeClass('backbone-file-explorer-idle');
    },

    idle: function() {
      $('#backbone-file-explorer-busy-text').remove();
      $(this.el).addClass('backbone-file-explorer-idle');
      $(this.el).removeClass('backbone-file-explorer-busy');
    },

    snapShotToggledFolders: function() {
      this.toggled = [];
      var self = this;
      $('.directory').each(function(index, value) {
        if (!$(value).next().is(':visible')) {
          self.toggled.push($(value).attr('id'));
        }
      }); 
    },

    restoreToggledFolders: function() {
      for (var index in this.toggled) {
        var cssId = this.toggled[index],
            toggleEl = $('#' + cssId);

        toggleEl.next().toggle();
        if (toggleEl.next().is(':visible')) {
          togglEl.addClass('backbone-file-explorer-directory_open');
       } else {
          toggleEl.removeClass('backbone-file-explorer-directory_open');
        }
     }
    },

    dragHandler: function(event) {
      var id = event.currentTarget.id
        , $el = $('#' + event.currentTarget.id)
        , offsets = $el.offset();

      if (exports.Data.startY[id] == undefined) {
       exports.Data.startX[id] = offsets.left;
       exports.Data.startY[id] = offsets.top;
      }

      $el.css({'z-index': 1});
      $el.css({left: event.offsetX - exports.Data.startX[id]});
      $el.css({top: event.offsetY - exports.Data.startY[id]});
    },

    dropHandler: function(event) {
      var droppedId   = event.dragTarget.id;
      var containerId = event.dropTarget.id;
      var self = event.data.self;

      if (droppedId != containerId) {
        var droppedPath = exports.Data.idPaths[droppedId];
        var containerPath = exports.Data.idPaths[containerId];
        var moveAllowed = containerPath.indexOf(droppedPath) != 0;
        self.moveHandler({
          'self': self,
          'droppedPath': droppedPath,
          'containerPath': containerPath,
          'allowed': moveAllowed
        });
      }
      $('#' + droppedId).css({left: 0});
      $('#' + droppedId).css({top: 0});
    },

    render: function() {
      var directory = this.directory;

      // if a JSON directory structure has been provided, render it
      // into entry objects
      if(this.structure) {
        directory = this.structureToObjects(
          this.structure,
          new exports.Directory
        );
      }

      var toggledFolders = this.snapShotToggledFolders();

      this.dirView = new exports.DirectoryView({
        parentId: this.id,
        directory: directory,
        levelTemplate: this.options.levelTemplate,
        entryTemplate: this.options.entryTemplate,
        closeDirsByDefault: this.options.closeDirsByDefault,
        hideFiles: this.options.hideFiles,
        nameClickHandler: this.options.nameClickHandler,
        actionHandlers: this.options.actionHandlers
      });

      $(this.el)
        .empty()
        .append(this.dirView.render().el);

      this.restoreToggledFolders();

      $('.backbone-file-explorer-entry:odd').addClass('backbone-file-explorer-entry-odd');

      return this;
    }
  });
})(typeof exports === 'undefined' ? this['fileBrowser'] = {} : exports);
