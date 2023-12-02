<template>
  <v-container>
    <div class="d-flex align-center">
      <v-text-field
        v-model="search"
        class="mr-2"
        :label="t('$vuetify.homeView.search')"
        prepend-inner-icon="mdi-magnify"
        single-line
        variant="outlined"
        hide-details
      ></v-text-field>

      <v-spacer v-if="!mobile" />

      <v-dialog width="500" v-model="openAddDialog">
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
          >
            <v-icon left>mdi-plus</v-icon>
            {{ t('$vuetify.homeView.form.button') }}
          </v-btn>
        </template>

        <template v-slot:default>
          <v-card :title="t('$vuetify.homeView.form.title')">
            <v-form v-model="valid" @submit.prevent ref="addForm">
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-combobox
                        v-model="addModel.manufacturer"
                        :rules="requiredRules"
                        :items="autocomplete('manufacturer')"
                        :label="t('$vuetify.homeView.form.manufacturer')"
                        required
                      ></v-combobox>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-combobox
                        v-model="addModel.type"
                        :rules="requiredRules"
                        :items="autocomplete('type')"
                        :label="t('$vuetify.homeView.form.type')"
                        required
                      ></v-combobox>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="addModel.name"
                        :rules="requiredRules"
                        :label="t('$vuetify.homeView.form.name')"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-combobox
                        v-model="addModel.size"
                        :items="[1000, 500, 250]"
                        :rules="requiredRules"
                        :label="t('$vuetify.homeView.form.size')"
                        required
                      ></v-combobox>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-slider
                        v-model="addModel.remain"
                        :rules="requiredRules"
                        type="number"
                        :min="0"
                        :max="100"
                        :step="1"
                        :label="t('$vuetify.homeView.form.remain')"
                        required
                        thumb-label="always"
                      >
                        <template v-slot:thumb-label>
                          <span style="white-space: nowrap;">{{ addModel.remain }} %</span>
                        </template>
                      </v-slider>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="addModel.colorname"
                        required
                        :rules="requiredRules"
                        :label="t('$vuetify.homeView.form.colorname')"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-color-picker
                        v-model="addModel.color"
                        :label="t('$vuetify.homeView.form.color')"
                        required
                        show-swatches
                        hide-details
                        mode="hexa"
                        :modes="['hexa']"
                      ></v-color-picker>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                  :text="t('$vuetify.confirmEdit.cancel')"
                  color="red darken-2"
                  @click="openAddDialog = false"
                ></v-btn>

                <v-btn
                  :text="t('$vuetify.general.save')"
                  color="green darken-2"
                  type="submit"
                  :disabled="!valid"
                  @click="addFilament"
                ></v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </template>
      </v-dialog>
    </div>

    <v-data-table
      :headers="headers"
      :items="store.filamentList"
      :search="search"
      :items-per-page="-1"
    >
      <template v-slot:item.color="{ item }">
        <v-avatar variant="elevated" :color="item.color"></v-avatar>
      </template>

      <template v-slot:item.filaments="{ item }">
        {{ item.filaments.length }}
      </template>

      <template v-slot:item.remain="{ item }">
        {{ item.remain }} g
      </template>

      <template v-slot:item.actions="{ item }">
        <div style="white-space: nowrap;">
          <v-btn
            size="x-small"
            @click="editFilament(item)"
            icon
            flat
          >
            <v-icon color="orange darken-2" size="small">mdi-pencil</v-icon>
          </v-btn>

          <v-btn
            size="x-small"
            @click="additionalFilament(item)"
            icon
            flat
          >
            <v-icon color="primary" size="small">mdi-plus</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <Filament-Details ref="filamentDetails"></Filament-Details>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { toast } from 'vue3-toastify';
import FilamentDetails from '@/components/FilamentDetails.vue';
import { useLocale, useDisplay } from 'vuetify';

const { t } = useLocale();
const { mobile } = useDisplay()

const requiredRules = [
  v => !!v || t('$vuetify.general.required')
];

const store = useAppStore();

const { autocomplete } = storeToRefs(store);

const search = ref('');
const valid = ref(false);
const openAddDialog = ref(false);
const addForm = ref(null);
const filamentDetails = ref(null);

const addModel = ref({
  manufacturer: '',
  type: '',
  name: '',
  color: '#ffffffff',
  colorname: '',
  size: 1000,
  remain: 100,
  empty: false
});

const headers = [
  { title: t('$vuetify.homeView.form.manufacturer'), key: 'manufacturer' },
  { title: t('$vuetify.homeView.form.type'), key: 'type' },
  { title: t('$vuetify.homeView.form.name'), key: 'name' },
  { title: t('$vuetify.homeView.form.color'), key: 'color' },
  { title: t('$vuetify.homeView.form.colorname'), key: 'colorname' },
  { title: t('$vuetify.homeView.form.spools'), key: 'filaments' },
  { title: t('$vuetify.homeView.form.remain'), key: 'remain' },
  { title: t('$vuetify.homeView.form.actions'), key: 'actions', sortable: false }
];

onMounted(() => {
    if (store.isLoggedIn) {
    store.getFilaments();
  }
});

const addFilament = async () => {
  let success = store.addFilament(addModel.value);

  if (success) {
    addForm.value.reset();
    addModel.value = {
      manufacturer: '',
      type: '',
      name: '',
      color: '#ffffffff',
      size: 1000,
      remain: 100,
      empty: false
    };

    openAddDialog.value = false;
    toast.success('Filament erfolgreich hinzugefügt');
  } else {
    toast.error('Fehler beim Hinzufügen des Filaments');
  }
};

const additionalFilament = async (item) => {
  let success = store.addFilament({
    manufacturer: item.manufacturer,
    type: item.type,
    name: item.name,
    color: item.color,
    colorname: item.colorname,
    size: 1000,
    remain: 100,
    empty: false
  });

  if (success) {
    toast.success('Filament erfolgreich hinzugefügt');
  } else {
    toast.error('Fehler beim Hinzufügen des Filaments');
  }
};

const editFilament = async (item) => {
  filamentDetails.value.open(item.filaments);
};
</script>
