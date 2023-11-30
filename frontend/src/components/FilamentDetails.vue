<template>
  <v-dialog width="800" v-model="show">
    <v-card title="Dialog">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">
                Nummer
              </th>
              <th class="text-left">
                Größe
              </th>
              <th class="text-left">
                Rest
              </th>
              <th class="text-left">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in filamentList"
              :key="item.tag_uid"
            >
              <td>#{{ i + 1 }}</td>
              <td>
                <v-combobox
                  v-model="item.size"
                  :items="[1000, 500, 250]"
                  label="Größe"
                  hide-details
                  required
                  @update:modelValue="update(item)"
                ></v-combobox>
              </td>
              <td>
                <v-slider
                  v-model="item.remain"
                  type="number"
                  :min="0"
                  :max="100"
                  :disabled="item.tracking"
                  :step="1"
                  label="Restmenge"
                  required
                  thumb-label="always"
                  @update:modelValue="debouncedUpdate(item)"
                >
                  <template v-slot:thumb-label>
                    <span style="white-space: nowrap;">{{ item.remain }} %</span>
                  </template>
                </v-slider>
              </td>
              <td>
                <v-btn size="x-small" flat icon @click="remove(item)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          text="Schließen"
          @click="show = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import _ from 'lodash';
import { useAppStore } from '@/store/app';
import { toast } from 'vue3-toastify';

const store = useAppStore();

const filamentList = ref([]);
const show = ref(false);
const open = (list) => {
  filamentList.value = _.cloneDeep(list);
  show.value = true;
};

const remove = (item) => {
  const result = store.deleteFilament(item.tag_uid);

  if (result) {
    const index = filamentList.value.indexOf(item);
    if (index > -1) {
      filamentList.value.splice(index, 1);
    }

    if (filamentList.value.length === 0) {
      show.value = false;
    }

    toast.success('Filament gelöscht');
  } else {
    toast.error('Fehler beim Löschen des Filaments');
  }
};

const update = async (filament) => {
  const result = await store.updateFilament(filament);

  if (result) {
    toast.success('Filament aktualisiert');
  } else {
    toast.error('Fehler beim Aktualisieren des Filaments');
  }
};

var debouncedUpdate = _.debounce(update, 250, { 'maxWait': 1000 });

defineExpose({ open });
</script>
