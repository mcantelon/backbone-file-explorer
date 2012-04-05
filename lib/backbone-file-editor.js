var FileExplorer = Backbone.View.extend({

  tagName: 'div',

  initialize: function() {
    //_.bindAll(this, 'render');
    this.render();
  },

  render: function() {
    $(this.el).text('ho ho ho');
    return this;
  }
});

