var Reflux = require('Reflux');
var contractEditStore = require('./contractEditStore');

var appStore = Reflux.createStore({
  state: {
  },

  init: function() {
    this.state.contractEdit = contractEditStore.state;
    this.listenTo(contractEditStore, (contractEdit) => {
      this.state.contractEdit = contractEdit;
      this.trigger(this.state);
    });
  }
});

module.exports = appStore;
