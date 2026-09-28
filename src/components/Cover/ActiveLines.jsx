import React, { Fragment, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';

import { formatMiles, formatMoney } from '../../helpers';
import { calcPotentialRiskTotal } from '../../helpers/calculates';

import CoverDatePicker from '../Controls/CoverDatePicker';

/**
 * Componente exclusivo de caratula para mostrar las lineas anteriores, linea solicitada y linea autorizada por el modelo
 * @param {Object} data - Recibe un objecto que contiene los datos a mostrar en el componente
 * @param {Function} fnSet - Funcion que se ejecuta al modificar algun campo manual
 * @returns {JSX.Element} Seccion inferior de la caratula
 */
export function ActiveLines({ data, fnSet }) {
   const linesActives = useMemo(() => {
      return data?.previousLines?.linesActives;
   }, [data]);

   const onChangeVirtual = (e, attrFather, idx) => {
      const { name, value } = e;
      let setName = name.split('-')[0];
      let newValue = value.includes('$') ? value.replace(/[$,]/g, '') : value;
      let newData = structuredClone(data);

      if (attrFather === 'linesActives') {
         newData.previousLines.linesActives[idx][setName] = newValue;
      } else {
         newData[attrFather][setName] = newValue;
      }

      calcPotentialRiskTotal(newData, setName);
      fnSet('resolutionLinesResponse', '', newData, 'object');
   };

   return (
      <div className='flex flex-col mb-4 rounded-t-md overflow-clip'>
         <div className='flex items-center w-full h-8 px-4 text-white bg-black'>Resolución de líneas</div>
         <div className='flex w-full overflow-auto container-overflow'>
            <div className='flex flex-col flex-none w-1/5'>
               <div className='h-8 bg-black'></div>
               <div className='flex flex-col items-center w-full gap-2 p-2 border-x border-gray'>
                  <div className='flex items-center flex-none w-full h-10 gap-2'>
                     <p className='flex-none w-1/3'>No.</p>
                     <p className='flex-none w-2/3'>Tipo </p>
                  </div>
               </div>
               <div className='flex-none w-full h-[20.53rem] grid grid-cols-3 items-start gap-2 px-2 pb-4 border-b border-x border-gray'>
                  {linesActives?.map((_u, indx) => (
                     <Fragment key={'typeLine-' + _u?.lineNumber}>
                        <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                           No.&nbsp;{_u?.lineNumber || indx + 1}
                        </div>
                        <select
                           id={'type-' + indx}
                           data-testid={'type-' + indx}
                           name={'type-' + indx}
                           value={linesActives[indx]?.type ? linesActives[indx]?.type : ''}
                           onChange={(e) => onChangeVirtual(e.target, 'linesActives', indx)}
                           className='w-full h-8 col-span-2 border rounded outline-none border-black-500 focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <option> - Seleccionar -</option>
                           <option value='ACCC'>ACCC</option>
                           <option value='ACS'>ACS</option>
                           <option value='FX LOAN'>FX LOAN</option>
                           <option value='FACT. CLIENTES'>FACT. CLIENTES</option>
                           <option value='FACT. PROV'>FACT. PROV</option>
                           <option value='DERIVADOS'>DERIVADOS</option>
                           <option value='PQ'>PQ</option>
                           <option value='CCI/ACCC'>CCI/ACCC</option>
                           <option value='ARREND. PURO'>ARREND. PURO</option>
                           <option value='ARREND. FIN'>ARREND. FIN</option>
                           <option value='ARRENDAMIENTO'>ARRENDAMIENTO</option>
                        </select>
                     </Fragment>
                  ))}
               </div>
            </div>
            <div className='flex flex-col flex-none w-2/3'>
               <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>Líneas anteriores</div>
               <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2 border-r border-gray'>
                  <div className='flex flex-col justify-center h-10 col-span-2'>
                     Autoriza <br />
                     <span className='text-xs'>(dd-mm-aaaa)</span>
                  </div>
                  <div className='col-span-2'>
                     Vencimiento <br />
                     <span className='text-xs'>(dd-mm-aaaa)</span>
                  </div>
                  <div className='col-span-2'>Monto</div>
                  <div>Moneda</div>
                  <div className='col-span-2'>Saldo</div>
                  <div className='-m-2'>Garantía</div>
               </div>
               <div className='flex-none w-full h-[20.53rem] grid grid-cols-10 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                  {linesActives?.map((_u, indx) => (
                     <Fragment key={'line-' + _u?.lineNumber}>
                        <div className='relative w-full col-span-2 group'>
                           <input
                              id={'authDateIsi-' + indx}
                              data-testid={'authDateIsi-' + indx}
                              name={'authDateIsi-' + indx}
                              type='date'
                              placeholder='00-00-0000'
                              value={linesActives[indx]?.authDateIsi ? linesActives[indx]?.authDateIsi : ''}
                              onChange={(e) => onChangeVirtual(e.target, 'linesActives', indx)}
                              className={`w-full h-8  p-2 text-center border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800  hover:ring-1 hover:border-blue-800 hover:ring-blue-800`}
                           />
                        </div>
                        <div className='relative w-full col-span-2 group'>
                           <input
                              id={'issueDateIsi-' + indx}
                              data-testid={'issueDateIsi-' + indx}
                              name={'issueDateIsi-' + indx}
                              type='date'
                              placeholder='00-00-0000'
                              value={linesActives[indx]?.issueDateIsi ? linesActives[indx]?.issueDateIsi : ''}
                              onChange={(e) => onChangeVirtual(e.target, 'linesActives', indx)}
                              className={`w-full h-8  p-2 text-center border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800  hover:ring-1 hover:border-blue-800 hover:ring-blue-800`}
                           />
                        </div>
                        <NumericFormat
                           id={'amountIsi-' + indx}
                           data-testid={'amountIsi-' + indx}
                           name={'amountIsi-' + indx}
                           type='text'
                           maxLength='12'
                           placeholder='$ 0.00'
                           value={linesActives[indx]?.amountIsi}
                           className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                           thousandsGroupStyle='thousand'
                           thousandSeparator=','
                           prefix='$'
                           allowNegative={false}
                           decimalScale='2'
                           onValueChange={(_v, source) => {
                              source.source != 'prop' && onChangeVirtual(source.event.target, 'linesActives', indx);
                           }}
                        />
                        <select
                           id={'currencyIsi-' + indx}
                           data-testid={'currencyIsi-' + indx}
                           name={'currencyIsi-' + indx}
                           value={linesActives[indx]?.currencyIsi ? linesActives[indx]?.currencyIsi : ''}
                           onChange={(e) => onChangeVirtual(e.target, 'linesActives', indx)}
                           className='h-8 text-center border rounded outline-none cursor-pointer border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <option value=''>-</option>
                           <option value='USD'>USD</option>
                           <option value='MXP'>MXP</option>
                        </select>
                        <NumericFormat
                           id={'balanceIsi-' + indx}
                           data-testid={'balanceIsi-' + indx}
                           name={'balanceIsi-' + indx}
                           type='text'
                           maxLength='12'
                           placeholder='$ 0.00'
                           value={linesActives[indx]?.balanceIsi}
                           className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                           thousandsGroupStyle='thousand'
                           thousandSeparator=','
                           prefix='$'
                           allowNegative={false}
                           decimalScale='2'
                           onValueChange={(_v, source) => {
                              source.source != 'prop' && onChangeVirtual(source.event.target, 'linesActives', indx);
                           }}
                        />
                        <select
                           id={'warrantyIsi-' + indx}
                           data-testid={'warrantyIsi-' + indx}
                           name={'warrantyIsi-' + indx}
                           value={linesActives[indx]?.warrantyIsi ? linesActives[indx]?.warrantyIsi : ''}
                           onChange={(e) => onChangeVirtual(e.target, 'linesActives', indx)}
                           className='h-8 border rounded outline-none cursor-pointer border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <option value=''>-</option>
                           <option value='OS'>O.S.</option>
                           <option value='SIN_OS'>Sin O.S.</option>
                        </select>
                     </Fragment>
                  ))}
               </div>
               <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2'>
                  <div className='col-span-4 text-right'>Riesgo Solicitante Val.</div>
                  <NumericFormat
                     id='riskApplicantAmountIsi'
                     data-testid='riskApplicantAmountIsi'
                     name='riskApplicantAmountIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskApplicantAmountIsi || ''}
                     className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     decimalScale='2'
                     allowNegative={false}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
                  <NumericFormat
                     id='riskApplicantBalanceIsi'
                     data-testid='riskApplicantBalanceIsi'
                     name='riskApplicantBalanceIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskApplicantBalanceIsi || ''}
                     className='w-full h-8 col-span-2 col-start-8 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     decimalScale='2'
                     allowNegative={false}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
                  <div className='col-span-4 text-right'>Riesgo Resto de grupo Val.</div>
                  <NumericFormat
                     id='riskGroupAmountIsi'
                     data-testid='riskGroupAmountIsi'
                     name='riskGroupAmountIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskGroupAmountIsi || ''}
                     className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale='2'
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
                  <NumericFormat
                     id='riskGroupBalanceIsi'
                     data-testid='riskGroupBalanceIsi'
                     name='riskGroupBalanceIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskGroupBalanceIsi || ''}
                     className='w-full h-8 col-span-2 col-start-8 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale='2'
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
                  <div className='col-span-4 text-right'>Riesgo Potencial de grupo Val.</div>
                  <NumericFormat
                     id='riskPotentialAmountIsi'
                     data-testid='riskPotentialAmountIsi'
                     name='riskPotentialAmountIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskPotentialAmountIsi || ''}
                     className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     decimalScale='2'
                     allowNegative={false}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
                  <NumericFormat
                     id='riskPotentialBalanceIsi'
                     data-testid='riskPotentialBalanceIsi'
                     name='riskPotentialBalanceIsi'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.previousLines?.riskPotentialBalanceIsi || ''}
                     className='w-full h-8 col-span-2 col-start-8 p-2 text-right border rounded outline-none border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     decimalScale='2'
                     allowNegative={false}
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'previousLines');
                     }}
                  />
               </div>
            </div>
            <div className='flex flex-col flex-none w-1/2'>
               <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>Solicitud</div>
               <div className='grid items-center flex-none w-full grid-cols-7 gap-2 p-2 border-r border-gray'>
                  <div className='flex items-center h-10 col-span-2'>Situación</div>
                  <div className='col-span-2'>Monto</div>
                  <div className='text-center'>Moneda</div>
                  <div className='text-center'>Plazo</div>
                  <div className='text-center '>Garantía</div>
               </div>
               <div className='flex-none w-full h-[20.53rem] grid grid-cols-7 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                  <div className='flex items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'>
                     {data?.requestLinesResponse?.situation || ''}
                  </div>
                  <div className='flex items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'>
                     {formatMiles({ monto: data?.requestLinesResponse?.amountEc, withSign: true })}
                  </div>
                  <div className='flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                     {data?.requestLinesResponse?.currencyEc || ''}
                  </div>
                  <div className='flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                     {data?.requestLinesResponse?.termEc || ''}
                  </div>
                  <div className='flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                     {data?.requestLinesResponse?.warrantyEc || ''}
                  </div>
               </div>
               <div className='grid items-center flex-none grid-cols-7 gap-2 p-2 full'>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'>
                     {formatMiles({
                        monto: data?.requestLinesResponse?.riskApplicantAmountEc,
                        withSign: true,
                     })}
                  </div>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'>
                     {formatMiles({
                        monto: data?.requestLinesResponse?.riskGroupAmountEc,
                        withSign: true,
                     })}
                  </div>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'>
                     {formatMiles({
                        monto: data?.requestLinesResponse?.riskPotentialAmountEc,
                        withSign: true,
                     })}
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-none w-1/3'>
               <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>Autorizado*</div>
               <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2 border-r border-gray'>
                  <div className="flex items-center justify-start h-10 col-span-3 after:content-['*'] after:ml-0.5 after:text-red-500">
                     Monto
                  </div>
                  <div className="col-span-2 text-left after:content-['*'] after:ml-0.5 after:text-red-500">Moneda</div>
                  <div className="col-span-3 text-left after:content-['*'] after:ml-0.5 after:text-red-500">Plazo</div>
                  <div className="col-span-2 text-left after:content-['*'] after:ml-0.5 after:text-red-500">
                     Garantía
                  </div>
               </div>
               <div className='flex-none w-full h-[20.53rem] grid grid-cols-10 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                  <NumericFormat
                     id='amountEm'
                     data-testid='amountEm'
                     name='amountEm'
                     type='text'
                     maxLength='12'
                     placeholder='$ 0.00'
                     value={data?.modelAuthorization?.amountEm || ''}
                     className='w-full h-8 col-span-3 p-2 text-right border rounded border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     thousandsGroupStyle='thousand'
                     thousandSeparator=','
                     prefix='$'
                     allowNegative={false}
                     decimalScale='2'
                     onValueChange={(_v, source) => {
                        source.source != 'prop' && onChangeVirtual(source.event.target, 'modelAuthorization');
                     }}
                  />
                  <select
                     id='currencyEm'
                     data-testid='currencyEm'
                     name='currencyEm'
                     value={data?.modelAuthorization?.currencyEm || ''}
                     onChange={(e) => onChangeVirtual(e.target, 'modelAuthorization')}
                     className='h-8 col-span-2 text-center border rounded outline-none cursor-pointer border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                     <option value=''>-</option>
                     <option value='USD'>USD</option>
                     <option value='MXP'>MXP</option>
                  </select>
                  <CoverDatePicker {...{ data, onChangeVirtual }} />
                  <select
                     id='warrantyEm'
                     data-testid='warrantyEm'
                     name='warrantyEm'
                     value={data?.modelAuthorization?.warrantyEm || ''}
                     onChange={(e) => onChangeVirtual(e.target, 'modelAuthorization')}
                     className='h-8 col-span-2 text-center border rounded outline-none cursor-pointer border-gray focus:outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                     <option value=''>-</option>
                     <option value='OS'>O.S.</option>
                     <option value='SIN_OS'>Sin O.S.</option>
                  </select>
               </div>
               <div className='grid items-center flex-none grid-cols-10 gap-2 p-2 full'>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-3 col-start-1 ml-2'>
                     {(data?.modelAuthorization?.riskApplicantAmountEm &&
                        formatMoney(data?.modelAuthorization?.riskApplicantAmountEm)) ||
                        '$ 0.00'}
                  </div>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-3 col-start-1 ml-2'>
                     {(data?.modelAuthorization?.riskGroupAmountEm &&
                        formatMoney(data?.modelAuthorization?.riskGroupAmountEm)) ||
                        '$ 0.00'}
                  </div>
                  <div className='flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-3 col-start-1 ml-2'>
                     {(data?.modelAuthorization?.riskPotentialAmountEm &&
                        formatMoney(data?.modelAuthorization?.riskPotentialAmountEm)) ||
                        '$ 0.00'}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

ActiveLines.prototypes = {
   data: PropTypes.object.isRequired,
   fnSet: PropTypes.func.isRequired,
};
