import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileDaySheetComponent } from './mobile-day-sheet.component';

describe('MobileDaySheetComponent', () => {
  let component: MobileDaySheetComponent;
  let fixture: ComponentFixture<MobileDaySheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileDaySheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileDaySheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
