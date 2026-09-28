import React from 'react';
import PropTypes from 'prop-types';
import { IconResult, CommentItem } from '../Controls';

/**
 * Componente que muestra un titulo y un icono de like o dislike con base a un bolean, es necesario pasarle un item
 * @param {Object} item - Información del initHistory contiene configuración a renderizar
 * @param {Object} source - Información origin por la cual se extraeran los datos
 * @returns
 */
//TODO falta complementar el JSDoc
export function ResultItem({ item, source }) {
   if (item?.config === 'all') {
      return (
         <div className='px-4 py-2'>
            <p className='font-bold'>{item.display}</p>
            <div className='flex justify-center gap-4 mt-2'>
               <div className='flex w-1/2 gap-4'>
                  <p>Analista: </p>
                  <IconResult key={`adc-${item.id}-${source.idRequest}`} result={source.recommendationAc} />
               </div>
               <div className='flex w-1/2 gap-4'>
                  <p>Líder: </p>
                  <IconResult key={`ldc-${item.id}-${source.idRequest}`} result={source.recommendationLc} />
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className='px-4 py-2'>
         <p className='font-bold'>{item.display}</p>
         <div className='flex gap-4 mt-2'>
            Estatus:
            <IconResult key={`result-${item.id}-${source.idRequest}`} result={source[item.id]} />
            {item.comments && (
               <CommentItem
                  comments={source[item.attrComment]}
                  title={item.display.replace('Recomendación', 'comentarios')}
               />
            )}
         </div>
      </div>
   );
}

ResultItem.propTypes = {
   item: PropTypes.object.isRequired,
   source: PropTypes.object.isRequired,
};
