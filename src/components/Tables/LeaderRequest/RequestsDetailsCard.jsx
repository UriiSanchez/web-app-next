'use client';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { onChangeRequestStatusOrAssignUser } from '../../../services';
import { IconResult, ReassignmentRequestDropdown } from '../../Controls';
import { AccessDirectApplication } from './AccessDirectApplication';
import { ShowAplicantOrGroup } from './ShowAplicantOrGroup';
import { useGlobalContext } from '../../../hooks';
import {
   datetimeToString,
   formatId,
   formatMiles,
   getError,
   hasClientFinancialChanges,
   sweetSnackbar,
} from '../../../helpers';
import { EnumStatus } from '../../../helpers/config';

/**
 * Crea una componente card con información detallada sobre una solicitud.
 * @param {Object} props - Propiedades que heredan del componente padre.
 * @param {Object} props.info - Información de la solicitud
 * @param {number} props.idGroup - Identificador único de la solicitud
 * @param {boolean} props.isGroup - Indica si la solicitud es grupal o individual.
 * @param {boolean} props.isExpanded - Indica si se debe mostrar/ocultar los detalles.
 * @param {function} props.onExpand - Función que permite ocultar o mostrar los detalles.
 * @param {function} props.onRedirectToChecklist - Función que permite al usuario hacer clic sobre la card y redireccionarlo a otra pantalla.
 * @return JSX.Element - Elemento CARD
 */
