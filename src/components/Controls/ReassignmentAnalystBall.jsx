'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';

import { onChangeRequestStatusOrAssignUser } from '../../services';
import { AvatarUser } from './AvatarUser';
import { useDetectClickOutside, useGlobalContext } from '../../hooks';
import { getError, sweetSnackbar } from '../../helpers';
import { EnumStatus } from '../../helpers/config';

/**
 * Este componente permite al usuario Líder realizar reasignación de analista desde la pantalla `Documentación`
 * @param {Object} props - Propiedades que heredan del componente padre.
 *  @param {Object} props.request - Información esencial de la solicitud
 */
export function ReassignmentAnalystBall({ request }) {
   const { reload } = useRouter();
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);
   const { listAnalyst, user, actions } = useGlobalContext();
   const enabledReassignmentAnalyst = useMemo(() => {
      const allowedStatuses = [
         EnumStatus.EN_ASIGNACION_LIDER,
         EnumStatus.EN_ANALISTA,
         EnumStatus.EN_REVISION_LIDER,
         EnumStatus.DEVUELTA_ANALISTA_POR_LIDER,
      ];

      return user?.userAD === request?.idLeader && allowedStatuses.includes(request?.idCatStatus);
   }, [request?.idGroup, user?.userAD, request?.idLeader, request?.idCatStatus]);
   const defaultParams = { idGroupRequest: request?.idGroup, nextProfile: 'AC' };
   const assignedItem = listAnalyst.find((u) => u.userAD === request?.idAnalyst);

   const handleAssignAnalyst = async (e, idAnalyst) => {
      e.stopPropagation();
      actions.toggleLoading('Asignando a analista de contraparte...');
      try {
         if (request?.idAnalyst === idAnalyst) {
            return;
         }

         let reassignRequest = !_.isEmpty(request?.idAnalyst);

         let params = reassignRequest
            ? { ...defaultParams, userAD: idAnalyst }
            : { ...defaultParams, userCreate: user?.userAD, idAnalyst, idCatStatus: EnumStatus.EN_ANALISTA };

         const result = await onChangeRequestStatusOrAssignUser(params, reassignRequest);
         if (result.status !== 204) {
            return getError(result);
         }

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Se asignó la solicitud con éxito!</p>',
         });

         setTimeout(() => {
            reload();
            localStorage.removeItem('listAnalyst');
         }, 1200);
      } catch (error) {
         getError(error);
      } finally {
         setIsOpen(false);
         actions.toggleLoading();
      }
   };

   return (
      <div data-testid='analyst-select-ball' className='relative flex-none text-sm 2xl:text-base' ref={refElement}>
         <div
            onClick={(e) => {
               e.stopPropagation();
               enabledReassignmentAnalyst && setIsOpen(!isOpen);
            }}
            className={clsx('flex items-center gap-1 justify-between rounded child', {
               'cursor-pointer': enabledReassignmentAnalyst,
               'cursor-default': !enabledReassignmentAnalyst,
            })}>
            <AvatarUser
               firstLetters={assignedItem?.firstLetters ?? 'SA'}
               color={assignedItem?.color ?? '#C8C8C8'}
               height='h-8'
               width='w-8'
            />
         </div>
         {isOpen && enabledReassignmentAnalyst && (
            <div
               className={clsx(
                  'absolute p-2 left-2 top-9 max-w-[17rem] 2xl:max-w-[21rem] rounded-lg bg-white border border-gray z-20 shadow-2xl fadeIn transform transition-all duration-300',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <div className='container-overflow'>
                  {_.isEmpty(assignedItem) && (
                     <div
                        onClick={(e) => {
                           e.stopPropagation();
                           setIsOpen(false);
                        }}
                        className={clsx(
                           'flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 rounded h-8 group',
                           {
                              'border-[1.5px] border-blue-800': _.isEmpty(assignedItem?.userAD),
                           }
                        )}>
                        <span className='flex-none w-3 h-3 rounded-full bg-black'></span>
                        <span className='flex-auto line-clamp-1'>Sin asignar</span>
                     </div>
                  )}
                  {listAnalyst?.map(({ color, userAD, fullName }) => {
                     const backgroundColor = color ?? 'black';
                     return (
                        <div
                           key={userAD}
                           onClick={(e) => handleAssignAnalyst(e, userAD)}
                           className={clsx(
                              'flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 rounded h-8',
                              {
                                 'border-[1.5px] border-blue-800': userAD === assignedItem?.userAD,
                              }
                           )}>
                           <span style={{ backgroundColor }} className='flex-none w-3 h-3 rounded-full' />
                           <p className='flex-auto line-clamp-1 truncate capitalize'>{fullName}</p>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
}

ReassignmentAnalystBall.propTypes = {
   request: PropTypes.object.isRequired,
};
