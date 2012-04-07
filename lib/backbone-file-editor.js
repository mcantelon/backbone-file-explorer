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
    this.template = _.template(this.options.template);
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

    $(this.el).click(function() {
      $(this.el).next().toggle();
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

  makeEntryEl: function(context) {
    var html = this.entryTemplate(context)
      , entryEl = $(html);

    $(entryEl).click(function() {
      $(entryEl).next().toggle();
    });

    return entryEl;
  },

  childrenToHtml: function(destEl, dir, level) {
    var level = level || 1
      , self = this
      , container = $(this.directoryTemplate());

    $(destEl).append(container);

    if (dir.children != undefined) {
      dir.children.map(function(child) {
        var context = self.entryContext(child);
        $(container).append(self.makeEntryEl(context));
        self.childrenToHtml(container, child, level + 1);
      });
    }
  },

  entryContext: function(entry) {
    var context = entry.toJSON();
    context.icon = '';
    if (entry.children != undefined) {
      context.icon = '(D)';
    }
    return context;
  },

  render: function() {

    var parentEl = $(this.makeEntryEl(this.entryContext(this.model)));

    $(this.el)
      .empty()
      .append(parentEl);

    this.childrenToHtml(this.el, this.model);

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
