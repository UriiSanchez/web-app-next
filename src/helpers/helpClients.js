import _ from 'lodash';

/**
 * Recorre un array de objetos haciendo un filtrado de los clientes que cambiaron sus financieros
 * @param {Array} clientsData - Array de objetos con la información de los clientes involucrados de cada subsolicitud
 * @returns {Array} - Array de los fullName de los clientes que cambiaron sus financieros
 * */
export const getChangedFinancialClients = (clientsData = []) => {
   try {
      return (
         _(clientsData)
            //* Juntamos todos los arrays en 'relatedPersonResponseList' de cada objeto en un solo array
            .flatMap('relatedPersonResponseList')
            //* Filtramos el array con solo los clientes que cambiaron sus financieros
            .filter('financialDocsChanges')
            //* Eliminamos los duplicados en base al 'idClient' convertido a string
            .uniqBy((c) => String(c.idClient ?? c.idClient))
            //* Extraemos solo el campo 'fullName' de cada cliente
            .map('fullName')
            //* Devolvemos el array final de nombres
            .value()
      );
   } catch (error) {
      console.error('Error al obtener los clientes que cambiaron sus financieros', error);
      return [];
   }
};

/**
 * Recorre un array de objetos para identificar si al menos a uno de los clientes le cambiaron sus financieros
 * @param {Array} groupData - Array de objetos con la información del grupo
 * @returns {boolean} - `true` si al menos a uno de los participantes de la solicitud le cambiaron los documentos financieros, `false` si no se encontro ninguno
 * */
export const hasClientFinancialChanges = (groupData = []) => {
   if (!Array.isArray(groupData)) return false;

   return groupData.some((request) =>
      request?.relatedPersonResponseList?.some((client) => client?.financialDocsChanges === true)
   );
};
