'use client';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { AddButton, DeleteButton } from '../../Controls';
import { useGlobalContext } from '../../../hooks';
import { formatId, getUUIDArray, initContext } from '../../../helpers';
import { calcIndividualSummary } from '../../../helpers/calculates';

/**
 * Permite añadir, editar, verificar y/o eliminar propiedades exclusivamente para el Especialista.
 * @param {Object} info - Es la información ya sea aplicante u obligado
 * @param {function} onUpdateData - Función que actualiza el state original, se debe regresar el info modificado.
 * @param {string} width - Medida del contenedor padre, permitiendo restringir el ancho del contenedor de los items.
 * @returns Un contenedor con propiedades.
 */
export default function PropertiesEdit({ info = {}, onUpdateData, width }) {
   const { actions } = useGlobalContext();
   const [numItems, setNumItems] = useState(1);
   const [virtual, setVirtual] = useState([]);
   const refElement = useRef(null);
   const PROPERTIES_LIMIT = 20;
   const templateUUID = useMemo(() => {
      return getUUIDArray(PROPERTIES_LIMIT, 'Property-');
   }, []);

   useEffect(() => {
      let properties = info?.properties.filter((p) => !p.deleted);
      setVirtual(properties || []);
      setNumItems(properties.length || 1);
   }, [info.properties]);

   const fnGetIndexProperty = (virtualIndex) => {
      const virtualProperty = virtual[virtualIndex];
      if (virtualProperty?.idRelOwnership) {
         return info.properties.findIndex(({ idRelOwnership }) => idRelOwnership === virtualProperty.idRelOwnership);
      }

      //* Las propiedades sin idRelOwnership son las que no se han guardado y siempre están al final de la lista
      //* por lo que hay que agregar el número de propiedades eliminadas.
      const deletedPropertiesCount = info?.properties.filter((p) => p.deleted)?.length || 0;
      return deletedPropertiesCount + virtualIndex;
   };

   const handleChangeVirtual = (event, idx) => {
      const { name, value } = event.target;
      let setName = name.split('-')[0];
      let newValue = value.replace(/[$,]/g, '');
      let newData = [];

      if (_.isEmpty(info?.properties)) {
         newData = [{ [setName]: newValue, numberOwnership: idx + 1, newProperty: true }];
      } else if (_.isUndefined(info?.properties[fnGetIndexProperty(idx)])) {
         newData = [...info.properties, { [setName]: newValue, numberOwnership: idx + 1, newProperty: true }];
      } else {
         newData = info?.properties.map((property, index) =>
            index === fnGetIndexProperty(idx) ? { ...property, [setName]: newValue } : property
         );
      }
      //* Se realizan los calculos para Resumen Individual
      let resumeInd = calcIndividualSummary(newData, info.resumeInd);
      onUpdateData('applicant', { ...info, properties: newData, resumeInd });
   };

   const handleAddProperty = () => {
      setNumItems((prevState) => prevState + 1);
      const element = refElement.current;
      setTimeout(() => {
         element.scrollTo({
            left: element.scrollWidth - element.clientWidth,
            behavior: 'smooth',
         });
      }, 500);
   };

   const handleDeleteProperty = (idx) => {
      let existProperty = virtual[idx];
      if (!_.isEmpty(existProperty)) {
         let properties = _.isUndefined(existProperty?.idRelOwnership)
            ? info?.properties?.filter((u, i) => i !== fnGetIndexProperty(idx))
            : info?.properties?.map((p) =>
                 existProperty.idRelOwnership === p.idRelOwnership ? { ...p, deleted: true } : p
              );
         //* Se realizan los calculos para Resumen Individual
         let resumeInd = calcIndividualSummary(
            properties.filter((p) => !p.deleted),
            info.resumeInd
         );

         onUpdateData('applicant', { ...info, properties, resumeInd });
      }

      if (virtual.length === 1 && numItems === 1) {
         setVirtual([]);
      } else {
         setNumItems((prevState) => prevState - 1);
      }
   };

   const fnSetContextVerification = (idx) => {
      const { properties } = info;
      const infoIndex = fnGetIndexProperty(idx);
      let item = properties[infoIndex]?.idCheckOwnership
         ? {
              idx: infoIndex,
              catTypePerson: info?.idCatTypePerson,
              ...properties[infoIndex]?.idCheckOwnership,
              idRelOwnership: properties[infoIndex]?.idRelOwnership || null,
              idClient: info?.idClient,
           }
         : {
              ...initContext,
              idx: infoIndex,
              checkNumber: infoIndex + 1,
              catTypePerson: info?.idCatTypePerson,
              idRelOwnership: properties[infoIndex]?.idRelOwnership || null,
              idClient: info?.idClient,
           };

      actions.toggleVerification(item);
   };

   return (
      <div style={{ width }} className='flex gap-2 overflow-x-auto' ref={refElement}>
         {[...Array(numItems)].map((_u, idx) => {
            let property = virtual[idx];
            let disabledBtn = _.isUndefined(property?.idRelOwnership);
            let uuid = _.isEmpty(property?.idRelOwnership) ? templateUUID[idx] : `Property-${property.idRelOwnership}`;
            return (
               <div
                  key={uuid}
                  className='grid grid-cols-2 grid-flow-row flex-none w-[22rem] gap-x-2 gap-y-3 p-4 box-border border border-black-500 rounded-md relative fadeIn'>
                  {(numItems > 1 || property) && <DeleteButton fn={() => handleDeleteProperty(idx)} />}
                  <div className='flex items-end col-span-2 gap-2 mt-2 select-none'>
                     <span className='flex-none text-gray material-symbols-outlined icon-size-24'>home</span>
                     <p>
                        Propiedad&nbsp;
                        {formatId(idx + 1, 2)}
                     </p>
                     <div
                        className={clsx('flex-auto flex items-center justify-end ', {
                           'text-gray': disabledBtn,
                           'text-blue-800 cursor-pointer': !disabledBtn,
                        })}>
                        <button
                           type='button'
                           disabled={disabledBtn}
                           className='flex items-center gap-1 text-sm clean'
                           onClick={() => fnSetContextVerification(idx)}>
                           verificación
                           <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
                        </button>
                     </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                     <label htmlFor={'formFoil-' + idx} className='text-xs select-none'>
                        Folio del formulario
                     </label>
                     <NumericFormat
                        id={'formFoil-' + idx}
                        name={'formFoil-' + idx}
                        type='text'
                        maxLength='12'
                        allowNegative={false}
                        decimalScale={0}
                        value={property?.formFoil || ''}
                        placeholder='Escribe el folio'
                        onValueChange={(_v, source) => {
                           source.source !== 'prop' && handleChangeVirtual(source.event, idx);
                        }}
                        className='w-full h-8 px-2 py-1 text-sm text-center input-form'
                     />
                  </div>
                  <div className='flex flex-col gap-2'>
                     <label htmlFor={'customerValue-' + idx} className='text-xs select-none'>
                        Valor s/cliente (MXP)
                     </label>
                     <div className='flex items-center h-8 input-form'>
                        <NumericFormat
                           id={'customerValue-' + idx}
                           name={'customerValue-' + idx}
                           placeholder='$ 00.00'
                           type='text'
                           maxLength='14'
                           value={property?.customerValue || ''}
                           thousandsGroupStyle='thousand'
                           thousandSeparator=','
                           allowNegative={false}
                           prefix='$'
                           decimalScale={2}
                           onValueChange={(_v, source) => {
                              source.source !== 'prop' && handleChangeVirtual(source.event, idx);
                           }}
                           className='w-full py-0.5 px-2 text-right text-sm outline-none focus:text-blue-800'
                        />
                        <div className='flex items-center justify-center flex-none w-8 h-8 text-center border-l select-none border-black-500'>
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
                     <label htmlFor={'landUnit-' + idx} className='text-xs select-none'>
                        Unidad de terreno
                     </label>
                     <select
                        id={'landUnit-' + idx}
                        name={'landUnit-' + idx}
                        value={property?.landUnit || ''}
                        onChange={(e) => handleChangeVirtual(e, idx)}
                        className='w-full h-8 py-1 text-sm text-black input-form cursor-pointer text-center'>
                        <option value=''>- Seleccionar -</option>
                        <option value='hectare'>Hectárea</option>
                        <option value='squareMeter'>Metro cuadrado</option>
                     </select>
                  </div>
                  <div className='flex flex-col gap-2'>
                     <label htmlFor={'propertyType-' + idx} className='text-xs select-none'>
                        Tipo de inmueble
                     </label>
                     <select
                        id={'propertyType-' + idx}
                        name={'propertyType-' + idx}
                        value={property?.propertyType || ''}
                        onChange={(e) => handleChangeVirtual(e, idx)}
                        className='w-full h-8 py-1 text-sm text-black input-form cursor-pointer text-center'>
                        <option value=''>- Seleccionar -</option>
                        <option value='roomHouse'>Casa habitación</option>
                        <option value='department'>Departamento</option>
                        <option value='building'>Edificio</option>
                        <option value='land'>Terreno</option>
                        <option value='industrialUnit'>Nave industrial</option>
                        <option value='agriculturaLand'>Terreno agricola</option>
                        <option value='Commercial'>Comercial</option>
                     </select>
                  </div>
                  <div className='flex flex-col gap-2'>
                     <label htmlFor={'buildArea-' + idx} className='text-xs select-none'>
                        m<sup>2</sup> de construcción
                     </label>
                     <div className='flex items-center h-8 input-form'>
                        <NumericFormat
                           id={'buildArea-' + idx}
                           name={'buildArea-' + idx}
                           placeholder='00'
                           type='text'
                           maxLength='10'
                           value={property?.buildArea || ''}
                           allowNegative={false}
                           decimalScale={2}
                           onValueChange={(_v, source) => {
                              source.source !== 'prop' && handleChangeVirtual(source.event, idx);
                           }}
                           className='w-full py-0.5 px-2 text-right text-sm outline-none focus:text-blue-800'
                        />
                        <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                           m<sup>2</sup>
                        </div>
                     </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                     <label htmlFor={'areaDimension-' + idx} className='text-xs select-none'>
                        Dimensiones de terreno
                     </label>
                     <div className='flex items-center h-8 text-sm input-form'>
                        <NumericFormat
                           id={'areaDimension-' + idx}
                           name={'areaDimension-' + idx}
                           placeholder='00'
                           type='text'
                           maxLength='10'
                           value={property?.areaDimension || ''}
                           allowNegative={false}
                           decimalScale={2}
                           onValueChange={(_v, source) => {
                              source.source !== 'prop' && handleChangeVirtual(source.event, idx);
                           }}
                           className='w-full py-0.5 px-2 text-right text-sm outline-none focus:text-blue-800'
                        />
                        <div className='flex items-center justify-center w-8 h-8 text-xs text-center border-l select-none border-black-500'>
                           {virtual[idx]?.landUnit === 'hectare' ? (
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
                     <label htmlFor={'location-' + idx} className='text-xs select-none'>
                        Ubicación
                     </label>
                     <textarea
                        id={'location-' + idx}
                        name={'location-' + idx}
                        maxLength={500}
                        value={virtual[idx]?.location || ''}
                        onChange={(e) => handleChangeVirtual(e, idx)}
                        placeholder='Lo ideal es identificar la calle, colonia, fraccionamiento, municipio y entidad...'
                        className='w-full h-24 p-2 text-sm text-black resize-none max-h-24 input-form'
                     />
                  </div>
                  {idx === numItems - 1 && numItems < PROPERTIES_LIMIT && (
                     <AddButton fn={handleAddProperty} isDisabled={_.isEmpty(property)} />
                  )}
               </div>
            );
         })}
      </div>
   );
}

PropertiesEdit.propTypes = {
   info: PropTypes.object,
   onUpdateData: PropTypes.func,
   width: PropTypes.string,
};
