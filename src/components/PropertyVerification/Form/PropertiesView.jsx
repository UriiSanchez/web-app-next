'use client';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import clsx from 'clsx';

import { useGlobalContext } from '../../../hooks';
import { formatId, formatMoney, initContext, optionsBase } from '../../../helpers';
import { constProfiles as Profile } from '../../../helpers/config';

/**
 * Permite verificar y validar verificación exclusivamente para el Analista y/o Líder. Para mesa todos los botones se encuentran bloqueados.
 * @param {Object} info Es la información ya sea aplicante u obligado
 * @param {function} onUpdateData Función que actualiza el state original, se debe regresar el info modificado.
 * @returns Un contenedor con propiedades y permitir la validación.
 */
export default function PropertiesView({ info, onUpdateData }) {
   const { user, actions } = useGlobalContext();
   const [propertiesOpen, setPropertiesOpen] = useState([]);
   const showValidation = useMemo(
      () => (user?.idProfile === Profile.ADC || user?.idProfile === Profile.LDC),
      [user?.idProfile]
   );

   const onChangeVirtual = (event, idOwnership) => {
      const { name, checked, value, type } = event.target;
      let setName = name.split('-')[0];
      let properties = info?.properties.map((pro) =>
         pro.idRelOwnership === idOwnership ? { ...pro, [setName]: type === 'checkbox' ? checked : value } : pro
      );
      onUpdateData('applicant', { ...info, properties });
   };

   const onShowValidation = (idRelOwnership, idx) => {
      if (!_.isEmpty(info?.properties[idx].idCheckOwnership)) {
         if (propertiesOpen.includes(idRelOwnership)) {
            let filterProperties = propertiesOpen.filter((p) => p !== idRelOwnership);
            setPropertiesOpen(filterProperties);
         } else {
            setPropertiesOpen([...propertiesOpen, idRelOwnership]);
         }
      }
   };

   const setContextVerification = (item, idx) => {
      let newItem = item?.idCheckOwnership
         ? {
              idx,
              catTypePerson: info?.idCatTypePerson,
              ...item.idCheckOwnership,
              idRelOwnership: item?.idRelOwnership || null,
              idClient: info?.idClient,
           }
         : {
              ...initContext,
              idx,
              checkNumber: idx + 1,
              catTypePerson: info?.idCatTypePerson,
              idRelOwnership: item?.idRelOwnership || null,
              idClient: info?.idClient,
           };
      actions.toggleVerification(newItem);
   };

   if (_.isEmpty(info?.properties)) {
      return (
         <div className='flex flex-row gap-4 container-overflow'>
            <div className='grid grid-cols-2 grid-flow-row auto-rows-max flex-none w-[22rem] max-h-[26rem] gap-x-2 gap-y-4 p-4 box-border border border-black-500 rounded-md relative fadeIn'>
               <div className='flex items-end col-span-2 gap-2 mt-2 select-none'>
                  <span className='flex-none text-gray material-symbols-outlined icon-size-24'>home</span>
                  <p>Propiedad&nbsp;</p>
                  <div className='flex items-center justify-end flex-auto gap-2 text-sm text-gray'>
                     verificación
                     <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
                  </div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>Folio del formulario</p>
                  <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 bg-neutral-100'></div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>Valor s/cliente (MXP)</p>
                  <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                     <div className='w-[7rem] py-0.5 mr-2 text-right text-sm outline-none'></div>
                     <div className='flex items-center justify-center w-8 h-8 text-center border-l select-none border-black-500'>
                        <Image
                           src="/flags/flag_mx.svg"
                           width='100'
                           height='100'
                           className='w-[1.5rem] h-[1.5rem]'
                           alt='Moneda en Pesos'
                           priority='true'
                        />
                     </div>
                  </div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>Unidad de terreno</p>
                  <div className='w-full h-8 py-1 text-sm text-black border rounded outline-none border-black-500 bg-neutral-100'></div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>Tipo de inmueble</p>
                  <div className='w-full h-8 py-1 text-sm text-black border rounded outline-none border-black-500 bg-neutral-100'></div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>
                     m<sup>2</sup> de construcción
                  </p>
                  <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                     <div className='w-[7rem] py-0.5 mr-2 text-right text-sm outline-none'></div>
                     <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                        m<sup>2</sup>
                     </div>
                  </div>
               </div>
               <div className='flex flex-col gap-2'>
                  <p className='text-xs select-none'>Dimensiones de terreno</p>
                  <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                     <div className='w-[7rem] py-0.5 mr-2 text-right outline-none text-sm'></div>
                     <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                        m<sup>2</sup>
                     </div>
                  </div>
               </div>
               <div className='flex flex-col col-span-2 gap-2'>
                  <p className='text-xs select-none'>Ubicación</p>
                  <div className='w-full h-24 p-2 text-sm text-black border rounded outline-none resize-none max-h-24 border-black-500 bg-neutral-100'></div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className='flex flex-row gap-4 container-overflow'>
         {info?.properties.map((item, idx) => {
            let disabledBtn = user?.idProfile === Profile.MRC || _.isUndefined(item.idRelOwnership);
            return (
               <div
                  key={'properties-' + item.idRelOwnership}
                  className='box-border relative flex flex-row border rounded border-black-500 fadeIn'>
                  <div className='grid grid-cols-2 grid-flow-row auto-rows-max flex-none w-[22rem] max-h-[26rem] gap-x-2 gap-y-4 p-4 '>
                     <div className='flex items-end col-span-2 gap-2 mt-2 select-none'>
                        <span className='flex-none text-gray material-symbols-outlined icon-size-24'>home</span>
                        <p>
                           Propiedad&nbsp;
                           {formatId(item.numberOwnership, 2)}
                        </p>
                        <div
                           className={clsx('flex-auto flex justify-end gap-2 text-blue-800 cursor-pointer ', {
                              'text-gray cursor-auto': disabledBtn,
                           })}>
                           <button
                              type='button'
                              disabled={disabledBtn}
                              className='flex items-center mb-1 text-sm clean'
                              onClick={() => setContextVerification(item, idx)}>
                              verificación
                           </button>
                           <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>Folio del formulario</p>
                        <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none bg-neutral-100 border-black-500'>
                           {item.formFoil || ''}
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>Valor s/cliente (MXP)</p>
                        <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                           <div className='w-[7rem] py-0.5 mr-2 text-right text-sm outline-none'>
                              {item.customerValue ? formatMoney(item.customerValue) : ''}
                           </div>
                           <div className='flex items-center justify-center w-8 h-8 text-center border-l select-none border-black-500'>
                              <Image
                                 src="/flags/flag_mx.svg"
                                 width='100'
                                 height='100'
                                 className='w-[1.5rem] h-[1.5rem]'
                                 alt='Moneda en Pesos'
                                 priority='true'
                              />
                           </div>
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>Unidad de terreno</p>
                        <div className='w-full h-8 px-2 py-1 text-sm text-center text-black border rounded outline-none border-black-500 bg-neutral-100'>
                           {!_.isEmpty(item.landUnit) ? optionsBase.landUnit[item.landUnit] : ''}
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>Tipo de inmueble</p>
                        <div className='w-full h-8 px-2 py-1 text-sm text-center text-black border rounded outline-none border-black-500 bg-neutral-100'>
                           {!_.isEmpty(item.propertyType) ? optionsBase.propertyType[item.propertyType] : ''}
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>
                           m<sup>2</sup> de construcción
                        </p>
                        <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                           <div className='w-[7rem] py-0.5 mr-2 text-right text-sm outline-none'>
                              {item.buildArea || ''}
                           </div>
                           <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                              m<sup>2</sup>
                           </div>
                        </div>
                     </div>
                     <div className='flex flex-col gap-2'>
                        <p className='text-xs select-none'>Dimensiones de terreno</p>
                        <div className='flex items-center h-8 border rounded border-black-500 bg-neutral-100'>
                           <div className='w-[7rem] py-0.5 mr-2 text-right outline-none text-sm'>
                              {item.areaDimension || ''}
                           </div>
                           <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                              {item.landUnit === 'hectare' ? (
                                 'ha'
                              ) : (
                                 <>
                                    m<sup>2</sup>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>
                     <div className='flex flex-col col-span-2 gap-2'>
                        <p className='text-xs select-none'>Ubicación</p>
                        <div className='w-full h-24 p-2 text-sm text-black border rounded outline-none resize-none max-h-24 border-black-500 bg-neutral-100'>
                           {item.location || ''}
                        </div>
                     </div>
                  </div>
                  {propertiesOpen.includes(item?.idRelOwnership) && (
                     <div
                        key={'validation-' + item?.idRelOwnership}
                        className='flex flex-col space-y-5 w-[16rem] max-h-[26rem] p-4  fadeIn bg-[#c8c8c8] bg-opacity-20'>
                        <div className='flex items-start w-full mt-2'>
                           <p className='flex-auto'>Validación</p>
                           <input
                              type='checkbox'
                              id={'validation-' + idx}
                              name={'validation-' + idx}
                              checked={item?.validation}
                              onChange={(e) => onChangeVirtual(e, item?.idRelOwnership)}
                              className='option-input'
                           />
                        </div>
                        <p className='flex flex-row text-sm text-black'>
                           El aréa de contraparte da su consentimiento de que la información es correcta
                        </p>
                        <div className='flex flex-col col-span-2 gap-2'>
                           <label htmlFor={'comments-' + idx} className='text-sm select-none '>
                              Comentarios
                           </label>
                           <textarea
                              id={'comments-' + idx}
                              name={'comments-' + idx}
                              maxLength={500}
                              cols="8"
                              rows="8"
                              value={item?.comments || ''}
                              onChange={(e) => onChangeVirtual(e, item?.idRelOwnership)}
                              placeholder='Escribe aquí...'
                              className='w-full p-2 text-sm text-black border rounded outline-none resize-none h-[13.2rem] max-h-[13.2rem] border-black-500 hover:border-blue-800 hover:ring-1 focus:text-blue-800'
                           />
                        </div>
                     </div>
                  )}
                  {showValidation && (
                     <div
                        key={'button-' + item?.idRelOwnership}
                        className={clsx('items-center h-full border-l border-black-500 rounded-e group ', {
                           'hover:border-blue-800 hover:bg-blue-800 hover:ring-1 focus:text-blue-800 hover:text-white cursor-pointer bg-white':
                              !_.isEmpty(item.idCheckOwnership),
                           'bg-neutral-100': _.isEmpty(item.idCheckOwnership),
                        })}
                        onClick={() => onShowValidation(item?.idRelOwnership, idx)}>
                        <span className='mt-48 material-symbols-outlined icon-size-24'>
                           {propertiesOpen.includes(item?.idRelOwnership)
                              ? 'keyboard_double_arrow_left'
                              : 'keyboard_double_arrow_right'}
                        </span>
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );
}

PropertiesView.propTypes = {
   info: PropTypes.object,
   onUpdateData: PropTypes.func,
};
