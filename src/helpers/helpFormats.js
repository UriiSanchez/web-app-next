import _ from 'lodash';

export const formatMoney = (monto, decimals = 0, defaultValue= '0') => {
   return !isNaN(monto)
      ? new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: 'USD',
           maximumFractionDigits: decimals,
        }).format(monto)
      : defaultValue;
};

/**
 * Formatea una cantidad numérica como una cadena de moneda con hasta 5 decimales,
 * manejando entradas con múltiples puntos decimales o caracteres de moneda.
 *
 * @param {string|number} cantidad - La entrada a formatear.
 * @returns {string} La cadena formateada o '0' si la entrada no es válida.
 * */
export const formatMoneyMiles = (cantidad) => {
   // 1. Limpiar la entrada de caracteres no deseados ($, -) y asegurar un formato numérico válido.
   let cadena = String(cantidad).replace(/[$,-]/g, '');

   // 2. Manejar múltiples puntos decimales: toma solo la parte antes del segundo punto (si existe).
   const parts = cadena.split('.');
   if (parts.length > 2) {
      cadena = parts[0] + '.' + parts.slice(1).join('');
   }

   // 3. Validar si la cadena resultante es un número válido.
   const numericValue = Number(cadena);
   if (isNaN(numericValue) || numericValue === 0) {
      return '0';
   }

   // 4. Formatear la parte entera usando la función externa (asumida) formatMoney
   let monto = parts[0];
   let num = formatMoney(monto); // Devuelve algo como "$1,234"

   // 5. Manejar los decimales (hasta 5 dígitos)
   let miles = parts[1]; // partes[1] será undefined si no hay punto

   if (miles === undefined) {
      // Si no hay decimales, solo devuelve la parte entera sin el símbolo '$'.
      return num.replace('$', '').trim();
   } else {
      // Limita los decimales a un máximo de 5 caracteres.
      const limitedMiles = miles.substring(0, 5);
      return num.replace('$', '').trim() + '.' + limitedMiles;
   }
};

/**
 * Formatea un valor numérico de acuerd a varias reglas.
 * @param {number|string} monto - El valor que desea formatear. Si no es númerico, se devuelve "0.00".
 * @param {boolean} inThousands - Si es `true`, se manejará la contidad en miles.
 * @param {boolean} withSign - Si es `true`, se agregará el símbolo de pesos ($) al resultado formateado.
 * @param {number} min - Indica el número minimo de decimales. Este valor no puede ser mayor al atributo max.
 * @param {number} max - Indica el número maximo de decimales. Este valor no puede ser menor al atributo min.
 * @returns {string} El valor formateado de acuerdo a las reglas especificadas. Si el valor no es númerico, devuelve "0.00"
 *
 * @example
 * //? Formatea 1,000,000 como $ 1,000 (isThousands es true)
 * formatMiles(1000000, true, true); //* "$ 1,000"
 *
 * @example
 * //? Formatea 1,000,000 como $ 1,000,000 (isThousands es false)
 * formatMiles(1000000, false, true) //* "$ 1,000,000"
 *
 * @example
 * //? Formatea 1,000,000 como 1,000,000 sin el símbolo de pesos
 * formatMiles(100000) //* "1,000,000" *
 */
export const formatMiles = ({ monto, inThousands = false, withSign = false, min = 0, max = 2 }) => {
   let configuration = {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
      roundingMode: 'trunc',
   };

   if (_.isNaN(monto) || !monto) {
      return '0';
   }

   if (inThousands && monto.toString().length >= 6) {
      monto = monto / 1000;
   }

   if (withSign) {
      configuration.style = 'currency';
      configuration.currency = 'USD';
   }

   return new Intl.NumberFormat('en-US', configuration).format(monto);
};

/**
 * Formatea un número con un número específico de decimales.
 * @param {number} number - El número a formatear.
 * @param {number} decimals - El número de decimales a mostrar (por defecto 2)
 * @returns {String} El número formateado con decimales.
 */
export const formatDecimals = (number, decimals = 2) => {
   const num = number.toString().replace(/[$,.]/g, '');
   if (!isNaN(parseFloat(num))) {
      const _char = num.toString();
      const pointDecimal = _char.length - decimals;
      return _char.slice(0, pointDecimal) + '.' + _char.slice(pointDecimal);
   }

   return '';
};

export const formatNumber = (number, decimals = 2) =>
   !_.isNaN(Number(number)) ? Number(number).toFixed(decimals) : number;

export const formatId = (id, pad = 10) => String(id).padStart(pad, '0');
