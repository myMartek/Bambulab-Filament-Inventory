<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-card width="400" class="mx-auto">
      <v-card-title class="text-h5 text-center">Login</v-card-title>
      <v-card-text>
        <v-form fast-fail @submit.prevent="login">
          <v-text-field v-model="username" label="Benutzername"></v-text-field>

          <v-text-field v-model="password" type="password" label="Passwort"></v-text-field>

          <v-btn type="submit" color="primary" @click="login" block class="mt-2">Einloggen</v-btn>
        </v-form>

        <v-alert type="error" v-if="error" class="mt-2">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();

const username = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  error.value = '';

  if (await store.checkLogin(username.value, password.value)) {
    router.push({ name: 'Home' });
  } else {
    error.value = 'Benutzername oder Passwort falsch';
  }
}

</script>
