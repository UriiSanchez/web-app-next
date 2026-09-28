import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { templateHistory } from '../../helpers';

/**
 * Componente que muestra la información inicial de la pantalla Detalles Historial.
 * @param {Object} info - la información general de la solicitud.
 * @param {number} idProfile - perfil actual del usuario en sesión.
 * @returns {ReactElement}
 */
export function DetailsGroup({ info, idProfile }) {
   const initTemplate = useMemo(() => templateHistory.details(idProfile, info) ?? [], [info, idProfile]);

   return (
      <div className='grid h-auto grid-cols-3 py-2 text-left border rounded px-11 border-gray'>
         {initTemplate.map((item) => (
            <div key={item.id + item.display} className='px-4 py-2'>
               <p className='font-bold'>{item.display}</p>
               <p>{item.value || '-'}</p>
            </div>
         ))}
      </div>
   );
}

DetailsGroup.propTypes = {
   info: PropTypes.object,
   idProfile: PropTypes.number,
};
