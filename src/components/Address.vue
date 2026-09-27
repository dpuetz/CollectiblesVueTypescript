<script setup lang="ts">
import states from '@/constants/states';
import { formatState } from '@/utils/stateName';
import { ShippingModel } from '@/models/checkout';

// props
const props = defineProps<{
  model: ShippingModel;
  isDisabled?: boolean;
}>();

// validation
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import ValidationMessage from '@/components/ValidationMessage.vue';

const rules = {
  fullName: { required, minLength: minLength(5) },
  company: { minLength: minLength(3) },
  address: {
    address1: { required, minLength: minLength(10) },
    address2: {},
    cityTown: { required, minLength: minLength(5) },
    stateProvince: { required },
    postalCode: { required, minLength: minLength(5) },
  },
};

const v$ = useVuelidate(rules, props.model) as any;
</script>

<template>
  <div class="card-modern">
    <div class="mb-4">
      <slot />
    </div>

    <label for="fullName" class="form-label">Full Name</label>
    <input v-model="v$.fullName.$model" type="text" id="fullName" :disabled="isDisabled" class="form-input" />
    <validationMessage :model="v$.fullName" />

    <label for="company" class="form-label">Company</label>
    <input v-model="v$.company.$model" type="text" id="company" :disabled="isDisabled" class="form-input" />
    <validationMessage :model="v$.company" />

    <label for="address1" class="form-label">Street Address</label>
    <input v-model="v$.address.address1.$model" type="text" id="address1" :disabled="isDisabled"
      class="form-input mb-2" />
    <validationMessage :model="v$.address.address1" />

    <input v-model="v$.address.address2.$model" type="text" id="address2" :disabled="isDisabled" class="form-input" />
    <validationMessage :model="v$.address.address2" />

    <label for="cityTown" class="form-label">City</label>
    <input v-model="v$.address.cityTown.$model" type="text" id="cityTown" :disabled="isDisabled" class="form-input" />
    <validationMessage :model="v$.address.cityTown" />

    <label for="stateProvince" class="form-label">State/Province</label>
    <select v-model="v$.address.stateProvince.$model" id="stateProvince" :disabled="isDisabled" class="form-select">
      <option v-for="state in states" :key="state.abbreviation" :value="state.abbreviation">
        {{ formatState(state) }}
      </option>
    </select>
    <validationMessage :model="v$.address.stateProvince" />

    <label for="postalCode" class="form-label">Postal Code</label>
    <input v-model="v$.address.postalCode.$model" id="postalCode" :disabled="isDisabled" class="form-input" />
    <ValidationMessage :model="v$.address.postalCode" />
  </div>
</template>
