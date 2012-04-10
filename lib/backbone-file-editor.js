var File = Backbone.Model.extend({});

var Directory = Backbone.Model.extend({
  initialize: function() {
    this.children = [];
    this.cssClass = 'directory';
  },

  addChild: function(options, Type) {
    var child = new Type(options)
      , parent = this.get('parent');

    if (parent != undefined) {
      parent += '/' + this.get('name');
    } else {
      parent = this.get('name');
    }
    child.set({parent: parent});

    this.children.push(child);
    return child;
  },

  addFile: function(options) {
    return this.addChild(options, File);
  },

  addDir: function(options) {
    return this.addChild(options, Directory);
  }
});

var EntryView = Backbone.View.extend({

  initialize: function() {
    this.model = this.options.entry;
    this.className = (this.model.children != undefined)
      ? 'directory'
      : 'directory-file';
    this.template = this.options.template;
  },

  context: function() {
    var context = this.model.toJSON();
    context.icon = '';
    context.className = this.className;
    if (this.model.children != undefined) {
      context.icon = '(D)';
    }
    return context;
  },

  render: function() {
    var context = this.context()
      , html = this.template(context);

    this.el = $(html);
    $(this.el).addClass(this.className);

    var self = this;
    $(this.el).children('.directory_icon_button').click(function() {
      $(self.el).next().toggle();
      if ($(self.el).next().is(':visible')) {
        $(self.el).addClass('directory_open');
      } else {
        $(self.el).removeClass('directory_open');
      }
    });

    return this;
  }
});

var DirectoryView = Backbone.View.extend({

  tagName: 'div',

  initialize: function() {
    this.model = this.options.directory;
    this.directoryTemplate = _.template(this.options.directoryTemplate);
    this.entryTemplate = _.template(this.options.entryTemplate);
  },

  appendChildElements: function(destEl, dir, level) {
    var level = level || 1
      , container = $(this.directoryTemplate());

    $(destEl).append(container);

    if (dir.children != undefined) {
      for (var index in dir.children) {
        var child = dir.children[index];
        var entryView = new EntryView({
          entry: child,
          template: this.entryTemplate
        });
        var entryEl = entryView.render().el;
        if (child.children != undefined) {
          $(entryEl).addClass('directory_open');
        }
        $(container).append(entryEl);
        this.appendChildElements(container, child, level + 1);
      }
    }
  },

  render: function() {
    var entryView = new EntryView({
      entry: this.model,
      template: this.entryTemplate
    });

    var entryEl = entryView.render().el;
    $(entryEl).addClass('directory_open');

    $(this.el)
      .empty()
      .append(entryEl);

    this.appendChildElements(this.el, this.model);

    return this;
  }
});

var FileExplorer = Backbone.View.extend({

  tagName: 'div',

  initialize: function() {
    this.directory = this.options.directory;
    //_.bindAll(this, 'render');
    this.render();
  },

  // convert JSON structure to entry objects
  structureToObjects: function(structure, base) {
    if (structure.children != undefined) {
      base.set({name: structure.name});
      for (var index in structure.children) {
        var child = structure.children[index];
        if (child.children != undefined) {
          var parent = new Directory({name: child.name});
          parent = this.structureToObjects(child, parent);
          base.children.push(parent);
        } else {
          base.addFile({name: child.name});
        }
      }
    } else {
      base.addFile(structure.name);
    }

    return base;
  },

  render: function() {
    var directory = this.directory;

    // if a JSON directory structure has been provided, render it
    // into entry objects
    if(this.options.structure) {
      directory = this.structureToObjects(
        this.options.structure,
        new Directory
      );
    }

    this.dirView = new DirectoryView({
      directory: directory,
      directoryTemplate: this.options.directoryTemplate,
      entryTemplate: this.options.entryTemplate
    });

    $(this.el)
      .empty()
      .append(this.dirView.render().el);

    return this;
  }
});
