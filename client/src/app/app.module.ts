import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FollowListItemComponent } from './follow-list-item/follow-list-item.component';
import { FollowListComponent } from './follow-list/follow-list.component';
import { ApolloModule } from 'apollo-angular';
import { provideClient } from './apollo/client';
import { FollowUserFormComponent } from './follow-user-form/follow-user-form.component';

@NgModule({
  declarations: [
    AppComponent,
    FollowListItemComponent,
    FollowListComponent,
    FollowUserFormComponent
  ],
  imports: [
    BrowserModule,
    ApolloModule.forRoot(provideClient)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
