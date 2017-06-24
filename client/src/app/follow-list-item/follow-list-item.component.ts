import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-follow-list-item',
  templateUrl: './follow-list-item.component.html',
  styleUrls: ['./follow-list-item.component.css']
})
export class FollowListItemComponent {
  @Input() user: any;
}
