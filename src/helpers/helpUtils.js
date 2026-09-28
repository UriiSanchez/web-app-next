import _ from 'lodash';

/**
 * Función que crea un color random HSL con el siguiente formato
 * hsl(valor, valor, porcentage%)
 */
export function getRandomColor() {
   return 'hsl(' + 360 * _.random(true) + ',' + (25 + 70 * _.random(true)) + '%,' + (40 + 30 * _.random(true)) + '%)';
}

export function getFirstTwoLetters(sentence) {
   const words = sentence.split(' ').filter((pos) => pos.length > 0);
   if (words.length <= 1) {
      return words[0].charAt(0);
   } else if (words.length >= 2 && words.length <= 4) {
      let idx = words.length > 3 ? 2 : 1;
      return words[0].charAt(0) + words[idx].charAt(0);
   } else {
      return words[0].charAt(0) + words[3].charAt(0);
   }
}

/**
 * Limita el texto a un número máximo de caracteres.
 *
 * Si el texto supera el límite, se corta y se devuelve el texto truncado
 * @param {string} text - El texto a limitar
 * @param {number} limit - El límite máxico de caracteres (opcional), por defecto 253.
 * @returns {string} El nuevo texto cortado.
 */
export function setTextLimit(text, limit = 253) {
   return text?.length > limit ? text.slice(0, limit) : text;
}

/**
 * Elimina los atributos vacíos de un objeto
 *
 * Un atributo se considera vacío si su valor es `null` o `undefined`.
 *
 * @param {Object} obj - El objeto del que se eliminarán los atributos vacíos.
 * @returns {Object} Un nuevo objeto con los atributos que no se encuentren vacíos.
 */
export function removeEmptyAttributes(obj) {
   for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
         const value = obj[key];
         if (value == null || value == undefined || value == '') {
            delete obj[key];
         }
      }
   }
   return obj;
}

/**
 * Ayuda a limpiar atributos vaciós de los objetos
 * @param {Object} obj - es el Objeto que se volverá a generar con los objetos vacios.
 * @returns
 */
export function cleanAttributeForObject(obj) {
   const newObject = {};
   for (const key in obj) {
      newObject[key] = _.isArray(obj[key]) ? [] : '';
   }
   return newObject;
}

/**
 * Busca el valor de un atributo en específico en una estructura de objetos anidada de forma recursiva.
 * TODO: falta añadir la logica cuando un atributo es un arreglo
 * @param {Object} obj - El objeto origen donde se buscará atributo/valor.
 * @param {String} attribute - El nombre del atributo a buscar.
 * @returns {any} El valor del atributo, o undefined si no se encuentra.
 */
export function findAttribute(obj, attribute) {
   const entrys = Object.entries(obj);
   for (const [key, value] of entrys) {
      if (key === attribute) {
         return value;
      }

      if (typeof value === 'object' && value) {
         const foundValue = findAttribute(value, attribute);
         if (foundValue !== undefined) {
            return foundValue;
         }
      }
   }
   return undefined;
}

/**
 * Compara dos objetos JSON de forma profunda.
 * @param {object} json1 El primer objeto JSON.
 * @param {object} json2 El segundo objeto JSON.
 * @returns {boolean} `true` si los objetos JSON son iguales, `false` si no son iguales o hubo algún error.
 */
export function compareJSON(json1, json2) {
   try {
      if ((json1 == null && json2 == '') || (json1 == '' && json2 == null)) {
         return true;
      }

      if (typeof json1 !== typeof json2) {
         return false;
      }

      if (Array.isArray(json1)) {
         return json1.every((item1, index) => compareJSON(item1, json2[index]));
      }

      if (typeof json1 === 'object' && json1 != null) {
         const keys1 = Object.keys(json1).sort();
         const keys2 = Object.keys(json2).sort();

         if (keys1.length !== keys2.length) {
            return false;
         }

         return keys1.every((key) => compareJSON(json1[key], json2[key]));
      }

      return json1 === json2;
   } catch (error) {
      console.error('compareJSON: ', error);
      return false;
   }
}

/**
 * Comprueba si todos los campos de un objeto están llenos.
 *
 * Un campo se considera lleno si no es `undefined`, `null` o una cadena vacía.
 * Si el campo es un objeto, se recurre a esta función para comprobar que todos sus también estén llenos.
 *
 * @param {Object} obj - El objeto a comprobar
 * @returns {boolean} `true` si todos los campos están llenos, `false` en caso contrario.
 */
export function areAllObjectFilled(obj) {
   for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
         const value = obj[key];
         if (value === undefined || value === null || value === '') {
            return false;
         }

         if (_.isObject(value) && !areAllObjectFilled(value)) {
            return false;
         }
      }
   }
   return true;
}

/**
 * Comprueba si al menos un campo de un objeto están lleno y permite recibir un arreglo de los campos que no se revisaran.
 *
 * Un campo se considera lleno si no es `undefined`, `null` o una cadena vacía.
 * Si el campo es un objeto, se recurre a esta función para comprobar que al menos uno de sus campos esta lleno.
 *
 * @param {Object} obj - El objeto a comprobar
 * @returns {boolean} `true` si al menos un campo está lleno, `false` en caso de que todos esten vacios.
 */
