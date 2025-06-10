<template>
  <div class="min-h-screen bg-black text-white">
    <div
      class="relative min-h-[700px] h-screen bg-cover bg-center"
      style="background-image: url('/hero-bg.jpg')"
    >
      <div
        class="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-transparent to-black/80"
      ></div>

      <div class="relative z-10">
        <header class="hidden xl:flex justify-between items-start px-8 py-4">
          <div class="flex-shrink-0">
            <img
              src="/NotflixLogo.png"
              alt="Notflix"
              class="h-34 md:h-50 w-auto"
            />
          </div>
          <div class="pt-6">
            <button
              @click="navigateToLogin(true)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-medium cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </header>

        <div class="xl:hidden relative">
          <div class="absolute top-4 right-4 z-20">
            <button
              @click="navigateToLogin(true)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-medium cursor-pointer"
            >
              Sign In
            </button>
          </div>
          
          <div class="flex justify-center pt-1 pb-0">
            <img
              src="/NotflixLogo.png"
              alt="Notflix"
              class="h-100 w-auto"
            />
          </div>
        </div>
      </div>

      <div
        class="relative z-10 max-w-5xl mx-auto px-4 pb-70 md:px-8 text-center flex flex-col items-center justify-center xl:h-[calc(100%-100px)] h-[calc(100%-200px)]"
      >
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-12">
          Unlimited movies, TV shows, and more
        </h1>
        <h2 class="text-xl md:text-2xl font-normal mb-8">
          Watch anywhere. Cancel anytime.
        </h2>
        <p class="text-lg md:text-xl mb-8">
          Ready to watch? Enter your email to create or restart your membership.
        </p>

        <div class="flex flex-col items-center">
          <button
            @click="navigateToSignup(true)"
            class="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4 rounded font-semibold flex items-center cursor-pointer"
          >
            Get Started <span class="ml-2">→</span>
          </button>
          <button
            @click="signInAsGuest"
            class="mt-6 bg-black/30 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded text-lg cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>

    <section class="border-t-8 border-neutral-800">
      <div class="max-w-7xl mx-auto py-16 md:py-24 px-4">
        <div
          class="flex flex-col md:flex-row items-center justify-between mb-16 pb-16 border-b border-neutral-800"
        >
          <div class="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 class="text-2xl md:text-4xl font-bold mb-4">
              Enjoy on your TV
            </h2>
            <p class="text-lg md:text-xl text-gray-300">
              Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV,
              Blu-ray players, and more.
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="https://placehold.co/600x400?text=TV"
              alt="TV"
              class="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        <div
          class="flex flex-col md:flex-row-reverse items-center justify-between mb-16 pb-16 border-b border-neutral-800"
        >
          <div class="md:w-1/2 mb-8 md:mb-0 md:pl-12">
            <h2 class="text-2xl md:text-4xl font-bold mb-4">
              Download your shows to watch offline
            </h2>
            <p class="text-lg md:text-xl text-gray-300">
              Save your favorites easily and always have something to watch.
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="https://placehold.co/600x400?text=Mobile"
              alt="Mobile"
              class="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 class="text-2xl md:text-4xl font-bold mb-4">
              Watch everywhere
            </h2>
            <p class="text-lg md:text-xl text-gray-300">
              Stream unlimited movies and TV shows on your phone, tablet,
              laptop, and TV.
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="https://placehold.co/600x400?text=Devices"
              alt="Devices"
              class="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    
    <section class="border-t-8 border-neutral-800 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-3xl md:text-5xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        

        <div class="text-center mt-12">
          <p class="text-lg mb-6">
            Ready to watch? Enter your email to create or restart your
            membership.
          </p>
          <button
            @click="navigateToSignup(true)"
            class="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4 rounded font-semibold cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  </div>
  <div class="footer bg-black pt-8 pb-16">
    <div class="max-w-7xl mx-auto border-t border-neutral-800 pt-8">
      <div class="footer-content text-netflix-gray-100">
        <ul class="flex flex-col items-center text-center justify-center space-y-4 p-4">
          <li><p>
            Not in any way associated with Netflix. For educational purposes only.
          </p></li>
          <li><p>
            Created by Jack Anderson
          </p></li>
          <li>
            <a href="https://github.com/jack123xyz" target="_blank"><img class="" src="@/assets/github-mark-white.svg" alt="GitHub Link"></img></a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";


const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(false);
const error = ref(null);

const navigateToLogin = (force = false) => {
  if (force) {
    router.replace({ path: '/login', query: { force: 'true' }});
  } else {
    router.push("/login");
  }
  
};

const navigateToSignup = (force = false) => {
  if (force) {
    router.replace({ path: '/signup', query: { force: 'true' }});
  } else {
    router.push("/signup");
  }
};

const signInAsGuest = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const button = document.querySelector('[class*="Continue as Guest"]');
    if (button) {
      button.innerHTML =
        '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Signing in...';
    }

    await userStore.signInAsGuest();

    router.push("/select-profile");
  } catch (err) {
    error.value = err.message || "Failed to sign in as guest";
    console.error("Guest sign-in error:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>
