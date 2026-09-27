<script setup lang="ts">
import {
  CodeBracketIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
} from '@heroicons/vue/24/outline';

interface Project {
  key: 'collectibles' | 'sales';
  name: string;
  tagline: string;
  description: string;
  liveUrl: string;
  frontendRepo: string;
  backendRepo: string;
  tech: string[];
}

defineProps<{
  currentApp?: 'collectibles' | 'sales';
}>();

const GITHUB_PROFILE_URL = 'https://github.com/dpuetz';

const projects: Project[] = [
  {
    key: 'collectibles',
    name: 'Collectibles Antique Mall',
    tagline: 'A curated e-commerce catalog',
    description:
      'A full-stack storefront for browsing and managing an antique collectibles catalog.',
    liveUrl: 'https://takemetoyourdata.com/collectibles/home',
    frontendRepo: 'https://github.com/dpuetz/CollectiblesVueTypescript',
    backendRepo: 'https://github.com/dpuetz/CollectiblesVueApi',
    tech: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'C# / .NET API'],
  },
  {
    key: 'sales',
    name: 'Sales App',
    tagline: 'A sales tracking & reporting tool',
    description:
      'A sales management app for tracking transactions, customers, and reporting.',
    liveUrl: 'https://takemetoyourdata.com/salesUI/',
    frontendRepo: 'https://github.com/dpuetz/SalesVue',
    backendRepo: 'https://github.com/dpuetz/SalesAPI',
    tech: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'C# / .NET API'],
  },
];
</script>

<template>
  <div v-fade-in class="page-background">
    <div class="page-container-xl pt-10 pb-16">

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-2xl sm:text-4xl lg:text-5xl headerMargins">
          My <span class="text-primary">Portfolio</span>
        </h1>
        <p class="text-base sm:text-xl text-gray-600 font-light max-w-2xl mx-auto mt-4">
          Full-stack apps built with Vue and C# / .NET — live demos and source code below.
        </p>
      </div>

      <!-- Project Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="project in projects" :key="project.key" class="relative flex flex-col rounded-2xl border border-gray-200 bg-white/60
                 backdrop-blur-md shadow-lg p-6 lg:p-8 transition-all duration-300
                 hover:shadow-xl hover:-translate-y-1">
          <!-- Title + "You're here" badge -->
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-xl lg:text-2xl font-semibold text-gray-900">
              {{ project.name }}
            </h2>
            <span v-if="currentApp === project.key" class="shrink-0 whitespace-nowrap text-xs font-semibold text-primary
                     bg-primary/10 rounded-full px-3 py-1">
              You're here
            </span>
          </div>
          <p class="text-sm font-medium text-primary mt-1">
            {{ project.tagline }}
          </p>
          <p class="text-base text-gray-600 leading-relaxed mt-3">
            {{ project.description }}
          </p>

          <!-- Tech badges -->
          <div class="flex flex-wrap gap-2 mt-4">
            <span v-for="tech in project.tech" :key="tech"
              class="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1">
              {{ tech }}
            </span>
          </div>

          <!-- Links -->
          <div class="flex flex-col gap-3 mt-6">
            <a :href="project.liveUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-md gap-2">
              <GlobeAltIcon class="w-5 h-5" />
              View Live App
            </a>
            <div class="flex flex-col lg:flex-row gap-3">
              <a :href="project.frontendRepo" target="_blank" rel="noopener noreferrer"
                class="btn btn-outline-primary btn-md gap-2">
                <CodeBracketIcon class="w-5 h-5" />
                Frontend Repo
              </a>
              <a :href="project.backendRepo" target="_blank" rel="noopener noreferrer"
                class="btn btn-outline-primary btn-md gap-2">
                <CodeBracketIcon class="w-5 h-5" />
                API Repo
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer link -->
      <div class="text-center mt-12">
        <a :href="GITHUB_PROFILE_URL" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm font-medium text-gray-600
                 hover:text-primary transition-colors">
          View all repos on GitHub
          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
</template>