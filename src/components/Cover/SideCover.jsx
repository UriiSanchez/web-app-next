import _ from 'lodash';
import { Fragment, useEffect } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

import { useToggle } from '../../hooks';
import imgMenu from '../../../public/icons/ico_menu.svg';

/**
 * Componente exclusivo para el menu lateral de la caratula
 * @param {Array.<Object>} data - Listado de solicitantes
 * @param {Function} fnSet - Funcion que permite cambiar al Aplicante activo,
 * @returns {JSX.Element} Menu lateral de solicitantes
 */
export const SideCover = ({ data = [], onFunc }) => {
   const [toggled, setToggled] = useToggle();

   useEffect(() => {
      if (toggled) {
         document.documentElement.classList.add('overflow-hidden');
      } else {
         document.documentElement.classList.remove('overflow-hidden');
      }

      return () => {
         document.documentElement.classList.remove('overflow-hidden');
      };
   }, [toggled]);

   return (
      <>
         <button
            id='menuButton'
            data-testid='menuButton'
            type='button'
            className='flex items-center'
            onClick={(e) => {
               setToggled(true);
               e.stopPropagation();
            }}>
            <Image src={imgMenu} alt='Icono menú' />
         </button>
         {toggled && (
            <>
               <div className='fixed top-0 left-0 z-10 w-screen h-screen bg-black opacity-30' />
               <div
                  onClick={() => setToggled(false)}
                  className='fixed top-0 left-0 z-10 w-screen h-screen fadeIn backdrop-filter backdrop-blur-sm'
               />
               <div
                  className={clsx(
                     'fixed p-5 left-0 top-0 w-96 h-screen bg-black-900 z-20 shadow-2xl transform transition-all duration-300 text-white',
                     {
                        'translate-x-full hidden': !toggled,
                     }
                  )}>
                  <div className='flex flex-col gap-3 text-sm'>
                     {!_.isEmpty(data) &&
                        data.map((item) => (
                           <Fragment key={'child-' + item.idRequest}>
                              <div
                                 className='flex gap-1 py-1 select-none cursor-pointer hover:bg-[#83838385]'
                                 onClick={() => {
                                    if (data.length > 1) {
                                       onFunc(item.idRequest);
                                    }
                                    setToggled(false);
                                 }}>
                                 <span
                                    className={clsx(
                                       'flex-none select-none w-6 material-symbols-outlined icon-size-24',
                                       {
                                          'text-yellow-500': item.coverComplete,
                                       }
                                    )}>
                                    {item.coverComplete ? 'check_circle' : 'done'}
                                 </span>
                                 <p
                                    id='applicant'
                                    data-testid='applicant'
                                    className='items-center px-1.5 truncate'
                                    title={item.generalDataCifResponse.applicant}>
                                    {item.generalDataCifResponse.applicant}
                                 </p>
                              </div>
                           </Fragment>
                        ))}
                  </div>
               </div>
            </>
         )}
      </>
   );
};

SideCover.prototypes = {
   data: PropTypes.array.isRequired,
   fnSet: PropTypes.func.isRequired,
};
