import _ from 'lodash';
import Decimal from 'decimal.js';

/**
 * Función para realizar sumar el mismo valor de un atributo en específico dentro de un array de objetos
 * @param {Array.<Object>} data - Arreglo de objetos.
 * @param {string} atrName - Se debe indicar el nombre del atributo que se quiere sumar
 * @returns Retorna un valor numérico o `0`
 */
export const sumGeneric = (data, atrName) => {
   if (_.isEmpty(data)) return 0;
   let total = data.map((u) => parseInt(u[atrName] || 0)).reduce((total, monto) => total + monto);
   return _.isNaN(total) ? 0 : total;
};

/**
 * Función que realiza la sumatoria precisa de valores decimales) de un array de objetos,
 * utilizando la librería `decimal.js` para evitar imprecisiones de punto flotante en JavaScript.
 *
 * @param {Object[]} data - Un array de objetos que contienen los valores a sumar.
 * @param {string} atrName - Nombre de la propiedad dentro de cada objeto en `data`
 * que contiene el valor numérico a sumar.
 * @returns {number} La suma total de los valores, redondeada a un número que pueda ser
 * representado de forma nativa en JavaScript. Si el array de entrada está vacío o no
 * contiene valores válidos, retorna `0`.
 *
 * @example
 * const data = [
 *    { id: 1, valor:11.0007 },
 *    { id: 2, valor:44.5553 },
 *    { id: 3, valor:44.5550 }
 * ];
 *
 * const totalValor = sumGenericDecimal(data, 'valor');
 * console.log(totalValor); //100
 * */
export const sumGenericDecimal = (data, atrName) => {
   if (_.isEmpty(data)) return new Decimal(0).toNumber();

   let total = new Decimal(0);
   data.forEach((u) => {
      const monto = new Decimal(u[atrName] || 0).toNumber();
      total = total.plus(monto);
   });

   return total.toNumber();
};
