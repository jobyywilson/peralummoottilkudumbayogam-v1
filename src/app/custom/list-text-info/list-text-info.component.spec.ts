import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTextInfoComponent } from './list-text-info.component';

describe('ListTextInfoComponent', () => {
  let component: ListTextInfoComponent;
  let fixture: ComponentFixture<ListTextInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListTextInfoComponent]
    });
    fixture = TestBed.createComponent(ListTextInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
