<script setup lang="ts">
import { computed } from 'vue';
import { useProgressStore } from '@/stores/progressStore';
import type { ProgressStep } from '@/models/progressStep';

const progressStore = useProgressStore();

// typed steps
const steps: ProgressStep[] = [
  { stepNumber: 1, stepName: 'Shipping' },
  { stepNumber: 2, stepName: 'Payment' },
  { stepNumber: 3, stepName: 'Review' },
  { stepNumber: 4, stepName: 'Complete' },
];

//computed
const liArray = computed<ProgressStep[]>(() =>
  steps.map((s) => {
    let stepClass = '';

    if (s.stepNumber < progressStore.currentStep || progressStore.currentStep === 4) {
      stepClass = 'completed';
    } else if (s.stepNumber === progressStore.currentStep) {
      stepClass = 'active';
    }

    return { ...s, className: stepClass };
  })
);
</script>
<template>
  <div class="text-center mb-6">
    <div class="progress-bar-modern">
      <ol>
        <li v-for="step in liArray" :key="step.stepNumber" :class="[step.className, 'capitalize']"
          :data-test="`step-${step.stepNumber}`">
          {{ step.stepName }}
        </li>
      </ol>
    </div>
  </div>
</template>



<style scoped>
@reference "@/assets/main.css";

.progress-bar-modern {
  @apply inline-flex gap-0 text-gray-700;
  counter-reset: step;
}

.progress-bar-modern li {
  @apply relative text-center flex-1 inline-block text-xs sm:text-sm w-16 sm:w-20 z-10;
}

.progress-bar-modern li::before {
  @apply block w-6 h-6 sm:w-7 sm:h-7 leading-6 sm:leading-7 rounded-full bg-white border-2 border-primary mx-auto mb-1 text-xs transition-all duration-300;
  counter-increment: step;
  content: counter(step);
}

.progress-bar-modern li.active::before {
  @apply bg-primary text-white font-semibold shadow-md scale-110;
}

.progress-bar-modern li:not(:last-child)::after {
  @apply absolute top-3 sm:top-3.5 left-1/2 w-full h-0.5 bg-primary -z-10 transition-all duration-300;
  content: '';
}

.progress-bar-modern li.completed::before {
  @apply bg-primary text-white font-bold shadow-lg;
  content: "✓";
}
</style>