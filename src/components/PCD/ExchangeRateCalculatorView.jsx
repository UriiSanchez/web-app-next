import React, { useMemo } from 'react';
import Image from 'next/image';
import { NumericFormat } from 'react-number-format';

import { TypeOfChange } from './Controls/TypeOfChange';
import { IncompleteSectionAlert } from './Controls/IncompleteSectionAlert';
import {
   formatId,
   formatMoney,
   formatNumber,
   getClassInput,
   getUUIDArray,
   onKeyNumbers,
   onPasteOnlyNumbers,
} from '../../helpers';
import { calcExchangeData } from '../../helpers/calculates';

import flag_mexico from '../../../public/flags/flag_mx.svg';
import flag_us from '../../../public/flags/flag_us.svg';

export const ExchangeRateCalculatorView = ({ info, onUpdateData, dollar, isDisabled, isSave, isComplete }) => {
   const onChangeVirtual = (e) => {
      let { name, value, type } = e.target;
      let newInfo = structuredClone(info);
      if (type === 'number') {
         const regex = /^.{0,3}$/;
         if (!regex.test(value) || value > 5) {
            return;
         }
      }

      newInfo[name] = value.includes('$') ? value.replace(/[$,]/g, '') : value;
      calcExchangeData(newInfo, dollar);
      onUpdateData('calculatorRateExchange', newInfo);
   };

   const keyUuids = useMemo(() => {
      return getUUIDArray(61, 'month' + '-');
   }, []);

   return (
      <div className='flex flex-col px-8 pb-8 mb-4 gap-y-4'>
         <TypeOfChange />
         {isSave && !isComplete && <IncompleteSectionAlert />}
         <h2 className='mt-3 font-bold text-black-900'>Estimación de cobertura anual</h2>
         <div className='flex flex-wrap w-[97%] gap-4 m-auto'>
            <div className='flex flex-col flex-none w-3/12 gap-1'>
               <p className='text-sm'>Posición del cliente</p>
               <div className='w-full h-9 py-0.5 flex items-center justify-center border border-gray-400 rounded bg-gray-100 text-gray-600'>
                  {info?.customerPosition || '-'}
               </div>
            </div>
            <div className='flex flex-col flex-none w-3/12 gap-1'>
               <p className='text-sm'>
                  {info?.customerPosition.includes('Compra')
                     ? 'Costo de ventas último del ejercicio'
                     : 'Ventas del último ejercicio'}
               </p>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.salesForLastFiscalYear,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='salesForLastFiscalYear'
                     name='salesForLastFiscalYear'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0'
                     value={formatMoney(info?.salesForLastFiscalYear, 0, '')}
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale={2}
                     disabled={isDisabled}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event);
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-blue-800'
                  />
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-10'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none gap-1'>
               <p className='text-sm'>% en moneda extranjera</p>
               <div className='flex items-center justify-center text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-4 text-center'>{info?.percentageInForeignCurrency || '0'}</div>
                  <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                     %
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none gap-1'>
               <p className='text-sm'>Flujo de moneda extranjera*</p>
               <div className='flex items-center justify-center w-full text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-2 text-center'>{formatMoney(info?.foreignCurrencyFlow, 2, '')}</div>
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-10'>
                     <Image className='w-2/3' src={flag_us} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none gap-1'>
               <p className='text-sm'>Politica de cobertura</p>
               <div className='flex items-center justify-center flex-initial w-5/6 text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-4 text-center'>{info?.coveragePolicy || '0'}</div>
                  <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                     %
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none gap-1'>
               <p className='text-sm'>Posición acumulada estimada*</p>
               <div className='flex items-center justify-center w-full text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-2 text-center'>
                     {formatMoney(info?.estimatedCumulativePosition, 2, '')}
                  </div>
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-10'>
                     <Image className='w-2/3' src={flag_us} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none gap-1'>
               <p className='text-sm'>Índice de cobertura</p>
               <div className='flex items-center justify-center w-full text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-4 text-center'>{formatNumber(info?.coverageIndex, 0, '-')}</div>
                  <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                     %
                  </div>
               </div>
            </div>
            <div className='flex items-end flex-none text-sm text-gray-300'>*Todos los datos mostrados son anuales</div>
         </div>
         <h2 className='mt-3 font-bold text-black-900'>Parámetros de operación</h2>
         <div className='flex flex-col w-[97%] gap-4 m-auto'>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>¿Cuál es el monto promedio por operación?</p>
               <div
                  className={`flex items-center justify-center flex-none h-9 input-form ${getClassInput(
                     info?.averageTransactionAmount,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='averageTransactionAmount'
                     name='averageTransactionAmount'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0'
                     disabled={isDisabled}
                     value={formatMoney(info?.averageTransactionAmount, 0, '')}
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale={2}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event);
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-blue-800'
                  />
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-12'>
                     <Image className='w-2/3' src={flag_us} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <label htmlFor='estimatedRevolving' className='flex-initial text-sm'>
                  Revolvencia estimada
               </label>
               <select
                  id='estimatedRevolving'
                  data-testid='estimatedRevolving'
                  name='estimatedRevolving'
                  value={info?.estimatedRevolving || ''}
                  onChange={onChangeVirtual}
                  disabled={isDisabled}
                  className={`w-1/3 h-[36px] text-center py-1 pl-0 text-sm cursor-pointer input-form ${getClassInput(
                     info?.estimatedRevolving,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Seleccionar</option>
                  <option value='semanal'>Semanal</option>
                  <option value='quincenal'>Quincenal</option>
                  <option value='mensual'>Mensual</option>
                  <option value='bimestral'>Bimestral</option>
                  <option value='trimestral'>Trimestral</option>
               </select>
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <label htmlFor='maximumCoverageTermInMonths' className='flex-initial text-sm'>
                  Plazo máximo de cobertura en meses
               </label>
               <select
                  id='maximumCoverageTermInMonths'
                  data-testid='maximumCoverageTermInMonths'
                  name='maximumCoverageTermInMonths'
                  value={info?.maximumCoverageTermInMonths || ''}
                  onChange={onChangeVirtual}
                  disabled={isDisabled}
                  className={`w-24 h-[36px] py-1 pl-0 text-sm text-center cursor-pointer input-form ${getClassInput(
                     info?.maximumCoverageTermInMonths,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value='0'>0</option>
                  {[...Array(60)].map((uo, i) => (
                     <option key={keyUuids[i]} value={i + 1}>
                        {formatId(i + 1, 2)}
                     </option>
                  ))}
               </select>
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>MPA (máxima posición abierta)</p>
               <div className='flex items-center justify-center flex-none w-5/12 text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-2 text-right'>{formatMoney(info?.mpa, 2)}</div>
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-10'>
                     <Image className='w-2/3' src={flag_us} alt='moneda' />
                  </div>
               </div>
            </div>
         </div>
         <div
            className={`w-full text-center m-auto rounded h-8 my-4 ${
               info?.annualConsistencyValidation?.color || 'bg-gray'
            }`}>
            <p className='pt-1 ml-1 mr-1 text-center text-white'>
               Validación de congruencia anual: &nbsp;
               {info?.annualConsistencyValidation?.title || ''}
            </p>
         </div>
         <h2 className='mt-2 font-bold text-black-900'>Congruencia de la línea</h2>
         <div className='flex flex-wrap w-1/3 gap-4 mb-6'>
            <div className='flex flex-col flex-none w-1/3 gap-1'>
               <p className='text-sm'>Spread</p>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.spread,
                     isDisabled,
                     isSave
                  )}`}>
                  <input
                     id='spread'
                     name='spread'
                     type='number'
                     min={0}
                     max={5}
                     placeholder='0.0'
                     value={info?.spread || ''}
                     onChange={onChangeVirtual}
                     onPaste={onPasteOnlyNumbers}
                     onKeyDown={onKeyNumbers}
                     disabled={isDisabled}
                     className='flex-auto w-full h-8 px-2 text-sm text-right outline-none focus:text-blue-800 remove-arrow'
                  />
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-12'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-1 gap-1'>
               <p className='text-sm'>Línea estimada</p>
               <div className='flex items-center justify-center w-full text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto px-4 text-right'>
                     {info?.estimatedLine ? formatMoney(info?.estimatedLine) : '$ 0'}
                  </div>
                  <div className='border-gray-400 border-l flex h-8 justify-center py-1.5 w-10'>
                     <Image className='w-2/3' src={flag_mexico} alt='moneda' />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
