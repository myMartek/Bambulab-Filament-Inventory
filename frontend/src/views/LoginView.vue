<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-card width="400" class="mx-auto">
      <v-card-title class="text-h5 text-center">{{ t('$vuetify.loginPage.title') }}</v-card-title>
      <v-card-text>
        <v-form fast-fail @submit.prevent="login">
          <v-text-field v-model="username" :label="t('$vuetify.loginPage.username')"></v-text-field>

          <v-text-field v-model="password" type="password" :label="t('$vuetify.loginPage.password')"></v-text-field>

          <v-btn type="submit" color="primary" @click="login" block class="mt-2">{{ t('$vuetify.loginPage.login') }}</v-btn>
        </v-form>

        <v-alert type="error" v-if="error" class="mt-2">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLocale } from 'vuetify';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();
const { t } = useLocale();

const username = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  error.value = '';

  if (await store.checkLogin(username.value, password.value)) {
    router.push({ name: 'Home' });
  } else {
    error.value = t('$vuetify.loginPage.error');
  }
}

</script>
