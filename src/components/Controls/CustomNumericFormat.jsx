import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NumberFormatBase, useNumericFormat } from 'react-number-format';

/**
 * Componente que utiliza como base el módulo react-number-format y agrega funcionalidad adicional
 * @param {Object} props
 * @param {Function} props.onChangeNumeric - wrapper del callback onChange que recibe el valor del input con formato numérico en vez del string con caracteres adicionales.
 * @returns
 */
export const CustomNumericFormat = ({ onChangeNumeric, ...props }) => {
   const baseProps = useNumericFormat(props);
   const { removeFormatting } = baseProps;

   const handleOnChange = useCallback(
      (event) => {
         if (onChangeNumeric) {
            const floatValue = parseFloat(removeFormatting(event.target.value));
            onChangeNumeric(isNaN(floatValue) ? null : floatValue);
         }
      },
      [onChangeNumeric, removeFormatting],
   );

   return <NumberFormatBase {...baseProps} onChange={onChangeNumeric ? handleOnChange : props.onChange} />;
};

CustomNumericFormat.propTypes = {
   onChangeNumeric: PropTypes.func,
};
