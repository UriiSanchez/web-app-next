import PropTypes from 'prop-types';

import { ToggleSelector } from '../Controls';

import { ActiveLines } from './ActiveLines';
import { EmptySharedholding } from './EmptyShareholding';
import { ItemSharedholding } from './ItemSharedholding';
import { CoverFormatSkeleton } from '../Skeleton/CoverSkeleton';

/**
 * Vista principal para la Carátula que permite editar los campos de generalDataCifResponse,
 * infoFinancialResponse y resolutionLinesResponse
 *
 * @view Información para carátula
 * @param {Object} props
 * @param {Object} props.data - Información del aplicante principal o activo en la pantalla.
 * @param {Function} props.fnSet - Función que permite modificar el State del componente padre
 * @param {Boolean} props.isLoading - Permite mostrar el Skeleton o los campos editables
 * @param {Object} erros - Objeto que obtiene si algún campo tiene un error
 * @param {Function} setErrors - Función que permite alterar el State padre de errores. *
 * @param {String} [props.sx] - Permite modificar el padding del contenedor principal con clases de TailwindCSS
 * */
export const Format = ({ data, fnSet, isLoading, errors, setErrors, sx = '' }) => {
   const onChangeControl = (e, attr) => {
      const { name, value } = e;
      let newData = { ...data, [attr]: { ...data[attr], [name]: value } };
      fnSet(newData);
   };

   const onUpdateData = (attr, name, newValue, type = 'atribute') => {
      let newData = {};
      if (type != 'atribute') {
         newData = { ...data, [attr]: newValue };
      } else {
         newData = { ...data, [attr]: { ...data[attr], [name]: newValue } };
      }
      fnSet(newData);
   };

   if (isLoading) return <CoverFormatSkeleton />;

   return (
      <section className='px-8 text-sm'>
         <div className='bg-[#F4F4F4] px-12 pt-4 pb-2 flex flex-col gap-3'>
            <h2 className='text-xl font-semibold text-[#545555]'>
               Información para caratula de autorización de crédito
            </h2>
            <h4 className='mb-4 text-sm text-[#707271]'>Grupo Financiero BASE S.A. de C.V. </h4>
         </div>
         <h4 className='flex flex-row justify-end pr-2 mt-2 text-sm'>CIFRAS EN MILES</h4>
         <div className='flex items-center justify-between mb-4'>
            <div className='flex gap-2'>
               <input
                  id='checkBase'
                  name='checkBase'
                  type='checkbox'
                  className='option-input top-[0!important]'
                  disabled
                  readOnly
                  checked={data?.generalDataCifResponse?.checkBase || true}
               />
               <label htmlFor='checkBase'>Banco BASE, SA, IBM</label>
            </div>
            <div className='flex gap-2'>
               <input
                  id='checkLessor'
                  data-testid='checkLessor'
                  name='checkLessor'
                  className='option-input top-[0!important]'
                  disabled
                  readOnly
                  type='checkbox'
                  checked={data?.generalDataCifResponse?.checkLessor || false}
               />
               <label htmlFor='checkLessor'>Arrendadora BASE, SA de CV SOFOM ER</label>
            </div>
            <div className='flex items-center gap-2'>
               <label htmlFor='relationshipCredit' className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Crédito relacionado Art. 73
               </label>
               <select
                  id='relationshipCredit'
                  data-testid='relationshipCredit'
                  name='relationshipCredit'
                  value={data?.generalDataCifResponse?.relationshipCredit || ''}
                  onChange={(e) => onChangeControl(e.target, 'generalDataCifResponse')}
                  className='h-8 ml-2 border rounded outline-none cursor-pointer w-36 border-black-500 focus:outline-none focus:border-blue-800 focus:text-blue-800 focus:ring-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
                  <option value='SI'>Si</option>
                  <option value='NO'>No</option>
               </select>
            </div>
            <div className='flex items-center gap-6'>
               <label htmlFor='typeExchange'>Tipo de cambio</label>
               <input
                  id='typeExchange'
                  data-testid='typeExchange'
                  disabled
                  type='text'
                  readOnly
                  value={data?.generalDataCifResponse?.typeExchange || ''}
                  className='w-32 h-8 ml-2 text-center border rounded border-gray'
               />
            </div>
         </div>
         <div className='mb-4 border rounded-md overflow-clip border-gray'>
            <h4 className='flex items-center h-8 px-4 text-white bg-black'>Datos generales</h4>
            <div className='grid grid-cols-3 gap-2 p-2'>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='applicant'>
                     Solicitante
                  </label>
                  <input
                     id='applicant'
                     data-testid='applicant'
                     name='applicant'
                     type='text'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.applicant || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='idClient'>
                     Número de cliente
                  </label>
                  <input
                     id='idClient'
                     data-testid='idClient'
                     type='text'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.idClient || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='address'>
                     Domicilio
                  </label>
                  <input
                     type='text'
                     id='address'
                     data-testid='address'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.address || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='economicGroup'>
                     Grupo económico
                  </label>
                  <input
                     type='text'
                     id='economicGroup'
                     data-testid='economicGroup'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.economicGroup || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='antiquity'>
                     Antigüedad
                  </label>
                  <input
                     type='text'
                     id='antiquity'
                     data-testid='antiquity'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.antiquity || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='city'>
                     Ciudad
                  </label>
                  <input
                     type='text'
                     id='city'
                     data-testid='city'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.city || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='rfc'>
                     R.F.C
                  </label>
                  <input
                     type='text'
                     id='rfc'
                     data-testid='rfc'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.rfc || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='branchOffice'>
                     Sucursal
                  </label>
                  <input
                     type='text'
                     id='branchOffice'
                     data-testid='branchOffice'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.branchOffice || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center justify-end'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='state'>
                     Estado
                  </label>
                  <input
                     type='text'
                     id='state'
                     data-testid='state'
                     readOnly
                     disabled
                     value={data?.generalDataCifResponse?.state || ''}
                     className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
            </div>
         </div>
         <div className='mb-4 border rounded-md overflow-clip border-gray'>
            <div className='flex items-center justify-between h-8 px-4 text-white bg-black'>
               <h4>Fecha de presentación</h4>
               <div>{data?.generalDataCifResponse?.presentationDate || ''}</div>
            </div>
            <div className='flex gap-10 p-2'>
               <div className='flex items-center '>
                  <label className='pr-2 whitespace-nowrap' htmlFor='requestDate'>
                     Fecha de solicitud
                  </label>
                  <input
                     type='text'
                     id='requestDate'
                     data-testid='requestDate'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.requestDate || ''}
                     className='w-32 h-8 p-2 text-center border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center w-full'>
                  <label className='pr-2 whitespace-nowrap' htmlFor='analyst'>
                     Analista
                  </label>
                  <input
                     type='text'
                     id='analyst'
                     data-testid='analyst'
                     disabled
                     readOnly
                     value={data?.generalDataCifResponse?.analyst || ''}
                     className='w-full h-8 p-2 border rounded pointer-events-none border-gray'
                  />
               </div>
               <div className='flex items-center'>
                  <label
                     className=" whitespace-nowrap after:content-['*'] after:ml-0.5 after:text-red-500"
                     htmlFor='commercialAddress'>
                     Dirección comercial
                  </label>
                  <input
                     type='text'
                     id='commercialAddress'
                     data-testid='commercialAddress'
                     name='commercialAddress'
                     value={data?.generalDataCifResponse?.commercialAddress || ''}
                     disabled
                     readOnly
                     className='h-8 p-2 ml-2 border rounded outline-none w-72 border-black-500 focus:outline-none focus:border-blue-800 focus:text-blue-800 focus:ring-blue-800'
                  />
               </div>
            </div>
         </div>
         <div className='flex w-full gap-2 mb-4'>
            {data?.generalDataCifResponse?.personType === 'PFAE' ? (
               <EmptySharedholding />
            ) : (
               <ItemSharedholding
                  {...{
                     data: data?.infoFinancialResponse,
                     fnSet: onUpdateData,
                  }}
               />
            )}
            <div className='flex flex-col w-5/12 gap-2 max-h-max '>
               <div className='border rounded-md overflow-clip border-gray'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black'>Información financiera</h4>
                  <div className='flex'>
                     <div className='h-[88px] w-36 flex justify-center items-center border-r border-gray'>
                        Últimos EEFF
                     </div>
                     <div className='flex flex-col items-end w-full gap-2 p-2'>
                        <div className='flex items-center w-fit'>
                           <label className='pr-2 whitespace-nowrap' htmlFor='lastAnnualDate'>
                              Anual
                           </label>
                           <input
                              type='text'
                              id='lastAnnualDate'
                              data-testid='lastAnnualDate'
                              disabled
                              readOnly
                              value={data?.infoFinancialResponse?.lastAnnualDate || ''}
                              className='p-2 border-gray border h-8 rounded text-center w-[247px] pointer-events-none'
                           />
                        </div>
                        <div className='flex items-center w-fit'>
                           <label className='pr-2 whitespace-nowrap' htmlFor='partialDate'>
                              Parcial
                           </label>
                           <input
                              type='text'
                              id='partialDate'
                              data-testid='partialDate'
                              disabled
                              readOnly
                              value={data?.infoFinancialResponse?.partialDate || 'N/A'}
                              className='p-2 border-gray border h-8 rounded text-center w-[247px] pointer-events-none'
                           />
                        </div>
                     </div>
                  </div>
               </div>
               <div className='border rounded-md grow overflow-clip border-gray'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black '>Experiencia de buró</h4>
                  <div className='grid grid-cols-3 grid-rows-3 auto-rows-max max-h-max'>
                     <div className='flex items-center px-2 py-2 border-b border-gray'>Información / Participante</div>
                     <div className='flex items-center px-2 py-2 border-b border-x border-gray'>Acreditado</div>
                     <div className='flex items-center px-2 py-2 border-b border-gray'>Aval / Obligado Solidario</div>
                     <div className='flex items-center px-2 py-2'>Fecha reporte de buró de crédito</div>
                     <div className='flex items-center w-full py-2 border-x border-gray'>
                        <div className='flex items-center p-2 border-gray border h-8 rounded w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'>
                           {data?.infoFinancialResponse?.bureauReportApplicantDate}
                        </div>
                     </div>
                     <div className='flex items-center w-full py-2'>
                        <div className='flex items-center p-2 border-gray border h-8 rounded w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'>
                           {data?.infoFinancialResponse?.bureauReportObligedDate || 'N/A'}
                        </div>
                     </div>
                     <div className='flex items-center px-2 '>Calificación de buró interno</div>
                     <div className='flex items-center w-full py-2 border-x border-gray'>
                        <div className='flex items-center p-2 border-gray border h-8 rounded w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'>
                           {data?.infoFinancialResponse?.qualificationApplicant || ''}
                        </div>
                     </div>
                     <div className='flex items-center w-full py-2 '>
                        <div className='flex items-center p-2 border-gray border h-8 rounded w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'>
                           {data?.infoFinancialResponse?.qualificationObliged || 'N/A'}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='flex w-full gap-2 mb-4'>
            <div className='flex flex-col w-7/12 border rounded-md overflow-clip border-gray'>
               <h4 className='flex items-center h-8 px-4 text-white bg-black '>Información sectorial</h4>
               <div className='flex flex-col gap-3 p-2 grow justify-stretch'>
                  <div className='flex items-center w-full'>
                     <label
                        className='flex justify-end w-1/6 pr-2 align-middle min-w-fit whitespace-nowrap'
                        htmlFor='codeBaseSector'>
                        Código sectorial BASE
                     </label>
                     <input
                        id='codeBaseSector'
                        data-testid='codeBaseSector'
                        type='text'
                        disabled
                        readOnly
                        value={data?.sectorInformationResponse?.codeBaseSector || ''}
                        className='h-8 p-2 mr-4 border rounded border-gray grow'
                     />
                     <div className='flex items-center gap-2'>
                        <p className="whitespace-nowrap after:content-['*'] after:ml-0.5 after:text-red-500">
                           Mercado objetivo
                        </p>
                        <ToggleSelector
                           name='targetMarket'
                           value={data?.sectorInformationResponse?.targetMarket}
                           fnSet={onUpdateData}
                        />
                     </div>
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <label className='flex justify-end w-1/6 pr-2 text-end' htmlFor='sector'>
                        Sector
                     </label>
                     <input
                        type='text'
                        id='sector'
                        data-testid='sector'
                        disabled
                        readOnly
                        value={data?.sectorInformationResponse?.sector || ''}
                        className='w-5/6 h-full p-2 border rounded pointer-events-none border-gray'
                     />
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <label className='flex justify-end w-1/6 pr-2 text-end' htmlFor='subSector'>
                        Sub sector
                     </label>
                     <input
                        type='text'
                        id='subSector'
                        data-testid='subSector'
                        className='w-5/6 h-full p-2 border rounded pointer-events-none border-gray'
                        disabled
                        value={data?.sectorInformationResponse?.subSector || ''}
                     />
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <label className='flex justify-end w-1/6 pr-2 text-end' htmlFor='specificActivity'>
                        Actividad específica
                     </label>
                     <input
                        type='text'
                        id='specificActivity'
                        data-testid='specificActivity'
                        disabled
                        value={data?.sectorInformationResponse?.specificActivity || ''}
                        className='w-5/6 h-full p-2 border rounded pointer-events-none border-gray'
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-5/12 gap-2 '>
               <div className='border rounded-md overflow-clip border-gray'>
                  <h4 className="flex items-center h-8 px-4 text-white bg-black after:content-['*'] after:ml-0.5">
                     Mercado estratégico
                  </h4>
                  <div className='p-2'>
                     <ToggleSelector
                        name='strategicMarket'
                        value={data?.sectorInformationResponse?.strategicMarket}
                        fnSet={onUpdateData}
                     />
                  </div>
               </div>
               <div className='flex flex-col border rounded-md grow border-gray overflow-clip'>
                  <h4 className="flex items-center h-8 px-4 text-white bg-black after:content-['*'] after:ml-0.5">
                     Descripción
                  </h4>
                  <div className='p-2 grow'>
                     <textarea
                        id='specificDescriptionActivity'
                        data-testid='specificDescriptionActivity'
                        name='specificDescriptionActivity'
                        value={data?.sectorInformationResponse?.specificDescriptionActivity || ''}
                        onChange={(e) => onChangeControl(e.target, 'sectorInformationResponse')}
                        maxLength='500'
                        placeholder='Añade una descripción'
                        className='w-full h-full p-2 border rounded outline-none resize-none border-gray focus:outline-none focus:text-blue-800 hover:ring-1 hover:border-blue-800 hover:ring-blue-800'
                     />
                  </div>
               </div>
            </div>
         </div>
         <ActiveLines
            {...{
               data: data?.resolutionLinesResponse,
               fnSet: onUpdateData,
               isLoading,
               errors,
               setErrors,
            }}
         />
      </section>
   );
};

Format.propTypes = {
   data: PropTypes.shape({
      generalDataCifResponse: PropTypes.object,
      infoFinancialResponse: PropTypes.object,
      sectorInformationResponse: PropTypes.object,
      resolutionLinesResponse: PropTypes.object,
   }),
   fnSet: PropTypes.func.isRequired,
   isLoading: PropTypes.bool,
   errors: PropTypes.object,
   setErrors: PropTypes.func,
   sx: PropTypes.string,
};
