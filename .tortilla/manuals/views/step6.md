# Step 6: Pagination

Our last step of the tutorial is to add pagination (load more) feature to the list.

So let's add the basics of pagination - we need an indication for the current page, the amount of items to load per page, and we need to add it to the GraphQL Query so we can pass these variables from the client to the server.

Our GraphQL API can also tell us the total amount of items (called `followingCount`), so we will also add this field in our Query, and use it's value to show/hide the "load more" button.

[{]: <helper> (diffStep 6.1)

#### Step 6.1: Added pagination basics

##### Changed client&#x2F;src&#x2F;app&#x2F;follow-list&#x2F;follow-list.component.ts
```diff
@@ -4,6 +4,8 @@
 ┊ 4┊ 4┊import { MeQuery } from '../graphql/me.query';
 ┊ 5┊ 5┊import 'rxjs/add/operator/map';
 ┊ 6┊ 6┊
+┊  ┊ 7┊const PER_PAGE = 10;
+┊  ┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: 'app-follow-list',
 ┊ 9┊11┊  templateUrl: './follow-list.component.html',
```
```diff
@@ -11,6 +13,7 @@
 ┊11┊13┊})
 ┊12┊14┊export class FollowListComponent implements OnInit {
 ┊13┊15┊  private items$: Observable<any>;
+┊  ┊16┊  private currentPage: number = 1;
 ┊14┊17┊
 ┊15┊18┊  constructor(private apollo: Apollo) {
 ┊16┊19┊  }
```
```diff
@@ -18,6 +21,10 @@
 ┊18┊21┊  ngOnInit() {
 ┊19┊22┊    this.items$ = this.apollo.watchQuery<any>({
 ┊20┊23┊      query: MeQuery,
+┊  ┊24┊      variables: {
+┊  ┊25┊        perPage: PER_PAGE,
+┊  ┊26┊        page: this.currentPage,
+┊  ┊27┊      },
 ┊21┊28┊    }).map(({ data }) => data.me);
 ┊22┊29┊  }
 ┊23┊30┊}
```

##### Changed client&#x2F;src&#x2F;app&#x2F;graphql&#x2F;me.query.ts
```diff
@@ -1,10 +1,11 @@
 ┊ 1┊ 1┊import gql from 'graphql-tag';
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊export const MeQuery = gql`
-┊ 4┊  ┊  query Me {
+┊  ┊ 4┊  query Me($page: Int!, $perPage: Int!) {
 ┊ 5┊ 5┊    me {
 ┊ 6┊ 6┊      id
-┊ 7┊  ┊      following {
+┊  ┊ 7┊      followingCount
+┊  ┊ 8┊      following(page: $page, perPage: $perPage) {
 ┊ 8┊ 9┊        name
 ┊ 9┊10┊        login
 ┊10┊11┊      }
```

[}]: #

Now, all we have to do is to add a "load more" button to the template, that triggers a class method. And we also need to hide this button when there are no more items to load.

Apollo-client API allows us to use our existing query and execute `fetchMore` with new variables, and then to get more data.

We can also use the new data with a mechanism called `updateQuery` (the same as `updateQueries` we used in step 5) to patch the cache and append the new page of data.

[{]: <helper> (diffStep 6.2)

#### Step 6.2: Implemented pagination and load more

##### Changed client&#x2F;src&#x2F;app&#x2F;follow-list&#x2F;follow-list.component.html
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊<ul>
 ┊2┊2┊  <app-follow-list-item *ngFor="let item of (items$ | async)?.following" [user]="item"></app-follow-list-item>
-┊3┊ ┊</ul>🚫↵
+┊ ┊3┊</ul>
+┊ ┊4┊<button *ngIf="hasMoreToLoad" (click)="loadMore()">load more</button>🚫↵
```

##### Changed client&#x2F;src&#x2F;app&#x2F;follow-list&#x2F;follow-list.component.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Observable } from 'rxjs';
 ┊3┊2┊import { Apollo } from 'apollo-angular';
 ┊4┊3┊import { MeQuery } from '../graphql/me.query';
+┊ ┊4┊import update from 'immutability-helper';
 ┊5┊5┊import 'rxjs/add/operator/map';
 ┊6┊6┊
 ┊7┊7┊const PER_PAGE = 10;
```
```diff
@@ -12,8 +12,9 @@
 ┊12┊12┊  styleUrls: ['./follow-list.component.css']
 ┊13┊13┊})
 ┊14┊14┊export class FollowListComponent implements OnInit {
-┊15┊  ┊  private items$: Observable<any>;
+┊  ┊15┊  private items$: any;
 ┊16┊16┊  private currentPage: number = 1;
+┊  ┊17┊  private hasMoreToLoad: boolean = false;
 ┊17┊18┊
 ┊18┊19┊  constructor(private apollo: Apollo) {
 ┊19┊20┊  }
```
```diff
@@ -26,5 +27,36 @@
 ┊26┊27┊        page: this.currentPage,
 ┊27┊28┊      },
 ┊28┊29┊    }).map(({ data }) => data.me);
+┊  ┊30┊
+┊  ┊31┊    this.items$.subscribe(({ followingCount }) => {
+┊  ┊32┊      this.hasMoreToLoad = this.currentPage * PER_PAGE < followingCount;
+┊  ┊33┊    });
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  loadMore() {
+┊  ┊37┊    if (!this.hasMoreToLoad) {
+┊  ┊38┊      return;
+┊  ┊39┊    }
+┊  ┊40┊
+┊  ┊41┊    this.currentPage = this.currentPage + 1;
+┊  ┊42┊
+┊  ┊43┊    this.items$.fetchMore({
+┊  ┊44┊      variables: {
+┊  ┊45┊        page: this.currentPage,
+┊  ┊46┊      },
+┊  ┊47┊      updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult: any }) => {
+┊  ┊48┊        if (!fetchMoreResult.me) {
+┊  ┊49┊          return prev;
+┊  ┊50┊        }
+┊  ┊51┊
+┊  ┊52┊        return update(prev, {
+┊  ┊53┊          me: {
+┊  ┊54┊            following: {
+┊  ┊55┊              $push: fetchMoreResult.me.following,
+┊  ┊56┊            },
+┊  ┊57┊          }
+┊  ┊58┊        });
+┊  ┊59┊      }
+┊  ┊60┊    })
 ┊29┊61┊  }
 ┊30┊62┊}
```

[}]: #

As you can see, we are using the Query result now for another use: subscribing to Query data changes and check `followingCount` every time the data changes, and update the class property `hasMoreToLoad` (which show/hide the "load more" button).


[{]: <helper> (navStep)

| [< Previous Step](step5.md) |
|:----------------------|

[}]: #
