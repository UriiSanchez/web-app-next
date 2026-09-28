'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import Image from 'next/image';

import {
   formatMoney,
   generateListYears,
   getClassInput,
   getCurrentDate,
   initDerivatives,
   typeCreditList,
} from '../../../../helpers';
import { constMonths } from '../../../../helpers/config';

import flag_mexico from '../../../../../public/flags/flag_mx.svg';

export function CardCreditorItem({ idx = 0, data = [], fnVirtual, extra, isDisabled, isSave }) {
   const showIcons = useMemo(() => {
      let setting = {
         lineAmount: {
            isNotShow: true,
         },
         balanceInNational: {
            isNotShow: true,
         },
      };

      if (!_.isEmpty(data[idx]?.natureOfCredit)) {
         let options = initDerivatives.validationRules[extra][data[idx].natureOfCredit];
         setting[options.attr].isNotShow = options.conditional(data[idx]);
      }

      return setting;
   }, [extra, data]);
   const currentYear = getCurrentDate('YY');
   const currentMonth = parseInt(getCurrentDate('MM'));

   let listYears = useMemo(() => {
      return generateListYears();
   }, []);

   return (
      <>
         <p className='px-1 ml-8 -m-3 text-base bg-white w-fit'>Acreedor {idx + 1}</p>
         <div className='grid grid-cols-5 gap-4 px-4 pt-8 pb-4'>
            <div className='flex flex-col col-span-2 gap-2'>
               <label htmlFor={'creditor-' + idx} className='text-sm truncate' title='Acreedor'>
                  Acreedor
               </label>
               <input
                  id={'creditor-' + idx}
                  data-testid={'creditor-' + idx}
                  name={'creditor-' + idx}
                  type='text'
                  autoComplete='off'
                  placeholder='Nombre del acreedor'
                  value={data[idx]?.creditor || ''}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full text-sm text-center input-form h-9 ${getClassInput(
                     data[idx]?.creditor,
                     isDisabled,
                     isSave
                  )}`}
               />
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'natureOfCredit-' + idx} className='text-sm truncate' title='Naturaleza del crédito'>
                  Naturaleza del crédito
               </label>
               <select
                  id={'natureOfCredit-' + idx}
                  data-testid={'natureOfCredit-' + idx}
                  name={'natureOfCredit-' + idx}
                  value={data[idx]?.natureOfCredit}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full text-sm text-center input-form h-9 ${getClassInput(
                     data[idx]?.natureOfCredit,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Seleccionar</option>
                  <option value='revolvente'>Revolvente</option>
                  <option value='amortizable'>Amortizable</option>
               </select>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'typeOfCredit-' + idx} className='text-sm truncate' title='Tipo de crédito'>
                  Tipo de crédito
               </label>
               <select
                  id={'typeOfCredit-' + idx}
                  data-testid={'typeOfCredit-' + idx}
                  name={'typeOfCredit-' + idx}
                  value={data[idx]?.typeOfCredit}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full text-sm text-center input-form h-9 ${getClassInput(
                     data[idx]?.typeOfCredit,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Seleccionar</option>
                  {data[idx]?.natureOfCredit &&
                     typeCreditList[data[idx].natureOfCredit].map((u) => (
                        <option key={u} value={u}>
                           {u}
                        </option>
                     ))}
               </select>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'grantMonth-' + idx} className='text-sm truncate' title='Fecha de contratación'>
                  Fecha de contratación
               </label>
               <div className='flex gap-2'>
                  <select
                     id={'grantMonth-' + idx}
                     data-testid={'grantMonth-' + idx}
                     name={'grantMonth-' + idx}
                     value={data[idx]?.grantMonth || ''}
                     disabled={isDisabled}
                     onChange={(e) => fnVirtual(e, idx)}
                     className={`flex-auto w-full text-sm text-center input-form h-9 ${getClassInput(
                        data[idx]?.grantMonth,
                        isDisabled,
                        isSave
                     )}`}>
                     <option value=''>Seleccionar</option>
                     {constMonths.map((m, i) => {
                        if (data[idx]?.yearOfGrant === currentYear.toString()) {
                           if (i < currentMonth) {
                              return (
                                 <option key={'grant-' + m} value={m}>
                                    {m}
                                 </option>
                              );
                           }
                        } else {
                           return (
                              <option key={'grant-' + m} value={m}>
                                 {m}
                              </option>
                           );
                        }
                     })}
                  </select>
                  <div
                     className={`flex flex-row input-form h-9 ${getClassInput(
                        data[idx]?.yearOfGrant,
                        isDisabled,
                        isSave
                     )}`}>
                     <div className='flex items-center justify-center w-10 text-right text-gray-600 bg-gray-100 rounded-l outline-none'>
                        <p>20</p>
                     </div>
                     <select
                        id={'yearOfGrant-' + idx}
                        name={'yearOfGrant-' + idx}
                        value={data[idx]?.yearOfGrant}
                        disabled={isDisabled}
                        className='h-auto text-center rounded cursor-pointer w-14 focus:outline-none focus:text-blue-800'
                        onChange={(e) => fnVirtual(e, idx)}>
                        <option value=''>Año</option>
                        {listYears?.expirationDate.map((value, idx) => (
                           <option key={'YearHire-20' + value} value={value}>
                              {value}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'expirationMonth-' + idx} className='text-sm truncate' title='Fecha de vencimiento'>
                  Fecha de vencimiento
               </label>
               <div className='flex gap-2'>
                  <select
                     id={'expirationMonth-' + idx}
                     data-testid={'expirationMonth-' + idx}
                     name={'expirationMonth-' + idx}
                     value={data[idx]?.expirationMonth || ''}
                     disabled={isDisabled}
                     onChange={(e) => fnVirtual(e, idx)}
                     className={`flex-auto w-full text-sm text-center input-form h-9 ${getClassInput(
                        data[idx]?.expirationMonth,
                        isDisabled,
                        isSave
                     )}`}>
                     <option value=''>Selecionar</option>
                     {constMonths.map((m, i) => {
                        if (data[idx]?.expirationYear === currentYear.toString()) {
                           if (i >= currentMonth) {
                              return (
                                 <option key={'expired-' + m} value={m}>
                                    {m}
                                 </option>
                              );
                           }
                        } else {
                           return (
                              <option key={'expired-' + m} value={m}>
                                 {m}
                              </option>
                           );
                        }
                     })}
                  </select>
                  <div
                     className={`flex flex-row input-form h-9 ${getClassInput(
                        data[idx]?.expirationYear,
                        isDisabled,
                        isSave
                     )}`}>
                     <div className='flex items-center justify-center w-10 text-right text-gray-600 bg-gray-100 rounded-l outline-none'>
                        <p>20</p>
                     </div>
                     <select
                        id={'expirationYear-' + idx}
                        name={'expirationYear-' + idx}
                        value={data[idx]?.expirationYear}
                        disabled={isDisabled}
                        className='h-auto text-center rounded cursor-pointer w-14 focus:outline-none focus:text-blue-800'
                        onChange={(e) => fnVirtual(e, idx)}>
                        <option value=''>Año</option>
                        {listYears?.hiringDate.map((value, idx) => (
                           <option key={'YearExpiration-20' + value} value={value}>
                              {value}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'lineAmount-' + idx} className='text-sm truncate' title='Monto autorizado'>
                  Monto autorizado
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     data[idx]?.lineAmount,
                     isDisabled,
                     isSave,
                     !showIcons.lineAmount.isNotShow
                  )}`}>
                  <span
                     hidden={showIcons.lineAmount.isNotShow}
                     className='relative mx-1 text-red-500 cursor-pointer material-symbols-outlined group icon-size-20'>
                     info
                     <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-8 -right-[5rem]'>
                        <div className='px-2 py-1 text-sm text-white bg-red-500 rounded'>
                           El monto autorizado debe ser mayor o igual al monto a cubrir
                        </div>
                     </div>
                  </span>
                  <NumericFormat
                     id={'lineAmount-' + idx}
                     name={'lineAmount-' + idx}
                     type='text'
                     autoComplete='off'
                     maxLength='12'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     placeholder='$ 0'
                     allowNegative={false}
                     decimalScale={2}
                     disabled={isDisabled}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && fnVirtual(source.event, idx);
                     }}
                     value={formatMoney(data[idx]?.lineAmount)}
                     className={`flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-${
                        showIcons.lineAmount.isNotShow ? 'blue-800' : 'red-500'
                     } text-${showIcons.lineAmount.isNotShow ? 'black' : 'red-500'}`}
                  />
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'currency-' + idx} className='text-sm truncate' title='Moneda'>
                  Moneda
               </label>
               <select
                  id={'currency-' + idx}
                  name={'currency-' + idx}
                  disabled
                  value={data[idx]?.currency || ''}
                  onChange={(e) => fnVirtual(e, idx)}
                  className='flex-auto w-full text-sm text-center bg-gray-100 border border-gray-400 rounded outline-none'>
                  <option value='MXN'>MXN</option>
                  <option value='USD'>USD</option>
                  <option value='EUR'>EUR</option>
               </select>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label
                  htmlFor={'balanceInNationalCurrency-' + idx}
                  className='text-sm truncate'
                  title='Saldo en moneda nacional'>
                  Saldo en moneda nacional
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     data[idx]?.balanceInNationalCurrency,
                     isDisabled,
                     isSave,
                     !showIcons.balanceInNational.isNotShow
                  )}`}>
                  <span
                     hidden={showIcons.balanceInNational.isNotShow}
                     className='relative mx-1 text-red-500 cursor-pointer material-symbols-outlined group icon-size-20'>
                     info
                     <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-8 -right-[5rem]'>
                        <div className='px-2 py-1 text-sm text-white bg-red-500 rounded'>
                           El saldo en moneda nacional debe ser mayor o igual al monto a cubrir
                        </div>
                     </div>
                  </span>
                  <NumericFormat
                     id={'balanceInNationalCurrency-' + idx}
                     name={'balanceInNationalCurrency-' + idx}
                     type='text'
                     autoComplete='off'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     placeholder='$ 0'
                     maxLength='12'
                     allowNegative={false}
                     decimalScale={2}
                     disabled={isDisabled}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && fnVirtual(source.event, idx);
                     }}
                     value={formatMoney(data[idx]?.balanceInNationalCurrency)}
                     className={`flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-${
                        showIcons.balanceInNational.isNotShow ? 'blue-800' : 'red-500'
                     } text-${showIcons.balanceInNational.isNotShow ? 'black' : 'red-500'}`}
                  />
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'amountCover-' + idx} className='text-sm truncate' title='Monto a cubrir'>
                  Monto a cubrir
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     data[idx]?.amountCover,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id={'amountCover-' + idx}
                     name={'amountCover-' + idx}
                     type='text'
                     autoComplete='off'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale={2}
                     placeholder='$ 0'
                     maxLength='12'
                     disabled={isDisabled}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && fnVirtual(source.event, idx);
                     }}
                     value={formatMoney(data[idx]?.amountCover)}
                     className='flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-blue-800'
                  />
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor={'termToCover-' + idx} className='text-sm truncate' title='Plazo a cubrir (meses)'>
                  Plazo a cubrir (meses)
               </label>
               <NumericFormat
                  id={'termToCover-' + idx}
                  data-testid={'termToCover-' + idx}
                  name={'termToCover-' + idx}
                  maxLength={3}
                  allowNegative={false}
                  placeholder='0'
                  disabled={isDisabled}
                  value={data[idx]?.termToCover || ''}
                  onValueChange={(_v, source) => {
                     source.source != 'prop' && fnVirtual(source.event, idx);
                  }}
                  className={`flex-auto w-1/2 text-sm text-center h-9 input-form  ${getClassInput(
                     data[idx]?.termToCover,
                     isDisabled,
                     isSave
                  )}`}
               />
            </div>
         </div>
      </>
   );
}
