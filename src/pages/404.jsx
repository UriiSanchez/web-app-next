import React from 'react';
import { MainLayout } from '../components/Layout';
import { useRouter } from 'next/router';

const Page404 = () => {
   const { back } = useRouter();
   return (
      <MainLayout title='Page not found'>
         <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
            <h1 className='text-9xl'>404</h1>
            <p className='text-3xl'> No hemos encontrado nada por aquí</p>
            <button className='text-blue-800 hover:underline' onClick={back}>
               Regresar
            </button>
         </div>
      </MainLayout>
   );
};

export default Page404;
