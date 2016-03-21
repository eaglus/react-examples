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
        content
      }
    `,
  },

  getMutation() {
    return Relay.QL`mutation { readNews }`;
  }
}

export default ReadNewsItemMutation;
