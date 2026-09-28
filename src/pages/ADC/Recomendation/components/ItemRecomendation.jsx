import _ from 'lodash';
import React from 'react';
import clsx from 'clsx';

import { formatId } from '../../../../helpers';
import { constTypePerson as TypePerson } from '../../../../helpers/config';

export default function ItemRecomendation({ data = {}, onSet }) {
   return (
      <div className='flex flex-row gap-4 mx-auto container-overflow'>
         {!_.isEmpty(data) ? (
            data.map((item) => {
               let soli = item?.relatedPersonResponseList.find((sl) => sl.idCatTypePerson == TypePerson.APPLICANT);
               let oblys = item?.relatedPersonResponseList.filter(
                  (sl) => sl.idCatTypePerson == TypePerson.SOLIDARY_OBLIGED
               );
               return (
                  <div key={item?.idRequest} className='flex flex-col flex-none gap-4 w-72 fadeIn'>
                     <div>
                        <div className='px-4 py-2 text-white rounded-t-lg 2xl:py-4 bg-black-900'>
                           <h3 className='text-base font-light'>Solicitud&nbsp;{formatId(item?.idRequest) || '-'}</h3>
                        </div>
                        <div className='px-4 py-2 text-sm bg-white border rounded-b-lg border-gray'>
                           <h4 className='mb-2 text-base'>Solicitante</h4>
                           <p className='py-1 text-sm'>{soli?.fullName || ''}</p>
                        </div>
                     </div>
                     <div className='px-4 py-2 border rounded border-gray bg-white container-overflow h-[15rem!important] xl:h-[17rem!important]'>
                        <h4 className='mb-2 text-base'>Obligados solidarios</h4>
                        {oblys?.map((ob) => (
                           <p key={'ob-' + ob?.idClient} className='py-1 text-sm'>
                              {ob?.fullName || ''}
                           </p>
                        ))}
                     </div>
                     <div className='flex flex-col bg-white border rounded border-gray'>
                        <textarea
                           col='6'
                           row='10'
                           maxLength={500}
                           value={item?.commentAc || ''}
                           onChange={(e) => onSet(e.target.value, item?.idRequest, 'commentAc')}
                           placeholder='Ingresa aquí los comentarios'
                           className='w-auto p-2 m-1 text-xs outline-none resize-none focus:text-blue-800 h-28 min-h-28 max-h-28'
                        />
                        <div className='flex border-t border-gray'>
                           <button
                              onClick={() => onSet(true, item?.idRequest, 'recommendationAc')}
                              className={clsx(
                                 'flex items-center justify-center w-1/2 h-10 text-sm border-r border-gray hover:bg-black-900 hover:text-white ',
                                 {
                                    'bg-black-900 text-white':
                                       !_.isNull(item?.recommendationAc) && item?.recommendationAc,
                                 }
                              )}>
                              <span className='w-6 material-symbols-outlined icon-size-20'>done</span>
                              Recomiendo
                           </button>
                           <button
                              onClick={() => onSet(false, item?.idRequest, 'recommendationAc')}
                              className={clsx(
                                 'flex items-center justify-center w-1/2 h-10 text-sm border-gray hover:bg-black-900 hover:text-white ',
                                 {
                                    'bg-black-900 text-white':
                                       !_.isNull(item?.recommendationAc) && !item?.recommendationAc,
                                 }
                              )}>
                              <span className='w-6 material-symbols-outlined icon-size-20'>close</span>
                              No Recomiendo
                           </button>
                        </div>
                     </div>
                  </div>
               );
            })
         ) : (
            <div className='flex flex-col flex-none w-64 gap-4'>
               <div>
                  <div className='h-8 px-4 py-2 text-white rounded-t-lg 2xl:py-4 bg-black-900'></div>
                  <div className='h-20 px-4 py-2 text-sm bg-white border rounded-b-lg border-gray box'></div>
               </div>
               <div className='px-4 py-2 border rounded border-gray bg-white container-overflow h-[15rem!important] xl:h-[17rem!important] box'></div>
               <div className='flex h-32 p-1 bg-white border rounded border-gray box'></div>
            </div>
         )}
      </div>
   );
}
