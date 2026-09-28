import React from 'react';
import { useRouter } from 'next/router';

import { MainLayout } from '../components/Layout';

const Page500 = () => {
   const { back } = useRouter();
   return (
      <MainLayout title='Internal Error'>
         <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
            <h1 className='text-9xl'>500</h1>
            <p className='text-3xl'>Server-side error occurred</p>
            <button className='text-blue-800 hover:underline' onClick={back}>
               Regresar
            </button>
         </div>
      </MainLayout>
   );
};

export default Page500;
