var Directory = Backbone.Model.extend({
  initialize: function() {
    this.children = [];
  },

  addChildDir: function(name) {
    var child = new Directory(name);
    this.children.push(child);
    return child;
  },
});

var DirectoryView = Backbone.View.extend({

  tagName: 'div',

  initialize: function() {
    this.model = this.options.directory;
    this.directoryTemplate = _.template(this.options.directoryTemplate);
    this.entryTemplate = _.template(this.options.entryTemplate);
  },

  childrenToHtml: function(destEl, dir, level) {
    var level = level || 1
      , self = this
      , container = $(this.directoryTemplate());

    $(destEl).append(container);

    dir.children.map(function(child) {
      var context = self.entryContext(child);
      $(container).append(self.entryTemplate(context));
      self.childrenToHtml(container, child, level + 1);
    });
  },

  entryContext: function(model) {
    var context = model.toJSON();
    return context;
  },

  render: function() {

    $(this.el)
      .empty()
      .append(this.entryTemplate(this.entryContext(this.model)));

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
