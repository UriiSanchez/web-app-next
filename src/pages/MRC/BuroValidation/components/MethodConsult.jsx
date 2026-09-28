import _ from 'lodash';
import { useEffect, useState } from 'react';

import { useGlobalContext } from '../../../../hooks';
import { colorStatus } from '../../../../helpers';

export default function MethodConsult({ docMCBC }) {
   const { actions } = useGlobalContext();
   const [method, setMethod] = useState({ title: '', folio: 0 });

   useEffect(() => {
      setMethod({ title: docMCBC?.selectedType, folio: docMCBC.folio });
   }, [docMCBC]);

   return (
      <div className='flex flex-col h-40 p-0.5 text-sm'>
         <div className='px-4 py-2 text-sm text-white bg-black border-white rounded-t'>
            <h4>Método para la consulta de Buró de Crédito</h4>
         </div>
         <div className='border-b rounded-b border-x border-gray'>
            <div className='grid h-24 grid-cols-3 text-xs border-b last:border-b-0 border-gray lg:text-sm 2xl:text-base'>
               <div className='flex items-center col-span-2 px-4 text-base'>
                  <h3 className='w-full'>{method?.title || '-'}</h3>
               </div>
               <div className='flex items-center justify-center px-4'>
                  <button
                     type='button'
                     disabled={docMCBC?.folio === 0}
                     className='pt-1 pb-1 pl-5 pr-5 text-xs text-white rounded-full bg-black-900'
                     onClick={() => actions.togglePDF(method)}>
                     Visualizar
                  </button>
               </div>
            </div>
            {!_.isEmpty(docMCBC) &&
               docMCBC.screenBureau?.docs?.map((dc) => (
                  <div
                     key={'RL-' + dc._id}
                     className='grid h-24 grid-cols-3 text-xs border-b last:border-b-0 border-gray lg:text-sm 2xl:text-base'>
                     <div className='flex flex-col justify-center col-span-2 px-4 text-base'>
                        <h3 className='w-full'>{dc.title || ''}</h3>
                        {dc.layout && <h5 className='text-xs text-gray'>{dc.layout}</h5>}
                        {dc.status && (
                           <h5 className={`text-xs text-${colorStatus[dc?.status] || 'gray'}`}>{dc.status}</h5>
                        )}
                     </div>
                     <div className='flex items-center justify-center px-4'>
                        <button
                           type='button'
                           disabled={!dc.enable}
                           className='pt-1 pb-1 pl-5 pr-5 text-xs text-white rounded-full bg-black-900'
                           onClick={() => actions.togglePDF({ title: dc.title, folio: dc.folio })}>
                           Visualizar
                        </button>
                     </div>
                  </div>
               ))}
         </div>
      </div>
   );
}
