/** @type {import('next').NextConfig} */

module.exports = {
   output: 'standalone',
   eslint: {
      // Preserve the pre-src lint scope; widening it is a separate quality task.
      dirs: ['src/pages', 'src/components', 'src/app', 'src/lib'],
      ignoreDuringBuilds: true,
   },
   reactStrictMode: false,
   env: {
      NEXT_SECRET_CLIENT: process.env.NEXT_SECRET_CLIENT,
      NEXT_SECRET_ID: process.env.NEXT_SECRET_ID,
   },
   experimental: {
      serverComponentsExternalPackages: ['newrelic']
   },
   webpack: (config, {isServer}) => {
      if(isServer){
         const nrExternals = require('newrelic/load-externals');
         nrExternals(config)
      }

      return config;
   }
};
