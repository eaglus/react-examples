import Relay from 'react-relay';

class ReadNewsItemMutation extends Relay.Mutation {
  static fragments = {
    newsItem: () => Relay.QL`
      fragment on NewsItem {
        id,
        type {
          name,
          id
        },
        title,
        content,
        readCount
      }
    `
  };

  getMutation() {
    return Relay.QL`mutation { readNews }`;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        newsItem: this.props.newsItem.id
      }
    }];
  }

  getFatQuery() {
    return Relay.QL`
      fragment on ReadNewsItemPayload @relay(pattern: true) {
        newsItem {
          readCount
        }
      }
    `;
  }

  getVariables() {
    return {newsItemId: this.props.newsItem.id};
  }
}

export default ReadNewsItemMutation;
