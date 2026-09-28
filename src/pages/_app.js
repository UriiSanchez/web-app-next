import { SessionProvider } from 'next-auth/react';
import { EasyProvider } from '../context';

import 'material-symbols/outlined.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
   return (
      <SessionProvider>
         <EasyProvider>
            <Component {...pageProps} />
         </EasyProvider>
      </SessionProvider>
   );
}

export default MyApp;
