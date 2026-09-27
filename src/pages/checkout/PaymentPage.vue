<script setup lang="ts">

import { watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import Address from '@/components/Address.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import Totals from '@/components/Totals.vue';
import months from '@/constants/months';
import CartEmpty from '@/components/CartEmpty.vue';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useProgressStore } from '@/stores/progressStore';
import { useCartStore } from '@/stores/cartStore';

//initializers
const checkoutStore = useCheckoutStore();
const { shipping, billing, creditCard } = storeToRefs(checkoutStore);
const progressStore = useProgressStore();
const cartStore = useCartStore();
const router = useRouter();

//computed
const hasCartItems = computed(() => cartStore.cart.length > 0);

//actions
watch(  // when checkbox is toggled on
  () => billing.value.sameAsShipping,
  (same) => {
    if (same) {
      billing.value.fullName = shipping.value.fullName;
      billing.value.company = shipping.value.company;
      Object.assign(billing.value.address, shipping.value.address);
    }
  }
);

const years = Array.from({ length: 10 }, (_, i) => i + new Date().getFullYear());

async function onSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  router.push({ name: 'review' });
}

onMounted(() => {
  progressStore.setStepById(2);
  creditCard.value.cardNumber = '4111111111111111'; //set this default because is a demo app
});

//validation
import { required, minLength, maxLength, numeric } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import ValidationMessage from '@/components/ValidationMessage.vue';
import creditCardValid from '@/validators/creditCardValidator';

const creditCardRules = {
  cardNumber: { required, creditCardValid },
  cardHolder: { required, minLength: minLength(5) },
  exMonth: { required },
  exYear: { required },
  cvv: { required, numeric, minLength: minLength(3), maxLength: maxLength(4) },
};

const v$ = useVuelidate(creditCardRules, creditCard);
const isValid = computed(() => !v$.value.$invalid);

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">

      <!-- if no items in cart -->
      <div v-if="!hasCartItems" class="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <CartEmpty>Payment</CartEmpty>
      </div>

      <div v-else>

        <form novalidate @submit.prevent="onSubmit">
          <div class="mb-6">
            <ProgressBar />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 mt-6">

            <div id="colLeft">

              <div class="card-modern">

                <h2 class="headerMargins">
                  <span class="titleGradient">
                    Payment
                  </span>
                </h2>

                <div>
                  <label for="cardNumber">Card Number</label>
                  <input v-model="v$.cardNumber.$model" type="text" class="form-input" id="cardNumber" />
                  <validationMessage :model="v$.cardNumber" />

                  <label for="cardHolder">Name on Card</label>
                  <input v-model="v$.cardHolder.$model" type="text" class="form-input" id="cardHolder" />
                  <validationMessage :model="v$.cardHolder" />
                </div>

                <!-- credit-card-3cols-div -->
                <div class="grid grid-cols-1  sm:grid-cols-3 sm:gap-2" id="credit-card-3cols-div">
                  <div>
                    <label for="exMonth" class="text-lg sm:text-sm">Expiration Month</label>
                    <select v-model="v$.exMonth.$model" class="form-input" id="exMonth">
                      <option v-for="month in months" :key="month.number" :value="month.number">
                        {{ month.name }}
                      </option>
                    </select>
                    <validationMessage :model="v$.exMonth" />
                  </div>

                  <div>
                    <label for="exYear" class="text-lg sm:text-sm">Expiration Year</label>
                    <select v-model="v$.exYear.$model" class="form-input" id="exYear">
                      <option v-for="year in years" :key="year">
                        {{ year }}
                      </option>
                    </select>
                    <validationMessage :model="v$.exYear" />
                  </div>

                  <div>
                    <label for="cvv" class="text-lg sm:text-sm">CVV</label>
                    <input v-model="v$.cvv.$model" id="cvv" class="form-input" type="text" />
                    <validationMessage :model="v$.cvv" />
                  </div>
                </div>
              </div>

              <div id="billing-address-div" class="mt-6 lg:mt-8">
                <Address :model="billing" :is-disabled="billing.sameAsShipping">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h2 class="headerMargins">
                      <span class="titleGradient">
                        Billing Address
                      </span>
                    </h2>
                    <label class="inline-flex items-center gap-2 text-sm sm:text-base cursor-pointer
                      hover:text-primary transition-colors duration-200">
                      <input type="checkbox" class="form-checkbox" v-model="billing.sameAsShipping" />
                      <span>Same as shipping</span>
                    </label>
                  </div>
                </Address>
              </div>

            </div>

            <div id="colRight" class="sticky top-4 self-start">
              <div class="card-modern mb-6">
                <Totals />
              </div>

              <button type="submit" class="btn btn-primary btn-md w-full" :disabled="!isValid">
                Next
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  </div>

</template>
