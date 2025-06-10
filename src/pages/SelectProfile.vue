<template>
  <div
    class="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center"
  >
    <div v-if="$Loading">
      <svg
        fill="#ffffff"
        class="animate-spin -ml-1 mr-2 h-40 w-40 text-white inline-block"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M512 1024c-69.1 0-136.2-13.5-199.3-40.2C251.7 958 197 921 150 874c-47-47-84-101.7-109.8-162.7C13.5 648.2 0 581.1 0 512c0-19.9 16.1-36 36-36s36 16.1 36 36c0 59.4 11.6 117 34.6 171.3 22.2 52.4 53.9 99.5 94.3 139.9 40.4 40.4 87.5 72.2 139.9 94.3C395 940.4 452.6 952 512 952c59.4 0 117-11.6 171.3-34.6 52.4-22.2 99.5-53.9 139.9-94.3 40.4-40.4 72.2-87.5 94.3-139.9C940.4 629 952 571.4 952 512c0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.2C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3s-13.5 136.2-40.2 199.3C958 772.3 921 827 874 874c-47 47-101.8 83.9-162.7 109.7-63.1 26.8-130.2 40.3-199.3 40.3z"
          ></path>
        </g>
      </svg>
    </div>

    <div v-else>
      <addProfileModal
        v-if="addModal"
        @close="addModal = false"
        @save="handleAddProfile"
      />
      <manageProfileModal
        v-if="editModal"
        :user="selectedUser"
        @close="closeEditModal"
        @save="updateUser"
      />

      <h1
        v-if="managing && deletingUser === null"
        class="text-3xl md:text-8xl font-medium mb-14"
      >
        Manage Profiles:
      </h1>
      <h1
        v-if="managing && deletingUser !== null"
        class="text-3xl md:text-8xl font-medium mb-14"
      >
        Permanently delete {{ deletingUser?.name }}'s profile?
      </h1>
      <h1 v-if="!managing" class="text-3xl md:text-8xl font-medium mb-14">
        Who's watching?
      </h1>

      <div class="flex flex-wrap justify-center gap-4 md:gap-8">
        <div
          v-for="profile in userStore.profiles"
          :key="profile.id"
          class="relative flex flex-col items-center group cursor-pointer"
          @click="handleProfileClick(profile)"
        >
          <img
            :src="profile.avatar"
            alt="Profile Avatar"
            :class="getProfileImageClasses(profile)"
          />
          <span
            class="mt-2 md:mt-4 text-sm md:text-2xl text-netflix-gray-100"
            :class="getProfileNameClasses(profile)"
            >{{ profile.name }}</span
          >

          <button
            v-if="managing && deletingUser === null"
            class="absolute top-2 right-2 bg-transparent bg-opacity-50 text-white p-1 rounded hover:border-white cursor-pointer"
            @click.stop="editUser(profile)"
          >
            <img
              src="@/assets/pencil-white.svg"
              alt="Edit Profile"
              class="w-5 h-5 sm:w-10 sm:h-10"
            />
          </button>

          <button
            v-if="managing && deletingUser === null"
            class="absolute top-2 left-2 bg-transparent text-white p-1 rounded hover:bg-opacity-75 cursor-pointer"
            @click.stop="deleteUser(profile)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-5 sm:size-9 hover:stroke-red-500 transition-colors"
              alt="Delete User"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>

        <div
          class="flex flex-col items-center group cursor-pointer"
          :class="{
            'pointer-events-none opacity-50': deletingUser !== null,
          }"
          @click="addModal = true"
        >
          <div
            class="w-16 h-16 sm:w-24 sm:h-24 md:w-52 md:h-52 flex items-center justify-center rounded border-gray-500 text-5xl text-netflix-gray-100"
            :class="{
              'group-hover:bg-white group-hover:text-white':
                deletingUser === null,
            }"
          >
            <img
              src="@/assets/plus-sym.svg"
              alt="Add Profile"
              class="w-8 h-8 sm:w-12 sm:h-12 md:w-38 md:h-38"
            />
          </div>
          <span
            class="mt-2 md:mt-4 text-sm md:text-2xl text-netflix-gray-100"
            :class="{
              'group-hover:text-white': deletingUser === null,
            }"
          >
            Add Profile
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center mt-24 space-y-4">
        <template v-if="managing && deletingUser === null">
          <button
            :class="[
              'px-10 py-4 text-3xl hover:text-white cursor-pointer',
              'bg-white text-black hover:bg-red-500 font-semibold',
            ]"
            @click="managing = false"
          >
            Done
          </button>
        </template>
        <template v-else-if="managing && deletingUser !== null">
          <button
            class="px-10 py-4 text-3xl bg-red-600 text-white font-semibold hover:bg-red-800 cursor-pointer"
            @click="confirmDelete"
          >
            Yes, Delete
          </button>
          <button
            class="px-10 py-4 text-3xl bg-black text-white font-semibold hover:bg-stone-800 cursor-pointer"
            @click="cancelDelete"
          >
            Cancel
          </button>
        </template>
        <template v-else>
          <button
            :class="getManageButtonClasses"
            @click="managing = true"
            data-manage-profiles
          >
            Manage Profiles
          </button>

          <button
            class="lg:hidden px-10 py-2 mt-4 text-xl text-netflix-gray-100 hover:text-white cursor-pointer"
            @click="handleSignOut"
          >
            Sign Out
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import AddProfileModal from "@/components/Landing/AddProfileModal.vue";
import ManageProfileModal from "@/components/Landing/ManageProfileModal.vue";

