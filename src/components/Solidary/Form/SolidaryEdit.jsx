'use client';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { NumericFormat } from 'react-number-format';
import clsx from 'clsx';

import { validateAmount } from '../../../services';
import { sweetNormal } from '../../../helpers';
import { constTypePerson as TypePerson } from '../../../helpers/config';

const ObligatedDetails = dynamic(() => import('./ObligatedItemDetails'));

const errorLabel = {
   Incremento: 'El monto debe ser mayor',
   Decremento: 'El monto debe ser menor',
};

export function SolidaryEdit({ request, onSet, creditLimit = 0, isNotEditable }) {
   const [numOblis, setNumOblis] = useState(1);
   const [virtual, setVirtual] = useState([]);
   const [validAmount, setValidAmount] = useState({ valid: true, procedure: '' });
   const holder = request?.relatedPersonResponseList.find((person) => person.idCatTypePerson === TypePerson.APPLICANT);
   const { idRequest } = request || {};
   const OBLIGATED_LIMIT = 10;
   const templateUUID = ['OS-01', 'OS-02', 'OS-03', 'OS-04', 'OS-05', 'OS-06', 'OS-07', 'OS-08', 'OS-09', 'OS-10'];

   useEffect(() => {
      const list = request?.relatedPersonResponseList.filter(
         (person) =>
            person?.idCatTypePerson !== TypePerson.APPLICANT && (person?.deleted === undefined || !person?.deleted)
      );

      if (!_.isEmpty(list)) {
         setVirtual(list);
         setNumOblis(list.length || 1);
      }
   }, [request?.relatedPersonResponseList]);

   const onChangeVirtual = (e) => {
      const { value, name } = e.target;
      let setName = name.split('-')[0];
      let newValue = value.includes('$') ? value.replace(/[$,]/g, '') : value;
      let validate = validateAmount(setName, newValue, request.kindProcedure, creditLimit, request);
      if (setName === 'kindProcedure' && request.activeCredit) {
         onSet(idRequest, { ...request, [setName]: newValue, requestAmount: request.oldAmount, validate });
      } else {
         onSet(idRequest, { ...request, [setName]: newValue, validate });
      }
      setValidAmount(validate);
   };

   const handleUpdateObligated = (obligated, idx) => {
      // 1. Manejar el caso de validación inicial con un Guard Clause
      // El cliente ya existe y no está marcado para ser añadido.
      let existAndActiveObligated = request?.relatedPersonResponseList?.find(
         (rp) => rp.idClient === obligated.idClient && !rp.deleted
      );

      if (existAndActiveObligated) {
         sweetNormal({
            txt: 'Ya has asignado a este cliente como <b>Obligado Solidario</b>, por favor elige uno diferente.',
            icon: 'warning',
         });
         return;
      }

      // 2.- Determinar la nueva lista de personas
      let newPersonList;
      // Caso A: Reactivar un obligado solidario que ya estaba eliminado
      const existingAndDeletedObligated = request.relatedPersonResponseList.find(
         (rp) => rp.idClient === obligated.idClient && rp.deleted
      );

      if (existingAndDeletedObligated) {
         newPersonList = request.relatedPersonResponseList.map((rp) =>
            rp.idClient === existingAndDeletedObligated.idClient ? { ...rp, deleted: false } : rp
         );
      }
      // Caso B: Reemplazar un obligado solidario en una posición virtual
      else if (!_.isEmpty(virtual[idx])) {
         const obligatedToReplace = virtual[idx];
         newPersonList = request.relatedPersonResponseList.map((rp) =>
            rp.idClient === obligatedToReplace.idClient ? obligated : rp
         );
         if (!obligatedToReplace.newObli) {
            newPersonList.push({ ...obligatedToReplace, deleted: true });
         }
      }
      // Caso C: Añadir un nuevo obligado solidario a la lista
      else {
         newPersonList = [...request.relatedPersonResponseList, { ...obligated }];
      }

      // 3. Actualizar el estado con la nueva lista
      onSet(idRequest, { ...request, relatedPersonResponseList: newPersonList });
   };

   const handleDeleteObligated = (idx) => {
      let existObligated = virtual[idx];
      if (!_.isEmpty(existObligated)) {
         let relatedPersonResponseList = existObligated.newObli
            ? request.relatedPersonResponseList.filter((rp) => rp.idClient !== existObligated.idClient)
            : request.relatedPersonResponseList.map((rp) =>
                 rp.idClient === existObligated.idClient ? { ...rp, deleted: true } : rp
              );
         onSet(idRequest, { ...request, relatedPersonResponseList });
      }

      if (virtual.length === 1 && idx === 0) {
         setVirtual([]);
      } else {
         setNumOblis(numOblis - 1);
      }
   };

   return (
      <div className='flex flex-none flex-col h-auto text-sm bg-opacity-75 rounded bg-neutral-50 w-80'>
         <div className='px-4 py-2 text-left text-white rounded-tl rounded-tr bg-black-900'>
            <h3 className='truncate' title={holder.fullName || '-'}>
               {holder.fullName || '-'}
            </h3>
         </div>
         <div className='relative flex flex-col gap-1 px-4 pt-2 pb-4 text-sm border rounded-b border-gray'>
            <>
               <label
                  htmlFor={'kindProcedure-' + idRequest}
                  className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Tipo de trámite
               </label>
               <select
                  id={'kindProcedure-' + idRequest}
                  name={'kindProcedure-' + idRequest}
                  required
                  value={request?.kindProcedure || ''}
                  onChange={(e) => onChangeVirtual(e)}
                  className='w-full p-2 border border-gray-400 rounded cursor-pointer focus:outline-none hover:border-blue-800 hover:ring-1 hover:ring-blue-800 focus:border-blue-800 focus:ring-blue-800 focus:text-blue-800'>
                  <option value=''>- Seleccionar -</option>
                  {request?.activeCredit ? (
                     <>
                        <option value='Recalificacion'>Recalificación</option>
                        <option value='Incremento'>Incremento</option>
                        <option value='Decremento'>Decremento</option>
                        <option value='Modificacion'>Modificación</option>
                     </>
                  ) : (
                     <option value='Nuevo Tramite'>Nuevo trámite</option>
                  )}
               </select>
               <label
                  htmlFor={'requestAmount-' + idRequest}
                  className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Monto de línea solicitado
               </label>
               <NumericFormat
                  id={'requestAmount-' + idRequest}
                  name={'requestAmount-' + idRequest}
                  disabled={['Recalificacion', 'Modificacion'].includes(request?.kindProcedure)}
                  maxLength='12'
                  required
                  placeholder='$ 0'
                  value={request?.requestAmount}
                  thousandsGroupStyle='thousand'
                  thousandSeparator=','
                  prefix='$'
                  allowNegative={false}
                  decimalScale={2}
                  onValueChange={(_v, source) => {
                     source.source !== 'prop' && onChangeVirtual(source.event);
                  }}
                  className={clsx(
                     'input-required w-full p-2 text-right border rounded outline-none focus:outline-none mb-4 border-gray-400 hover:ring-1 hover:border-blue-800 hover:ring-blue-800 focus:ring-blue-800 focus:text-blue-800 focus:border-blue-800 disabled:hover:ring-0 disabled:hover:border-black-500',
                     {
                        'border-red-500 hover:border-red-500 hover:ring-1 hover:ring-red-500 focus:ring-red-500 focus:text-red-500 focus:border-red-500':
                           !validAmount.valid,
                     }
                  )}
               />
               {!validAmount.valid && (
                  <p className='mb-2 -mt-4 text-xs text-red-500 rounded-md'>{`${
                     errorLabel[validAmount?.procedure] || 'Monto excedido'
                  }`}</p>
               )}
            </>
            {[...Array(numOblis)].map((_u, idx) => {
               let data = virtual[idx];
               let uuid = _.isEmpty(data) ? templateUUID[idx] : `Request-${data.idRequest}-OS-${data.idClient}`;

               return (
                  <ObligatedDetails
                     key={uuid}
                     obligated={data || {}}
                     index={idx}
                     showSeparator={idx === numOblis - 1 && numOblis < OBLIGATED_LIMIT}
                     isNotEditable={isNotEditable}
                     idRequest={idRequest}
                     numVirtualObligateds={numOblis}
                     onSetObligated={handleUpdateObligated}
                     onDeletedObligated={() => handleDeleteObligated(idx)}
                     onAddObligated={() => setNumOblis((prevState) => prevState + 1)}
                  />
               );
            })}
         </div>
      </div>
   );
}
