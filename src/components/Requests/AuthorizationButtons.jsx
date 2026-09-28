import _ from 'lodash';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { validateAuthorizationForRequest } from '../../services';
import {
   EnumOptionsDecisionFaculty as DecisionFaculty,
   mapButtonsOptions,
   sweetQuestionAction,
   templateSweetAlert,
} from '../../helpers';
import { EnumStatus } from '../../helpers/config';

/**
 * Se renderizan los botones Rechazar y Autorizar para que los facultados
 * tomen una resolución.
 *
 * @component AuthorizationButtons
 * @param {Object} props - Props que vienen del componente padre
 * @param {Array} props.authorizations - Arreglo con las firmas de los facultados
 * @param {string} props.userAD - Usuario activo en sesion
 * @param {Function} props.onSet - Función para guardar la decisión de los botones.
 * @param {number} props.idStatusRequest - Estatus en el que se encuentra la solicitud activa
 * @param {boolean} props.lastRejection=false - Indica si el usuario es el último que facultado que puede firmar.
 *
 * @returns {JSX.Element} - Un radio buttón con las opciones Rechazar y Autorizar con estilo de botón.
 * */
export const AuthorizationButtons = ({
   authorizations,
   userAD,
   profileType,
   onSet,
   idStatusRequest,
   lastRejection = false,
}) => {
   const [decision, setDecision] = React.useState({ isDisabled: false, userDecision: null });

   useEffect(() => {
      let upDecision = { userDecision: null, isDisabled: false };

      if (!_.isEmpty(authorizations)) {
         // Valida por estatus de la request si aún se puede modificar.
         if ([EnumStatus.SOLICITUD_AUTORIZADA, EnumStatus.SOLICITUD_RECHAZADA].includes(idStatusRequest)) {
            upDecision.isDisabled = true;
         } else {
            upDecision.isDisabled = validateAuthorizationForRequest(authorizations, userAD, profileType);
         }

         // Valida si el usuario en sesión pudo emitir una decisión, en caso de que si muestra el check
         let isUserDefinedDecision = authorizations.find((user) => user.userAD === userAD);
         if (isUserDefinedDecision) {
            upDecision.userDecision = isUserDefinedDecision.decisionFaculty;
         }
      }

      setDecision(upDecision);
   }, [authorizations]);

   const onActionButton = (value) => {
      if (lastRejection && value === DecisionFaculty.NOT) {
         sweetQuestionAction({
            html: templateSweetAlert['REQUEST_REJECTED'](),
            fnAction: () => onSet(value),
         });
      } else {
         onSet(value);
      }
   };

   return (
      <div className='flex gap-3'>
         {mapButtonsOptions.map((item) => {
            return (
               <label
                  key={item.value}
                  htmlFor={'authorizedDecision-' + item.value}
                  className={`w-36 h-7 py-1.5 px-2 border border-black rounded-2xl text-xs 2xl:text-sm 2xl:w-40 flex items-center justify-center gap-1 select-none ${
                     decision.isDisabled ? 'bg-neutral-200 text-black-900' : item.sx + ' cursor-pointer'
                  }`}>
                  {decision.userDecision === item.value && (
                     <span className='material-symbols-outlined icon-size-20'>check</span>
                  )}
                  <input
                     id={'authorizedDecision-' + item.value}
                     name='authorizedDecision'
                     type='radio'
                     value={item.value}
                     disabled={decision.isDisabled}
                     className='hidden'
                     onChange={(e) => onActionButton(e.target.value)}
                     checked={decision.userDecision === item.value}
                  />
                  <span>{item.text}</span>
               </label>
            );
         })}
      </div>
   );
};

AuthorizationButtons.propTypes = {
   authorizations: PropTypes.array.isRequired,
   userAD: PropTypes.string.isRequired,
   profileType: PropTypes.string,
   onSet: PropTypes.func,
   idCatStatus: PropTypes.number,
   lastRejection: PropTypes.bool,
};
