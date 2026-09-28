import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { datetimeToString } from '../../../helpers';

/**
 * Presenta un div con los datos del facultado y su decisión AUTORIZADO/RECHAZADO
 * @component
 * @param {Object} faculty - Datos de la desición del facultado.
 * @example
 * const item = {
 *    userAD: 'usertest',
 *    signatureDate: '2025-02-06T23:54:55',
 *    typeFaculty: 'COMERCIAL',
 *    decisionFaculty:'YES'
 * }
 *
 * <ResolutionFacultyItem faculty={item} />
 * */
export const ResolutionFacultyItem = ({ faculty }) => {
   return (
      <div className='text-sm my-2 flex items-center w-full'>
         <p>{faculty.fullName}</p>
         <p className='text-center'>{datetimeToString(faculty.signatureDate)}</p>
         <div
            data-testid={'decisionFaculty-' + faculty.decisionFaculty}
            className={clsx('px-4 py-1 rounded-2xl text-center text-white', {
               'bg-red-500': faculty.decisionFaculty === 'NO',
               'bg-emerald-600': faculty.decisionFaculty === 'YES',
            })}>
            {faculty.decisionFaculty === 'YES' ? 'Autorizado' : 'Rechazado'}
         </div>
      </div>
   );
};

ResolutionFacultyItem.propTypes = {
   faculty: PropTypes.shape({
      fullName: PropTypes.string.isRequired,
      signatureDate: PropTypes.string,
      decisionFaculty: PropTypes.oneOf(['YES', 'NO']).isRequired,
   }),
};
