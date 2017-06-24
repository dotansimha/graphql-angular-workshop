import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.css']
})
export class FollowListComponent implements OnInit {
  private items$: Observable<any>;

  constructor() { }

  ngOnInit() {
    this.items$ = Observable.of([
      {
        name: 'Dotan',
        login: 'dotansimha',
      },
    ]);
  }
}
