import _ from 'lodash';
import React from 'react';

const PropTypes = React.PropTypes;

const TypeSelect = React.createClass({
  propTypes: {
    types: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      selected: PropTypes.boolean
    })).isRequired,
    onToggleType: PropTypes.func
  },

  getDefaultProps: function() {
    return {
      propTypes: [],
      onToggleType: () => {}
    };
  },

  render() {
    const toggleType = (name) => {
      const mapFn = (type) => type.name === name ? _.assign({}, type, {selected: !type.selected}) : type;
      this.props.onToggleType(_.map(this.props.types, mapFn));
    };

    const makeButton = ({name, selected}) => {
      const className = "btn btn-default" + (selected ? ' active' : '');
      return <div key={name} className={className} onClick={() => toggleType(name)}>{name}</div>
    };
    const buttons = _.map(this.props.types, makeButton);

    return <div className="btn-group" >
      {buttons}
    </div>;
  }
});

export default TypeSelect;
