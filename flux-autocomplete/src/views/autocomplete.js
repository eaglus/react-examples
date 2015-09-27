var React = require('react');
var Autocomplete = require('react-autocomplete');
var _ = require('lodash');

var styles = {
  item: {
    padding: '2px 6px',
    cursor: 'default'
  },

  highlightedItem: {
    color: 'white',
    background: 'hsl(200, 50%, 50%)',
    padding: '2px 6px',
    cursor: 'default'
  },

  newItem: {
    fontStyle: 'italic',
    color: 'gray',
    borderBottomStyle: 'solid',
    borderBottomWidth: 'thin'
  },

  menu: {
    border: 'solid 1px #ccc'
  }
};

function getStyle(item, isHighlighted) {
  var result = isHighlighted ? styles.highlightedItem : styles.item;
  if (item.id === 'new') {
    result = _.merge({}, result, styles.newItem);
  }
  return result;
}

function renderItem(item, isHighlighted) {
  return <div style={getStyle(item, isHighlighted)}  key={item.id} id={item.id}>{item.fullName}</div>;
}

module.exports = function(cfg) {
  return <Autocomplete
    items={cfg.items}
    getItemValue={ (item) => item[cfg.itemValueField] }
    onSelect={cfg.onSelect}
    onChange={cfg.onChange}
    renderItem={renderItem}
  />
};
