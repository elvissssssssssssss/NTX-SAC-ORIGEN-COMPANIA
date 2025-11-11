import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { CartComponent } from '../pages/cart/cart.component';

describe('Cart', () => {
  let service: CartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
