import _ from 'lodash';
import React from 'react';
import { clsx } from 'clsx';

import { RecomendationSkeleton } from '../../../../components';
import { formatId } from '../../../../helpers';
import { constTypePerson as TypePerson } from '../../../../helpers/config';

export default function ItemRecomendation({ data = {}, onSet }) {
   if (_.isEmpty(data)) {
      return <RecomendationSkeleton />;
   }

   return (
      <div className='flex flex-col w-full h-auto gap-6 mx-auto'>
         {data.map((item) => {
            let soli = item?.relatedPersonResponseList.find((sl) => sl.idCatTypePerson == TypePerson.APPLICANT);
            let oblys = item?.relatedPersonResponseList.filter(
               (sl) => sl.idCatTypePerson == TypePerson.SOLIDARY_OBLIGED
            );
            return (
               <div key={'column-' + item?.idRequest} className='flex gap-4 fadeIn'>
                  <div className='flex flex-col w-1/4'>
                     <h3 className='px-4 py-2 text-base font-light text-white 2xl:py-4 rounded-t-md bg-black-900'>
                        Solicitud&nbsp;{formatId(item?.idRequest) || '-'}
                     </h3>
                     <div className='px-4 py-2 text-sm bg-white border rounded-b-lg border-gray'>
                        <h4 className='mb-2 text-lg'>Solicitante</h4>
                        <p className='py-1 text-sm'>{soli?.fullName || ''}</p>
                     </div>
                     <div className='px-4 py-2 mt-4 border rounded-md border-gray bg-white container-overflow h-[26.5rem!important] min-h-80'>
                        <h4 className='mb-2 text-lg'>Obligados solidarios</h4>
                        {oblys?.map((ob) => (
                           <p key={'ob-' + ob?.idClient} className='py-1 text-sm'>
                              {ob?.fullName || ''}
                           </p>
                        ))}
                     </div>
                  </div>
                  <div className='flex flex-col w-1/4'>
                     <h3 className='px-4 py-2 text-base font-light text-white 2xl:py-4 rounded-t-md bg-black-900'>
                        Analista de Contraparte
                     </h3>
                     <div className='flex flex-col h-full text-sm bg-white border border-gray rounded-b-md'>
                        <h4 className='px-4 py-2 text-lg'>Comentarios</h4>
                        <div className='px-4 text-sm border-b text-black-light grow border-gray'>{item?.commentAc}</div>
                        <div className='flex rounded-b-md'>
                           <button
                              disabled={item?.recommendationAc}
                              className='flex items-center justify-center w-1/2 h-10 text-sm bg-white cursor-default rounded-bl-md'>
                              <span className='w-6 material-symbols-outlined icon-size-20'>done</span>
                              Recomiendo
                           </button>
                           <button
                              disabled={!item?.recommendationAc}
                              className='flex items-center justify-center w-1/2 h-10 text-sm bg-white cursor-default'>
                              <span className='w-6 material-symbols-outlined icon-size-20'>close</span>
                              No Recomiendo
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className='flex flex-col w-1/4'>
                     <h3 className='px-4 py-2 text-base font-light text-white 2xl:py-4 rounded-t-md bg-black-900'>
                        Líder de Contraparte
                     </h3>
                     <div className='box-content flex flex-col h-full text-sm bg-white border border-gray rounded-b-md'>
                        <h4 className='px-4 py-2 text-lg'>Comentarios</h4>
                        <textarea
                           maxLength={2000}
                           value={item?.commentLc || ''}
                           onChange={(e) => onSet(e.target.value, item?.idRequest, 'commentLc')}
                           placeholder='Ingresa aquí los comentarios'
                           className='px-4 text-sm outline-none resize-none grow focus:text-blue-800'
                        />
                        <label htmlFor='numero de caracteres' className='px-4 py-2 text-sm text-right text-black-500'>
                           {(item?.commentLc?.length || 0) + '/2000'}
                        </label>

                        <div className='flex border-t rounded-b-md border-gray'>
                           <button
                              onClick={() => onSet(true, item?.idRequest, 'recommendationLc')}
                              className={clsx(
                                 'flex items-center justify-center w-1/2 h-10 text-sm border-r border-gray rounded-bl-md',
                                 {
                                    'bg-black text-white': item?.recommendationLc,
                                    'hover:bg-black-900 hover:text-white':
                                       !item?.recommendationLc || _.isNull(item?.recommendationLc),
                                 }
                              )}>
                              <span className='w-6 material-symbols-outlined icon-size-20'>done</span>
                              Recomiendo
                           </button>
                           <button
                              onClick={() => onSet(false, item?.idRequest, 'recommendationLc')}
                              className={clsx(
                                 'flex items-center justify-center w-1/2 h-10 text-sm border-gray rounded-br-md',
                                 {
                                    'bg-black text-white': !item?.recommendationLc,
                                    'hover:bg-black-900 hover:text-white':
                                       item?.recommendationLc || _.isNull(item?.recommendationLc),
                                 }
                              )}>
                              <span className='w-6 material-symbols-outlined icon-size-20'>close</span>
                              No Recomiendo
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
