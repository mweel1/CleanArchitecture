import Vue from "vue";
import App from "./App.vue";
import Auth0 from "./auth0";
import Provision from "./provision";
Vue.config.productionTip = false;
Provision(Vue).then((router) => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount("#app");
});
