// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/views/HomeView.vue"),
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
    path: "/map",
    name: "Map",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "map" */ "@/views/MapView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
