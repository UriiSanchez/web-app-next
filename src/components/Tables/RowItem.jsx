import _ from 'lodash';
import React, { Fragment } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import { IconResult } from '../Controls';
import { useGlobalContext } from '../../hooks';
import { datetimeToString, formatMoney, renderCellAndExpand } from '../../helpers';
import { constProfiles as Profile, constTypePerson as TypePerson } from '../../helpers/config';

export const RowItem = ({ item, cols, onFunc }) => {
   const router = useRouter();
   const {
      user,
      expandedRows,
      actions: { setExpandedRows },
   } = useGlobalContext();
   const isExpanded = expandedRows.includes(item.idGroup);
   const iconExpanded = isExpanded ? 'expand_less' : 'expand_more';
   return (
      <Fragment>
         <tr
            onClick={() => onFunc && onFunc(item)}
            className={clsx(
               'grid grid-cols-12 justify-between items-center w-full gap-2 px-2 py-1 cursor-pointer h-16 border-t last:border-b',
               {
                  'hover:bg-gray-light': !isExpanded,
               }
            )}>
            {renderCellAndExpand(cols, item, setExpandedRows, iconExpanded)}
         </tr>
         {isExpanded &&
            item?.requestResponseList?.map((rl) => {
               let person = rl.relatedPersonResponseList.find(
                  (person) => person.idCatTypePerson === TypePerson.APPLICANT
               );
               return (
                  <tr
                     key={'request-' + rl.idClient}
                     className='grid items-center justify-between w-full h-auto grid-cols-12 gap-2 px-2 py-1 fadeIn hover:bg-gray-light'>
                     <td className='col-span-2'></td>
                     <td className='col-span-2 text-left'>{item.isGroup && person.fullName}</td>
                     {user.idProfile != Profile.MRC && (
                        <>
                           <td className='flex flex-col items-start col-span-2 gap-2'>
                              <span className='font-bold'>Última ejecución del modelo</span>
                              <span>{datetimeToString(rl.lastDateExecEm)}</span>
                           </td>
                           <td className='flex flex-col items-start col-span-2 gap-2'>
                              <div className='flex gap-2 font-bold'>
                                 <div className='font-bold'>Resultado del modelo</div>
                                 {user.idProfile === Profile.ADC && (
                                    <button
                                       onClick={() => {
                                          router.push(`/${user?.path}/ApplicationEvaluation/${item.idGroup}`);
                                       }}
                                       disabled={
                                          _.isNull(rl?.resultExecEm) || !user?.status.includes(item?.idCatStatus)
                                       }
                                       className='relative clean group'>
                                       <span
                                          className={clsx('material-symbols-outlined icon-size-20', {
                                             'text-blue-800': user?.status.includes(item?.idCatStatus),
                                             'text-gray': !user?.status.includes(item?.idCatStatus),
                                          })}>
                                          open_in_new
                                       </span>
                                       <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-5 -right-[6rem] fadeIn'>
                                          <div className='self-center px-2 py-1 text-xs text-white bg-blue-800 rounded-r rounded-bl whitespace-nowrap'>
                                             Ver resultado del modelo
                                          </div>
                                       </div>
                                    </button>
                                 )}
                              </div>
                              <IconResult result={rl?.resultExecEm} alt='Resultado del modelo' />
                           </td>
                           <td className='flex flex-col items-start col-span-2 gap-2'>
                              <div className='font-bold'>Recomendación contraparte:</div>
                              <div className='flex justify-center gap-4'>
                                 <span>Analista: </span>
                                 <IconResult result={rl?.recommendationAc} alt='Recomendación del Analista' />
                                 <span>Líder: </span>
                                 <IconResult result={rl?.recommendationLc} alt='Recomendación del Líder' />
                              </div>
                           </td>
                        </>
                     )}
                     {item.isGroup && (
                        <td className='flex flex-col items-start col-span-1 gap-2'>
                           <div className='font-bold'>Monto línea:</div>
                           <span>{formatMoney(rl.requestAmount)}</span>
                        </td>
                     )}
                     <td className='flex flex-col items-start col-span-1 gap-2'>
                        <div className='font-bold'>Tipo tramite:</div>
                        <span>{rl.kindProcedure || '- No definido -'}</span>
                     </td>
                  </tr>
               );
            })}
      </Fragment>
   );
};
