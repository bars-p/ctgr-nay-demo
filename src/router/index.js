// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Main",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/views/MainView.vue"),
    props: { mode: "base" },
    // component: () => import("@/layouts/default/DefaultView.vue"),

    // children: [
    //   {
    //     path: "",
    //     name: "Home",
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () =>
    //       import(/* webpackChunkName: "home" */ "@/views/HomeView.vue"),
    //   },
    //   // {
    //   //   path: "map",
    //   //   name: "Map",
    //   //   // route level code-splitting
    //   //   // this generates a separate chunk (about.[hash].js) for this route
    //   //   // which is lazy-loaded when the route is visited.
    //   //   component: () =>
    //   //     import(/* webpackChunkName: "map" */ "@/views/MapView.vue"),
    //   // },
    // ],
  },
  {
    path: "/social",
    name: "Social",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "social" },
  },
  {
    path: "/demand",
    name: "Demand",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "demand" },
  },
  {
    path: "/routes",
    name: "Routes",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "routes" },
  },
  // {
  //   path: "/stops",
  //   name: "Stops",
  //   component: () =>
  //     import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
  //   props: { mode: "stops" },
  // },
  {
    path: "/sites",
    name: "Sites",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "sites" },
  },
  {
    path: "/connectivity",
    name: "Connectivity",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "connectivity" },
  },
  {
    path: "/access",
    name: "Accessability",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "access" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MainView.vue"),
    props: { mode: "base" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
