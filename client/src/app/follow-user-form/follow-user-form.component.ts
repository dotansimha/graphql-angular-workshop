import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-follow-user-form',
  templateUrl: './follow-user-form.component.html',
  styleUrls: ['./follow-user-form.component.css']
})
export class FollowUserFormComponent implements OnInit {
  private usernameToFollow: string = '';

  constructor() { }

  ngOnInit() {
  }

  follow() {

  }
}
