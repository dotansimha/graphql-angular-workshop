import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import update from 'immutability-helper';
import { FollowMutation } from '../graphql/follow.mutation';

@Component({
  selector: 'app-follow-user-form',
  templateUrl: './follow-user-form.component.html',
  styleUrls: ['./follow-user-form.component.css']
})
export class FollowUserFormComponent implements OnInit {
  private usernameToFollow: string = '';

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
  }

  follow() {
    if (this.usernameToFollow === '') {
      return;
    }

    this.apollo.mutate<any>({
      mutation: FollowMutation,
      variables: {
        login: this.usernameToFollow,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        follow: {
          __typename: 'User',
          id: '',
          name: '',
          login: this.usernameToFollow,
        },
      },
      updateQueries: {
        Me: (prev, { mutationResult }: { mutationResult: any }) => {
          const result = mutationResult.data.follow;

          return update(prev, {
            me: {
              following: {
                $push: [result]
              },
            },
          });
        },
      }
    }).subscribe(() => {
      this.usernameToFollow = '';
    });
  }
}
