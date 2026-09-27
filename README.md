# Collectibles E-Commerce Application

A modern, full-featured e-commerce application built with Vue 3, demonstrating best practices in modern web development. Created as a portfolio project to showcase Vue.js expertise.

## ⚠️ Before You Do Anything Else: Node.js Setup

This project requires **Node.js v24.16.0 exactly**. Using a different version is the most common cause of install and build failures.

If you use [nvm](https://github.com/nvm-sh/nvm) (recommended), run these two commands first:

```sh
nvm install 24.16.0
nvm use 24.16.0
```

- `nvm install 24.16.0` downloads and installs Node v24.16.0 if you don't already have it.
- `nvm use 24.16.0` switches your active session to that version.

Verify the active version before continuing:

```sh
node --version   # must print v24.16.0
```

Once you're on the correct Node version, install dependencies:

```sh
npm install
```

> **Don't have nvm?** Install it from https://github.com/nvm-sh/nvm before proceeding.

---

## 🎯 Project Purpose

This application serves as a demonstration of:

- Complex state management with Pinia
- User authentication and role-based access control
- Multi-step form workflows (checkout process)
- Responsive design across all device sizes
- Form validation with Vuelidate
- Component composition and reusability
- Testing with Vitest

## 🛠️ Technology Stack

### Core Framework

- **Vue 3** (v3.5.24) - Progressive JavaScript framework using Composition API
- **Vue Router** (v4.6.3) - Official routing library
- **Pinia** (v3.0.4) - State management store
- **Vite** (v7.2.4) - Next generation build tool

### UI & Styling

- **Tailwind CSS** (v3.4.18) - Utility-first CSS framework
- **Heroicons** (v2.2.0) - Beautiful hand-crafted SVG icons
- **Vue3 Snackbar** (v2.5.2) - Toast notification system

### Validation & Forms

- **Vuelidate** (v2.0.3) - Model-based validation library
- **Card Validator** (v10.0.3) - Credit card number validation

### Testing & Development

- **Vitest** (v0.32.4) - Blazing fast unit test framework
- **Vue Test Utils** (v2.4.6) - Official testing utility library
- **@vitest/ui** (v0.32.4) - Interactive test UI
- **@vitest/coverage-v8** (v0.33.0) - Code coverage reporting

## 🚀 Getting Started

### Prerequisites

- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test.ui

# Run tests with coverage
npm run test.coverage
```

## 📁 Project Structure

```
collectibles-cld/
├── src/
│   ├── assets/              # Images and static assets
│   ├── components/          # Reusable Vue components
│   │   ├── NavBar.vue
│   │   ├── Tooltip.vue
│   │   ├── ValidationMessage.vue
│   │   ├── Address.vue
│   │   ├── CartEmpty.vue
│   │   ├── ProgressBar.vue
│   │   └── Totals.vue
│   ├── composables/         # Composition API composables
│   ├── directives/          # Custom Vue directives
│   ├── lookup/             # Static lookup data (states, months, etc.)
│   ├── models/             # Data models and types
│   ├── pages/              # Route page components
│   │   ├── HomePage.vue
│   │   ├── CatalogPage.vue
│   │   ├── DetailsPage.vue
│   │   ├── CartPage.vue
│   │   ├── AdminPage.vue
│   │   ├── EditPage.vue
│   │   ├── LoginPage.vue
│   │   ├── AboutPage.vue
│   │   ├── NotFoundPage.vue
│   │   ├── UnauthorizedPage.vue
│   │   └── checkout/       # Multi-step checkout flow
│   │       ├── ShippingPage.vue
│   │       ├── PaymentPage.vue
│   │       ├── ReviewPage.vue
│   │       └── CompletePage.vue
│   ├── router/             # Vue Router configuration
│   │   ├── routes.ts       # Route definitions
│   │   └── router.ts       # Router instance
│   ├── stores/             # Pinia state stores
│   │   ├── cartStore.ts    # Shopping cart state
│   │   ├── userStore.ts    # User authentication state
│   │   └── productsStore.ts # Product catalog state
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── public/                 # Static public assets
├── .clinerules            # Claude Code project rules
├── claude.md              # This file
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vitest.config.ts       # Vitest testing configuration
```

## ✨ Key Features

### 🏪 Product Catalog

- Browse collectibles by category
- Dynamic image carousel on homepage
- Filter products by category
- Detailed product view pages

### 🛒 Shopping Cart

- Add/remove items from cart
- Adjust quantities
- Real-time cart count badge with animations
- Persistent cart storage
- Cart total calculations

### 👤 User Authentication

- Secure login system
- Role-based access control (user/admin)
- Protected routes requiring authentication
- User session management

### 💳 Multi-Step Checkout

1. **Shipping** - Address and delivery information
2. **Payment** - Credit card details with validation
3. **Review** - Order summary before submission
4. **Complete** - Order confirmation

### 🔐 Admin Panel

- Product inventory management
- Full CRUD operations (Create, Read, Update, Delete)
- Image URL management
- Category assignment
- Protected with admin role requirement

### 📱 Responsive Design

- Mobile-first approach
- Hamburger menu for mobile navigation
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### ℹ️ About Page

- Project documentation
- Technology stack showcase
- Feature highlights
- Purpose and context for interviewers

## 🗄️ State Management

### Cart Store (`useCartStore`)

- Cart items and quantities
- Add/remove/update cart operations
- Calculate totals
- Checkout functionality
- Clear cart

### User Store (`useUserStore`)

- Current user information
- Login/logout operations
- Role checking (user/admin)
- Authentication state

### Products Store (`useProductsStore`)

- Product catalog
- Category filtering
- Search functionality
- Product CRUD operations

## 🎨 Styling Conventions

### Tailwind CSS Patterns

- **Primary Colors**: `bg-primary`, `text-primary`, `border-primary`
- **Lighter Variants**: `bg-primary/80`, `text-primary/80`
- **Opacity Variants**: `bg-primary/10`, `bg-primary/5`
- **Gradients**: `bg-linear-to-br`, `bg-linear-to-r`
- **Shadows**: `shadow-lg`, `shadow-xl`, `hover:shadow-xl`
- **Rounded Corners**: `rounded-xl`, `rounded-2xl`, `rounded-full`
- **Transitions**: `transition-all duration-300`, `hover:scale-105`

### Responsive Breakpoints

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

## 🧪 Testing

- `.test.ts` files in `tests/` subdirectories
- Type all test variables (stores, routers, wrappers)

Tests are written using Vitest and Vue Test Utils:

```bash
# Run all tests
npm run test

# Run tests with interactive UI
npm run test.ui

# Generate coverage report
npm run test.coverage
```

## 📝 Code Style

### Vue Components

- `<script setup lang="ts">` with Composition API
- Typed `ref()`, `reactive()`, and computed properties
- Template → Script → Style order
- Explicit types for props, emits, and complex state

### TypeScript

- Strict mode enabled
- ES6+ features (arrow functions, destructuring, spread)
- `const` over `let`, never `var`
- Type inference preferred, explicit types for clarity
- `interface` for objects, `type` for unions
- Properly typed composables

### Example Component Structure

```vue
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <button @click="handleClick" class="btn-primary">Click Me</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';

const router = useRouter();
const cartStore = useCartStore();

const title = ref('Welcome');
const count = ref(0);

const handleClick = (): void => {
  count.value++;
};
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors;
}
</style>
```

## 🔒 Security Considerations

- Input validation on all forms
- Role-based access control
- Protected admin routes
- XSS prevention through Vue's template escaping
- Card number validation before submission

## 🎯 Development Guidelines

1. **Follow Existing Patterns** - Maintain consistency with established code patterns
2. **Component Reusability** - Use existing components before creating new ones
3. **State Management** - Use appropriate Pinia store for global state
4. **Routing** - Use `RouterLink` for internal navigation
5. **Validation** - Implement Vuelidate for form validation
6. **Testing** - Write tests for complex logic and components
7. **Accessibility** - Maintain semantic HTML and ARIA attributes
8. **Performance** - Use lazy loading for routes when appropriate

## 📚 Learning Resources

This project demonstrates:

- **Composition API** patterns in Vue 3
- **Pinia** for state management
- **Vue Router** navigation guards and meta fields
- **Vuelidate** form validation
- **Tailwind CSS** utility-first styling
- **Vitest** component testing
- **Multi-step forms** and workflows
- **Role-based authentication**
- **TypeScript**

## 🤝 Contributing

This is a demonstration project for portfolio purposes. When extending or modifying:

1. Follow the established code style
2. Update tests as needed
3. Maintain responsive design
4. Keep components focused and reusable
5. Document new features in this file

## 📄 License

This is a demonstration/portfolio project. Use as reference for learning purposes.

## 👨‍💻 Author

Created as a demonstration project showcasing Vue 3 and modern web development practices.

---

**Note**: This application is designed as a reference implementation and portfolio piece. It demonstrates best practices in Vue 3 development including state management, routing, validation, testing, and responsive design.
