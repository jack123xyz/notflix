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
          Manage Profile
        </h2>

        <div class="flex items-center space-x-8">
          <div
            class="relative group cursor-pointer"
            @click="showAvatarModal = true"
          >
            <img
              :src="newProfile.avatar"
              class="w-24 h-24 border-2 border-transparent group-hover:border-white rounded ml-4"
              alt="Current Avatar"
            />
            <div
              class="absolute inset-0 flex items-center justify-center transition-opacity"
            >
              <img
                src="@/assets/pencil-white.svg"
                class="w-6 h-6"
                alt="Edit Avatar"
              />
            </div>
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
          @click="saveChanges"
          class="p-3 bg-white hover:opacity-80 font-semibold text-lg text-black cursor-pointer rounded transition-colors duration-300"
        >
          Save
        </button>

        <button
          @click="close"
          class="p-3 hover:bg-netflix-gray-150 text-lg font-semibold text-white cursor-pointer rounded transition-colors duration-300"
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
import { ref, watch } from "vue";
import SelectAvatarModal from "./SelectAvatarModal.vue";

const emit = defineEmits(["close", "save"]);
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const avatars = Array.from(
  { length: 9 },
  (_, i) => `/avatars/avatar${i + 1}.png`
);

const newProfile = ref({
  name: "",
  avatar: "",
});

const showAvatarModal = ref(false);

watch(
  () => props.user,
  (user) => {
    if (user) {
      newProfile.value.name = user.name;
      newProfile.value.avatar = user.avatar;
    }
  },
  { immediate: true }
);

function selectAvatar(avatar) {
  newProfile.value.avatar = avatar;
  showAvatarModal.value = false;
}

function saveChanges() {
  const updatedData = {
    name: newProfile.value.name,
    avatar: newProfile.value.avatar,
    updatedAt: new Date(),
  };

  emit("save", updatedData);
}

function close() {
  emit("close");
}
</script>
