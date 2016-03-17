import _ from 'lodash';
import React from 'react';
import Relay from 'react-relay';

import TypeSelect from './TypeSelect';
import NewsItem from './NewsItem';

const NewsList = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  render() {

    const router = this.context.router;
    const props = this.props;
    const viewer = props.viewer;
    const path = props.location.pathname;
    const selectedTypeNames = _.keyBy((props.location.query.types || '').split(','));
    const newsTypes = _.map(viewer.newsTypes, (type) => _.assign({}, type, {selected: selectedTypeNames.hasOwnProperty(type.name)}));

    const onToggleType = (types) => {
      const selectedTypes = _.map(_.filter(types, ({selected}) => !!selected), ({name}) => name).join(',');
      const newLocation = selectedTypes ? { pathname: path, query: {types: selectedTypes} } : path;

      router.push(newLocation);
    };

    const renderNewItem = (newsItem, i) => {
      const withMode = _.assign({}, newsItem, {mode: 'short'});
      return <li key={i}><NewsItem {...withMode}/></li>;
    };

    return <div>
      <TypeSelect types={newsTypes} onToggleType={onToggleType}/>
      <ul>
        {_.map(viewer.newsByTypes, renderNewItem)}
      </ul>
    </div>;
  }
});

const NewsListContainer = Relay.createContainer(NewsList, {
  initialVariables: {
    types: ''
  },

  prepareVariables: (prev) => {
    const typesArr = prev.types ? prev.types.split(',') : [];
    return _.assign({}, prev, {types: typesArr});
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        newsTypes {
          name,
          id
        },
        newsByTypes(types: $types) {
          id,
          type {
            name,
            id
          },
          title,
          content
        }
      }
    `
  }
});

export default NewsListContainer;
