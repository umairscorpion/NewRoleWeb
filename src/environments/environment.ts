// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiUrl: 'http://162.241.138.178/plesk-site-preview/sapi.loginsubzz.com/api/',
  // profileImageUrl: 'http://162.241.138.178/plesk-site-preview/sapi.loginsubzz.com/Profile/'

  apiUrl: 'http://localhost:61137/api/',
  profileImageUrl: 'http://localhost:61137/Profile/'
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
