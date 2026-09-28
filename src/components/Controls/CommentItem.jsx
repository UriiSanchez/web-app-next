import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

/**
 * @param {Object} props
 * @param {string} props.title Recibe un string, es obligatorio para mostrar el titulo.
 * @param {string} props.comments Recibe un string, es obligatorio para mostrar los comentarios.
 * @returns
 */
export function CommentItem({ title, comments }) {
   const [isOpen, setIsOpen] = useState(false);
   const refDown = useRef(null);
   const handleClickOutside = (event) => {
      if (refDown.current && !refDown.current.contains(event.target)) {
         setIsOpen(false);
      }
   };

   const onShowComments = () => {
      if (!_.isEmpty(comments)) {
         setIsOpen(true);
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
      <div ref={refDown} className='relative group'>
         <button
            type='button'
            onClick={onShowComments}
            className={`group  ${
               !_.isEmpty(comments) ? 'text-blue-800 hover:underline' : 'text-black-500 cursor-default'
            }`}>
            Comentarios
         </button>
         <div className='absolute hidden w-full group-hover:block'>
            <p
               className={`px-2 py-1 mt-1 text-sm text-white rounded ${
                  !_.isEmpty(comments) ? 'bg-blue-800 w-64' : ' bg-black-500 w-40'
               }`}>
               {!_.isEmpty(comments) ? 'Haz clic para ver los comentarios' : 'No hay comentarios'}
            </p>
         </div>
         {isOpen && (
            <div className='absolute left-[6rem] h-auto text-black bg-white border rounded top-[-20rem] border-black-500 w-72 fadeIn'>
               <h4 className='py-2 pl-3 pr-2 text-white capitalize bg-black rounded-t'>
                  {title || 'Comentarios -'}
                  <span
                     className='items-center justify-center float-right cursor-pointer material-symbols-outlined icon-size-20'
                     onClick={() => setIsOpen(false)}>
                     close
                  </span>
               </h4>
               <p className='px-2.5 py-1 container-overflow h-[18rem!important]'>{comments}</p>
            </div>
         )}
      </div>
   );
}
