var Reflux = require('reflux');
var _ = require('lodash');
var loadEntities = require('../entityLoaders').load;

var Actions = Reflux.createActions({
	"loadAutocomplete": {children: ["completed","failed"]}
});

Actions.loadAutocomplete.listen(function(entity, filter, filterField, realm) {
	function completed(data) {
		Actions.loadAutocomplete.completed({
			data: data,
			filter: filter,
			filterField: filterField,
			entity: entity,
			realm: realm
		});
	}

	function failed(error) {
		Actions.loadAutocomplete.failed({
			error: error,
			entity: entity,
			realm: realm
		});
	}

	loadEntities(entity, filter).then(completed).catch(failed);
});

function filterAutocomplete(entity, realm, fn) {
	return function(data) {
		if (((entity === undefined) || (entity === data.entity)) &&
	      ((realm === undefined) || (realm === data.realm)))
		{
			var isNew = !_.find(data.data, function(item) {
				return item[data.filterField] === data.filter;
			});
			var response = data.data;
			var newItem;
			if (isNew) {
				newItem = {id: 'new'};
				newItem[data.filterField] = data.filter;
				response = [newItem].concat(response);
			}
			fn.call(this, response);
		}
	};
}

module.exports = {
	actions: Actions,
	filterAutocomplete: filterAutocomplete
};
