import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import {
   formatMiles,
   initItemShareholding,
   onKeyNumbers,
   onPasteOnlyNumbers,
   sumGenericDecimal,
   sweetNormal,
} from '../../helpers';

/**
 * Componente exclusivo para mostrar la sección Tenencia accionario de la carátula
 * @param {Object} data - Recibe un objeto con los datos de tenencia accionario
 * @param {Function} fnSet - Función que se ejecuta al modificar algún campo manual
 * @returns {JSX.Element} Sección Tenencia accionario de la carátula
 */
export function ItemSharedholding({ data, fnSet }) {
   const listShareholding = useMemo(() => {
      return data?.shareholding?.filter((value) => value.name !== 'Otros');
   }, [data?.shareholding]);

   const onlyOthers = data?.shareholding?.find((value) => value.name === 'Otros') || {
      ...initItemShareholding,
      name: 'Otros',
   };

   const onChangeVirtual = (e, id) => {
      const { name, value, type } = e;
      let setName = name.split('-')[0];
      let newData = structuredClone(data);
      const regex = /^\d{0,3}(\.\d{0,20})?$/;
      if (type == 'number' && (!regex.test(value) || value > 100)) {
         return;
      }

      newData.shareholding = newData.shareholding.map((sh) => (sh.id === id ? { ...sh, [setName]: value } : sh));

      if (['directParticipation', 'indirectParticipation'].includes(setName)) {
         let totalGeneric = sumGenericDecimal(newData.shareholding, setName);
         if (totalGeneric > 100) {
            sweetNormal({
               title: 'Recuerda que...',
               txt: `<p>La sumatoria del porcentaje de participación no puede ser mayor al 100%.</p>
                  <p class="text-xs mt-2">Total: ${totalGeneric}%</p>`,
            });
            return;
         }

         let setTotal = setName === 'directParticipation' ? 'totalDirect' : 'totalIndirect';
         newData[setTotal] = totalGeneric;
      }

      fnSet('infoFinancialResponse', '-', newData, 'object');
   };

   return (
      <div className='w-7/12 border rounded-md overflow-clip border-gray'>
         <div className='flex items-center h-8 px-4 text-white bg-black '>Tenencia accionario</div>
         <div className='flex flex-col gap-2 p-2 place-items-center '>
            <div className='grid w-full grid-cols-5 text-center'>
               <div className='col-span-2'>Accionistas</div>
               <div className='col-span-1'>RFC</div>
               <div className='col-span-1'>% Part. Directa</div>
               <div className='col-span-1'>% Part. Indirecta</div>
            </div>
            {listShareholding?.map((item) => {
               return (
                  <div key={item.id} className='grid w-full grid-cols-5 gap-2'>
                     <input
                        id={'name-' + item.id}
                        name={'name-' + item.id}
                        type='text'
                        maxLength='50'
                        onChange={(e) => onChangeVirtual(e.target, item.id)}
                        value={item?.name || ''}
                        className='h-8 col-span-2 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray disabled:bg-[#bebebe33]'
                     />
                     <input
                        id={'rfc-' + item.id}
                        name={'rfc-' + item.id}
                        type='text'
                        maxLength='13'
                        onChange={(e) => onChangeVirtual(e.target, item.id)}
                        value={item?.rfc || ''}
                        className='h-8 col-span-1 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray'
                     />
                     <input
                        id={'directParticipation-' + item.id}
                        name={'directParticipation-' + item.id}
                        type='number'
                        placeholder=''
                        value={item?.directParticipation || ''}
                        onChange={(e) => onChangeVirtual(e.target, item.id)}
                        onPaste={onPasteOnlyNumbers}
                        onKeyDown={onKeyNumbers}
                        className='h-8 col-span-1 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray'
                     />
                     <input
                        id={'indirectParticipation-' + item.id}
                        name={'indirectParticipation-' + item.id}
                        type='number'
                        placeholder=''
                        value={item?.indirectParticipation || ''}
                        onChange={(e) => onChangeVirtual(e.target, item.id)}
                        onPaste={onPasteOnlyNumbers}
                        onKeyDown={onKeyNumbers}
                        className='h-8 col-span-1 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray'
                     />
                  </div>
               );
            })}
            <div className='grid w-full grid-cols-5 gap-2'>
               <div className='flex items-center border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'>
                  Otros
               </div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'>
                  -
               </div>
               <input
                  id={'directParticipation-' + onlyOthers.id}
                  name={'directParticipation-' + onlyOthers.id}
                  type='number'
                  placeholder=''
                  value={onlyOthers?.directParticipation || ''}
                  onChange={(e) => onChangeVirtual(e.target, onlyOthers.id)}
                  onPaste={onPasteOnlyNumbers}
                  onKeyDown={onKeyNumbers}
                  className='h-8 col-span-1 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray'
               />
               <input
                  id={'indirectParticipation-' + onlyOthers.id}
                  name={'indirectParticipation-' + onlyOthers.id}
                  type='number'
                  placeholder=''
                  value={onlyOthers?.indirectParticipation || ''}
                  onChange={(e) => onChangeVirtual(e.target, onlyOthers.id)}
                  onPaste={onPasteOnlyNumbers}
                  onKeyDown={onKeyNumbers}
                  className='h-8 col-span-1 p-2 text-center border rounded outline-none remove-arrow focus:ring-1 focus:outline-none focus:text-blue-800 focus:border-blue-800 border-gray'
               />
            </div>
            <div className='grid w-full grid-cols-5 gap-2'>
               <div className='flex items-center justify-end border-gray bg-[#bebebe33] border h-8 rounded col-span-3 pr-6'>
                  Total
               </div>
               <div
                  title={`Total Directo: ${data?.totalDirect}%`}
                  className={clsx(
                     `flex items-center justify-center text-center bg-[#bebebe33] border h-8 rounded col-span-1 `,
                     {
                        'border-red-600 border-2 text-red-600':
                           data?.totalDirect !== 100 && !_.isEmpty(listShareholding),
                        'border-gray': data?.totalDirect === 100,
                     }
                  )}>
                  {data?.totalDirect + '%' || '-'}
               </div>
               <div
                  title={`Total Directo: ${data?.totalIndirect}%`}
                  className='flex items-center justify-center text-center border-gray
                  }  bg-[#bebebe33] border h-8 rounded col-span-1'>
                  {data?.totalIndirect+ '%' || '-'}
               </div>
            </div>
            <label htmlFor='información' className='text-xs text-red-600 '>
               El total de la participación directa no puede ser mayor al 100%
            </label>
         </div>
      </div>
   );
}

ItemSharedholding.prototypes = {
   data: PropTypes.object.isRequired,
   fnSet: PropTypes.func.isRequired,
};
