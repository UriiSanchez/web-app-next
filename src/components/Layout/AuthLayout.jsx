import { useEffect, useState } from 'react';
import Head from 'next/head';

import { LoadingScreen } from '../UI';

export const AuthLayout = ({ title = 'EasyCredit', children }) => {
   const [isInitial, setIsInitial] = useState(true);

   useEffect(() => {
      setTimeout(() => {
         setIsInitial(false);
      }, 2000);
   }, []);

   return (
      <>
         <Head>
            <title>{title}</title>
            <meta name='description' content='Otorga créditos + rápido + sencillo + easy' />
         </Head>
         {isInitial ? <LoadingScreen /> : <main className='fadeIn'>{children}</main>}
      </>
   );
};
