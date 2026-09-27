<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import Address from '@/components/Address.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import Totals from '@/components/Totals.vue';
import CartEmpty from '@/components/CartEmpty.vue';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useProgressStore } from '@/stores/progressStore';
import { useCartStore } from '@/stores/cartStore';

//initializers
const router = useRouter();
const checkoutStore = useCheckoutStore();
const { shipping } = storeToRefs(checkoutStore);
const progressStore = useProgressStore();
const cartStore = useCartStore();

//computed
const hasCartItems = computed<boolean>(() => cartStore.cart.length > 0);

//actions
onMounted(() => {
  progressStore.setStepById(1);
});

function onSubmit() {
  if (!isValid.value) return;
  router.push({ name: 'payment' });
}

//validation
import { required, minLength } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

const rules = {
  fullName: { required, minLength: minLength(5) },
  company: { minLength: minLength(3) },
  address: {
    address1: { required, minLength: minLength(10) },
    address2: {},
    cityTown: { required, minLength: minLength(5) },
    stateProvince: { required },
    postalCode: { required, minLength: minLength(5) }
  }
};

const v$ = useVuelidate(rules, shipping);
const isValid = computed(() => !v$.value.$invalid);

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">

      <!-- if no items in cart -->
      <div v-if="!hasCartItems" class="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <CartEmpty>Shipping Address</CartEmpty>
      </div>
      <div v-else>
        <form novalidate @submit.prevent="onSubmit">

          <div class="mb-6">
            <ProgressBar />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 mt-6">

            <div id="shipping-address-div">
              <Address :model="shipping">

                <h2 class="headerMargins">
                  <span class="titleGradient">
                    Shipping Address
                  </span>
                </h2>
              </Address>
            </div>
            <div id="colRight" class="sticky top-4 self-start">
              <div class="card-modern mb-6">
                <div>
                  <Totals />
                </div>
              </div>
              <div>
                <button type="submit" class="btn btn-primary btn-md w-full" :disabled="!isValid">
                  Next
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
