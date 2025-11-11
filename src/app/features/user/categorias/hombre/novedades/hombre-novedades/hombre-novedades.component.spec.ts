import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HombreNovedadescomponent } from './hombre-novedades.component';

describe('HombreNovedades', () => {
  let component: HombreNovedadescomponent;
  let fixture: ComponentFixture<HombreNovedadescomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HombreNovedadescomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HombreNovedadescomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
