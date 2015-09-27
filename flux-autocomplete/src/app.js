var React = require('react');
var _ = require('lodash');
var Reflux = require('Reflux');
var validation = require('react-validation-mixin');

var appStore = require('./stores/appStore');
var contractEditStore = require('./stores/contractEditStore');
var contractEditActions = require('./actions/contractEdit');
var autoCompleteActions = require('./actions/autocomplete');
var loadAutocomplete = autoCompleteActions.actions.loadAutocomplete;
var autocomplete = require('./views/autocomplete');

loadAutocomplete('user', '', 'contractEdit');

let App = React.createClass({
  mixins: [Reflux.connect(appStore)],

  getInitialState () {
    return appStore.state;
  },

  render () {
    var contractEdit = this.state.contractEdit;
    var userId = contractEdit.userId;
    var selectedUser;

    if (userId) {
      selectedUser = <div>
        <div>Выбран пользователь: {contractEdit.userFullName}</div>
        <div>Id пользователя: {contractEdit.userId}</div>
      </div>;
    }

    return (
      <div>
        <h1>Async Data</h1>

        {autocomplete({
          items: contractEdit.userList,
          itemValueField: 'fullName',
          onSelect: (_, item) => { contractEditActions.setUser(item) },
          onChange: (event, value) => { loadAutocomplete('user', value, 'fullName', 'contractEdit') }
        })}

        {selectedUser}
      </div>
    )
  }
});

let AppValidated = App;

React.render(<AppValidated/>, document.getElementById('container'));
