import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutTypeSheetComponent } from './workout-type-sheet.component';

describe('WorkoutTypeSheetComponent', () => {
  let component: WorkoutTypeSheetComponent;
  let fixture: ComponentFixture<WorkoutTypeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutTypeSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutTypeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
