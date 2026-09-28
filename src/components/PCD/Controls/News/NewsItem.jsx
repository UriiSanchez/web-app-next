import _ from 'lodash';
import { useMemo } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { AddButton, DeleteButton } from '../../../Controls';
import { getClassInput, getUUIDArray } from '../../../../helpers';

import icoLink from '../../../../../public/icons/ico_link_url.svg';

/**
 * Componente que renderiza una lista de itemes, permitiendo la acción de eliminar, añadir o actualizar.
 * @param {number} numItems - Número total de items a renderizar.
 * @param {Array} item - Arreglo de noticias.
 * @param {string} type - Tipo de noticias.
 * @param {Function} fnRemove - Función para eliminar un item.
 * @param {Function} fnAdd - Función para añadir un nuevo item.
 * @param {Function} onSetData - Función para actualizar la información de un item.
 * @param {number} [limitItems=5] - Límite máximo de items a mostrar.
 * @param {boolean} isDisabled - Permite habilitar o deshabilitar los inputs
 * @param {boolean} isSave - Bandera que nos indica si ya hay información guardada en la sección.
 * @returns Lista de noticias.
 */
export const NewsItem = ({ numItems, item, type, fnRemove, fnAdd, onSetData, limitItems = 5, isDisabled, isSave }) => {
   const keyUuids = useMemo(() => {
      return getUUIDArray(limitItems, type + '-');
   }, [type]);

   return (
      <div className='flex flex-col gap-6'>
         {[...Array(numItems)].map((_numI, idx) => (
            <div key={keyUuids[idx]} className='relative flex flex-col gap-2'>
               {!isDisabled && (numItems > 1 || item?.[idx]) && <DeleteButton fn={(e) => fnRemove(e, idx, type)} />}
               <div className='flex flex-col group'>
                  <textarea
                     id={`description-${type}-${idx}`}
                     data-testid={`description-${type}-${idx}`}
                     name={'description-' + idx}
                     maxLength={500}
                     disabled={isDisabled}
                     value={item?.[idx]?.description || ''}
                     onChange={(e) => onSetData(e, idx, type)}
                     className={`px-4 py-2.5 h-32 max-h-32 w-full text-sm input-form ${getClassInput(
                        item?.[idx]?.description,
                        isDisabled,
                        isSave
                     )}`}
                  />
                  <div className='flex'>
                     <div className='flex items-center flex-none w-8 h-8 rounded-bl bg-black-900'>
                        <Image src={icoLink} alt='' className='m-auto' />
                     </div>
                     <input
                        type='url'
                        id={`url-${type}-${idx}`}
                        data-testid={`url-${type}-${idx}`}
                        name={'url-' + idx}
                        disabled={isDisabled}
                        value={item?.[idx]?.url || ''}
                        onChange={(e) => onSetData(e, idx, type)}
                        maxLength={200}
                        placeholder='Copia aquí el link de la noticia'
                        className={`flex-auto px-2 text-sm input-form ${getClassInput(
                           item?.[idx]?.url,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
               {!isDisabled && idx === numItems - 1 && numItems < limitItems && (
                  <AddButton
                     fn={(e) => fnAdd(e, type)}
                     sx='absolute bottom-[-2rem] left-[50%]'
                     isDisabled={_.isEmpty(item?.[idx])}
                  />
               )}
            </div>
         ))}
      </div>
   );
};

NewsItem.propTypes = {
   numItems: PropTypes.number.isRequired,
   item: PropTypes.arrayOf(PropTypes.object),
   type: PropTypes.oneOf(['positives', 'negatives']),
   fnRemove: PropTypes.func,
   fnAdd: PropTypes.func,
   onSetData: PropTypes.func,
   limitItems: PropTypes.number,
   isDisabled: PropTypes.bool,
   isSave: PropTypes.bool,
};
