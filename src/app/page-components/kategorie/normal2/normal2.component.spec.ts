import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Normal2Component } from './normal2.component';

describe('Normal2Component', () => {
  let component: Normal2Component;
  let fixture: ComponentFixture<Normal2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Normal2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Normal2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
