import React from 'react';
import Relay from 'react-relay';
import NewsItem from './NewsItem';
import ReadNewsItemMutation from './ReadNewsItemMutation';

const NewsItemWrap = React.createClass({
  render() {
    const newsItem = _.assign({}, this.props.viewer.newsById || {}, {mode: 'full'});
    return <NewsItem {...newsItem} />;
  }
});

const NewsItemContainer = Relay.createContainer(NewsItemWrap, {
  initialVariables: {
    id: ''
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        newsById(id: $id) {
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

function handleNewsItemEnter(id) {
  const mutation = new ReadNewsItemMutation({newsItemId: id});
  Relay.Store.commitUpdate(mutation);
  console.log('handleNewsItemEnter', this);
}

export default NewsItemContainer;
export {handleNewsItemEnter};
