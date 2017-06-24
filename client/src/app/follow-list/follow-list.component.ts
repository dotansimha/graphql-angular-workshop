import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { MeQuery } from '../graphql/me.query';
import update from 'immutability-helper';
import 'rxjs/add/operator/map';

const PER_PAGE = 10;

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.css']
})
export class FollowListComponent implements OnInit {
  private items$: any;
  private currentPage: number = 1;
  private hasMoreToLoad: boolean = false;

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

    this.items$.subscribe(({ followingCount }) => {
      this.hasMoreToLoad = this.currentPage * PER_PAGE < followingCount;
    });
  }

  loadMore() {
    if (!this.hasMoreToLoad) {
      return;
    }

    this.currentPage = this.currentPage + 1;

    this.items$.fetchMore({
      variables: {
        page: this.currentPage,
      },
      updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult: any }) => {
        if (!fetchMoreResult.me) {
          return prev;
        }

        return update(prev, {
          me: {
            following: {
              $push: fetchMoreResult.me.following,
            },
          }
        });
      }
    })
  }
}
