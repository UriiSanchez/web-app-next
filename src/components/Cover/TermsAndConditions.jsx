import React from 'react';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';

import { CoverTermsSkeleton } from '../Skeleton/CoverSkeleton';
import { formatMiles, inputsNum } from '../../helpers';

/**
 * Segunda vista para la Carátula que permite editar los campos de termsAndConditionsResponse.
 *
 * @view Sumario de términos y condiciones
 * @param {Object} props
 * @param {Object} props.data - Información del aplicante principal o activo en la pantalla.
 * @param {Function} props.fnSet - Función que permite modificar el State del componente padre
 * @param {Boolean} props.isLoading - Permite mostrar el Skeleton o los campos editables
 * @param {String} [props.sx] - Permite modificar el padding del contenedor principal con clases de TailwindCSS
 * */
export const TermsAndConditions = ({ data, fnSet, isLoading, sx }) => {
   const onChangeControl = (e, attr) => {
      const { name, value } = e;
      let valueFormat = inputsNum.includes(name) ? parseFloat(value.replace(/[$,]/g, '') || 0) : value;
      let newData = { ...data, [attr]: { ...data[attr], [name]: valueFormat } };
      fnSet(newData);
   };

   if (isLoading) return <CoverTermsSkeleton />;

   return (
      <section className='flex flex-col h-auto gap-4 px-8 text-sm'>
         <div className='bg-[#F4F4F4] px-12 pt-4 pb-2 flex flex-col gap-3'>
            <h2 className='text-xl font-semibold text-[#545555]'>Sumario de términos y condiciones</h2>
            <div className='flex items-center'>
               <h4 className='w-1/2 text-sm text-[#707271]'>Grupo Financiero BASE S.A. de C.V. </h4>
               <div className='flex items-center justify-end w-1/2 gap-2 text-sm'>
                  <p className='text-right basis-2/3 text-[#383939]'>Fecha presentación: </p>
                  <input
                     id='presentationDate'
                     data-testid='presentationDate'
                     name='presentationDate'
                     type='text'
                     disabled
                     readOnly
                     placeholder='00-00-0000'
                     value={data?.termsAndConditionsResponse?.presentationDate || ''}
                     className='p-1 text-center border border-gray-400 rounded w-36'
                  />
               </div>
            </div>
         </div>
         <div className='flex items-center gap-2 mb-2'>
            <label className='whitespace-nowrap' htmlFor='company'>
               Empresa
            </label>
            <input
               type='text'
               id='company'
               data-testid='company'
               name='company'
               disabled
               readOnly
               value={data?.termsAndConditionsResponse?.company || ''}
               className='w-2/6 h-8 p-2 border border-gray-400 rounded pointer-events-none'
            />
         </div>
         <div className='rounded-t-md overflow-clip'>
            <div className='h-8 px-4 bg-black'></div>
            <div className='flex flex-col w-3/5 gap-2 p-2'>
               <div className='flex items-center justify-between'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='lineNumber'>
                     Número de línea
                  </label>
                  <input
                     readOnly
                     type='text'
                     id='lineNumber'
                     data-testid='lineNumber'
                     name='lineNumber'
                     disabled
                     value={data?.termsAndConditionsResponse?.lineNumber || ''}
                     className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                  />
               </div>
               <div className='flex items-center justify-between'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='creditType'>
                     Tipo de Crédito
                  </label>
                  <input
                     readOnly
                     type='text'
                     id='creditType'
                     data-testid='creditType'
                     name='creditType'
                     disabled
                     value={data?.termsAndConditionsResponse?.creditType || ''}
                     className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                  />
               </div>
               <div className='flex items-center justify-between'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='amountAuth'>
                     Monto Autorizado
                  </label>
                  <div className='relative flex items-center w-2/3 gap-2'>
                     <input
                        readOnly
                        type='text'
                        id='amountAuth'
                        data-testid='amountAuth'
                        name='amountAuth'
                        disabled
                        value={
                           formatMiles({monto: data?.resolutionLinesResponse?.modelAuthorization.amountEm}) + ' MXN'
                        }
                        className="w-full h-8 p-2 border rounded pointer-events-none border-gray-400 after:content-['*']"
                     />
                  </div>
               </div>
               <div className='flex items-center justify-between'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='destination'>
                     Destino
                  </label>
                  <input
                     readOnly
                     id='destination'
                     data-testid='destination'
                     name='destination'
                     type='text'
                     disabled
                     value={data?.termsAndConditionsResponse?.destination || ''}
                     className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none'
                  />
               </div>
            </div>
         </div>
         <div className='rounded-t-md overflow-clip'>
            <div className='flex items-center h-8 px-4 text-white bg-black'>
               Ubicación Geográfica del destino del crédito
            </div>
            <div className='flex flex-col gap-2 p-2'>
               <div className='flex'>
                  <div className='flex items-center w-3/5'>
                     <label className='w-1/3 pr-14'>Ubicación Geográfica del destino del crédito</label>
                     <div className='flex items-center w-2/3'>
                        <label className='pr-2 whitespace-nowrap' htmlFor='municipality'>
                           Municipio/Delegación:
                        </label>
                        <input
                           readOnly
                           type='text'
                           id='municipality'
                           data-testid='municipality'
                           name='municipality'
                           disabled
                           value={data?.termsAndConditionsResponse?.municipality || ''}
                           className='w-full h-8 p-2 border border-gray-400 rounded pointer-events-none '
                        />
                     </div>
                  </div>
                  <div className='flex items-center w-2/5 pl-8'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='state'>
                        Estado
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='state'
                        data-testid='state'
                        name='state'
                        disabled
                        value={data?.termsAndConditionsResponse?.state || ''}
                        className='w-full h-8 p-2 border border-gray-400 rounded pointer-events-none '
                     />
                  </div>
               </div>
               <div className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between w-3/5'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='lineTerm'>
                        Plazo de Línea
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='lineTerm'
                        data-testid='lineTerm'
                        name='lineTerm'
                        disabled
                        value={data?.termsAndConditionsResponse?.lineTerm || ''}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='contractTerm'>
                        Plazo de contrato
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='contractTerm'
                        data-testid='contractTerm'
                        name='contractTerm'
                        disabled
                        value={data?.termsAndConditionsResponse?.contractTerm || ''}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='resources'>
                        Recursos
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='resources'
                        data-testid='resources'
                        name='resources'
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                        disabled
                        value={data?.termsAndConditionsResponse?.resources || ''}
                     />
                  </div>
                  <div className='flex items-center justify-between w-full'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='provision'>
                        Disposición
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='provision'
                        data-testid='provision'
                        name='provision'
                        disabled
                        value={data?.termsAndConditionsResponse?.provision || ''}
                        className='w-4/5 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='principalPayment'>
                        Pago de Capital
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='principalPayment'
                        data-testid='principalPayment'
                        name='principalPayment'
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                        disabled
                        value={data?.termsAndConditionsResponse?.principalPayment || ''}
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label className='pr-2 whitespace-nowrap' htmlFor='interestPayment'>
                        Pago de Intereses
                     </label>
                     <input
                        readOnly
                        type='text'
                        id='interestPayment'
                        data-testid='interestPayment'
                        name='interestPayment'
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded pointer-events-none '
                        disabled
                        value={data?.termsAndConditionsResponse?.interestPayment || ''}
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label
                        className="after:content-['*'] after:ml-0.5 after:text-red-500 w-1/3 pr-2"
                        htmlFor='solidaryObliged'>
                        Obligado Solidario(s), Fianza y/o Aval(es)
                     </label>
                     <input
                        id='solidaryObliged'
                        data-testid='solidaryObliged'
                        name='solidaryObliged'
                        type='text'
                        maxLength='300'
                        placeholder='Escribe aqui...'
                        value={data?.termsAndConditionsResponse?.solidaryObliged || ''}
                        onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label
                        className="after:content-['*'] after:ml-0.5 after:text-red-500 w-1/3 pr-2"
                        htmlFor='warranty'>
                        Garantía
                     </label>
                     <input
                        type='text'
                        id='warranty'
                        data-testid='warranty'
                        name='warranty'
                        maxLength='500'
                        placeholder='Escribe aqui...'
                        value={data?.termsAndConditionsResponse?.warranty || ''}
                        onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label
                        className="after:content-['*'] after:ml-0.5 after:text-red-500 pr-2 whitespace-nowrap"
                        htmlFor='precedentCondition'>
                        Condiciones Precedentes
                     </label>
                     <textarea
                        id='precedentCondition'
                        data-testid='precedentCondition'
                        name='precedentCondition'
                        rows='5'
                        maxLength='500'
                        value={data?.termsAndConditionsResponse?.precedentCondition || ''}
                        onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                        className='w-2/3 p-2 border border-gray-400 rounded outline-none resize-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label
                        className="after:content-['*'] after:ml-0.5 after:text-red-500 pr-2 whitespace-nowrap"
                        htmlFor='followingCondition'>
                        Condiciones de Seguimiento
                     </label>
                     <input
                        id='followingCondition'
                        data-testid='followingCondition'
                        name='followingCondition'
                        type='text'
                        maxLength='500'
                        placeholder='Escribe aqui...'
                        value={data?.termsAndConditionsResponse?.followingCondition || ''}
                        onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <label
                        className="after:content-['*'] after:ml-0.5 after:text-red-500 pr-2 whitespace-nowrap"
                        htmlFor='contractCondition'>
                        Condiciones contractuales
                     </label>
                     <input
                        id='contractCondition'
                        data-testid='contractCondition'
                        name='contractCondition'
                        type='text'
                        maxLength='500'
                        placeholder='Escribe aqui...'
                        value={data?.termsAndConditionsResponse?.contractCondition || ''}
                        onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                        className='w-2/3 h-8 p-2 border border-gray-400 rounded outline-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
               </div>
               <div className='flex items-center'>
                  <label
                     className="after:content-['*'] after:ml-0.5 after:text-red-500 w-1/5"
                     htmlFor='operatingCondition'>
                     Condiciones de Operación
                  </label>
                  <div className='flex flex-col justify-end w-2/5 gap-2'>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <label
                           className="after:content-['*'] after:ml-0.5 after:text-red-500"
                           htmlFor='cumulativeAmount'>
                           Monto Acumulado
                        </label>
                        <div className='flex items-center justify-center flex-initial max-w-[8rem] text-gray-600 border border-gray-400 rounded h-9 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <NumericFormat
                              id='cumulativeAmount'
                              data-testid='cumulativeAmount'
                              name='cumulativeAmount'
                              maxLength='12'
                              placeholder='0.00'
                              decimalScale='2'
                              value={data?.termsAndConditionsResponse?.cumulativeAmount || ''}
                              thousandsGroupStyle='thousand'
                              thousandSeparator=','
                              className='flex-auto w-full h-8 text-sm text-center rounded-l outline-none focus:outline-none focus:text-blue-800'
                              allowNegative={false}
                              onValueChange={(_v, source) => {
                                 source.source != 'prop' &&
                                    onChangeControl(source.event.target, 'termsAndConditionsResponse');
                              }}
                           />
                           <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                              USD
                           </div>
                        </div>
                     </div>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <label className="after:content-['*'] after:ml-0.5 after:text-red-500" htmlFor='coverageIndex'>
                           Índice de Cobertura
                        </label>
                        <div className='flex items-center justify-center flex-initial max-w-[8rem] text-gray-600 border border-gray-400 rounded h-9 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <NumericFormat
                              id='coverageIndex'
                              data-testid='coverageIndex'
                              name='coverageIndex'
                              decimalScale='2'
                              maxLength='12'
                              placeholder='0.00'
                              value={data?.termsAndConditionsResponse?.coverageIndex || ''}
                              thousandsGroupStyle='thousand'
                              thousandSeparator=','
                              className='flex-auto w-full h-8 text-sm text-center rounded-l outline-none focus:outline-none focus:text-blue-800'
                              allowNegative={false}
                              onValueChange={(_v, source) => {
                                 source.source != 'prop' &&
                                    onChangeControl(source.event.target, 'termsAndConditionsResponse');
                              }}
                              isAllowed={({ value }) => value <= 100}
                           />
                           <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                              %
                           </div>
                        </div>
                     </div>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <label className="after:content-['*'] after:ml-0.5 after:text-red-500" htmlFor='notional'>
                           Nocional
                        </label>
                        <div className='flex items-center justify-center flex-initial max-w-[8rem] text-gray-600 border border-gray-400 rounded h-9 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                           <NumericFormat
                              id='notional'
                              data-testid='notional'
                              name='notional'
                              maxLength='12'
                              placeholder='0.00'
                              decimalScale='2'
                              value={data?.termsAndConditionsResponse?.notional || ''}
                              thousandsGroupStyle='thousand'
                              thousandSeparator=','
                              className='flex-auto w-full h-8 text-sm text-center rounded-l outline-none focus:outline-none focus:text-blue-800'
                              allowNegative={false}
                              onValueChange={(_v, source) => {
                                 source.source != 'prop' &&
                                    onChangeControl(source.event.target, 'termsAndConditionsResponse');
                              }}
                           />
                           <div className='flex flex-col py-1.5 border-l border-gray-400 items-center justify-center flex-none w-10'>
                              USD
                           </div>
                        </div>
                     </div>
                     <div className='flex items-center justify-end gap-3'>
                        <textarea
                           id='operatingCondition'
                           data-testid='operatingCondition'
                           name='operatingCondition'
                           type='text'
                           rows='5'
                           maxLength='500'
                           value={data?.termsAndConditionsResponse?.operatingCondition || ''}
                           onChange={(e) => onChangeControl(e.target, 'termsAndConditionsResponse')}
                           className='w-full p-2 border border-gray-400 rounded outline-none resize-none focus:ring-blue-800 focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

TermsAndConditions.propTypes = {
   fnSet: PropTypes.func.isRequired,
   isLoading: PropTypes.bool,
   sx: PropTypes.string,
};
