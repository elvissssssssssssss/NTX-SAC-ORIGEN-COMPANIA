import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoExitosocomponent } from './pago-exitoso.component';

describe('PagoExitoso', () => {
  let component: PagoExitosocomponent;
  let fixture: ComponentFixture<PagoExitosocomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoExitosocomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoExitosocomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
