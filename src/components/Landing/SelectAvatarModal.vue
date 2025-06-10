<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
    @mousedown.self="$emit('close')"
  >
    <div
      class="bg-neutral-900 p-8 rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <h2 class="text-4xl font-bold text-white mb-6">Select Avatar</h2>

      <AvatarCarousel
        title="The Classics"
        :avatars="classicAvatars"
        :current-avatar="currentAvatar"
        @select="$emit('select', $event)"
      />

      <AvatarCarousel
        title="Arcane"
        :avatars="arcaneAvatars"
        :current-avatar="currentAvatar"
        @select="$emit('select', $event)"
      />

      <AvatarCarousel
        title="Black Mirror"
        :avatars="blackMirrorAvatars"
        :current-avatar="currentAvatar"
        @select="$emit('select', $event)"
      />

      <AvatarCarousel
        title="Squid Game"
        :avatars="squidGameAvatars"
        :current-avatar="currentAvatar"
        @select="$emit('select', $event)"
      />

      <div class="flex justify-end mt-6">
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-netflix-bg-gray hover:bg-netflix-gray-50/10 text-white font-semibold border-1 border-netflix-gray-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AvatarCarousel from "./AvatarCarousel.vue";

const arcaneAvatars = ref([]);
const blackMirrorAvatars = ref([]);
const squidGameAvatars = ref([]);
const classicAvatars = ref([]);

onMounted(async () => {
  const avatars = await import("virtual:avatars").then((m) => m.default);
  arcaneAvatars.value = avatars.arcane || [];
  blackMirrorAvatars.value = avatars["black-mirror"] || [];
  squidGameAvatars.value = avatars["squid-game"] || [];
  classicAvatars.value = avatars["classic"] || [];
});

defineProps({
  currentAvatar: {
    type: String,
    required: true,
  },
});

defineEmits(["select", "close"]);
</script>
