<template>
  <div
    class="fixed inset-0 backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center z-50"
    @mousedown.self="close"
  >
    <div
      class="bg-netflix-gray-200 p-6 rounded w-180 h-[45%] flex flex-col border-1 border-netflix-gray-150"
      @click.stop
    >
      <div class="flex-1">
        <h2 class="text-3xl font-semibold text-white mt-10 mb-8 text-center">
          Create Profile
        </h2>

        <div class="flex items-center space-x-8">
          <div class="relative group">
            <img
              :src="newProfile.avatar || '/avatars/avatar1.png'"
              class="w-24 h-24 border-2 border-transparent rounded ml-4"
              alt="Current Avatar"
            />
          </div>

          <div class="flex-1">
            <div class="relative">
              <input
                v-model="newProfile.name"
                id="name-input"
                type="text"
                placeholder=" "
                class="block rounded px-4 pb-2.5 pt-5 w-full text-netflix-gray-25 bg-netflix-gray-200 border border-netflix-gray-100 appearance-none focus:outline-none focus:ring-white focus:ring-2 peer"
              />
              <label
                for="name-input"
                class="absolute text-md text-netflix-gray-100 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >
                Name
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col space-y-2 mt-auto pt-4">
        <button
          @click="createProfile"
          class="p-3 px-8 bg-white hover:opacity-80 font-semibold text-lg text-black cursor-pointer rounded transition-colors duration-300"
        >
          Add
        </button>

        <button
          @click="close"
          class="p-3 px-8 hover:bg-netflix-gray-150 text-lg font-semibold text-white cursor-pointer rounded transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>

    <SelectAvatarModal
      v-if="showAvatarModal"
      :current-avatar="newProfile.avatar"
      @select="selectAvatar"
      @close="showAvatarModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import SelectAvatarModal from "./SelectAvatarModal.vue";

const emit = defineEmits(["close", "save"]);
const userStore = useUserStore();

const newProfile = ref({
  name: "",
  avatar: "",
});

onMounted(async () => {
  const avatars = await import("virtual:avatars").then((m) => m.default);
  const classicAvatars = avatars.classic || [];
  if (classicAvatars.length > 0) {
    const randomIndex = Math.floor(Math.random() * classicAvatars.length);
    newProfile.value.avatar = classicAvatars[randomIndex];
  }
});

function selectAvatar(avatar) {
  newProfile.value.avatar = avatar;
  showAvatarModal.value = false;
}

function createProfile() {
  if (newProfile.value.name && newProfile.value.avatar) {
    userStore.addProfile({
      name: newProfile.value.name,
      avatar: newProfile.value.avatar,
    });
    close();
  }
}

function saveProfile() {
  const profile = {
    name: profileName.value,
    avatar: selectedAvatar.value,
    settings: {
      autoplay: true,
      maturityLevel: "all",
    },
    createdAt: new Date(),
  };

  emit("save", profile);
}

function close() {
  emit("close");
}
</script>
