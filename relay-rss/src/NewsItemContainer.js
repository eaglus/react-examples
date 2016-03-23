import React from 'react';
import Relay from 'react-relay';
import NewsItem from './NewsItem';
import ReadNewsItemMutation from './mutations/ReadNewsItemMutation';

const NewsItemWrap = React.createClass({
  render() {
    const newsById = this.props.viewer.newsById;
    const newsItem = _.assign({}, newsById || {}, {mode: 'full'});
    return <NewsItem {...newsItem} />;
  },

  componentDidMount() {
    const mutation = new ReadNewsItemMutation({newsItem: this.props.viewer.newsById});
    Relay.Store.commitUpdate(mutation);
    console.log('handleNewsItemEnter', this);
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
          content,
          readCount,
           ${ReadNewsItemMutation.getFragment('newsItem')}
        }
      }
    `
  }
});

export default NewsItemContainer;
