import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
 
const store = new Vuex.Store({
  state: {
    Authorization: localStorage.getItem('token') ? localStorage.getItem('token') : '',
    Username: localStorage.getItem('username') ? localStorage.getItem('username') : ''
  },
  mutations: {
    changeLogin (state, user) {
      state.Authorization = user.Authorization;
      state.Username = user.Username;
      localStorage.setItem('token', user.Authorization);
      localStorage.setItem('username', user.Username);
    }
  }
});
 
export default store;