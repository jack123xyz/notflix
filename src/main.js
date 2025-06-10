import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.js";
import { createPinia } from "pinia";
import "swiper/css";
import "swiper/css/navigation";
import { useUserStore } from "./stores/user";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");

setTimeout(() => {
  const store = useUserStore();
  store.init();
}, 0);
