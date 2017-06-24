import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { MeQuery } from '../graphql/me.query';
import 'rxjs/add/operator/map';

const PER_PAGE = 10;

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.css']
})
export class FollowListComponent implements OnInit {
  private items$: Observable<any>;
  private currentPage: number = 1;

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
    this.items$ = this.apollo.watchQuery<any>({
      query: MeQuery,
      variables: {
        perPage: PER_PAGE,
        page: this.currentPage,
      },
    }).map(({ data }) => data.me);
  }
}
