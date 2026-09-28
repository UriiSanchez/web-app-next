import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 *  @param {Function} toAction - Recibe una función, es obligatorio para manejar el evento de selección.
 *  @param {Array<Object>} data Arreglo obligatorio con los datos del dropdownList
 *    @param {string} ph - Placeholder que se va mostrar en el input
 *    @param {string} title - Opción visible en el dropdown
 *    @param {string} type - El tipo sirve para identificar la opción seleccionada.
 *  @param children Es el jsx que se va a mostrar como boton para que se muestren las opciones
 */
export const DropdownList = ({ toAction, data, children }) => {
   const [isOpen, setIsOpen] = useState(false);
   const refDown = useRef(null);
   const [sx, setSx] = useState('');

   const handleClickOutside = (event) => {
      if (refDown.current && !refDown.current.contains(event.target)) {
         setIsOpen(false);
      }
   };

   useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('touchstart', handleClickOutside);
      };
   }, []);

   const handleOptionClick = (element) => {
      setIsOpen(false);
      toAction(element);
   };

   const handleBounding = () => {
      let elem = document.querySelector('#menu');
      const bounding = elem.getBoundingClientRect();
      if (bounding.left < 0) {
         setSx('translate-x-0');
      }
   };

   return (
      <div ref={refDown} className={`dropdown ${isOpen && 'open'}`}>
         <button
            type='button'
            className='flex items-center'
            onClick={(e) => {
               setIsOpen(!isOpen);
               handleBounding();
               e.stopPropagation();
            }}>
            {children}
         </button>
         <div
            id='menu'
            className={`menu-drop ${sx} flex w-64 top-8 left-1/2 -translate-x-1/2 flex-col origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}>
            {data?.map((element) => {
               return (
                  <button
                     key={element.type}
                     type='button'
                     className='block w-full px-4 py-2 text-sm leading-none text-left bg-white hover:bg-blue-800 hover:text-white'
                     onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick(element);
                     }}>
                     {element.title}
                  </button>
               );
            })}
         </div>
      </div>
   );
};

DropdownList.propTypes = {
   toAction: PropTypes.func.isRequired,
   data: PropTypes.arrayOf(
      PropTypes.shape({
         ph: PropTypes.string.isRequired,
      })
   ).isRequired,
   children: PropTypes.element.isRequired,
};
