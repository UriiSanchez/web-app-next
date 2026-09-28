import _ from 'lodash';
import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

/**
 * Devuelve un icono de `Like` o `Dislike` que se debe utilizar para el resultado del Modelo, recomendaciones, etc.
 * @param {Object} props - Propiedades que heredan del componente padre.
 * @param {boolean|null} props.[result=null] - True o False para mostrar un pulgar hacia arriba o hacia abajo.
 * @param {string} props.[alt=''] - Texto alternativo para describir el icono.
 */
export const IconResult = ({ result = null, alt = '' }) => {
   if (_.isNull(result)) {
      return <span>-</span>;
   }

   let src = result ? '/icons/ico_like.svg' : '/icons/ico_dislike.svg';

   return <Image src={src} alt={alt} className='w-auto h-4' width='100' height='100' />;
};

IconResult.propTypes = {
   result: PropTypes.any,
   alt: PropTypes.string,
};
