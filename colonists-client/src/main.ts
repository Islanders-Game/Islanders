import Vue from 'vue'
import App from './App.vue'
import store from './store/store'
import './registerServiceWorker'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app')
