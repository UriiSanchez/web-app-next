import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Decimal from 'decimal.js';

import { formatNumber } from '../../helpers';

import { CustomNumericFormat } from './CustomNumericFormat';

/**
 * Componente para mostrar valores monetarios con porcentaje.
 * @param {Object} params
 * @param {boolean} params.allowNegative - indica si el input puede mostrar valores negativos.
 * @param {boolean} params.disabled - indica si el input debe estar siempre deshabilitado.
 * @param {function} params.onChange - callback del evento onChange del input, recibe el valor (tipo number) del input como parámetro
 * @param {number|string} params.percentage - el valor del input de porcentaje
 * @param {string} params.percentageId - valor que se utiliza para el atributo **id** y **name** del input de porcentaje.
 * @param {string} params.value - el valor del input
 * @param {string} params.valueId - el valor que se utiliza para el atributo **id** y **name** del input.
 * @param {boolean} params.viewDecimals - indica si se deben mostrar siempre decimales.
 * @param {boolean} params.withPercentage - indica si se muestra el valor del porcentaje.
 */
export function NumericInput({
   allowNegative = false,
   disabled = false,
   onChange,
   percentage,
   percentageId,
   value,
   valueId,
   viewDecimals = false,
   withPercentage = false,
}) {
   const [isFocus, setIsFocus] = useState(false);
   const handleFocus = useCallback(() => setIsFocus(true), []);
   const handleBlur = useCallback(() => setIsFocus(false), []);

   let parsedValue = '';
   if (value) {
      const decimalValue = new Decimal(value);
      parsedValue = viewDecimals || isFocus ? decimalValue.toNumber() : decimalValue.trunc().toNumber();
   }

   return (
      <>
         <CustomNumericFormat
            id={valueId}
            name={valueId}
            disabled={disabled}
            type='text'
            value={parsedValue}
            placeholder='0'
            allowNegative={allowNegative}
            decimalScale={5}
            thousandsGroupStyle='thousand'
            thousandSeparator=','
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeNumeric={onChange}
            className='flex-auto w-full text-sm text-center uppercase border rounded-md outline-none border-black-500 focus:outline-none focus:text-blue-800 h-9 enabled:hover:ring-1 enabled:hover:border-blue-800 enabled:hover:ring-blue-800'
         />
         {withPercentage && (
            <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border enabled:hover:ring-1 enabled:hover:border-blue-800 enabled:hover:ring-blue-800'>
               <input
                  id={percentageId}
                  name={percentageId}
                  type='text'
                  value={formatNumber(percentage, 2) || '0.00'}
                  disabled
                  className='flex-auto w-full h-8 text-sm text-center rounded-l-md'
               />
               <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
            </div>
         )}
      </>
   );
}

NumericInput.propTypes = {
   allowNegative: PropTypes.bool,
   disabled: PropTypes.bool,
   onChange: PropTypes.func,
   percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
   percentageId: PropTypes.string,
   value: PropTypes.string,
   valueId: PropTypes.string,
   viewDecimals: PropTypes.bool,
   withPercentage: PropTypes.bool,
};
