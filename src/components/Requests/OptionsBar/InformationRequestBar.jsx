import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { ResolutionFacultyItem } from './ResolutionFacultyItem';

/**
 * Se regresa el recuadro de información de la solicitud y muestra la desición de cada facultado en caso de existir una.
 * @component
 * @param {string} fullName - Es el nombre del Aplicante de la subsolicitud.
 * @param {Object[]} authorizations - Arreglo que contiene las decisiones de los facultados.
 * @param {string} authorizations[].userAD - User del facultado que firmo.
 * @param {string} authorizations[].signatureDate - Fecha y hora en la que el facultado realizo la firma.
 * @param {('COMERCIAL'|'CREDITO')} authorizations[].typeFaculty - Indica el que tipo de facultado realizo la firma.
 * @param {('YES'|'NO')} authorizations[].decisionFaculty - Decisión del facultado.
 *
 * @example
 * const fullName: 'Usuario de Prueba';
 * const authorizationsFaculty =  [
 *       {userAD: 'usertest',signatureDate: '2025-02-06T23:54:55', typeFaculty: 'COMERCIAL', decisionFaculty:'YES'  }
 *    ];
 *
 *  <InformationRequestBar fullName={fullName} authorizations={authorizationsFaculty} />
 * */
export const InformationRequestBar = ({ fullName, authorizations }) => {
   const listFacultys = useMemo(() => {
      return {
         COMMERCIAL: authorizations.filter((item) => item.typeFaculty === 'COMERCIAL'),
         CREDIT: authorizations.filter((item) => item.typeFaculty === 'CREDITO'),
      };
   }, [authorizations]);

   return (
      <div className='bg-white w-full rounded-xl px-4 py-5 h-screen 2xl:max-h-[550px]'>
         <h1 className='mb-4 font-semibold text-xl'>{fullName}</h1>
         <h2 className='my-3 font-semibold'>Área Crédito</h2>
         {listFacultys.CREDIT?.map((item) => (
            <ResolutionFacultyItem key={item.userAD} faculty={item} />
         ))}
         <br />
         <h2 className='my-3 font-semibold'>Área Comercial</h2>
         {listFacultys.COMMERCIAL?.map((item) => (
            <ResolutionFacultyItem key={item.userAD} faculty={item} />
         ))}
      </div>
   );
};

InformationRequestBar.propTypes = {
   fullName: PropTypes.string.isRequired,
   authorizations: PropTypes.arrayOf(
      PropTypes.shape({
         userAD: PropTypes.string.isRequired,
         fullName: PropTypes.string.isRequired,
         signatureDate: PropTypes.string.isRequired,
         typeFaculty: PropTypes.string.isRequired,
         decisionFaculty: PropTypes.oneOf(['YES', 'NO']).isRequired,
      })
   ),
};
