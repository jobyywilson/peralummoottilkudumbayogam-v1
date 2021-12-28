import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenealogyComponent } from './genealogy.component';

describe('GenealogyComponent', () => {
  let component: GenealogyComponent;
  let fixture: ComponentFixture<GenealogyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenealogyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenealogyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
