import _ from 'lodash';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { DeleteButton } from '../../Controls';
import { OtherOwnersItem } from './OtherOwnersItem';
import { constTypePerson as TypePerson } from '../../../helpers/config';

/**
 * Componente que gestiona la logica de renderizado sobre los diferentes escenarios acorde a la opción
 * elegida por el usuario sobre el combo `Nombre del propietario`
 * @param {Object} data - Información total de la verificación, viene del Contexto Global `verifyProperty.item`
 * @param {function} onDeleteCoOwner - Función para limpiar los atributos `otherName{N}` del estado principal.
 * @param {function} onChangeState - Función que permite modificar el estado principal.
 * @param {number} countOtherOwners - Indica los atributos `otherName{N}` que han sido modificados.
 * @returns JSX.Element - Diferentes elementos html.
 */
export function PersonOptionItem({ data, onDeleteCoOwner, onChangeState, countOtherOwners }) {
   const [numOthers, setNumOthers] = useState(1);
   const isObligated = data?.catTypePerson === TypePerson.SOLIDARY_OBLIGED;
   const templateUUID = [
      { key: 'CO-01', id: 1 },
      { key: 'CO-02', id: 2 },
      { key: 'CO-03', id: 3 },
      { key: 'CO-04', id: 4 },
   ];
   useEffect(() => {
      setNumOthers(countOtherOwners);
   }, [countOtherOwners]);

   if (data?.ownerType === 'APPLICANT') {
      return (
         <div title={data?.ownerName || ''} className='flex items-center h-8 px-2 border border-gray-400 rounded select-none bg-neutral-200 fadeIn truncate text-sm'>
            {data?.ownerName || ''}
         </div>
      );
   }

   if (data?.ownerType === 'CO_OBLIGED') {
      return (
         <div className='flex flex-col gap-2 mt-2'>
            {data?.ownerName && (
               <div title={data?.ownerName || ''} className='relative flex items-center h-8 px-2 border border-gray-400 rounded-md select-none bg-neutral-200 fadeIn truncate text-sm'>
                  {data?.ownerName || ''}
                  {isObligated && <DeleteButton testId='deleted-owner' fn={() => onDeleteCoOwner('ownerName')} />}
               </div>
            )}
            {templateUUID.map((o, idx) => {
               let positionTemplate = templateUUID[idx];
               let setName = 'otherName' + positionTemplate.id;
               let ownerInformation = data[setName];
               return (
                  !_.isEmpty(ownerInformation) && (
                     <div
                        key={positionTemplate.key}
                        title={ownerInformation ?? ''}
                        className='relative flex items-center h-8 px-2 border border-gray-400 rounded select-none bg-neutral-200 fadeIn truncate text-sm'>
                        {ownerInformation ?? ''}
                        <DeleteButton testId={`deleted-${setName}`} fn={() => onDeleteCoOwner(setName)} />
                     </div>
                  )
               );
            })}
         </div>
      );
   }

   if (data?.ownerType === 'CO_OTHERS') {
      return (
         <div className='flex flex-col gap-2 py-1 max-h-[18rem!important] container-overflow fadeIn'>
            <div title={data?.ownerName || ''} className='flex items-center h-8 px-2 border border-gray-400 rounded select-none bg-neutral-200 fadeIn truncate text-sm'>
               {data?.ownerName || ''}
            </div>
            {[...Array(numOthers)].map((o, idx) => {
               let positionTemplate = templateUUID[idx];
               let nameAttribute = 'otherName' + positionTemplate.id;
               let ownerValue = data[nameAttribute];
               return (
                  <OtherOwnersItem
                     key={positionTemplate.key}
                     name={nameAttribute}
                     value={ownerValue}
                     onState={onChangeState}
                     showButtons={{
                        showBtnDeleted: idx >= numOthers - 1 && idx !== 0,
                        showBtnAdded: idx === numOthers - 1 && numOthers < 4,
                     }}
                     onAdded={() => setNumOthers((prevState) => prevState + 1)}
                     onDelete={() => {
                        onDeleteCoOwner(nameAttribute);
                        setNumOthers((prevState) => (prevState === 1 ? 1 : prevState - 1));
                     }}
                  />
               );
            })}
            {numOthers === 4 && (
               <div className='col-span-2 text-sm input--square fadeIn'>
                  <label htmlFor='check' className='cursor-pointer select-none'>
                     <input
                        id='check'
                        name='check'
                        type='checkbox'
                        className='option-input'
                        checked={data?.check || false}
                        onChange={onChangeState}
                     />
                     más de los mencionados
                  </label>
               </div>
            )}
         </div>
      );
   }

   templateUUID.push({ key: 'CO-05', id: 5 });
   return (
      <div className='flex flex-col gap-2 py-1 max-h-[18rem!important] container-overflow fadeIn'>
         {[...Array(numOthers)].map((o, idx) => {
            let positionTemplate = templateUUID[idx];
            let nameAttribute = 'otherName' + positionTemplate.id;
            let ownerValue = data[nameAttribute];

            return (
               <OtherOwnersItem
                  key={positionTemplate.key}
                  name={nameAttribute}
                  value={ownerValue}
                  onState={onChangeState}
                  showButtons={{
                     showBtnDeleted: idx >= numOthers - 1 && idx !== 0,
                     showBtnAdded: positionTemplate.id === numOthers && numOthers < 5,
                  }}
                  onAdded={() => setNumOthers((prevState) => prevState + 1)}
                  onDelete={() => {
                     onDeleteCoOwner(nameAttribute);
                     setNumOthers((prevState) => (prevState === 1 ? 1 : prevState - 1));
                  }}
               />
            );
         })}

         {numOthers === 5 && (
            <div className='col-span-2 text-sm input--square fadeIn'>
               <label htmlFor='check' className='cursor-pointer select-none'>
                  <input
                     id='check'
                     name='check'
                     type='checkbox'
                     className='option-input'
                     checked={data?.check || false}
                     onChange={onChangeState}
                  />
                  más de los mencionados
               </label>
            </div>
         )}
      </div>
   );
}

PersonOptionItem.propTypes = {
   data: PropTypes.object,
   onDeleteCoOwner: PropTypes.func,
   onChangeState: PropTypes.func,
   countOtherOwners: PropTypes.number,
};
