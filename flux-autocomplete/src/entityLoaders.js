var _ = require('lodash');

var entityMap = {
	user: '/rest/users',
	contract: '/rest/contracts'
};

var testUsers = [
	{id: 0, fullName: 'Иван Петрович Иванов'},
	{id: 1, fullName: 'Николай Алексеевич Некрасов'},
	{id: 2, fullName: 'Александр Сергеевич Пушкин'},
	{id: 3, fullName: 'Михаил Афанасьевич Булгаков'},
	{id: 4, fullName: 'Виктор Олегович Пелевин'},
	{id: 5, fullName: 'Василий Иванович Чапаев'},
	{id: 6, fullName: 'Григорий Иванович Котовский'}
];

function filterDelayed(arr, field, filter) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(!filter ? arr : _.filter(arr, function(v) {
				return v[field].toLowerCase().indexOf(filter.toLowerCase()) !== -1;
			}));
		}, 300);
	});
}

module.exports = {
	load: function(entity, filter) {
		if (entity === 'user') {
			return filterDelayed(testUsers, 'fullName', filter);
		}
	}
};
