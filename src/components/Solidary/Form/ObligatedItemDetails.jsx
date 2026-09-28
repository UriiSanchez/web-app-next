'use client';
import _ from 'lodash';
import React, { Fragment } from 'react';
import clsx from 'clsx';

import SearchObligated from './SearchObligated';
import { DeleteButton } from '../../Controls';

const ObligatedItemDetails = ({
   obligated,
   index,
   showSeparator,
   isNotEditable,
   idRequest,
   numVirtualObligateds,
   onSetObligated,
   onDeletedObligated,
   onAddObligated,
}) => {
   let IdTemplates = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
   if (isNotEditable) {
      return (
         <Fragment>
            <p className='mt-2'>Obligado Solidario&nbsp;{IdTemplates[index]}</p>
            <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9'>
               {obligated?.fullName || ''}
            </div>
            {obligated?.maritalStatus && (
               <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9'>
                  {obligated?.maritalStatus || ''}
               </div>
            )}
            {obligated?.mail && (
               <div className='flex items-center w-full px-2 py-1 text-sm text-right truncate bg-gray-100 border border-gray-400 rounded h-9'>
                  {obligated?.mail || ''}
               </div>
            )}
            {showSeparator && (
               <div className='flex justify-center'>
                  <span className='w-3/4 mx-auto my-4 border border-gray' />
               </div>
            )}
         </Fragment>
      );
   }

   return (
      <Fragment>
         <div className='flex justify-between'>
            <p>Obligado Solidario&nbsp;{IdTemplates[index]}</p>
            {(numVirtualObligateds > 1 || !_.isEmpty(obligated)) && (
               <DeleteButton fn={onDeletedObligated} sx='h-fit w-fit' />
            )}
         </div>
         <SearchObligated idRequest={idRequest} onSetItem={onSetObligated} idx={index} />
         <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9 text-gray-400'>
            {obligated?.fullName || 'Nombre'}
         </div>
         {obligated?.personType !== 'PM' && (
            <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9 text-gray-400'>
               {obligated?.maritalStatus || 'Estado civil'}
            </div>
         )}
         {obligated?.personType !== 'PF' && (
            <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9 text-gray-400'>
               {obligated?.mail || 'ejemplo@bancobase.com'}
            </div>
         )}
         {showSeparator ? (
            <div className='px-4 mt-3 text-sm text-center'>
               <button
                  type='button'
                  disabled={_.isEmpty(obligated)}
                  className={clsx('text-blue-400 hover:underline', {
                     'clean select-none': obligated,
                  })}
                  onClick={onAddObligated}>
                  Agregar obligado solidario +
               </button>
            </div>
         ) : (
            <div className='flex justify-center'>
               <span className='w-3/4 mx-auto my-4 border border-gray-300' />
            </div>
         )}
      </Fragment>
   );
};

export default ObligatedItemDetails;
