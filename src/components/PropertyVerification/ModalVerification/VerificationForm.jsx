'use client';
import _ from 'lodash';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';

import { savePropertyAfterVerification, saveVerification } from '../../../services';
import { DeleteButton } from '../../Controls';
import { useGlobalContext } from '../../../hooks';
import { PersonOptionItem } from './PersonOptionItem';
import { formatId, getCurrentDate, keysToCheckOthers, optOwnerType, sweetSnackbar } from '../../../helpers';
import { constTypePerson as TypePerson } from '../../../helpers/config';

/**
 * Componente generico para realizar la verificación de una propiedad, la información de la propiedad se setea a través
 * del Context y recibe como prop la información global de la pantalla.
 * @param {Object} propertyInfo - Información completa de la pantalla para realizar calculos.
 * @returns Un modal/formulario para capturar una verificación.
 */
export default function VerificationForm({ propertyInfo }) {
   const { user, verifyProperty, actions } = useGlobalContext();
   const [item, setItem] = useState(verifyProperty.item);
   const listOwners = useMemo(() => {
      let newDrop = structuredClone(optOwnerType[item?.catTypePerson]);
      if (propertyInfo?.obligedList?.length < 1) {
         newDrop.splice(2, 1);
      }
      return newDrop;
   }, [item?.catTypePerson, propertyInfo?.obligedList]);

   useEffect(() => {
      const originalStyle = window.getComputedStyle(document.documentElement).overflow;
      document.documentElement.style.overflow = 'hidden';

      return () => {
         document.documentElement.style.overflow = originalStyle;
      };
   }, []);

   const countOtherOwners = useMemo(() => {
      let count = 0;
      keysToCheckOthers.forEach((key) => {
         if (item[key]) {
            count++;
         }
      });
      return count || 1;
   }, [item]);

   const handleChangeState = (e) => {
      const { name, value, type } = e.target;
      let newValue = value.replace(/[$,]/g, '');
      let newItem = { ...item, [name]: type !== 'checkbox' ? newValue : e.target.checked };
      if (name === 'ownerType') {
         setLogicOwners(newItem);
      }
      setItem(newItem);
   };

   const setLogicOwners = (data) => {
      //* Seteamos vació antes de procesar los owners
      keysToCheckOthers.forEach((key) => (data[key] = ''));

      if (['APPLICANT', 'CO_OTHERS'].includes(data.ownerType)) {
         data.ownerName =
            data.catTypePerson === TypePerson.SOLIDARY_OBLIGED
               ? propertyInfo?.obligedList.find((o) => o.idClient === item?.idClient)?.fullName
               : propertyInfo?.applicant?.fullName;
      } else if (data.ownerType === 'CO_OBLIGED') {
         data.ownerName = propertyInfo?.applicant?.fullName;
         propertyInfo.obligedList.forEach((itm, idx) => {
            data['otherName' + (idx + 1)] = itm.fullName;
         });
      }
   };

   const handelDeleteOwner = (attribute) => setItem({ ...item, [attribute]: '' });

   const onSaveVerification = async (e) => {
      e.preventDefault(e);
      actions.toggleLoading('Guardando datos...');
      try {
         const { data, status } = await saveVerification(item);
         if (status !== 200) {
            return;
         }

         let info = structuredClone(propertyInfo);
         info.propertiesFormat.userModify = user?.userAD;
         const upResult = await savePropertyAfterVerification({ ...item, ...data }, info);

         if (upResult.status !== 200) {
            console.error('Error al guardar después de la verificación');
         }

         actions.toggleReloading();
         actions.toggleVerification();
         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Listo! La verificación se ha guardado</p>',
         });
      } catch (error) {
         console.log('Modal Verification', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <dialog open className='main-modal'>
         <div className='relative m-auto max-w-3xl min-h-56 max-h-[30rem] rounded p-6 modal-container'>
            <DeleteButton testId='close-modal-verification' fn={() => actions.toggleVerification()} />
            <form id='verificationForm' method='post' onSubmit={onSaveVerification}>
               <div className='flex flex-row w-full mb-4'>
                  <div className='flex items-end w-1/3 gap-1'>
                     <span className='material-symbols-outlined'>approval</span>
                     <p>Verificación&nbsp;{formatId(item?.checkNumber, 2)} </p>
                  </div>
                  <div className='flex items-center justify-start w-1/3 text-sm'>
                     <input
                        id='checkDate'
                        name='checkDate'
                        onChange={handleChangeState}
                        type='date'
                        required
                        value={item?.checkDate || ''}
                        max={getCurrentDate('YYYY-MM-DD')}
                        placeholder='00-00-0000'
                        className='p-1 text-center cursor-pointer w-34 input-form'
                     />
                  </div>
                  <div className='flex justify-end w-1/3 text-xs'>
                     <button
                        form='verificationForm'
                        className='flex items-center justify-center px-4 text-white bg-blue-800 border cursor-pointer w-34 rounded-3xl'
                        type='submit'>
                        Guardar y salir
                     </button>
                  </div>
               </div>
               <div className='flex flex-row gap-4'>
                  <div className='flex flex-col w-1/2 gap-2 mb-2 min-h-48 max-h-96'>
                     <div className='flex flex-col gap-1'>
                        <label htmlFor='ownerType' className='text-xs'>
                           Nombre del propietario
                        </label>
                        <select
                           id='ownerType'
                           name='ownerType'
                           value={item?.ownerType || ''}
                           required
                           onChange={handleChangeState}
                           className='w-full h-8 p-1 text-sm text-black cursor-pointer input-form'>
                           <option value=''>- Seleccionar -</option>
                           {listOwners?.map((dr) => (
                              <option key={dr.value} value={dr.value}>
                                 {dr.label}
                              </option>
                           ))}
                        </select>
                     </div>
                     {!_.isEmpty(item.ownerType) && (
                        <PersonOptionItem
                           data={item}
                           onDeleteCoOwner={handelDeleteOwner}
                           onChangeState={handleChangeState}
                           countOtherOwners={countOtherOwners}
                        />
                     )}
                  </div>
                  <div className='flex flex-col w-1/2 gap-2'>
                     <div className='flex flex-col gap-1'>
                        <label htmlFor='ownershipStatus' className='text-xs'>
                           Estatus de propiedad
                        </label>
                        <select
                           required
                           id='ownershipStatus'
                           name='ownershipStatus'
                           value={item?.ownershipStatus || ''}
                           onChange={handleChangeState}
                           className='h-8 p-1 text-sm text-black cursor-pointer input-form'>
                           <option value=''>- Seleccionar -</option>
                           <option value='libre'>Libre</option>
                           <option value='gravado'>Gravado</option>
                           <option value='embargado'>Embargado</option>
                           <option value='pendiente'>Pendiente</option>
                           <option value='escrituracion'>En escrituración</option>
                           <option value='donada'>Donada</option>
                        </select>
                     </div>
                     {(item?.ownershipStatus === 'gravado' || item?.ownershipStatus === 'embargado') && (
                        <div className='w-full fadeIn'>
                           <textarea
                              id='description'
                              name='description'
                              value={item?.description || ''}
                              onChange={handleChangeState}
                              maxLength={500}
                              cols="6"
                              placeholder='Completar con el nombre de la institución, la fecha, el monto y el plazo'
                              className='w-full p-2 text-xs text-black resize-none input-form h-28'
                           />
                        </div>
                     )}
                     <div className='flex items-end justify-between gap-2 mb-2'>
                        <div className='flex flex-col w-1/2 gap-2'>
                           <label htmlFor='typeValue' className='text-xs'>
                              Valor propiedad
                           </label>
                           <select
                              required
                              id='typeValue'
                              name='typeValue'
                              value={item?.typeValue || ''}
                              onChange={handleChangeState}
                              className='w-full h-8 p-1 text-sm text-center text-black cursor-pointer input-form'>
                              <option value=''>- Seleccionar -</option>
                              <option value='appraisal'>Valor avalúo</option>
                              <option value='adjusted'>Valor ajustado</option>
                           </select>
                        </div>
                        <div className='flex flex-col w-1/2 gap-2'>
                           <label htmlFor='ownershipValue' className='text-xs'>
                              Valor
                           </label>
                           <div className='flex items-center h-8 input-form'>
                              <NumericFormat
                                 id='ownershipValue'
                                 name='ownershipValue'
                                 placeholder='$ 0'
                                 maxLength='15'
                                 value={item?.ownershipValue || ''}
                                 thousandsGroupStyle='thousand'
                                 thousandSeparator=','
                                 prefix='$'
                                 required
                                 allowNegative={false}
                                 decimalScale={2}
                                 onValueChange={(_v, source) => {
                                    source.source !== 'prop' && handleChangeState(source.event);
                                 }}
                                 className='w-32 py-0.5 mx-1 pl-2 text-right outline-none focus:text-blue-800'
                              />
                              <div className='flex items-center justify-center w-8 h-8 text-center border-l border-gray-400'>
                                 <Image
                                    src="/flags/flag_mx.svg"
                                    width='100'
                                    height='100'
                                    className='w-[1.5rem] h-[1.5rem]'
                                    alt='Bandera de MX - Valor en Pesos'
                                    priority='true'
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </form>
         </div>
      </dialog>
   );
}

VerificationForm.propTypes = {
   propertyInfo: PropTypes.object,
   isShow: PropTypes.bool,
};
