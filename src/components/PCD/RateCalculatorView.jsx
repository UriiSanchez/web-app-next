import _ from 'lodash';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { NumericFormat } from 'react-number-format';

import { CardGenericContainer } from './Controls/CardGenericContainer';
import { TypeOfChange } from './Controls/TypeOfChange';
import { IncompleteSectionAlert } from './Controls/IncompleteSectionAlert';
import { formatDecimals, formatMiles, formatMoney, formatNumber, getClassInput, initDerivatives } from '../../helpers';
import { calcCheckCreditor, calcRateData } from '../../helpers/calculates';

import flag_mexico from '../../../public/flags/flag_mx.svg';
import flag_us from '../../../public/flags/flag_us.svg';

export const RateCalculatorView = ({ info, onUpdateData, dollar, isDisabled, isSave, isComplete }) => {
   const congruence = useMemo(() => {
      return initDerivatives.congruenceCalculator[info?.rateCalculator?.congruenceCalculator];
   }, [info?.rateCalculator?.congruenceCalculator]);

   const congruenceCredit = useMemo(() => {
      switch (info?.congruenceCreditors) {
         case 1:
            return {
               sx: 'bg-emerald-600',
               label: 'Congruencia:',
            };
         case 2:
            return {
               sx: 'bg-red-500',
               label: 'Incongruencia:',
            };
         default:
            return {
               sx: 'bg-gray',
               label: '',
            };
      }
   }, [info?.congruenceCreditors]);

   const onChangeVirtual = (e, father) => {
      const newInfo = structuredClone(info);
      const { name, value } = e.target;
      let parseValue = value.includes('$') ? value.replace(/[$,]/g, '') : value;

      if (_.isEmpty(father)) {
         newInfo[name] = parseValue;
      } else {
         newInfo[father][name] = ['tableDerivaties', 'swapRate'].includes(name)
            ? formatDecimals(parseValue, 2)
            : parseValue;
         calcRateData(newInfo, dollar);
      }

      onUpdateData('calculatorRate', newInfo);
   };

   const handleSetCreditors = (newObj, attribute) => {
      const setInfo = structuredClone(info);
      setInfo[attribute] = newObj;
      calcCheckCreditor(setInfo);
      onUpdateData('calculatorRate', setInfo);
   };

   return (
      <div className='flex flex-col px-8 pb-8 mb-4 gap-y-4'>
         <TypeOfChange />
         {isSave && !isComplete && <IncompleteSectionAlert />}
         <p className='py-3 text-lg'>Crédito(s) a cubrir</p>
         <CardGenericContainer
            item={info?.creditors}
            onSetData={handleSetCreditors}
            attribute='creditors'
            extra={info?.sourcerOfCredit}
            disabled={isDisabled}
            isSave={isSave}
         />
         <div className={`w-full flex items-center justify-center rounded h-8 mt-5 ${congruenceCredit?.sx} min-w-max`}>
            <p className='text-sm text-center text-white'>
               ¿Congruencia con lo que se tiene de créditos?&nbsp;
               {congruenceCredit?.label + ' ' + formatMiles({ monto: info?.valueCongruence })}
            </p>
         </div>
         <p className='pt-10 text-sm'>Pregunta 1. ¿Qué origen tiene el crédito a cubrir?</p>
         <div className='flex flex-col gap-2 ml-5 text-sm'>
            <label htmlFor='base' className='w-1/5 cursor-pointer select-none'>
               <input
                  type='radio'
                  id='base'
                  name='sourcerOfCredit'
                  value='base'
                  className='option-input radio'
                  disabled={isDisabled}
                  checked={info?.sourcerOfCredit === 'base'}
                  onChange={(e) => onChangeVirtual(e)}
               />
               Propio, de Banco Base
            </label>
            <label htmlFor='other' className='w-1/5 cursor-pointer select-none'>
               <input
                  type='radio'
                  id='other'
                  name='sourcerOfCredit'
                  value='other'
                  className='option-input radio'
                  disabled={isDisabled}
                  checked={info?.sourcerOfCredit === 'other'}
                  onChange={(e) => onChangeVirtual(e)}
               />
               De otro banco
            </label>
         </div>
         <div className='flex flex-col mt-6'>
            <p className='text-black-900'>Calculadora de tasa</p>
            <p className='text-sm text-gray-500'>Validación de congruencia</p>
         </div>
         <div className='grid grid-cols-5 gap-4'>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='amountOfCredit' className='text-sm truncate' title='Monto del crédito a cubrir'>
                  Monto del crédito a cubrir
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.rateCalculator?.amountOfCredit,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='amountOfCredit'
                     name='amountOfCredit'
                     maxLength={12}
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     placeholder='$ 0'
                     allowNegative={false}
                     disabled={isDisabled}
                     value={formatMoney(info?.rateCalculator?.amountOfCredit)}
                     onValueChange={(_v, source) => {
                        source.source !== 'prop' && onChangeVirtual(source.event, 'rateCalculator');
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-center outline-none focus:text-blue-800'
                  />
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     <Image className='w-2/3' src={flag_mexico} alt='money' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label
                  htmlFor='amountOfCreditUS'
                  className='text-sm text-gray-400 truncate'
                  title='Monto del crédito a cubrir en USD'>
                  Monto del crédito a cubrir en USD
               </label>
               <div className='flex items-center flex-auto text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
                  <div className='flex-auto text-center'>{formatMoney(info?.rateCalculator?.amountOfCreditUS, 2)}</div>
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray'>
                     <Image className='w-2/3' src={flag_us} alt='money' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='creditTermValue' className='text-sm truncate' title='Plazo del crédito'>
                  Plazo del crédito
               </label>
               <div className='flex gap-2'>
                  <NumericFormat
                     id='creditTermValue'
                     name='creditTermValue'
                     maxLength={3}
                     allowNegative={false}
                     placeholder='0'
                     disabled={isDisabled}
                     value={info?.rateCalculator?.creditTermValue}
                     onValueChange={(_v, source) => {
                        source.source !== 'prop' && onChangeVirtual(source.event, 'rateCalculator');
                     }}
                     className={`flex-auto w-1/4 text-sm text-center h-9 input-form ${getClassInput(
                        info?.rateCalculator?.creditTermValue,
                        isDisabled,
                        isSave
                     )}`}
                  />
                  <select
                     id='creditTermType'
                     name='creditTermType'
                     value={info?.rateCalculator?.creditTermType}
                     disabled={isDisabled}
                     onChange={(e) => onChangeVirtual(e, 'rateCalculator')}
                     className={`flex-auto w-3/4 text-sm text-center uppercase cursor-pointer input-form ${getClassInput(
                        info?.rateCalculator?.creditTermType,
                        isDisabled,
                        isSave
                     )}`}>
                     <option value=''>- Seleccionar -</option>
                     <option value='months'>Mes(es)</option>
                     <option value='years'>Año(s)</option>
                  </select>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='coverageType' className='text-sm truncate' title='Tipo de cobertura'>
                  Tipo de cobertura
               </label>
               <select
                  id='coverageType'
                  name='coverageType'
                  value={info?.rateCalculator?.coverageType}
                  disabled={isDisabled}
                  onChange={(e) => onChangeVirtual(e, 'rateCalculator')}
                  className={`flex-auto w-full text-sm text-center uppercase cursor-pointer h-9 input-form ${getClassInput(
                     info?.rateCalculator?.coverageType,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Seleccionar</option>
                  <option value='variable-fija'>Variable a Fija</option>
                  <option value='fija-variable'>Fija a variable</option>
               </select>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='amortizationStyle' className='text-sm truncate' title='Estilo de amortización'>
                  Estilo de amortización
               </label>
               <select
                  id='amortizationStyle'
                  name='amortizationStyle'
                  value={info?.rateCalculator?.amortizationStyle}
                  disabled={isDisabled}
                  onChange={(e) => onChangeVirtual(e, 'rateCalculator')}
                  className={`flex-auto w-full text-sm text-center uppercase cursor-pointer h-9 input-form ${getClassInput(
                     info?.rateCalculator?.amortizationStyle,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Seleccionar</option>
                  <option value='revolvente'>Revolvente</option>
                  <option value='amortizable lineal'>Amortizable lineal</option>
                  <option value='amortizaciones especiales'>Amortizaciones especiales</option>
                  <option value='bullet'>Bullet</option>
               </select>
            </div>
         </div>
         <div className='grid grid-cols-6 gap-4'>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='tableDerivaties' className='text-sm truncate' title='PV01 (DV01) mesa derivados'>
                  PV01 (DV01) mesa derivados
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.rateCalculator?.tableDerivaties,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='tableDerivaties'
                     name='tableDerivaties'
                     allowNegative={false}
                     placeholder='0.00'
                     maxLength={16}
                     disabled={isDisabled}
                     value={info?.rateCalculator?.tableDerivaties}
                     onValueChange={(_v, source) => {
                        source.source !== 'prop' && onChangeVirtual(source.event, 'rateCalculator');
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-center outline-none focus:text-blue-800'
                  />
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400 '>
                     <Image className='w-2/3' src={flag_mexico} alt='money' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='pointsToCover' className='text-sm truncate' title='Puntos PV01 a cubrir'>
                  Puntos PV01 a cubrir
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.rateCalculator?.pointsToCover,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='pointsToCover'
                     name='pointsToCover'
                     maxLength={16}
                     allowNegative={false}
                     placeholder='0'
                     disabled={isDisabled}
                     value={info?.rateCalculator?.pointsToCover}
                     onValueChange={(_v, source) => {
                        source.source !== 'prop' && onChangeVirtual(source.event, 'rateCalculator');
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-center outline-none focus:text-blue-800'
                  />
                  <div className='flex flex-col py-[4.8px] border-l border-gray-400 rounded-r items-center justify-center flex-none w-10 bg-gray-100'>
                     PTS
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <label htmlFor='swapRate' className='text-sm truncate' title='Tasa SWAP cotizada'>
                  Tasa SWAP cotizada
               </label>
               <div
                  className={`flex items-center justify-center w-full h-9 input-form ${getClassInput(
                     info?.rateCalculator?.swapRate,
                     isDisabled,
                     isSave
                  )}`}>
                  <NumericFormat
                     id='swapRate'
                     name='swapRate'
                     allowNegative={false}
                     placeholder='0.00'
                     maxLength={16}
                     disabled={isDisabled}
                     value={info?.rateCalculator?.swapRate}
                     onValueChange={(_v, source) => {
                        source.source !== 'prop' && onChangeVirtual(source.event, 'rateCalculator');
                     }}
                     className='flex-auto w-full h-8 px-2 text-sm text-center outline-none focus:text-blue-800'
                  />
                  <div className='flex flex-col py-[4.8px] border-l rounded-r border-gray-400 items-center justify-center flex-none w-10 bg-gray-100'>
                     %
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <p className='text-sm truncate' title='Línea teórica'>
                  Línea teórica
               </p>
               <div className='flex items-center justify-center w-full bg-gray-100 border border-gray-400 rounded h-9 focus:outline-none '>
                  <div className='flex items-center justify-center w-full h-8 text-gray-600 truncate bg-gray-100 rounded'>
                     {formatMiles({ monto: info?.rateCalculator?.theoreticalLine, withSign: true, inThousands: true })}
                  </div>
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     <Image className='w-2/3' src={flag_mexico} alt='money' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <p className='text-sm truncate' title='Monto de línea solicitado'>
                  Monto de línea solicitado
               </p>
               <div className='flex items-center justify-center w-full bg-gray-100 border border-gray-400 rounded h-9 focus:outline-none '>
                  <div className='flex items-center justify-center w-full h-8 text-gray-600 bg-gray-100 rounded'>
                     {formatMiles({
                        monto: info?.rateCalculator?.requestedLineAmount,
                        inThousands: true,
                        max: 0,
                        withSign: true,
                     })}
                  </div>
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     <Image className='w-2/3' src={flag_mexico} alt='money' />
                  </div>
               </div>
            </div>
            <div className='flex flex-col col-span-1 gap-2'>
               <p className='text-sm truncate' title='Suficiencia'>
                  Suficiencia
               </p>
               <div className='flex items-center justify-center w-full bg-gray-100 border border-gray-400 rounded h-9 focus:outline-none '>
                  <div className='flex items-center justify-center w-full h-8 text-gray-600 bg-gray-100 rounded'>
                     {formatNumber(info?.rateCalculator?.sufficiency)}
                  </div>
                  <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                     %
                  </div>
               </div>
            </div>
         </div>
         <div className={`w-full flex items-center justify-center rounded h-8 mt-5 ${congruence?.color} min-w-max`}>
            <p className='text-sm text-center text-white'>Validación de congruencia anual:&nbsp;{congruence?.label}</p>
         </div>
      </div>
   );
};