export function hasObjectFilled(obj, exceptions = []) {
   return Object.entries(obj).some(([key, value]) => {
      if (exceptions.includes(key)) return false;
      if (typeof value === 'string') {
         return value.trim() !== '';
      }

      return value !== undefined && value !== null && value !== 0;
   });
}

/**
 * Comprueba si al menos un campo de un objeto dentro del arreglo están lleno y permite recibir un arreglo de los campos que no se revisaran.
 *
 * Un campo se considera lleno si no es `undefined`, `null` o una cadena vacía.
 * Si el campo es un objeto, se recurre a esta función para comprobar que al menos uno de sus campos esta lleno.
 *
 * @param {Array} arr - Array de objetos a comprobar
 * @returns {boolean} `true` si al menos un campo está lleno en uno de los objetos, `false` en caso de que todos esten vacios.
 */
export const hasArrObjectFilled = (arr) => {
   return arr.some((obj) =>
      Object.values(obj).some(
         (value) =>
            value !== undefined &&
            value !== null &&
            value !== 0 &&
            (typeof value !== 'string' ? true : value.trim() !== '')
      )
   );
};

/**
 * Crea un nuevo objeto de un solo nivel (LV 1) apartir de otro con solo los elementos a guardar sin modificar el objeto padre.
 *
 * @param {Array} _array - Lista de atributos que se van a mantener
 * @param {Object} data - El objeto a modificar.
 * @returns {Object} Nuevo objeto con solo los atributos que se utilizan para guardar.
 */
export function setOnlyIsToSave(_array, data) {
   if (_.isEmpty(_array)) {
      return data;
   }

   let newData = {};
   for (const key in data) {
      if (_.isObject(data[key])) {
         let uu = setOnlyIsToSave(_array, data[key]);
         newData = { ...newData, ...uu };
      }

      if (_array.includes(key)) {
         newData[key] = data[key];
      }
   }

   return newData;
}

/**
 * Maneja las pulsaciones de teclas para permitir sólo la entrada de números.
 * @param {KeyboardEvent} e El evento del teclado
 * @returns {void}
 */
export function onKeyNumbers(e) {
   const allowedKeys = [37, 38, 39, 40, 8, 13, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 110, 190];
   const keyCode = e.keyCode || e.which;
   const keyValue = String.fromCharCode(keyCode);
   const isCtrlV = (e.ctrlKey || e.metaKey) && keyValue.toLowerCase() === 'v';
   if (!/^\d+$/.test(keyValue) && !allowedKeys.includes(keyCode) && !isCtrlV) {
      e.preventDefault();
   }
}

/**
 * Permite validar si lo que se esta copiando en un input es de tipo numeric
 * @param {Event} e eventos del input
 */
export function onPasteOnlyNumbers(e) {
   e.preventDefault();
   const clipBoard = e.clipboardData.getData('text/plain');
   const numericValue = clipBoard.replace(/[^\d]/g, '');
   document.execCommand('insertText', false, numericValue);
}

/**
 * Crea un array de ids unicos
 * @param {number} size Tamaño del array
 * @param {String} prefix Prefijo de los ids del array
 * @returns {Array} Array de ids unicos
 */
export function getUUIDArray(size, prefix = '') {
   return [...Array(size)].map(() => _.uniqueId(prefix));
}

/**
 * Genera un arreglo de años, ya sean los 10 siguientes o los 10 anteriores,
 * empezando por el año actual.
 * @param {boolean} [nextYears=true] - Si es true, genera los 10 años siguientes.
 *                                   - Si es false, genera los 10 años anteriores.
 * @return {string[]} Una matriz de cadenas que representan los años,
 *  utilizando solo los dos últimos dígitos.
 */
export function generateLastTwoDigitsYears(nextYears = true) {
   const currentYears = new Date().getFullYear();
   const years = [];

   const startYear = nextYears ? currentYears : currentYears - 9;
   for (let i = startYear; i < startYear + 10; i++) {
      years.push(i.toString().slice(-2));
   }

   return nextYears ? years : _.orderBy(years, [Number], 'desc');
}

/**
 * Genera dos arreglos de años, expirationDate: los 10 siguientes, hiringDate: los 10 anteriores,
 * empezando por el año actual.
 * @return {string[],String[]} objeto con 2 cadenas (arreglos) que representan los años,
 *  utilizando solo los dos últimos dígitos.
 */
export function generateListYears() {
   return {
      expirationDate: generateLastTwoDigitsYears(false),
      hiringDate: generateLastTwoDigitsYears(),
   };
}

/**
 * Convierte una cadena de datos Base64 en un URL de un objeto Blob de tipo PDF
 * @param {string} `data` - La cadena de datos base64 que representa el contenido del PDF.
 * @returns {string} - Un URL de objeto que puede ser utilizado para descargar o mostrar el PDF.
 * */
export const createUrlPdf = (data) => {
   let binary = atob(data.replace(/\s/g, ''));
   let len = binary.length;
   let buffer = new ArrayBuffer(len);
   let view = new Uint8Array(buffer);

   for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
   }

   const blob = new Blob([view], { type: 'application/pdf' });
   const url = URL.createObjectURL(blob) + '#toolbar=1&navpanes=0&view=FitH,top';
   return url;
};
