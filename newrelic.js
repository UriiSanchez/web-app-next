'use strict';
/**
 * New Relic agent configuration.
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
   app_name: [process.env.NEW_RELIC_APP_NAME],
   license_key: process.env.NEW_RELIC_LICENSE_KEY,
   logging: {
      filepath: 'stdout',
   },
   /**
    * This provides instrumentation for setTimeout and setInterval calls.
    * We recommend you disable this instrumentation as it does not not provide
    * much value and creates a lot of unnecessary TraceSegments/Span events.
    */
   instrumentation: {
      timers: {
         enabled: false,
      },
   },
   /**
    * When true, all request headers except for those listed in attributes.exclude
    * will be captured for all traces, unless otherwise specified in a destination's
    * attributes include/exclude lists.
    */
   allow_all_headers: true,
   attributes: {
      exclude: [
         'request.headers.cookie',
         'request.headers.authorization',
         'request.headers.proxyAuthorization',
         'request.headers.setCookie*',
         'request.headers.x*',
         'response.headers.cookie',
         'response.headers.authorization',
         'response.headers.proxyAuthorization',
         'response.headers.setCookie*',
         'response.headers.x*',
      ],
   },
};