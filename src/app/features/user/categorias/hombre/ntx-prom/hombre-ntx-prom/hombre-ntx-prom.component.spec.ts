import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HombreNtxPromcomponent } from './hombre-ntx-prom.component';

describe('HombreNtxProm', () => {
  let component: HombreNtxPromcomponent;
  let fixture: ComponentFixture<HombreNtxPromcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HombreNtxPromcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HombreNtxPromcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
