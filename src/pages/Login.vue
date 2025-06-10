<template>
  <div class="flex flex-col min-h-screen">
    <div
      class="flex-grow flex flex-col bg-[url('/netflixLinesBG.jpg')] bg-cover bg-center bg-no-repeat p-4 relative 2xl:min-h-screen 3xl:min-h-full"
    >
      <div class="hidden 2xl:block absolute top-0 left-50">
        <img
          src="/NotflixLogo.png"
          class="h-54 cursor-pointer"
          alt="Notflix Logo"
          @click="$router.push('/')"
        />
      </div>

      <div class="flex items-center justify-center w-full h-full my-auto">
        <div
          class="w-full max-w-lg rounded-md bg-black/90 px-8 sm:px-12 py-10 sm:py-16 mx-4 sm:mx-12 shadow-lg"
        >
          <div class="flex justify-center mb-8 2xl:hidden">
            <img
              src="/NotflixLogo.png"
              class="h-54 sm:h-52 cursor-pointer"
              alt="Notflix Logo"
              @click="$router.push('/')"
            />
          </div>

          <h2
            class="text-2xl sm:text-3xl font-bold text-white text-center 2xl:text-left mb-10"
          >
            Sign In
          </h2>

          <div v-if="error" class="mb-4 rounded bg-red-700/70 p-3 text-white">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="w-full rounded bg-zinc-800 p-4 text-white border-1 border-netflix-gray-50 focus:outline-none focus:ring-2 focus:ring-white"
                required
                @blur="validateEmail"
              />
              <div v-if="emailError" class="text-red-500 text-sm mt-1 pl-1">
                {{ emailError }}
              </div>
            </div>

            <div>
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="w-full rounded bg-zinc-800 p-4 text-white border-1 border-netflix-gray-50 focus:outline-none focus:ring-2 focus:ring-white"
                required
                @blur="validatePassword"
              />
              <div v-if="passwordError" class="text-red-500 text-sm mt-1 pl-1">
                {{ passwordError }}
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="w-full rounded bg-red-600 py-3 font-bold text-white hover:bg-red-600/70 cursor-pointer text-lg"
                :disabled="loading || !isFormValid"
              >
                {{ loading ? "Signing in..." : "Sign In" }}
              </button>
            </div>
          </form>
          <div class="text-center mt-6">
            <span class="text-netflix-gray-50">OR</span>
          </div>
          <div class="mt-6">
            <button
              @click="signInAsGuest"
              class="w-full rounded bg-zinc-700/60 py-3 text-white hover:bg-zinc-700/50 cursor-pointer font-semibold text-lg"
              :disabled="loading"
            >
              Continue as Guest
            </button>
          </div>

          <div class="flex items-center mt-6">
            <input
              type="checkbox"
              id="remember-me"
              v-model="rememberMe"
              class="w-4 h-4 rounded text-red-600 bg-zinc-800 border-netflix-gray-50 focus:ring-0 focus:ring-offset-0"
            />
            <label
              for="remember-me"
              class="ml-2 text-md font-semibold text-white"
            >
              Remember me
            </label>
          </div>

          <p class="mt-6 text-netflix-gray-50 font-semibold">
            New to Notflix?
            <a
              href="#"
              @click.prevent="navigateToSignup"
              class="text-white hover:underline"
            >
              Sign up now.
            </a>
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import Footer from "@/components/Footer.vue";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const emailError = ref("");
const passwordError = ref("");
const rememberMe = ref(true);

const validateEmail = () => {
  emailError.value = "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.value) {
    emailError.value = "Email is required";
  } else if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter a valid email address";
  }
};

const validatePassword = () => {
  passwordError.value = "";

  if (!password.value) {
    passwordError.value = "Password is required";
  } else if (password.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters";
  }
};

const isFormValid = computed(() => {
  return (
    email.value && password.value && !emailError.value && !passwordError.value
  );
});

const handleLogin = async () => {
  validateEmail();
  validatePassword();

  if (!isFormValid.value) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await userStore.signIn({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    });
    router.push("/select-profile");
  } catch (err) {
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password"
    ) {
      error.value = "Invalid email or password. Please try again.";
    } else if (err.code === "auth/too-many-requests") {
      error.value =
        "Too many failed login attempts. Please try again later or reset your password.";
    } else if (err.code === "auth/user-disabled") {
      error.value = "This account has been disabled. Please contact support.";
    } else {
      error.value = err.message || "Failed to sign in";
    }
  } finally {
    loading.value = false;
  }
};

const signInAsGuest = async () => {
  loading.value = true;
  error.value = "";

  try {
    await userStore.signInAsGuest();
    router.push("/select-profile");
  } catch (err) {
    error.value = err.message || "Failed to sign in as guest";
  } finally {
    loading.value = false;
  }
};

const navigateToSignup = (force = false) => {
  if (force) {
    router.replace({ path: "/signup", query: { force: "true" } });
  } else {
    router.push("/signup");
  }
};
</script>
