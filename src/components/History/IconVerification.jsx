import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import { constProfiles as Profile, EnumStatus as Estatus } from '../../helpers/config';

/**
 * Componente que permite añadir una verificación por EF o validar una verificación por AC y LC.
 * @param {Number} idProfile - Perfile en sesión
 * @param {Number} idCatStatus - Id Status de la solicitud
 * @param {Number} idRequest - Id de la solicitud
 * @param {Number} idGroup - Id del group
 * @param {boolean} hasVerification - Permite saber si el ADC o LDC tienen una verificación pendiente por validar
 * @param {boolean} pendingVerification - Permite saber si el EMG tienen una verificación pendiente por realizar
 */
export function IconVerification({
   idProfile,
   idCatStatus,
   idRequest,
   idGroup,
   hasVerification = false,
   pendingVerification = false,
}) {
   const { push } = useRouter();
   const url = `/Shared/PropertyVerification/${idRequest}?idGroup=${idGroup}&origin=History`;

   if (
      Profile.EMG === idProfile &&
      [Estatus.EN_RESOLUCION_SECRETARIADO, Estatus.SOLICITUD_AUTORIZADA].includes(idCatStatus) &&
      pendingVerification
   ) {
      return (
         <div type='button' className='flex items-center flex-1 gap-2'>
            <Link href={url} className='relative cursor-pointer group'>
               <div className='absolute hidden w-auto left-5 group-hover:block -top-6'>
                  <p className='w-56 px-2 py-0.5 mt-1 text-sm text-center text-white rounded-tl rounded-r bg-blue-800'>
                     No cuenta con la seguridad
                  </p>
               </div>
               <span className='text-yellow-500 material-symbols-outlined filled icon-size-38'>gpp_bad</span>
            </Link>
         </div>
      );
   }

   if (
      [Profile.ADC, Profile.LDC].includes(idProfile) &&
      [Estatus.EN_RESOLUCION_SECRETARIADO, Estatus.SOLICITUD_AUTORIZADA].includes(idCatStatus)
   ) {
      return (
         <div className='flex items-center flex-1 gap-2'>
            <div
               type='button'
               onClick={() => hasVerification && push(url)}
               className={clsx('flex items-center flex-1 gap-2 cursor-default group', {
                  'cursor-pointer': hasVerification,
                  'cursor-default': !hasVerification,
               })}>
               <span
                  className={clsx('material-symbols-outlined filled icon-size-38 ', {
                     'text-yellow-500': hasVerification,
                     'text-gray': !hasVerification,
                  })}>
                  gpp_bad
               </span>
               <p className='px-2'>Ir a verificar</p>
               <div className={clsx('flex items-center', { 'cursor-pointer': hasVerification })}>
                  <span
                     className={clsx('material-symbols-outlined icon-size-20 text-black-500 ', {
                        'text-blue-800': hasVerification,
                     })}>
                     open_in_new
                  </span>
               </div>
               {hasVerification && (
                  <div className='absolute hidden float-left w-auto mt-12 -ml-24 group-hover:block'>
                     <p className='px-2 py-1 mt-1 text-sm text-center text-white bg-blue-800 rounded'>
                        Haz clic para abrir la verificación
                     </p>
                  </div>
               )}
            </div>
         </div>
      );
   }

   return  <div></div>;
}

IconVerification.propTypes = {
   idProfile: PropTypes.number.isRequired,
   idCatStatus: PropTypes.number.isRequired,
   idRequest: PropTypes.number.isRequired,
   idGroup: PropTypes.number.isRequired,
   hasVerification: PropTypes.bool,
};
