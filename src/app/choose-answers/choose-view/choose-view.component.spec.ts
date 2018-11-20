import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseViewComponent } from './choose-view.component';

describe('ChooseViewComponent', () => {
  let component: ChooseViewComponent;
  let fixture: ComponentFixture<ChooseViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
