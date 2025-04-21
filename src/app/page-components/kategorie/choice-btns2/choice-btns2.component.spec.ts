import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceBtns2Component } from './choice-btns2.component';

describe('ChoiceBtns2Component', () => {
  let component: ChoiceBtns2Component;
  let fixture: ComponentFixture<ChoiceBtns2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceBtns2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoiceBtns2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
