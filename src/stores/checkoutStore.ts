import { defineStore } from 'pinia';
import { BillingModel, ShippingModel, CreditCardModel } from '@/models/checkout';

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    billing: new BillingModel(),
    shipping: new ShippingModel(),
    creditCard: new CreditCardModel(),
    error: '' as string,
  }),
});
