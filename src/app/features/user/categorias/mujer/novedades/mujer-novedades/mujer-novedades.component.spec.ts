import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MujerNovedadesComponent } from './mujer-novedades.component';

describe('MujerNovedades', () => {
  let component: MujerNovedadesComponent;
  let fixture: ComponentFixture<MujerNovedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MujerNovedadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MujerNovedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
