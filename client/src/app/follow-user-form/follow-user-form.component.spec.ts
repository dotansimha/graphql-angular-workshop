import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUserFormComponent } from './follow-user-form.component';

describe('FollowUserFormComponent', () => {
  let component: FollowUserFormComponent;
  let fixture: ComponentFixture<FollowUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
