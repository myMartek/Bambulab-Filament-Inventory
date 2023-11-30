<template>
  <router-view />
</template>

<script setup>
import 'vue3-toastify/dist/index.css';
import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();

const isLoggedIn = computed(() => store.isLoggedIn);

if (!isLoggedIn.value) {
  router.push({ name: 'Login' });
}
</script>
