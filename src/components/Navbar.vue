<template>
  <nav
    :class="[
      'fixed top-0 left-0 w-full z-50 text-white px-6 py-4 flex items-center justify-between transition-colors duration-300',
      isScrolled ? 'bg-netflix-bg-gray' : 'bg-transparent',
    ]"
  >
    <div class="flex items-center">
      <div class="flex items-center mr-8 space-x-2">
        <img
          src="/NotflixLogo.png"
          alt="Netflix Logo"
          class="h-24 md:h-30 -my-24 cursor-pointer"
          @click="router.push('/browse')"
        />
        <span class="text-xs font-bold hidden sm:inline">(Not Netflix)</span>
      </div>
      <ul class="hidden lg:flex space-x-5 lg:text-md">
        <li>
          <a
            href="#"
            @click.prevent="router.push('/browse')"
            class="hover:opacity-70 transition"
            >Home</a
          >
        </li>
        <li>
          <a
            href="#"
            @click.prevent="router.push('/TV')"
            class="hover:opacity-70 transition"
            >TV Shows</a
          >
        </li>
        <li>
          <a
            href="#"
            @click.prevent="router.push('/movies')"
            class="hover:opacity-70 transition"
            >Movies</a
          >
        </li>
        <li>
          <a
            href="#"
            @click.prevent="router.push('/latest')"
            class="hover:opacity-70 transition"
            >New & Popular</a
          >
        </li>
        <li>
          <a
            href="#"
            @click.prevent="router.push('/my-list')"
            class="hover:opacity-70 transition"
            >My List</a
          >
        </li>
      </ul>
    </div>

    <div class="flex items-center space-x-4 mr-8 cursor-pointer">
      <div class="relative z-10 w-8">
        <button
          v-if="!isSearchOpen"
          @click.stop="openSearchInput"
          class="hover:opacity-70 transition mt-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M12.9 14.32a8 8 0 111.41-1.41l5.39 5.38-1.42 1.42-5.38-5.39zM8 14a6 6 0 100-12 6 6 0 000 12z"
            />
          </svg>
        </button>
        <div
          v-if="isSearchOpen"
          @click.stop
          class="absolute right-0 -top-4 transition-all duration-300 w-64"
        >
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search titles..."
            class="w-full bg-black/80 border border-gray-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-white"
            @keyup.enter="submitSearch"
            @keyup.esc="closeInput"
          />
        </div>
      </div>

      <div
        class="relative group"
        @mouseenter="isGroupHovered = true"
        @mouseleave="isGroupHovered = false"
      >
        <div class="flex items-center space-x-2" @click="handleProfileClick">
          <img
            v-if="userStore.currentProfile"
            :src="userStore.currentProfile.avatar"
            alt="User Avatar"
            class="w-8 h-8 rounded"
            @error="handleImageError"
          />
          <div
            v-else
            class="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold"
          >
            N
          </div>
          <svg
            v-if="!isMobileView"
            class="w-3 h-3 text-white transition-transform duration-300"
            :class="{ 'rotate-180': isGroupHovered }"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"
            />
          </svg>
        </div>

        <div
          v-if="!isMobileView"
          class="absolute top-0 right-[-10px] h-16 w-48 cursor-pointer"
        ></div>

        <div
          v-if="!isMobileView"
          class="absolute right-0 top-10 min-w-[200px] bg-black/95 border border-neutral-700 rounded shadow-lg transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          <div class="py-2 border-b border-neutral-700">
            <div
              v-for="profile in userStore.profiles"
              :key="profile.id"
              class="flex items-center px-4 py-2 hover:bg-neutral-800"
              @click="switchProfile(profile)"
            >
              <img
                :src="profile.avatar"
                :alt="profile.name"
                class="w-7 h-7 rounded"
                @error="handleImageError"
              />
              <span class="text-sm ml-2">{{ profile.name }}</span>

              <span
                v-if="
                  userStore.currentProfile &&
                  userStore.currentProfile.id === profile.id
                "
                class="ml-auto text-netflix-red font-bold"
                >✓</span
              >
            </div>
          </div>

          <ul class="py-2 text-sm">
            <li>
              <a
                href="#"
                @click.prevent="goToManageProfiles"
                class="block px-4 py-2 hover:bg-neutral-800"
                >Manage Profiles</a
              >
            </li>
            <li>
              <a
                href="#"
                @click.prevent="goToEditCurrentProfile"
                class="block px-4 py-2 hover:bg-neutral-800"
                >Account</a
              >
            </li>
            <li>
              <a href="#" class="block px-4 py-2 hover:bg-neutral-800"
                >Help Center</a
              >
            </li>
            <li>
              <button
                @click="handleSignOut"
                class="w-full text-left px-4 py-2 hover:bg-neutral-800 cursor-pointer"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useDebounce } from "@/composables/useDebounce";

