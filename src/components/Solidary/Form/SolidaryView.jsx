'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { formatMoney } from '../../../helpers';
import { constTypePerson as TypePerson } from '../../../helpers/config';

const ObligatedDetails = dynamic(() => import('./ObligatedItemDetails'));

export function SolidaryView({ request, isNotEditable }) {
   const holder = request?.relatedPersonResponseList.find((person) => person.idCatTypePerson === TypePerson.APPLICANT);
   const listOS = useMemo(() => {
      return request?.relatedPersonResponseList.filter((u) => u?.idCatTypePerson === TypePerson.SOLIDARY_OBLIGED);
   }, [request?.relatedPersonResponseList]);

   return (
      <div className='flex flex-none flex-col h-auto text-sm bg-opacity-75 rounded bg-neutral-50 w-80'>
         <div className='px-4 py-2 text-left text-white rounded-tl rounded-tr bg-black-900'>
            <h3 className='truncate' title={holder.fullName || '-'}>
               {holder.fullName || '-'}
            </h3>
         </div>
         <div className='relative flex flex-col gap-1 px-4 pt-2 pb-4 text-sm border rounded-b border-gray'>
            <p>Tipo de trámite</p>
            <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9'>
               {request?.kindProcedure || ''}
            </div>
            <p>Monto de línea solicitado</p>
            <div className='flex items-center w-full px-2 py-1 text-sm text-right bg-gray-100 border border-gray-400 rounded h-9'>
               {formatMoney(request?.requestAmount)}
            </div>
            {!_.isEmpty(listOS) &&
               listOS.map((obligated, idx) => {
                  let showSeparator = listOS.length < 10 && idx !== listOS.length - 1;
                  return (
                     <ObligatedDetails
                        key={`Request-${request.idRequest}-OS-${obligated.idClient}`}
                        obligated={obligated}
                        index={idx}
                        showSeparator={showSeparator}
                        isNotEditable={isNotEditable}
                     />
                  );
               })}
         </div>
      </div>
   );
}
