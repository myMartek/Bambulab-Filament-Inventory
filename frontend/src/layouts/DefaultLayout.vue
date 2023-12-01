<template>
  <v-app id="inspire">
    <v-app-bar flat>
      <v-container class="mx-auto d-flex align-center justify-center">
        <v-btn
          icon
          @click="toggleDrawer"
          v-if="mobile"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-spacer />

        {{ t('$vuetify.defaultLayout.title') }}

        <v-spacer />
        <v-btn
          color="primary"
          @click="store.logout"
        >
          <v-icon left>mdi-logout</v-icon> {{ t('$vuetify.defaultLayout.logout') }}
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
    >
    <v-list rounded="lg">
      <v-list-item
        color="grey-lighten-4"
        :title="t('$vuetify.defaultLayout.filamentFilter')"
      ></v-list-item>

      <v-divider class="my-2"></v-divider>

      <v-list-item
        color="grey-lighten-4"
        @click="setFilter(null)"
        :title="t('$vuetify.defaultLayout.filamentFilterAll')"
        :class="{ textBold: store.filter === null }"
      ></v-list-item>

      <v-list-item
        v-for="(type) in autocomplete('type')"
        :key="type"
        @click="setFilter(type)"
        :title="type"
        :class="{ textBold: store.filter === type}"
      ></v-list-item>
    </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list rounded="lg" v-if="!mobile">
                <v-list-item
                  color="grey-lighten-4"
                  :title="t('$vuetify.defaultLayout.filamentFilter')"
                ></v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                  color="grey-lighten-4"
                  @click="setFilter(null)"
                  :title="t('$vuetify.defaultLayout.filamentFilterAll')"
                  :class="{ textBold: store.filter === null }"
                ></v-list-item>

                <v-list-item
                  v-for="(type) in autocomplete('type')"
                  :key="type"
                  @click="setFilter(type)"
                  :title="type"
                  :class="{ textBold: store.filter === type}"
                ></v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet
              min-height="70vh"
              rounded="lg"
            >
              <default-view />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import DefaultView from './DefaultView.vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { useLocale, useDisplay } from 'vuetify';
import { ref } from 'vue';

const { t } = useLocale();
const { mobile } = useDisplay()

const store = useAppStore();

const { autocomplete } = storeToRefs(store);
const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const setFilter = (filter) => {
  store.setFilter(filter);
  drawer.value = false;
};
</script>

<style lang="css">
.textBold .v-list-item-title {
  font-weight: bold !important;
}
</style>
