<script setup lang="ts">

import {
  InformationCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  CubeIcon,
  SwatchIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CommandLineIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import TechItem from '@/components/TechItem.vue';
import FeatureCard from '@/components/FeatureCard.vue';

</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl">

      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          About <span class="text-primary">Collectibles</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 font-light max-w-3xl mx-auto">
          A modern e-commerce application showcasing Vue.js development expertise
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        <!-- Project Purpose Section -->
        <div class="bg-white rounded-2xl shadow-lg p-8 
            hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <InformationCircleIcon class="w-7 h-7 text-primary" />
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Project Purpose</h2>
          </div>

          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p class="text-base sm:text-lg">
              This application was created as a <strong class="text-primary">demonstration project</strong> for
              job interview purposes, showcasing modern web development practices and Vue.js expertise.
            </p>

            <p class="text-base sm:text-lg">
              The project demonstrates proficiency in building a full-featured e-commerce platform with:
            </p>

            <ul class="space-y-2 ml-4">
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Complex state management across multiple stores</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>User authentication and role-based access control</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Shopping cart and checkout flow</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Form validation and Go-style error handling</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Centralized error logging and monitoring with Sentry</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Responsive design for all device sizes</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                <span>Comprehensive testing with Vitest</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Technology Stack Section -->
        <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <CodeBracketIcon class="w-7 h-7 text-primary" />
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Technology Stack</h2>
          </div>

          <div class="space-y-6">
            <!-- Core Framework -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CubeIcon class="w-5 h-5 text-primary mr-2" />
                Core Framework
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="Vue 3" version="3.5.24" description="Progressive JavaScript framework" />
                <TechItem name="Vue Router" version="4.6.3" description="Official routing library" />
                <TechItem name="Pinia" version="3.0.4" description="State management" />
              </div>
            </div>

            <!-- Language -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CommandLineIcon class="w-5 h-5 text-primary mr-2" />
                Language
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="TypeScript" version="5.9.3" description="Typed superset of JavaScript" />
              </div>
            </div>

            <!-- UI & Styling -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <SwatchIcon class="w-5 h-5 text-primary mr-2" />
                UI & Styling
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="Tailwind CSS" version="4.3.3" description="Utility-first CSS framework" />
                <TechItem name="Heroicons" version="2.2.0" description="Beautiful hand-crafted SVG icons" />
                <TechItem name="Vue3 Snackbar" version="2.5.2" description="Notification system" />
              </div>
            </div>

            <!-- Validation -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <ShieldCheckIcon class="w-5 h-5 text-primary mr-2" />
                Validation
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="Vuelidate" version="2.0.3" description="Form validation library" />
                <TechItem name="Card Validator" version="10.0.3" description="Credit card validation" />
                <TechItem name="Zod" version="4.6.2" description="Schema validation for incoming API data" />
              </div>
            </div>

            <!-- Build Tools & Testing -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <WrenchScrewdriverIcon class="w-5 h-5 text-primary mr-2" />
                Build Tools & Testing
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="Vite" version="7.2.4" description="Next generation build tool" />
                <TechItem name="Vitest" version="4.0.18" description="Blazing fast unit test framework" />
                <TechItem name="Vue Test Utils" version="2.4.6" description="Official testing utility library" />
              </div>
            </div>

            <!-- Error Handling & Monitoring -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <ExclamationTriangleIcon class="w-5 h-5 text-primary mr-2" />
                Error Handling & Monitoring
              </h3>
              <div class="space-y-2 ml-7">
                <TechItem name="Sentry" version="10.73.0" description="Real-time error tracking and logging" />
              </div>
              <p class="text-sm text-gray-600 mt-2 ml-7">
                API and store actions return a <code class="text-primary">[data, error]</code> result tuple
                instead of throwing, following a Go-style error handling pattern for explicit,
                predictable control flow — with unexpected failures still captured and reported to Sentry.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Highlight -->
      <div class="mt-12 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 shadow-lg">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Key Features Implemented
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon="ShoppingBagIcon" title="Product Catalog"
            description="Browse and filter collectibles by category with dynamic image carousel" />
          <FeatureCard icon="ShoppingCartIcon" title="Shopping Cart"
            description="Add items to cart with real-time count updates and persistent storage" />
          <FeatureCard icon="UserCircleIcon" title="User Authentication"
            description="Secure login system with role-based access for admin features" />
          <FeatureCard icon="CreditCardIcon" title="Checkout Flow"
            description="Multi-step checkout with shipping, payment, and order review" />
          <FeatureCard icon="PencilSquareIcon" title="Admin Panel"
            description="Manage product inventory with create, read, update, and delete operations" />
          <FeatureCard icon="DevicePhoneMobileIcon" title="Responsive Design"
            description="Seamless experience across desktop, tablet, and mobile devices" />
        </div>
      </div>

      <!-- Call to Action -->
      <div class="mt-12 text-center">
        <div class="inline-flex flex-col sm:flex-row gap-4">
          <RouterLink :to="{ name: 'catalog' }" class="btn btn-primary btn-md">
            Browse Catalog
          </RouterLink>
          <RouterLink :to="{ name: 'portfolio' }" class="btn btn-outline-primary btn-md">
            <CodeBracketIcon class="w-6 h-6 mr-2" />
            View Portfolio
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
