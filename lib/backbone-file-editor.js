var FileExplorer = Backbone.View.extend({

  tagName: 'div',

  initialize: function() {
_.bindAll(this, 'render');
    this.render();
  },

  render: function() {
alert(this.el);
    $(this.el).text('ho ho ho');
alert($(this.el).html());
    return this;
  }
});

