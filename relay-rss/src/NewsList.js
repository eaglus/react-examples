import _ from 'lodash';
import React from 'react';

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

    const renderNewsItem = (newsItem, i) => {
      const withMode = _.assign({}, newsItem, {mode: 'short'});
      return <li key={i}><NewsItem {...withMode}/></li>;//TODO: NewsItemContainer сюда
    };

    return <div>
      <TypeSelect types={newsTypes} onToggleType={onToggleType}/>
      <ul>
        {_.map(viewer.newsByTypes, renderNewsItem)}
      </ul>
    </div>;
  }
});

export default NewsList;
