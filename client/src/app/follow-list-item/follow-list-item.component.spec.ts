import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowListItemComponent } from './follow-list-item.component';

describe('FollowListItemComponent', () => {
  let component: FollowListItemComponent;
  let fixture: ComponentFixture<FollowListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
