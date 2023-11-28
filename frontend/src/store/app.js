import { defineStore } from 'pinia'
import axios from 'axios';

const host = import.meta.env.DEV ? 'http://localhost:3000' : '';

export const useAppStore = defineStore('app', {
  state: () => ({
    login: sessionStorage.getItem('token') || null,
    filaments: []
  }),
  getters: {
    isLoggedIn: (state) => !!state.login,
    filamentList: (state) => {
      let filaments = state.filaments.reduce((acc, filament) => {
        let key = filament.color + filament.type + filament.manufacturer;

        if (!acc[key]) {
          acc[key] = {
            type: filament.type,
            manufacturer: filament.manufacturer,
            remain: filament.size / 100 * filament.remain,
            filaments: [filament],
            color: filament.color,
            name: filament.name
          }
        } else {
          acc[key].remain += filament.size / 100 * filament.remain;
          acc[key].filaments.push(filament);
        }

        return acc;
      }, {});

      return Object.keys(filaments).map(key => filaments[key]);
    }
  },
  actions: {
    async getFilaments() {
      if (!this.isLoggedIn) {
        return;
      }

      const { data } = await axios.get(host + '/filaments', {
        headers: {
          Authorization: `Bearer ${this.login}`,
        },
      });

      this.filaments = data;
    },
    async checkLogin(username, password) {
      try {
        const { data } = await axios.post(host + '/oauth/token', {
          grant_type: 'password',
          username,
          password
        });

        this.login = data.access_token;

        sessionStorage.setItem('token', data.access_token);

        this.getFilaments();

        return true;
      } catch (error) {
        console.log(error);
      }

      return false;
    }
  }
});

setInterval(() => {
  const appStore = useAppStore();

  appStore.getFilaments();
}, 10000);
