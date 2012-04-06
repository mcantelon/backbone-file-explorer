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
    this.template = _.template(this.options.template);
  },

  childrenToHtml: function(dir, level) {
    var level = level || 1
      , self = this;

    dir.children.map(function(child) {
      var context = self.entryContext(child);
      for (var index = 0; index < level; index++) {
        context.padding += '-';
      }
      $(self.el).append(self.template(context));
      self.childrenToHtml(child, level + 1);
    });
  },

  entryContext: function(model) {
    var context = model.toJSON();
    context.padding = '';
    return context;
  },

  render: function() {

    $(this.el).empty();

    $(this.el).append(this.template(this.entryContext(this.model)));
    $(this.el).append(this.childrenToHtml(this.model));

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
    $(this.el).empty();
    this.dirView = new DirectoryView({
      directory: this.directory,
      template: this.options.directoryTemplate
    });
    $(this.el).append(this.dirView.render().el);
    return this;
  }
});
