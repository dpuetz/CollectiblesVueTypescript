import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import fadeIn from './directives/fadeIn';
import { createPinia } from 'pinia';
import './assets/main.css';
import { SnackbarService } from 'vue3-snackbar';
import 'vue3-snackbar/styles';
import * as Sentry from '@sentry/vue';

const pinia = createPinia();
const apiBase = import.meta.env.VITE_API_URL;
const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
const prodURI = import.meta.env.VITE_PROD_URL;
const app = createApp(App);

Sentry.init({
  app,
  dsn: sentryDSN,
  tunnel: `${apiBase}/sentry-tunnel`,
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  },
  integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],

  // Tracing
  // tracesSampleRate is for performance tracing.
  // Every route navigation, API call timing, and component render Sentry instruments gets bundled into a "transaction"
  // Capture 10% of the transactions with 0.1
  // sent with type = "transaction"
  tracesSampleRate: 0.1,

  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', prodURI],

  // Session Replay for normal, non-error sessions
  // This sets the sample rate at 10%. Change it to 100% while in development
  // and then sample at a lower rate (even to 0) in production. This is expensive.
  replaysSessionSampleRate: 0.1,

  // Most important for errors/debugging.
  // This is the rate at which true errors get a replay attached to it.
  // 1.0 is 100%
  replaysOnErrorSampleRate: 1.0,

  // 'development' vs 'production'. Can filter on this in the Sentry feed
  environment: import.meta.env.MODE,
});
app.directive('fade-in', fadeIn);
app.use(router);
app.use(pinia);
app.use(SnackbarService);
app.mount('#app');

// Sentry.init creates a app.config.errorHandler. The 'app.config.errorHandler' below overwrites
// the Sentry one, because it has the same name.
// That's why Sentry.captureException(err) is here.
app.config.errorHandler = (err, instance, info) => {
  console.error('Error is:', err, info);
  Sentry.captureException(err);
};
