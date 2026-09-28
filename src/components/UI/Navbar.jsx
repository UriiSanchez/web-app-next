import React from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import { useGlobalContext } from '../../hooks';

import logo from '../../../public/logo_white.png';

export function Navbar() {
   const { asPath } = useRouter();
   const { user, settings } = useGlobalContext();

   return (
      <nav className='px-3 bg-black-900 h-[3.75rem]'>
         <div className='flex flex-wrap items-center justify-between mx-auto text-white'>
            <Link href={`${settings?.startPage || '/'}`}>
               <Image src={logo} alt='Logo EasyCreadit Blanco' width={130} priority />
            </Link>
            <ul className='flex flex-row flex-auto gap-4 2xl:text-lg'>
               {settings?.menu.map((item) => {
                  let active =
                     asPath === item.redirectTo || (asPath.includes(item.redirectTo) && item.redirectTo != '/')
                        ? 'border-b-2 border-white bg-black'
                        : '';
                  return (
                     <li key={'nav_' + item.redirectTo} className={`flex items-center w-32 px-3 h-[3.75rem] ${active}`}>
                        <Link
                           href={item.redirectTo}
                           className={`w-full text-center ${
                              item.isDisable ? 'pointer-events-none opacity-30 font-light' : ''
                           }`}>
                           {item.title}
                        </Link>
                     </li>
                  );
               })}
            </ul>
            <div className='flex flex-row items-center gap-4 text-sm 2xl:text-normal'>
               <span>{user?.profile || ''}</span> |
               <span
                  style={{ backgroundColor: user?.color || '#475569' }}
                  className='flex-none p-1 text-sm rounded-full'>
                  {user?.firstLetters || '--'}
               </span>
               <span>{user?.fullName}</span>
               <button
                  type='button'
                  className='flex p-1 rounded-full hover:bg-white hover:text-black'
                  title='Cerrar sesión'
                  onClick={() => {
                     localStorage.clear();
                     signOut();
                  }}>
                  <span className='material-symbols-outlined'>logout</span>
               </button>
            </div>
         </div>
      </nav>
   );
}
