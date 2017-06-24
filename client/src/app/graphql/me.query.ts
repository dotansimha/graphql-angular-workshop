import gql from 'graphql-tag';

export const MeQuery = gql`
  query Me($page: Int!, $perPage: Int!) {
    me {
      id
      followingCount
      following(page: $page, perPage: $perPage) {
        name
        login
      }
    }
  }
  `;
