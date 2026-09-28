'use client';
import _ from 'lodash';
import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

/**
 * Componente que renderiza un listado de forma vertical de los analistas activos.
 * @param {Object} props - Propiedades que heredan del componente padre.
 * @param {array} props.analyst - Lista de Analistas
 * @param {string} [props.selectedAnalystFilter=''] - Indica el analista seleccionado desde el componente padre el cual sé resalta.
 * @param {function} props.onSelectedAnalystFilter - Función que permite actualizar el analista seleccionado.
 * */
export const AnalystListContainer = ({ analyst, selectedAnalystFilter = '', onSelectedAnalystFilter }) => {
   if (_.isEmpty(analyst)) {
      return (
         <div data-testid="skeleton-container-analyst" className='text-xs border-[1.5px] rounded container-overflow border-gray min-h-96 2xl:min-h-[33rem]'>
            <div className='grid items-center justify-center h-full grid-cols-6 hover:bg-white box' />
         </div>
      );
   }

   return (
      <div className='text-xs border-[1.5px] rounded container-overflow border-gray min-h-96 2xl:min-h-[33rem]'>
         {analyst?.map(({ fullName, color, requestsAssigned, userAD, firstLetters }) => (
            <div
               key={userAD}
               onClick={() => onSelectedAnalystFilter(userAD)}
               className={clsx('grid grid-cols-6 items-center px-3 py-4 cursor-pointer hover:bg-gray-200 fadeIn', {
                  'bg-gray-200': selectedAnalystFilter === userAD,
               })}>
               <div
                  style={{ backgroundColor: color }}
                  className='flex items-center text-[11px] justify-center w-6 h-6 leading-none rounded-full text-white'>
                  {firstLetters}
               </div>
               <p className='col-span-4'>{fullName?.toUpperCase()}</p>
               <span className='text-xl font-medium text-center'>{requestsAssigned}</span>
            </div>
         ))}
      </div>
   );
};

AnalystListContainer.propTypes = {
   analyst: PropTypes.array,
   selectedAnalystFilter: PropTypes.string,
   onSelectedAnalystFilter: PropTypes.func,
};
