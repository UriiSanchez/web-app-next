import React from 'react';
import PropTypes from 'prop-types';

/**
 * Muestra un círculo con las primeras letras del nombre de un usuario, se puede personalizar el color y el tamaño del componente,
 * por medio de clases tailwindcss.
 *
 * Se planea que en un futuro pueda mostrar la foto del usuario en caso de que se tenga una.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} props.height - Altura que tendrá el componente, usando clases de TailwindCSS.
 * @param {string} props.width - Ancho que tendrá el componente, usando clases de TailwindCSS.
 * @param {string} props.firstLetters - Deben ser las iniciales del un nombre, se admiten un maximo de 3 caracteres.
 * @param {string} props.color - Acepta valores hexadecimales, hsl o valores basicos de css, ejemplo: blue, red, etc.
 *
 * @example
 * Permite color en hexadecimal
 * <AvatarUser fullName="TÚ" color={"#475569"}/>
 *
 * Permite color en HSL
 * <AvatarUser fullName="TÚ" color={"hsl(346,39%,35%)"}/>
 *
 * Permite colores basicos de CSS
 * <AvatarUser fullName="TÚ" color={"blue"}/>
 *
 * Color por default en caso de que no se pase la propiedad: '#475569'
 *
 * Si no se pasa el Height o Width las medidas por default son: 'h-9' y 'w-9'
 * <AvatarUser fullName="TÚ"/>
 * */
export const AvatarUser = ({ height = 'h-9', width = 'w-9', firstLetters = '', color }) => {
   return (
      <div
         style={{ backgroundColor: color || '#475569' }}
         className={`flex-none text-sm rounded-full ${height} ${width} flex justify-center items-center text-white`}>
         <span>{firstLetters}</span>
      </div>
   );
};

AvatarUser.propTypes = {
   height: PropTypes.string,
   width: PropTypes.string,
   firstLetters: PropTypes.string.isRequired,
   color: PropTypes.string,
};
