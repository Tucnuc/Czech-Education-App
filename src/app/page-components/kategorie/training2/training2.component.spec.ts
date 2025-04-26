import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Training2Component } from './training2.component';

describe('Training2Component', () => {
  let component: Training2Component;
  let fixture: ComponentFixture<Training2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Training2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Training2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
