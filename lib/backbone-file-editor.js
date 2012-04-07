var File = Backbone.Model.extend({});

var Directory = Backbone.Model.extend({
  initialize: function() {
    this.children = [];
  },

  addChild: function(name) {
    var child = new File(name);
    this.children.push(child);
    return child;
  },

  addChildDir: function(name) {
    var child = new Directory(name);
    this.children.push(child);
    return child;
  }
});

var EntryView = Backbone.View.extend({

  initialize: function() {
    this.model = this.options.entry;
    this.template = this.options.template;
  },

  context: function() {
    var context = this.model.toJSON();
    context.icon = '';
    if (this.model.children != undefined) {
      context.icon = '(D)';
    }
    return context;
  },

  render: function() {
    var context = this.context()
      , html = this.template(context);

    this.el = $(html);

    var self = this;
    $(this.el).click(function() {
      $(self.el).next().toggle();
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
      , self = this
      , container = $(this.directoryTemplate());

    $(destEl).append(container);

    if (dir.children != undefined) {
      dir.children.map(function(child) {
        var entryView = new EntryView({
          entry: child,
          template: self.entryTemplate
        });
        $(container).append(entryView.render().el);
        self.appendChildElements(container, child, level + 1);
      });
    }
  },

  render: function() {
    var entryView = new EntryView({
      entry: this.model,
      template: this.entryTemplate
    });

    $(this.el)
      .empty()
      .append(entryView.render().el);

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

  render: function() {
    this.dirView = new DirectoryView({
      directory: this.directory,
      directoryTemplate: this.options.directoryTemplate,
      entryTemplate: this.options.entryTemplate
    });

    $(this.el)
      .empty()
      .append(this.dirView.render().el);

    return this;
  }
});