const router = useRouter();
const userStore = useUserStore();

const isScrolled = ref(false);
const isGroupHovered = ref(false);
const isMobileView = ref(window.innerWidth <= 768);
const isSearchOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);

const debounceSearch = useDebounce(searchQuery, 500);
watch(debounceSearch, (query) => {
  if (query && query.length >= 2) {
    router.push({ name: "Search", query: { q: query } });
  }
});

const handleScroll = () => (isScrolled.value = window.scrollY > 30);
const handleResize = () => (isMobileView.value = window.innerWidth <= 768);
const handleClickOutsideSearch = (event) => {
  if (isSearchOpen.value && !event.target.closest(".relative.z-10")) {
    closeInput();
  }
};
const openSearchInput = () => {
  isSearchOpen.value = true;
  nextTick(() => searchInput.value?.focus());
};
const closeInput = () => {
  isSearchOpen.value = false;
  searchQuery.value = "";
};
const submitSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: "Search", query: { q: searchQuery.value.trim() } });
    closeInput();
  }
};

const handleProfileClick = () => {
  if (isMobileView.value) {
    router.push("/select-profile");
  }
};

const handleSignOut = async () => {
  try {
    await userStore.logout();
    router.push("/login");
  } catch (err) {
    console.error("Failed to sign out:", err);
  }
};

const switchProfile = async (profile) => {
  if (userStore.currentProfile?.id === profile.id) return;
  try {
    await userStore.setActiveProfile(profile);
    window.location.href = "/browse";
  } catch (err) {
    console.error("Failed to switch profile:", err);
  }
};

async function goToManageProfiles() {
  try {
    await router.push({ path: "/select-profile", query: { manage: "true" } });
  } catch (err) {
    if (err.name !== "NavigationDuplicated") {
      console.error("Navigation to manage profiles failed:", err);
    }
  }

  await nextTick();

  const manageButton = document.querySelector("button[data-manage-profiles]");
  if (manageButton) {
    manageButton.click();
  } else {
    console.warn("Could not find manage profiles button after navigation.");
  }
}

async function goToEditCurrentProfile() {
  const profileId = userStore.currentProfile?.id;
  if (!profileId) {
    console.warn("No current profile selected to edit.");

    return goToManageProfiles();
  }

  try {
    await router.push({
      path: "/select-profile",
      query: { manage: "true", editProfile: profileId },
    });
  } catch (error) {
    if (error.name !== "NavigationDuplicated") {
      console.error("Error navigating to edit profile:", error);
    }
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);
  window.addEventListener("click", handleClickOutsideSearch);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("click", handleClickOutsideSearch);
});
</script>

<style scoped>
.text-netflix-red {
  color: #e50914;
}

.hover-disabled {
  pointer-events: auto !important;
}

.hover-disabled:hover .group-hover\:block,
.hover-disabled:hover .group-hover\:opacity-100 {
  display: none !important;
  opacity: 0 !important;
}
</style>
