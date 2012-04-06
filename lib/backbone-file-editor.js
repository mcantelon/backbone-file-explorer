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

  initialize: function(directory) {
    this.model = directory;
  },

  childrenToHtml: function(dir, level) {
    var html = ''
      , level = level || 0
      , self = this;

    dir.children.map(function(child) {
      for (var index = 0; index < level; index++) {
        html += '-';
      }
      html += child.get('name') + '<br>';
      html += self.childrenToHtml(child, level + 1);
    });

    return html;
  },

  render: function() {

    $(this.el).empty();

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
    this.dirView = new DirectoryView(this.directory);
    $(this.el).append(this.dirView.render().el);
    return this;
  }
});
