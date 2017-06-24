import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { MeQuery } from '../graphql/me.query';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.css']
})
export class FollowListComponent implements OnInit {
  private items$: Observable<any>;

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
    this.items$ = this.apollo.watchQuery<any>({
      query: MeQuery,
    }).map(({ data }) => data.me);
  }
}
