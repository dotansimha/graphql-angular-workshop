import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FollowMutation } from '../graphql/follow.mutation';

@Component({
  selector: 'app-follow-user-form',
  templateUrl: './follow-user-form.component.html',
  styleUrls: ['./follow-user-form.component.css']
})
export class FollowUserFormComponent implements OnInit {
  private usernameToFollow: string = '';
  private followResultMessage: string = '';

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
    }).subscribe(({ data: { follow } }) => {
      const { name, login } = follow;

      this.followResultMessage = `You are now following ${login}${name ? ` (${name})` : ''}!`;
      this.usernameToFollow = '';
    });
  }
}
