import React from 'react';
import Image from 'next/image';

import { getCurrentYear } from '../../helpers/helpDates';
import Logo from '../../../public/loading.gif';

export const LoadingScreen = () => {
   const year = getCurrentYear();
   return (
      <div className='w-screen relative fadeIn'>
         <div className='h-screen flex justify-center items-center'>
            <Image src={Logo} alt='Loading EasyCreadit' priority unoptimized/>
         </div>
         <div className='text-gray text-xs font-light absolute bottom-14 left-14'>
            <p>Copyright @BancoBase{year} | Política de Privacidad</p>
         </div>
      </div>
   );
};
