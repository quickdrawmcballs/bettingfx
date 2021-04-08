import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorManagerComponent } from './error-manager.component';

describe('ErrorManagerComponent', () => {
  let component: ErrorManagerComponent;
  let fixture: ComponentFixture<ErrorManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
