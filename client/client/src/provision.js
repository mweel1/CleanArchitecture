import createAuth0Client from "@auth0/auth0-spa-js";
import VueRouter from "vue-router";
import axios from "axios";

export default async function Provision(Vue) {
  setupAxios(Vue);
  await setupAuth0(Vue);
  return await setupRoutes(Vue);
}

async function setupAuth0(Vue) {
  const auth0 = await createAuth0Client({
    domain: process.env.VUE_APP_AUTH_DOMAIN,
    client_id: process.env.VUE_APP_AUTH_CLIENT_ID,
    redirect_uri: process.env.VUE_APP_AUTH_REDIRECT_URI,
    audience: process.env.VUE_APP_AUTH_AUDIENCE,
  });

  Vue.prototype.$auth0 = auth0;
}

function setupRoutes(Vue) {
  const routes = [
    { path: "/", component: () => import("./pages/HomePage.vue") },
    { path: "/logout" },
  ];

  const router = new VueRouter({
    mode: "history",
    routes,
  });

  router.beforeEach(async (to, from, next) => {
    console.log(Vue.prototype.$auth0);
    var isAuthenticated = await Vue.prototype.$auth0.isAuthenticated();

    if (
      !isAuthenticated &&
      (to.path !== "/auth_callback" ||
        to.path === "/logout" ||
        to.path !== "/login")
    ) {
      await Vue.prototype.$auth0.loginWithRedirect();
      return;
    }

    if (to.path == "/login") {
      await Vue.prototype.$auth0.loginWithRedirect();
    }

    if (to.path == "/logout") {
      Vue.prototype.$auth0.logout();
      return;
    }

    if (to.path == "/auth_callback") {
      await Vue.prototype.$auth0.handleRedirectCallback();

      let user = await Vue.prototype.$auth0.getUser();

      let r = await Vue.prototype.$client.post("/rpc/user~userLoggedIn", user);
      if (!r.data.isSuccess) {
        next({ path: "/error" });
        return;
      } else {
        next({ path: "/home" });
        return;
      }
    }

    let user = await Vue.prototype.$auth0.getUser();

    Vue.prototype.$user = user;

    next();
  });

  Vue.use(VueRouter);

  return router;
}

function setupAxios(Vue) {
  var axiosClient = axios.create({
    baseURL: process.env.VUE_APP_API_SERVER,
    json: true,
  });

  Vue.prototype.$client = axiosClient;

  axiosClient.interceptors.request.use(
    async function (config) {
      var token;
      try {
        token = await Vue.prototype.$auth0.getTokenSilently();
      } catch (error) {
        await Vue.prototype.$auth0.loginWithRedirect();
      }

      config.headers["Authorization"] = "Bearer " + token;
      config.headers["TimeZone"] =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  axiosClient.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    }
  );
  console.log("Axios setup...");
}
