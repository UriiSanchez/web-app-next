import React, { useEffect } from 'react';
import parse from 'html-react-parser';

import styles from './ui.module.css';

export function Loader({ msg = 'Procesando...', children, sx }) {
   useEffect(() => {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.scroll = 'no';

      return () => {
         document.documentElement.style.overflow = 'auto';
         document.documentElement.scroll = 'yes';
      };
   }, []);

   if (children != undefined) {
      return <div className={styles['container-loader'] + ' fadeIn'}>{children}</div>;
   }

   return (
      <div className={styles['container-loader'] + ' fadeIn'}>
         <div className={`flex flex-col items-center justify-center rounded p-4 gap-4 bg-white ${sx || 'h-56 w-72 '}`}>
            <div className='flex items-center justify-center'>
               <div className={styles.wrapper}>
                  <div className={styles.leftHalf}></div>
                  <div className={styles.spinner}></div>
                  <div className={styles.rightHalf}></div>
               </div>
            </div>
            {msg && <div className={styles.cargando + ' text-center'}>{parse(msg)}</div>}
         </div>
      </div>
   );
}

export function LoaderStatic() {
   return (
      <div className='flex flex-col items-center justify-center w-full h-screen gap-4 border-8 border-black-900'>
         <div className='flex items-center justify-center'>
            <div className={styles.wrapper + ' animate-bounce'}>
               <div className={styles.leftHalf}></div>
               <div className={styles.spinner}></div>
               <div className={styles.rightHalf}></div>
            </div>
         </div>
         <div className='text-center'>
            Estamos cargando el documento
            <br />a guarda un momento...
         </div>
      </div>
   );
}
