import _ from 'lodash';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { NewsItem } from './News/NewsItem';

/**
 * Contenedor que muestra las noticias buenas y malas de la empresa.
 * @param {Object} item - objeto de padré
 * @param {Function} onSetData - Función que se ejecuta al realizar un cambio.
 * @param {boolean} [disabled] - Permite habilitar o deshabilitar los inputs
 * @param {boolean} [isSave] - Permite saber si ya hay informacion guardada en la sección
 * @returns
 */
export function NewsContainer({ item, onSetData, disabled, isSave }) {
   const [numItems, setNumItems] = useState({
      positives: 1,
      negatives: 1,
   });

   useEffect(() => {
      setNumItems({
         positives: item?.positives?.length || 1,
         negatives: item?.negatives?.length || 1,
      });
   }, [item]);

   const addItem = (e, type) => {
      setNumItems({ ...numItems, [type]: numItems[type] + 1 });
   };

   const removeItem = (e, idx, type) => {
      if (!_.isEmpty(item[type][idx])) {
         let newObj = item[type].filter((_, index) => index !== idx);
         onSetData({ ...item, [type]: newObj }, 'news');
      }

      if (item[type].length === 1 && idx === 0) {
         setNumItems({ ...numItems, [type]: 1 });
      } else {
         setNumItems({ ...numItems, [type]: numItems[type] - 1 });
      }
   };

   const handleChangeVirtual = (event, idx, type) => {
      const { name, value } = event.target;
      let setName = name.split('-')[0];
      let newData = [];

      if (_.isEmpty(item[type])) {
         newData = [{ [setName]: value }];
      } else if (_.isUndefined(item[type][idx])) {
         newData = [...item[type], { [setName]: value }];
      } else {
         newData = item[type].map((it, index) => (index === idx ? { ...it, [setName]: value } : it));
      }

      onSetData({ ...item, [type]: newData }, 'news');
   };

   return (
      <div className='flex flex-col w-full gap-4'>
         <p className='w-full'>
            <span className='font-semibold text-black-900'>Pregunta 6.</span>&nbsp;Resultado de Google It
         </p>
         <p className='w-full'>
            Ingresa las noticias resultados de Google en el campo correspondiente, en caso de no encontrar alguna, marca
            la casilla
         </p>
         <div className='custom-input'>
            <label htmlFor='noNewsWereFound' className='cursor-pointer select-none'>
               <input
                  id='noNewsWereFound'
                  name='noNewsWereFound'
                  type='checkbox'
                  checked={item?.noNewsWereFound}
                  disabled={disabled}
                  className='option-input'
                  onChange={(e) =>
                     onSetData({ noNewsWereFound: e.target.checked, negatives: [], positives: [] }, 'news')
                  }
               />
               No se encontraron noticias
            </label>
         </div>
         {!item?.noNewsWereFound && (
            <>
               <div className='grid grid-cols-2 gap-4 w-full mb-[-0.5rem]'>
                  <p className='select-none'>Noticias Positivas</p>
                  <p className='select-none'>Noticias Negativas</p>
               </div>
               <div className='grid grid-cols-2 gap-4 p-1 h-[20rem!important] container-overflow'>
                  <NewsItem
                     key='Positive-News'
                     {...{
                        numItems: numItems.positives,
                        item: item?.positives,
                        type: 'positives',
                        fnRemove: removeItem,
                        fnAdd: addItem,
                        onSetData: handleChangeVirtual,
                        isDisabled: disabled,
                        isSave: isSave,
                     }}
                  />
                  <NewsItem
                     key='Negative-News'
                     {...{
                        numItems: numItems.negatives,
                        item: item?.negatives,
                        type: 'negatives',
                        fnRemove: removeItem,
                        fnAdd: addItem,
                        onSetData: handleChangeVirtual,
                        isDisabled: disabled,
                        isSave: isSave,
                     }}
                  />
               </div>
            </>
         )}
      </div>
   );
}

NewsContainer.propTypes = {
   item: PropTypes.object,
   onSetData: PropTypes.func,
   disabled: PropTypes.bool,
   isSave: PropTypes.bool,
};
