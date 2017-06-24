import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FollowListItemComponent } from './follow-list-item/follow-list-item.component';
import { FollowListComponent } from './follow-list/follow-list.component';

@NgModule({
  declarations: [
    AppComponent,
    FollowListItemComponent,
    FollowListComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
