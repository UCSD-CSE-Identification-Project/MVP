import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchTerminalComponent } from './match-terminal.component';

describe('MatchTerminalComponent', () => {
  let component: MatchTerminalComponent;
  let fixture: ComponentFixture<MatchTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
