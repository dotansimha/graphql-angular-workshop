import gql from 'graphql-tag';

export const FollowMutation = gql`
  mutation follow($login: String!) {
    follow(login: $login) {
      id
      name
      login
    }
  }`;
