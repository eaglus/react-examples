var Reflux = require('Reflux');

var StateMixin = require('reflux-state-mixin')(Reflux);
var autoCompleteActions = require('../actions/autocomplete');
var contractEditActions = require('../actions/contractEdit');
var loadAutocomplete = autoCompleteActions.actions.loadAutocomplete;
var filterAutocomplete = autoCompleteActions.filterAutocomplete;

var contractEditStore = Reflux.createStore({
  mixins: [StateMixin],

  listenables: {
    loadAutocomplete: loadAutocomplete,
    setUser: contractEditActions.setUser
  },

  getInitialState: function() {
    return {
      userFullName: '',
      userId: null,
      userList: []
    };
  },

  onLoadAutocompleteCompleted: filterAutocomplete('user', 'contractEdit', function(data) {
    this.setState({
      userList: data
    });
  }),

  onSetUser: function(user) {
    this.setState({
      userId: user.id,
      userFullName: user.fullName
    });
  }
});

module.exports = contractEditStore;
