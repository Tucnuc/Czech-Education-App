import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hard2Component } from './hard2.component';

describe('Hard2Component', () => {
  let component: Hard2Component;
  let fixture: ComponentFixture<Hard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hard2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
