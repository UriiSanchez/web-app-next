import _ from 'lodash';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { mapRoutePages } from '../../../helpers/config';

/**
 * Componente que simula un acceso directo de la pantalla `Solicitudes` a `Evaluar solicitud`
 * siempre y cuando se cumplan las reglas necesarias para estar habilitado.
 * @param {object} props - Propiedades que heredan del componente padre.
 * @param {number} props.idGroup -
 * @param {number} props.idStatusRequest -
 * @param {object} props.userActive -
 * @param {string|null} props.assignedLeader -
 * @param {boolean|null} props.resultModel -
 * @param {boolean} props.hasChangeFinancial -
 * */
export const AccessDirectApplication = ({
   idGroup,
   idStatusRequest,
   userActive,
   assignedLeader,
   resultModel,
   hasChangeFinancial = false,
}) => {
   const router = useRouter();
   const isDisabledAccess = useMemo(() => {
      return (
         userActive.userAD !== assignedLeader ||
         _.isNull(resultModel) ||
         !userActive?.status.includes(idStatusRequest) ||
         hasChangeFinancial
      );
   }, [resultModel]);

   return (
      <button
         data-testid={`btnAccessDirect-${idGroup}`}
         onClick={(e) => {
            e.stopPropagation();
            router.push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE(userActive?.path, idGroup));
         }}
         disabled={isDisabledAccess}
         className='relative clean group enabled:cursor-pointer'>
         <span
            className={clsx('material-symbols-outlined icon-size-20 text-blue-800', {
               'text-gray': isDisabledAccess,
            })}>
            open_in_new
         </span>
         {userActive?.status.includes(idStatusRequest) && (
            <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-5 -right-[6rem] fadeIn'>
               <div className='self-center px-2 py-1 text-xs text-white bg-blue-800 rounded-r rounded-bl whitespace-nowrap'>
                  Ver resultado del modelo
               </div>
            </div>
         )}
      </button>
   );
};

AccessDirectApplication.propTypes = {
   idGroup: PropTypes.number.isRequired,
   idStatusRequest: PropTypes.number.isRequired,
   userActive: PropTypes.object.isRequired,
   assignedLeader: PropTypes.string,
   resultModel: PropTypes.bool,
   hasChangeFinancial: PropTypes.bool.isRequired,
};