export const RequestsDetailsCard = ({ info, idGroup, isGroup, isExpanded, onExpand, onRedirectToChecklist }) => {
   const { listLeaders, listAnalyst, user, actions, isReloading } = useGlobalContext();
   const initialRequest = info.isGroup ? null : info.requestResponseList[0];
   const [selectedRequest, setSelectedRequest] = useState(initialRequest);
   const requestAmount = useMemo(() => {
      if (isGroup && _.isEmpty(selectedRequest)) {
         return info?.requestAmount ?? '-';
      }

      return selectedRequest?.requestAmount ?? '-';
   }, [selectedRequest]);
   const enabledReassignmentAnalyst = useMemo(() => {
      const allowedStatuses = [
         EnumStatus.EN_ASIGNACION_LIDER,
         EnumStatus.EN_ANALISTA,
         EnumStatus.EN_REVISION_LIDER,
         EnumStatus.DEVUELTA_ANALISTA_POR_LIDER,
      ];

      return user?.userAD === info?.idLeader && allowedStatuses.includes(info?.idCatStatus);
   }, [idGroup, user?.userAD, info?.idLeader]);
   const hasChangeFinancial = useMemo(() => {
      return hasClientFinancialChanges(info?.requestResponseList);
   }, [idGroup]);

   const handleSelectRequest = (selectedIdRequest) => {
      const newSelectRequest = info.requestResponseList.find((req) => req.idRequest === selectedIdRequest);
      setSelectedRequest(newSelectRequest);
   };

   const handleReassignRequest = async (selectedUser, attribute) => {
      if (selectedUser === info[attribute]) {
         return;
      }

      // Si el atributo es asignación para analista, se debe revisar si es reasignación o asignación.
      const reassignRequest = attribute === 'idAnalyst' ? !_.isEmpty(info[attribute]) : true;
      let params = mapAtributteSection[attribute](selectedUser, reassignRequest);

      const result = await onChangeRequestStatusOrAssignUser({ idGroupRequest: idGroup, ...params }, reassignRequest);
      if (result.status !== 204) {
         return getError(result);
      }

      sweetSnackbar({
         html: '<p class="mt-1 text-sm">¡Se reasignó la solicitud correctamente!</p>',
      });

      setTimeout(() => {
         if (attribute === 'idAnalyst') {
            localStorage.removeItem('listAnalyst');
            actions.setDataAnalyst(!isReloading);
         } else {
            actions.toggleReloading();
         }
      }, 1200);
   };

   const mapAtributteSection = {
      idAnalyst: (value, reassign) => {
         if (!reassign) {
            return {
               userCreate: user?.userAD,
               idCatStatus: EnumStatus.EN_ANALISTA,
               nextProfile: 'AC',
               idAnalyst: value,
            };
         }

         return { userAD: value, nextProfile: 'AC' };
      },
      idLeader: (value) => ({ userAD: value, nextProfile: 'LC' }),
   };

   return (
      <div
         data-testid={'card-group-' + idGroup}
         onClick={onRedirectToChecklist}
         className='relative border-[1.5px] border-gray px-3 py-4 rounded text-sm 2xl:text-base transition-all duration-300 ease-in-out hover:border-blue-700'>
         <div
            className={clsx('flex items-stretch gap-2 p-3', {
               'bg-neutral-100 border-b-[1.5px] rounded-t': isExpanded,
               'bg-white': !isExpanded,
            })}>
            <div className='flex-1 space-y-1'>
               <p className='font-semibold'>No. de Solicitud</p>
               <p>{formatId(info?.idGroup)}</p>
            </div>
            <div className='flex-1 space-y-1'>
               <p className='font-semibold'>Solicitante</p>
               <ShowAplicantOrGroup
                  requests={info.requestResponseList}
                  isGroup={info.isGroup}
                  groupName={info.groupName}
                  onSelectRequest={handleSelectRequest}
                  idRequestSelected={selectedRequest?.idRequest}
               />
            </div>
            <div className='flex-1 space-y-1'>
               <p className='font-semibold'>Especialista Responsable</p>
               <p>{info?.nameEmg ?? '-'}</p>
            </div>
            <div className='flex-1 space-y-1'>
               <p className='font-semibold'>Subestatus</p>
               <p>{info?.status ?? '-'}</p>
            </div>
            <div className='flex flex-none w-6 items-center'>
               <button onClick={onExpand}>
                  <span
                     className={clsx('material-symbols-outlined icon-size-24 hover:bg-[#D9D9D9] rounded-3xl', {
                        'rotate-180': isExpanded,
                     })}>
                     expand_less
                  </span>
               </button>
            </div>
         </div>
         <div
            className={clsx('transition-all duration-300 ease-in-out px-3', {
               'max-h-96 mt-2 opacity-100 visible pointer-events-auto py-3': isExpanded,
               'max-h-0 opacity-0 invisible pointer-events-none': !isExpanded,
            })}>
            <div className='flex flex-row flex-wrap items-start gap-2 mb-6'>
               <div className='flex-1'>
                  <div className='flex gap-3 font-medium'>
                     Analista responsable
                     <div className='flex-none tooltip-container'>
                        <span className='material-symbols-outlined icon-size-20 rounded hover:cursor-pointer'>
                           info
                        </span>
                        <div className='tooltip-content tooltip-right shadow-lg pointer-events-none space-y-1 w-max text-xs bg-[#535152]'>
                           Fecha de asignación:
                           <br />
                           {datetimeToString(info?.arrivedAcDate)}
                        </div>
                     </div>
                  </div>
                  <ReassignmentRequestDropdown
                     listItems={listAnalyst}
                     isEnabled={enabledReassignmentAnalyst}
                     assignedItem={listAnalyst.find((u) => u.userAD === info?.idAnalyst)}
                     onReassignRequest={handleReassignRequest}
                     attribute='idAnalyst'
                  />
               </div>
               <div className='flex-1'>
                  <div className='flex gap-3 font-medium'>
                     Líder de crédito
                     <div className='flex-none tooltip-container'>
                        <span className='material-symbols-outlined icon-size-20 rounded hover:cursor-pointer'>
                           info
                        </span>
                        <div className='tooltip-content tooltip-right shadow-lg space-y-1 text-xs bg-[#535152]'>
                           Fecha de asignación:
                           <br />
                           {datetimeToString(info?.arrivedLcDate)}
                        </div>
                     </div>
                  </div>
                  <ReassignmentRequestDropdown
                     listItems={listLeaders}
                     assignedItem={listLeaders.find((u) => u.userAD === info?.idLeader)}
                     onReassignRequest={handleReassignRequest}
                     attribute='idLeader'
                  />
               </div>
               <div className='flex-1 space-y-1'>
                  <p className='font-medium'>Tipo de trámite</p>
                  <p>{selectedRequest?.kindProcedure ?? '-'}</p>
               </div>
               <div className='flex-1 space-y-1'>
                  <p className='font-medium'>Nocional</p>
                  <p>{formatMiles({ monto: selectedRequest?.notional, withSign: true })}</p>
               </div>
               <div className='flex-none w-6' />
            </div>
            <div className='flex flex-row flex-wrap items-start gap-2 '>
               <div className='flex-1 space-y-1'>
                  <p className='font-medium'>Última ejecución del modelo</p>
                  <p>{datetimeToString(selectedRequest?.lastDateExecEm)}</p>
               </div>
               <div className='flex-1 space-y-1'>
                  <p className='flex font-medium'>
                     Resultado del modelo&nbsp;
                     <AccessDirectApplication
                        idGroup={idGroup}
                        idStatusRequest={info?.idCatStatus}
                        userActive={user}
                        assignedLeader={info?.idLeader}
                        resultModel={selectedRequest?.resultExecEm}
                        hasChangeFinancial={hasChangeFinancial}
                     />
                  </p>
                  <IconResult result={selectedRequest?.resultExecEm} alt='Resultado del modelo' />
               </div>
               <div className='flex-1 space-y-1'>
                  <p className='font-medium'>Recomendación</p>
                  <div className='flex gap-4'>
                     <span>Analista: </span>
                     <IconResult result={selectedRequest?.recommendationAc} alt='Recomendación del análista' />
                     <span>Líder: </span>
                     <IconResult result={selectedRequest?.recommendationLc} alt='Recomendación del líder' />
                  </div>
               </div>
               <div className='flex-1 space-y-1'>
                  <p className='font-medium'>Monto de línea</p>
                  <p>{formatMiles({ monto: requestAmount, withSign: true })}</p>
               </div>
               <div className='flex-none w-6' />
            </div>
         </div>
      </div>
   );
};

RequestsDetailsCard.propTypes = {
   info: PropTypes.object.isRequired,
   idGroup: PropTypes.number,
   isGroup: PropTypes.bool,
   isExpanded: PropTypes.bool,
   onExpand: PropTypes.func,
   onRedirectToChecklist: PropTypes.func,
};
