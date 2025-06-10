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
            Sign Up
          </h2>

          <div v-if="error" class="mb-4 rounded bg-red-700/70 p-3 text-white">
            {{ error }}
          </div>

          <form @submit.prevent="handleSignup" class="space-y-4">
            <div>
              <input
                v-model="name"
                type="text"
                placeholder="Your Name"
                class="w-full rounded bg-zinc-800 p-4 text-white border-1 border-netflix-gray-50 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
            </div>
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
                {{ loading ? "Creating account..." : "Sign Up" }}
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

          <p class="mt-6 text-netflix-gray-50 font-semibold">
            Already have an account?
            <a
              href="#"
              @click.prevent="navigateToLogin"
              class="text-white hover:underline"
            >
              Sign in now.
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
const name = ref("");
const loading = ref(false);
const error = ref("");
const emailError = ref("");
const passwordError = ref("");

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
  const hasUpperCase = /[A-Z]/.test(password.value);
  const hasLowerCase = /[a-z]/.test(password.value);
  const hasNumbers = /\d/.test(password.value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
  const hasMinLength = password.value.length >= 8;

  const missing = [];

  if (!hasMinLength) missing.push("at least 8 characters");
  if (!hasUpperCase) missing.push("an uppercase letter");
  if (!hasLowerCase) missing.push("a lowercase letter");
  if (!hasNumbers) missing.push("a number");
  if (!hasSpecialChar) missing.push("a special character");

  if (missing.length > 0) {
    passwordError.value = `Your password needs ${missing.join(", ")}`;
  }
};

const isFormValid = computed(() => {
  return (
    name.value &&
    email.value &&
    password.value &&
    !emailError.value &&
    !passwordError.value
  );
});

const handleSignup = async () => {
  validateEmail();
  validatePassword();

  if (!isFormValid.value) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await userStore.signUp({
      email: email.value,
      password: password.value,
      displayName: name.value,
    });
    router.push("/select-profile");
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      error.value =
        "This email is already in use. Please use a different email or sign in.";
    } else if (err.code === "auth/weak-password") {
      error.value =
        "This password is too weak. Please create a stronger password.";
    } else {
      error.value = err.message || "Failed to create account";
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

const navigateToLogin = (force = false) => {
  if (force) {
    router.replace({ path: "/login", query: { force: "true" } });
  } else {
    router.push("/login");
  }
};
</script>
