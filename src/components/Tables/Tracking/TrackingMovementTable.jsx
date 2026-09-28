import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

import styles from '../Details/details.module.css';
import { datetimeToString } from '../../../helpers';

/**
 * Componente que muestra una tabla de movimientos de una solicitud específica.
 * Maneja tres estados: cargando, sin movimientos y con movimientos.
 * @param {Object} props - Las props del componente
 * @param {boolean} props.isLoading - Indica si los datos están cargando. Sí es `true`, muestra un esqueleto de carga.
 * @param {Array} props.details - El arreglo de objetos con los detalles de los movimientos a mostrar.
 * @return {JSX.Element} El componente de tabla de movimientos renderizado
 * */
export function TrackingMovementTable({ isLoading, details }) {
   if (isLoading) {
      return (
         <div className='flex flex-col gap-2 px-4' data-testid='loading-skeleton'>
            <div data-testid='skeleton-item' className='col-span-3 flex items-center gap-2 h-12 box' />
            <div data-testid='skeleton-item' className='col-span-2 h-12 box' />
            <div data-testid='skeleton-item' className='col-span-1 h-12 box' />
         </div>
      );
   }

   if (_.isEmpty(details)) {
      return (
         <div className='flex items-center justify-center min-h-max tracking-item text-xs 2xl:text-sm'>
            No se encontraron movimientos
         </div>
      );
   }

   const renderNameFacultys = (listAuthorization) => {
      if (_.isEmpty(listAuthorization)) {
         return <div>-</div>;
      }

      return listAuthorization.map((faculty) => {
         return (
            <div key={faculty.userAD} className='flex items-center gap-1'>
               <div
                  className={clsx('w-2 h-2 rounded-full', {
                     'bg-red-500': faculty.decisionFaculty === 'NO',
                     'bg-emerald-500': faculty.decisionFaculty === 'YES',
                  })}></div>
               <div className='truncate'>{faculty.fullName}</div>
            </div>
         );
      });
   };

   return (
      <div className='flex flex-col text-sm box-border overflow-y-auto'>
         <div className='grid grid-cols-6 py-3 border-b-gray border-b px-4 mb-4 sticky top-0 z-10 bg-white'>
            <div className='col-span-3'>Área Y Responsable</div>
            <div className='col-span-2'>Llegada</div>
            <div className='col-span-1'>Tiempo total</div>
         </div>
         <div className='flex-1  relative px-4 flex flex-col gap-5 text-xs 2xl:text-sm z-0'>
            {details.map(({ idTracking, profile, flagDevolution, fullName, createDate, ...others }, idx) => {
               let isFirstPosition = idx === 0;
               let iconStatus = flagDevolution ? 'sync' : 'check';
               return (
                  <div
                     key={`Movimiento-${idTracking}-Profile-${profile}`}
                     data-testid='tracking-timeline'
                     className={styles['tracking-timeline']}>
                     <div className=' col-span-3 flex items-center gap-2'>
                        <div className='flex-none w-10 z-10 flex items-center justify-center'>
                           <span
                              className={clsx(
                                 'material-symbols-outlined filled icon-size-20 rounded-full text-white z-[1px]',
                                 {
                                    'bg-emerald-500': isFirstPosition,
                                    'bg-[#B7B8B7]': !isFirstPosition,
                                    'bg-[#F9D37F]': flagDevolution,
                                 }
                              )}>
                              {iconStatus}
                           </span>
                        </div>
                        <div className='flex-1 text-left'>
                           <p className='font-semibold'>{profile || '-'}</p>
                           {profile.includes('FACULTADO') ? (
                              renderNameFacultys(others.authorizationFacultyResponse)
                           ) : (
                              <div className='truncate'>{fullName || '-'}</div>
                           )}
                        </div>
                     </div>
                     <div className='col-span-2'>{datetimeToString(createDate)}</div>
                     <div className='col-span-1'>{others?.totalTime ?? '-'}</div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}

TrackingMovementTable.propTypes = {
   isLoading: PropTypes.bool,
   details: PropTypes.array,
};
