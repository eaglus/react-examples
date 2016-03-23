import _ from 'lodash';
import React from 'react';
import Relay from 'react-relay';

import NewsList from './NewsList';

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
          content,
          readCount
        }
      }
    `
  }
});

export default NewsListContainer;
