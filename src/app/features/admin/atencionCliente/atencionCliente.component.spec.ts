import { ComponentFixture, TestBed } from '@angular/core/testing';

import { atencionClienteComponent } from './atencionCliente.component';

describe('Clientes', () => {
  let component: atencionClienteComponent;
  let fixture: ComponentFixture<atencionClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [atencionClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(atencionClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
