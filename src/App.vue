<template>
  <router-view />
</template>

<script>
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { useMovieStore } from "@/stores/movieStore";

export default {
  components: { Navbar },
  setup() {
    const route = useRoute();
    const movieStore = useMovieStore();
    movieStore.fetchGenres();

    const isHomePage = route.name === "Home";

    return { isHomePage };
  },
};
</script>
