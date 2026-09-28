import { sweetNormal } from './helpSweet';
import { findAttribute } from './helpUtils';

const objDefault = {
   title: '¡Error desconocido!',
   message: `Hubo un problema al ejecutar la petición. Por favor, verifica tu conexión a internet o vuelve a intentarlo de nuevo más tarde.`,
   icon: '',
};

export const getError = (info) => {
   let msj = findErrorOrMessage(info);
   let traceId = findAttribute(info, 'traceId');
   let { title, description, icon } = mapTypeErrors[info.status];

   sweetNormal({
      txt: `<h2 class='text-2xl font-semibold my-4'>${title}</h2>
         <p class='text-sm'>${description}</p>
         <details open class='text-left px-9 mt-2'>
            <summary class='text-sm font-bold cursor-pointer'>
               Detalles:
            </summary>
            <p class='text-xs text-gray-700 mt-3 text-center'>[ ${msj ?? objDefault.message} ]</p>
            <p class='text-xs text-gray-700 font-semibold text-center'>Trace ID: ${traceId ?? 'Sin Trace ID'}</p>
         </details>`,
      icon,
   });

   return info;
};

const mapTypeErrors = {
   400: {
      title: '¡La solicitud no pudo procesarse correctamente!',
      description: 'Si sigues experimentando problemas, no dudes en ponerte en contacto con nuestro equipo de soporte',
      icon: 'warning',
   },
   401: {
      title: '¡Petición no autorizada!',
      description:
         '¡Lo sentimos! Pero al parecer no tienes permisos para esta acción. Si esto no es correcto por favor contacta a nuestro equipo de soporte',
      icon: 'warning',
   },
   404: {
      title: '¡Recurso o información no encontrado!',
      description:
         'Por favor revisa los parametros de búsqueda e intenta nuevamente ya que no se encontrarón resultados.',
      icon: 'info',
   },
   409: {
      title: '¡La operación no pudo completarse!',
      description: 'La petición solicitada tuvo un conflicto con el estado actual del servidor.',
      icon: 'info',
   },
   429: {
      title: '¡Demasiadas solicitudes!',
      description:
         'Se han enviado demasiadas solicitudes en un periodo corto. Por favor espera un poco y vuelve a intentarlo más tarde.',
      icon: '',
   },
   500: {
      title: '¡Error interno del servidor!',
      description:
         'Hubo un problema al ejecutar la petición. Por favor, verifica tu conexión a internet o vuelve a intentarlo de nuevo más tarde.',
      icon: 'error',
   },
   502: {
      title: '¡Error de puerta de enlace!',
      description:
         'No pudimos obtener una respuesta valida del servidor. Por favor, verifica tu conexión a internet o vuelve a intentarlo más tarde.',
      icon: '',
   },
   504: {
      title: '¡Tiempo de espera agotado!',
      description:
         'El servidor ha tardado más de lo normal en responder. Por favor, verifica tu conexión a internet o vuelve a intentarlo más tarde.',
      icon: '',
   },
};

export const findErrorOrMessage = (obj) => {
   if (typeof obj !== 'object' || obj === null) return null;

   const keysToFind = ['message', 'error'];
   const searchAttribute = (currentObj, attributeName) => {
      if (typeof currentObj !== 'object' || currentObj === null) {
         return null;
      }

      if (
         currentObj.hasOwnProperty(attributeName) &&
         typeof currentObj[attributeName] === 'string' &&
         currentObj[attributeName].trim() !== ''
      ) {
         return currentObj[attributeName];
      }

      for (const key in currentObj) {
         if (currentObj.hasOwnProperty(key)) {
            const value = currentObj[key];

            if (Array.isArray(value)) {
               for (const item of value) {
                  const found = searchAttribute(item, attributeName);
                  if (found) return found;
               }
            } else if (typeof value === 'object' && value !== null) {
               const found = searchAttribute(value, attributeName);
               if (found) return found;
            }
         }
      }

      return null;
   };

   for (const attribute of keysToFind) {
      const result = searchAttribute(obj, attribute);
      if (result) return result;
   }

   return null;
};
