import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { ChatComponent } from './Chat/ChatComponent';
import { InformationRequestBar } from './OptionsBar/InformationRequestBar';
import { useGlobalContext } from '../../hooks';
import { constProfiles as Profiles } from '../../helpers/config';

import icoChat from '../../../public/icons/ico_message_outlined.svg';

/**
 * Componente de barra con los iconos Información y Chat sobre la solicitud activa en pantalla.
 *
 * @component
 * @param {string} requestActive - Es un objeto con la información de la solicitud activo o en pantalla
 * @param {Object} dimensions - Es un objeto con los atributos height y width en numerico
 *
 * @example
 * const applicant = {
 *        idRequest: 230,
 *         idCatStatus: 26,
 *         fullname: "CM HOTEL S.A. DE C.V.",
 *         idCatTypePerson: 1,
 *         personType: "PM",
 *         idClient: "4526900",
 *         statusFaculty: null,
 *    };
 *
 * const dimensions = {
 *       height: 100,
 *       width:200
 *    };
 *
 * <QuickActionBar requestActive={applicant} dimensions={dimensions} />
 * */
export const QuickActionBar = ({ requestActive, dimensions }) => {
   const { user } = useGlobalContext();
   const [settingsBar, setSettingsBar] = useState({ isOpen: false, selectIcon: '' });

   const onClickIconBar = (newSelectIcon) => {
      let newObject = {};
      if (newSelectIcon === settingsBar.selectIcon) {
         newObject = {
            isOpen: false,
            selectIcon: '',
         };
      } else {
         newObject = {
            isOpen: true,
            selectIcon: newSelectIcon,
         };
      }

      setSettingsBar(newObject);
   };

   return (
      <section
         className={`flex border-l border-black  h-[${
            dimensions.height || '695px'
         }] transition-all duration-1000 shadow-lg shadow-slate-900/20 shadow-2 w-auto`}>
         <div className='flex flex-col w-12 my-4 bg-white select-none'>
            <button
               onClick={() => onClickIconBar('INFO')}
               className={clsx('w-full h-10 flex items-center justify-center', {
                  'hover:bg-[#D9D9D9] hover:shadow-inner': settingsBar.selectIcon !== 'INFO',
                  'bg-[#D9D9D9]': settingsBar.selectIcon === 'INFO',
               })}>
               <span className='material-symbols-outlined' alt='Información'>
                  info
               </span>
            </button>
            {user?.idProfile === Profiles.FAC && (
               <button
                  onClick={() => onClickIconBar('CHAT')}
                  className={clsx('w-full h-10 flex items-center justify-center', {
                     'hover:bg-[#D9D9D9] hover:shadow-inner': settingsBar.selectIcon !== 'CHAT',
                     'bg-[#D9D9D9]': settingsBar.selectIcon === 'CHAT',
                  })}>
                  <Image src={icoChat} alt='Chat' />
               </button>
            )}
         </div>
         <div
            className={clsx('w-[27rem] bg-[#D9D9D9] items-start justify-center px-4 py-3', {
               hidden: !settingsBar.isOpen,
               flex: settingsBar.isOpen,
            })}>
            {settingsBar.selectIcon === 'INFO' && (
               <InformationRequestBar
                  fullName={requestActive?.fullName}
                  authorizations={requestActive?.authorizationsFaculty}
               />
            )}
            {settingsBar.selectIcon === 'CHAT' && (
               <ChatComponent idRequest={requestActive.idRequest} idStatusRequest={requestActive.idCatStatus} />
            )}
         </div>
      </section>
   );
};

QuickActionBar.propTypes = {
   requestActive: PropTypes.object.isRequired,
   dimensions: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number,
   }).isRequired,
};
