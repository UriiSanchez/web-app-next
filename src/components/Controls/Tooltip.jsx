import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @param msg Es el mensaje que va a ser mostrado en el tooltip
 * @param icon Nombre del icono de material icons que se va a mostrar para abrir el tooltip
 */

export function Tooltip({ msg, icon = 'info' }) {
   const refDown = useRef(null);
   const [show, setShow] = useState(false);

   const handleClickOutside = (event) => {
      if (refDown.current && !refDown.current.contains(event.target)) {
         setShow(false);
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

   return (
      <div ref={refDown} className='relative'>
         <button onClick={() => setShow(!show)} className=' text-blue-800 material-symbols-outlined text-[20px]'>
            {icon}
         </button>
         <pre
            className={`${
               show ? 'visible' : 'invisible'
            } absolute z-50 p-2 text-xs rounded-lg rounded-bl-none text-justify ${
               msg.length > 100
                  ? ' w-[500px!important] h-[7rem!important] container-overflow'
                  : 'w-auto whitespace-nowrap'
            }  left-[105%] bottom-[80%] bg-blue-800 text-white`}>
            {msg}
         </pre>
      </div>
   );
}

Tooltip.propTypes = {
   msg: PropTypes.string.isRequired,
   icon: PropTypes.string,
};
