// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
   // Production API - direct connection without CORS proxy
  apiUrl: "/api",
  // API prefix - set to empty string to remove bfg/ prefix
  apiPrefix: "",
  // CORS proxy options - disabled
  corsProxy: "https://thingproxy.freeboard.io/fetch/",
  useCorsProxy: false,
  // Use development API in development mode
  useDevApi: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import "zone.js/plugins/zone-error"; // Included with Angular CLI.
