import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProgressStore = defineStore('progress', () => {
  const currentStep = ref<number>(1);
  function setStepById(val: number) {
    currentStep.value = [1, 2, 3, 4].includes(val) ? val : 1;
  }

  return { currentStep, setStepById };
});
