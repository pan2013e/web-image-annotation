import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import store from './store/store'
import VueWechatTitle from 'vue-wechat-title'
import { Message } from 'element-ui'
import '@/assets/tailwind.css'
import JsonViewer from 'vue-json-viewer'
import conf from '../server/config/env'

Vue.config.productionTip = false;

Vue.use(VueWechatTitle);
Vue.use(Vuex);
Vue.use(JsonViewer);

Vue.prototype.$http = axios.create({
  baseURL: conf.server.callbackuri,
  timeout: 20000
});

Vue.prototype.$website_url = `http://${conf.server.domain}:${conf.server.frontend_port}`;
Vue.prototype.$crypto = require('bcryptjs');
Vue.prototype.$msg = function (msg) {
  Message({
    message: msg,
    type: 'success',
    customClass: 'max-z',
    offset: 20
  });
};
Vue.prototype.$err = function (err) {
  Message({
    message: err,
    type: 'error',
    customClass: 'max-z',
    offset: 20
  });
};

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
