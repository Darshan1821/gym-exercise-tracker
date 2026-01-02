import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayDetailDialogComponent } from './day-detail-dialog.component';

describe('DayDetailDialogComponent', () => {
  let component: DayDetailDialogComponent;
  let fixture: ComponentFixture<DayDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
