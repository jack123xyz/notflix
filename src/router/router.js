import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase";
import SelectProfile from "../pages/SelectProfile.vue";
import Home from "../pages/Home.vue";
import TV from "../pages/TV.vue";
import Movies from "../pages/Movies.vue";
import Popular from "../pages/Popular.vue";
import Login from "../pages/Login.vue";
import Landing from "../pages/Landing.vue";
import Signup from "../pages/Signup.vue";
import MyList from "../pages/MyList.vue";
import Search from "../pages/Search.vue";

const routes = [
  {
    path: "/",
    name: "Root",
    component: Landing,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    meta: {
      requiresGuest: true,
    },
  },

  {
    path: "/select-profile",
    name: "SelectProfile",
    component: SelectProfile,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/browse",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/tv",
    name: "TV",
    component: TV,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/movies",
    name: "Movies",
    component: Movies,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/latest",
    name: "New and Popular",
    component: Popular,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/my-list",
    name: "My List",
    component: MyList,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.query.force === "true") {
    return next();
  }

  const waitForAuthReady = () => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  };

  const user = await waitForAuthReady();

  const isAuthenticated = user !== null;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  if (requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (requiresGuest && isAuthenticated) {
    next("/browse");
  } else {
    next();
  }
});

export default router;
