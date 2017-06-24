const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  schema {
    query: Query
    mutation: Mutation
  }
  
  type Query {
    me: User
  }
  
  type Mutation {
    follow(login: String!): User
  }
  
  type User {
    id: ID!
    login: String!
    name: String
    followingCount: Int
    following(page: Int = 0, perPage: Int = 10): [User]
  }
`;

const resolvers = {
  Query: {
    me(_, args, { githubConnector, user }) {
      return githubConnector.getUserForLogin(user.login);
    }
  },
  User: {
    following(user, { page, perPage }, { githubConnector }) {
      return githubConnector.getFollowingForLogin(user.login, page, perPage)
        .then(users =>
          users.map(user => githubConnector.getUserForLogin(user.login))
        );
    },
    followingCount: user => user.following,
  }
};

const Schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = {
  Schema,
};
