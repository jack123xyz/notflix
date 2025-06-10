<template>
  <div v-if="items.length" class="mb-14">
    <h2 v-if="title" class="text-xl font-bold mb-4">{{ title }}</h2>
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="item in items.slice(0, 18)"
        :key="item.id"
        class="relative aspect-[2/3] rounded-md overflow-hidden"
        @click="emit('item-click', item)"
      >
        <img
          :src="`https://image.tmdb.org/t/p/w300${item.poster_path}`"
          :alt="item.title || item.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div class="absolute inset-0 hover:bg-black/40 transition-all"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  items: Array,
});
const emit = defineEmits(["item-click"]);
</script>
