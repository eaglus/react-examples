import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
} from 'graphql-relay';

import api from './mockApi';
/**
* @typedef {{getAllTypes: function, getAllNews: function, getNewsByTypeNames: function, getNewsItemById: function, getTypeById: function, NewsType: function, NewsItem: function, Viewer: function, readNewsItem: function}}  DataApi
*/

  const {nodeInterface, nodeField} = nodeDefinitions(
    (globalId) => {
      const {type, id} = fromGlobalId(globalId);
      if (type === 'NewsType') {
        return api.getTypeById(id);
      } else if (type === 'NewsItem') {
        return api.getNewsItemById(id);
      } else if (type === 'Viewer') {
        return api.getViewer();
      }

      return null;
    },
    (obj) => {
      if (obj instanceof api.NewsType) {
        return GraphQLNewsType;
      } else if (obj instanceof api.NewsItem) {
        return GraphQLNewsItem;
      } else if (obj instanceof api.Viewer) {
        return GraphQLViewer;
      }

      return null;
    }
  );

  const GraphQLNewsType = new GraphQLObjectType({
    name: 'NewsType',
    fields: {
      id: globalIdField('NewsType'),
      name: {
        type: GraphQLString,
        resolve: (obj) => obj.name
      }
    },
    interfaces: [nodeInterface]
  });

  const GraphQLNewsItem = new GraphQLObjectType({
    name: 'NewsItem',
    fields: {
      id: globalIdField('NewsItem'),

      type: {
        type: GraphQLNewsType,
        resolve: (obj) => obj.type
      },

      title: {
        type: GraphQLString,
        resolve: (obj) => obj.title
      },
      content: {
        type: GraphQLString,
        resolve: (obj) => obj.content
      }
    },
    interfaces: [nodeInterface]
  });

  const GraphQLReadNewsItemMutation = mutationWithClientMutationId({
    name: 'ReadNewsItem',
    inputFields: {
      newsItemId: {
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    outputFields: {
      newsItem: {
        type: GraphQLNewsItem,
        resolve: ({id}) => api.getNewsItemById(fromGlobalId(id).id)
      }
    },
    mutateAndGetPayload: ({newsItemId}) => {
      api.readNewsItem(newsItemId);
      return {
        newsItemId: newsItemId
      };
    }
  });

  const GraphQLViewer = new GraphQLObjectType({
    name: 'Viewer',
    fields: {
      id: globalIdField('Viewer'),
      newsTypes: {
        type: new GraphQLList(GraphQLNewsType),
        args: {},
        resolve: () => api.getAllTypes()
      },
      newsByTypes: {
        type: new GraphQLList(GraphQLNewsItem),
        args: {
          types: {
            type: new GraphQLList(GraphQLString),
            defaultValue: []
          },
        },
        resolve: (viewer, {types}) => api.getNewsByTypeNames(types)
      },
      newsById: {
        type: GraphQLNewsItem,
        args: {
          id: {
            type: GraphQLString
          },
        },
        resolve: (viewer, {id}) => api.getNewsItemById(fromGlobalId(id).id)
      }
    },
    interfaces: [nodeInterface]
  });

  const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
      viewer: {
        type: GraphQLViewer,
        resolve: () => api.getViewer()
      },
      node: nodeField
    }
  });


export const schema = new GraphQLSchema({
  query: Query
});

export default schema;