const userStore = useUserStore();
const router = useRouter();

const $Loading = ref(true);
const addModal = ref(false);
const managing = ref(false);
const editModal = ref(false);
const selectedUser = ref(null);
const deletingUser = ref(null);

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push("/login");
    return;
  }

  const route = router.currentRoute.value;

  try {
    await userStore.loadProfiles();
  } catch (error) {
    console.error("Error loading profiles:", error);
    $Loading.value = false;
    return;
  } finally {
    $Loading.value = false;
  }

  if (route.query.manage === "true") {
    managing.value = true;
  }

  if (route.query.editProfile && userStore.profiles.length > 0) {
    const profileIdToEdit = route.query.editProfile;
    const profileToEdit = userStore.profiles.find(
      (p) => p.id === profileIdToEdit
    );
    if (profileToEdit) {
      managing.value = true;
      editUser(profileToEdit);
    } else {
      console.warn(`Profile with ID ${profileIdToEdit} not found for editing.`);
    }
  }
});

// Methods
async function handleProfileClick(profile) {
  if (managing.value || deletingUser.value !== null) return;

  try {
    await userStore.setActiveProfile(profile);
    router.push("/browse");
  } catch (error) {
    console.error("Error selecting profile:", error);
  }
}

async function handleAddProfile(newProfile) {
  try {
    await userStore.addProfile(newProfile);
    addModal.value = false;
  } catch (error) {
    console.error("Error adding profile:", error);
  }
}

function editUser(profile) {
  selectedUser.value = profile;
  editModal.value = true;
}

function closeEditModal() {
  editModal.value = false;
  selectedUser.value = null;
}

async function updateUser(updatedProfile) {
  try {
    await userStore.updateProfileData(selectedUser.value.id, updatedProfile);
    editModal.value = false;
    selectedUser.value = null;
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

function deleteUser(profile) {
  deletingUser.value = profile;
}

async function confirmDelete() {
  try {
    await userStore.deleteProfile(deletingUser.value.id);
    deletingUser.value = null;
  } catch (error) {
    console.error("Error deleting profile:", error);
  }
}

function cancelDelete() {
  deletingUser.value = null;
}

async function handleSignOut() {
  try {
    await userStore.logout();
    router.push("/login");
  } catch (err) {
    console.error("Sign out failed:", err);
    router.push("/login");
  }
}

function getProfileImageClasses(profile) {
  let classes =
    "w-16 h-16 sm:w-24 sm:h-24 md:w-52 md:h-52 rounded border-4 transition";

  if (deletingUser.value !== null) {
    if (deletingUser.value.id === profile.id) {
      classes += " border-white brightness-100";
    } else {
      classes += " border-transparent brightness-50 cursor-default";
    }
  } else if (managing.value) {
    classes +=
      " border-transparent group-hover:border-white brightness-50 cursor-default";
  } else {
    classes += " border-transparent group-hover:border-white brightness-100";
  }

  return classes;
}

function getProfileNameClasses(profile) {
  if (deletingUser.value !== null) {
    return deletingUser.value.id === profile.id
      ? "text-white"
      : "brightness-50 cursor-default";
  }
  return "group-hover:text-white";
}

const getManageButtonClasses = computed(() => {
  return [
    "px-4 sm:px-10 py-2 sm:py-4 text-lg sm:text-3xl hover:text-white cursor-pointer",
    "text-netflix-gray-100 bg-transparent border border-netflix-gray-100 hover:border-white",
  ];
});
</script>
