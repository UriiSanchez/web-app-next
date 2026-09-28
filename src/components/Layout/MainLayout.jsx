import _ from 'lodash';
import { useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

import { CustomStepper } from '../Controls';
import { PDFModal } from '../Modal';
import { Loader, Navbar } from '../UI';
import { useGlobalContext } from '../../hooks';
import { sweetNormal, getWelcomeMessage } from '../../helpers';

/**
 * @param title - Permite identificar la pantalla que se encuentra activa.
 * @param children - Es el contenido que debe entre la etiqueta main.
 * @param props - Son los tributos heredados, para footer o estilos
 **/
export const MainLayout = ({ title = 'Home', children, ...props }) => {
   const { data } = useSession();
   const { loader, showPDF, stepper } = useGlobalContext();
   const pageTitle = 'EasyCredit - ' + title;

   useEffect(() => {
      const isShowWelcome = localStorage.getItem('showWelcome');
      if (!isShowWelcome && !_.isEmpty(data)) {
         let msg = getWelcomeMessage();
         sweetNormal({ title: `¡${msg + data?.user?.fullName}!` });
         localStorage.setItem('showWelcome', true);
      }
   }, [data]);

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            <meta name='description' content='Otorga créditos + rápido + sencillo + easy' />
         </Head>
         <Navbar />
         <main className={`${props?.sx || 'h-auto min-h-max'}`}>
            {loader.isShow && <Loader msg={loader.msg} />}
            {showPDF.isShow && <PDFModal />}
            {children}
         </main>
         {!showPDF.isShow && (
            <footer
               className={clsx('w-full h-12 bg-black-900', {
                  'sticky bottom-0 z-50': stepper.isShow,
                  'z-0': !stepper.isShow
               })}>
               {stepper.isShow && <CustomStepper />}
            </footer>
         )}
      </>
   );
};
