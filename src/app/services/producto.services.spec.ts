import { TestBed } from '@angular/core/testing';

import { ProductoServices } from './producto.services';

describe('ProductoServices', () => {
  let service: ProductoServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
