import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceBtnsComponent } from './choice-btns.component';

describe('ChoiceBtnsComponent', () => {
  let component: ChoiceBtnsComponent;
  let fixture: ComponentFixture<ChoiceBtnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceBtnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoiceBtnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
