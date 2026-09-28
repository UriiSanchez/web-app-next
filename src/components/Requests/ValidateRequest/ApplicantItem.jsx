import React from 'react';
import PropTypes from 'prop-types';

import { formatId } from '../../../helpers';

/**
 * Componente para mostrar al solicitante principal y sus obligados solidarios, así como la opción
 * de añadir un comentario al devolver la solicitud.
 *
 * @component ApplicantItem
 * @param {Object} props - Las props del componente
 * @param {number} props.idRequest - El ID único de la sub solicitud
 * @param {string} props.fullName - Nombre completo del solicitante principal.
 * @param {Array[]} props.listObligated - Arreglo de objetos que representan a los obligados solidarios.
 * @param {string} props.comment - Obtiene el valor del comentario guardado en el padre
 * @param {function(number,string):void} props.onVirtual - Función callback que se invoca cuando el valor del textarea de comentarios cambia.
 * Recibe el ID de la solicitud y el nuevo valor del comentario.
 * @returns {JSX.Element} Componente renderizado del ApplicantItem
 * */
export const ApplicantItem = ({ idRequest, fullName, listObligated, comment, onVirtual }) => {
   return (
      <div className='flex flex-col flex-none w-64 gap-4 fadeIn'>
         <div>
            <div className='px-4 py-2 text-white rounded-t 2xl:py-4 bg-black-900'>
               <h3 className='text-base font-light'>Solicitud&nbsp;{formatId(idRequest)}</h3>
            </div>
            <div className='h-24 px-4 py-2 text-sm bg-white border rounded-b border-gray'>
               <h4 className='mb-2 text-base text-gray-500'>Solicitante</h4>
               <p className='py-1 text-sm'>{fullName}</p>
            </div>
         </div>
         <div className='px-4 py-2 border rounded border-gray bg-white container-overflow h-[15rem!important] xl:h-[17rem!important]'>
            <h4 className='mb-2 text-base text-gray-500'>Obligados solidarios</h4>
            {listObligated?.map((ob) => (
               <p key={'ob-' + ob?.idClient} className='py-1 text-sm'>
                  {ob?.fullName || ''}
               </p>
            ))}
         </div>
         <textarea
            id={'comment-' + idRequest}
            name={'comment' + idRequest}
            data-testid={'text-comment-' + idRequest}
            col='6'
            row='10'
            maxLength={500}
            value={comment}
            onChange={(e) => onVirtual(idRequest, e.target.value)}
            placeholder='Ingresa aquí los comentarios'
            className='px-4 py-2.5 rounded border border-gray h-32 outline-none hover:ring-1 hover:border-blue-800 hover:ring-blue-800 focus:outline-none focus:text-blue-800 max-h-32 placeholder-slate-400 resize-none text-sm gap-2'
         />
      </div>
   );
};

ApplicantItem.propTypes = {
   idRequest: PropTypes.number.isRequired,
   fullName: PropTypes.string,
   listObligated: PropTypes.array,
   comment: PropTypes.string,
   onVirtual: PropTypes.func.isRequired,
};
