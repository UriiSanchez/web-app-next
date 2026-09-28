import _ from 'lodash';
import React from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

import { RequestsDetailsCard } from './RequestsDetailsCard';
import { useGlobalContext } from '../../../hooks';
import { mapRoutePages } from '../../../helpers/config';

/**
 * Contenedor para visualizar las solicitudes en modo CARD y permitiendo gestionar el `loading`
 * y si es que no existen solicitudes. *
 * @param {object} props - Propiedades que heredan del componente padre.
 * @param {array} props.requests - Arreglo de solicitudes para renderizar la lista.
 * @param {boolean} [props.isLoading=false] - Permite indicarle al componente si se está esperando respuesta del servidor para mostrar el skeleton.
 * */
export const RequestsContainer = ({ requests, isLoading = false }) => {
   const router = useRouter();
   const {
      expandedRows,
      user,
      actions: { setExpandedRows },
   } = useGlobalContext();

   if (isLoading) {
      return (
         <div data-testid="skeleton-requests-container"  className='flex flex-col w-full h-auto space-y-2'>
            <div className='w-full border rounded h-32 box'></div>
            <div className='w-full border rounded h-32 box'></div>
            <div className='w-full border rounded h-32 box'></div>
            <div className='w-full border rounded h-32 box'></div>
            <div className='w-full border rounded h-32 box'></div>
         </div>
      );
   }

   if (_.isEmpty(requests)) {
      return (
         <div className='flex items-center justify-center fadeIn min-h-svh 2xl:min-h-[33rem]'>
            No hay solicitudes por revisar
         </div>
      );
   }

   const handleRedirectToChecklist = (e, idGroup, idLeader) => {
      e.stopPropagation();
      if (idLeader === user?.userAD) {
         router.push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'LDC'));
      }
   };

   const listCardsRequest = requests.map(
      (item) =>
         item.isVisible && (
            <RequestsDetailsCard
               key={'Group-' + item.idGroup}
               info={item}
               idGroup={item.idGroup}
               isGroup={item.isGroup}
               isExpanded={expandedRows.includes(item.idGroup)}
               onExpand={(e) => {
                  e.stopPropagation();
                  setExpandedRows(item.idGroup);
               }}
               onRedirectToChecklist={(e) => handleRedirectToChecklist(e, item.idGroup, item.idLeader)}
            />
         )
   );

   return (
      <div className='space-y-4 text-sm fadeIn max-h-svh container-request container-overflow'>{listCardsRequest}</div>
   );
};

RequestsContainer.propTypes = {
   request: PropTypes.array,
   isLoading: PropTypes.bool,
};
