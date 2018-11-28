import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseGroupsComponent } from './choose-groups.component';

describe('ChooseGroupsComponent', () => {
  let component: ChooseGroupsComponent;
  let fixture: ComponentFixture<ChooseGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
