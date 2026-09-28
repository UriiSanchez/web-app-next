import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { getDetailsTrackingForIdRequest } from '../../../services';
import { TrackingMovementTable } from '../Tracking/TrackingMovementTable';
import { TrackingSelect } from '../Tracking/TrackingSelect';
import { getError } from '../../../helpers';

import styles from './details.module.css';
/**
 * @param {Object} props
 * @param {Function} props.onExpand - Función que permite cerrar el modal de `Detalles Movimientos`
 * @param {boolean} props.isGroup - Indica si es grupal o no
 * @param {number} props.idGroup - Número del grupo
 * @param {number} props.requestPerGroup - Indica el número total de participantes en el grupo
 * @param {Array} props.listRequests - Listado de solicitudes pertenecientes al grupo
 * @param {string} props.groupName - Nombre del grupo o aplicante en caso de ser una sola solicitud.
 * @param {Array} props.listApplicants - Listado custom con los nombres, id clientes y id request de cada solicitud del grupo.
 **/
const TrackingDetails = ({ onExpand, isGroup, idGroup, requestPerGroup, listRequests, groupName, listApplicants }) => {
   const [selectedRequest, setSelectedRequest] = useState(listRequests[0] || null);
   const [movements, setMovements] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   const fetchMovementsAsync = useCallback(async (idRequest) => {
      setIsLoading(true);
      setMovements([]);
      const result = await getDetailsTrackingForIdRequest(idRequest).finally(() => {
         setIsLoading(false);
      });

      if (result.status !== 200) {
         getError(result);
         return;
      }

      setMovements(result.data.trackingDetailResponse);
   }, []);

   useEffect(() => {
      if (!_.isEmpty(selectedRequest)) {
         fetchMovementsAsync(selectedRequest.idRequest);
      }
   }, [selectedRequest.idRequest]);

   const handleSelectChange = (idRequest) => {
      let newSelected = listRequests.find((request) => request.idRequest === idRequest);
      setSelectedRequest(() => newSelected);
   };

   return (
      <>
         <div onClick={onExpand} className='fixed top-0 left-0 z-40 w-screen h-screen backdrop-filter' />
         <div
            role='dialog'
            aria-modal='true'
            aria-labelledby={`details-group-${idGroup}`}
            className={`absolute top-[4.25rem] bottom-0 right-0 w-[40rem] 2xl:w-[43rem] shadow-[-9px_-9px_11px_-4px_rgba(51,_65,_85,_0.12)] bg-white z-50 rounded-tl-2xl fadeIn ${styles['tracking-details']}`}>
            <div className='border-b border-gray mb-3 2xl:mb-9'>
               <h1 className='px-10 my-4 text-left font-semibold'>Detalle de movimientos</h1>
            </div>
            <div className='flex items-center gap-2 px-10'>
               <h2 className='font-semibold'>{groupName}</h2>
               <span className='bg-opacity-80 bg-[#B6A269] text-sm h-5 w-6 text-white rounded flex items-center justify-center'>
                  {requestPerGroup}
               </span>
            </div>
            <div className='flex items-center gap-3 mt-2 mb-1 2xl:mb-5 px-10'>
               {isGroup && (
                  <TrackingSelect
                     listApplicants={listApplicants}
                     idRequestActive={selectedRequest?.idRequest}
                     onSelectChange={handleSelectChange}
                  />
               )}
               <p className='rounded-full bg-[#71CCC380] text-sm px-2 py-1'>
                  Esta solicitud es {selectedRequest?.kindProcedure?.includes('Nuevo Tramite') ? 'un' : 'una'}{' '}
                  <span className='font-semibold'>{selectedRequest?.kindProcedure || '-'}</span>
               </p>
            </div>
            <TrackingMovementTable details={movements} isLoading={isLoading} />
            <div className='border-t border-gray px-10 text-xs py-4 mt-2'>
               <p className='flex items-center justify-start gap-2'>
                  Esto{' '}
                  <span className='material-symbols-outlined bg-[#F9D37F] rounded-full icon-size-20 text-white'>
                     sync
                  </span>
                  indica que la solicitud fue devuelta
               </p>
            </div>
         </div>
      </>
   );
};

export default TrackingDetails;
