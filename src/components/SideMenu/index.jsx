import _ from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

import { useToggle } from '../../hooks';
import imgMenu from '../../../public/icons/ico_menu.svg';
import styles from './sidemenu.module.css';

/**
 * Componente exclusivo para el menu lateral del modelo, muesta aplicantes y obligados junto a las pantallas que
 * puede ver cada uno
 * @param {Array.<Object>} data - Listado de solicitantes y sus obligados solidarios
 * @param {Function} onFunc - Funcion que permite cambiar al Aplicante u Obligado activo.
 * @param {number} idActive - Pasa el id Cliente activon en pantalla
 * @returns {JSX.Element} Menu lateral
 */
export const SideMenu = ({ data = [], onFunc, idActive }) => {
   const [expandItems, setExpandItems] = useState([]);
   const [toggled, setToggled] = useToggle(false);

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

   const onClickExpansion = (e, idItem) => {
      e.stopPropagation();
      let items = expandItems.includes(idItem) ? expandItems.filter((id) => id != idItem) : [...expandItems, idItem];
      setExpandItems(items);
   };

   return (
      <>
         <button
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
                  <div className='flex flex-col gap-1 text-sm container-overflow'>
                     {!_.isEmpty(data) &&
                        data.map(({ applicant, obligated, ...other }) => {
                           let funcs = {
                              ei: expandItems,
                              fnToggle: setToggled,
                              fnExpand: onClickExpansion,
                           };
                           return (
                              <Fragment key={'content-' + other?.idRequest}>
                                 <PaintItem
                                    key={applicant.idClient}
                                    {...{
                                       item: applicant,
                                       idActive,
                                       fnClick: () => {
                                          onFunc(other, applicant);
                                          setToggled(false);
                                       },
                                       ...funcs,
                                    }}
                                 />
                                 {!_.isEmpty(obligated) &&
                                    obligated?.map((item) => (
                                       <PaintItem
                                          key={item.idClient}
                                          {...{
                                             item,
                                             idActive,
                                             fnClick: () => {
                                                onFunc(other, item);
                                                setToggled(false);
                                             },
                                             ...funcs,
                                          }}
                                       />
                                    ))}
                              </Fragment>
                           );
                        })}
                  </div>
               </div>
            </>
         )}
      </>
   );
};

const PaintItem = ({ item, idActive, ei, fnClick, fnExpand }) => {
   const isExpanded = ei.includes(item.idClient);
   const isApplicant = item?.participantType == 'Solicitante';
   return (
      <div
         className={clsx('flex flex-wrap items-center gap-1', {
            'ml-8 my-1': !isApplicant,
         })}>
         {isApplicant && (
            <span className='flex-none w-6 material-symbols-outlined icon-size-24 '>
               {item.idClient == idActive ? 'check_circle' : 'done'}
            </span>
         )}
         <p className={styles['btn-item']} onClick={fnClick}>
            {item.fullName}
         </p>
         {item?.docs && (
            <button
               className='flex items-center flex-none w-6 rounded-full'
               onClick={(e) => fnExpand(e, item.idClient)}>
               <span className='cursor-pointer material-symbols-outlined icon-size-24'>
                  {isExpanded ? 'expand_more' : 'expand_less'}
               </span>
            </button>
         )}
         {isExpanded && (
            <ul
               className={clsx('flex flex-col w-full gap-2 pl-2 font-light text-white border-l border-gray fadeIn', {
                  'ml-8': isApplicant,
               })}>
               {item.docs.map((doc) => (
                  <li key={item.idClient + '-' + doc}>
                     <p className='w-full'>{doc}</p>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};

SideMenu.prototypes = {
   data: PropTypes.array.isRequired,
   onFunc: PropTypes.func.isRequired,
   idActive: PropTypes.number.isRequired
};
