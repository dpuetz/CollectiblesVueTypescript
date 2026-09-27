import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    requiresLogin?: boolean;
    requiresRole?: string;
    hideNavbar?: boolean;
  }
}
