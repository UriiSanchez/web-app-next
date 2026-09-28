import _ from 'lodash';
import { useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Muestra los valores de fecha, fuente de información y despacho para un periodo parcial o anual.
 * @param {Object} props
 * @param {string} props.id se utiliza como prefijo en los atributos de "name" y "id" de los inputs.
 * @param {string} props.month nombre del mes para el periodo.
 * @param {number} props.monthIncludes número de meses del periodo parcial.
 * @param {string} props.officeOrAccountant oficina o despacho del periodo.
 * @param {(value: string) => void} props.onOfficeChange callback para cambios en el input de despacho.
 * @param {(value: string) => void} props.onSourceChange callback para cambios en el input de fuente de información.
 * @param {'ANNUAL'|'PARTIAL'} props.periodType tipo de periodo.
 * @param {string} props.sourceInformation fuente de información del periodo.
 * @param {number} props.year el año del periodo.
 * @returns
 */
export default function PeriodView({
   disabled = false,
   id,
   month,
   monthIncludes,
   officeOrAccountant,
   onOfficeChange,
   onSourceChange,
   periodType,
   sourceInformation,
   year,
}) {
   const handleOfficeChange = useCallback(
      (event) => {
         onOfficeChange(event.target.value);
      },
      [onOfficeChange]
   );

   const handleSourceChange = useCallback(
      (event) => {
         onSourceChange(event.target.value);
      },
      [onSourceChange]
   );

   const isPartial = periodType === 'PARTIAL';
   const formattedMonth = _.capitalize(month);

   return (
      <>
         <h1 className='text-lg'>{isPartial ? 'Parcial' : 'Anual'}</h1>
         <div className='flex flex-col'>
            <label className='text-xs'>Fecha</label>
            <div className={`flex border rounded-md border-gray overflow-clip h-9 ${isPartial ? 'w-full' : 'w-fit'}`}>
               <label className='p-2 bg-[#f2f2f2] rounded-md rounded-r-none w-full min-w-[112px]'>
                  {isPartial ? `${formattedMonth} ${year}` : formattedMonth}
               </label>
               {!isPartial && <label className='bg-[#f2f2f2] w-20 p-2 border-l border-gray min-w-[80px]'>{year}</label>}
            </div>
         </div>
         <div className='flex flex-col'>
            <label htmlFor={`${id}-sourceOfInformation`} className='text-xs'>
               Fuente de información
            </label>
            {isPartial || disabled ? (
               <label className='p-2 border rounded-md border-gray bg-[#f2f2f2] min-h-[38px]'>
                  {sourceInformation}
               </label>
            ) : (
               <select
                  name={`${id}-sourceOfInformation`}
                  id={`${id}-sourceOfInformation`}
                  className='p-2 border rounded-md outline-none border-gray focus:outline-none focus:text-blue-800 enabled:hover:ring-1 enabled:hover:border-blue-800 enabled:hover:ring-blue-800'
                  disabled={isPartial || disabled}
                  value={sourceInformation}
                  onChange={handleSourceChange}>
                  <option value=''>Seleccionar</option>
                  <option value='Dictamen fiscal'>Dictamen fiscal</option>
                  <option value='Dictamen contable'>Dictamen contable</option>
                  <option value='SAT'>SAT</option>
                  <option value='Interno'>Interno</option>
               </select>
            )}
         </div>
         <div className='flex flex-col'>
            <label htmlFor={isPartial ? '' : `${id}-office`} className='text-xs'>
               {isPartial ? 'Meses incluidos' : 'Despacho, contador o interno'}
            </label>
            {isPartial ? (
               <label className='p-2 h-9 border rounded-md border-gray bg-[#f2f2f2]'>{monthIncludes}</label>
            ) : (
               <input
                  id={`${id}-office`}
                  name={`${id}-office`}
                  disabled={disabled}
                  className='p-2 border rounded-md border-gray'
                  type='text'
                  value={officeOrAccountant}
                  onChange={handleOfficeChange}
               />
            )}
         </div>
      </>
   );
}

PeriodView.propTypes = {
   disabled: PropTypes.bool,
   id: PropTypes.string.isRequired,
   month: PropTypes.string,
   monthIncludes: PropTypes.number,
   officeOrAccountant: PropTypes.string,
   onOfficeChange: PropTypes.func,
   onSourceChange: PropTypes.func,
   periodType: PropTypes.string,
   sourceInformation: PropTypes.string,
   year: PropTypes.number,
};
