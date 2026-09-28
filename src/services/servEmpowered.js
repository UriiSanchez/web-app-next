import { downloadCoverStudio } from './servCover';
import { genericFetch } from '../hooks';
import {
   createUrlPdf,
   EnumOptionsDecisionFaculty as DecisionFaculty,
   EnumTypeFaculty,
   getError,
   sweetNormal,
} from '../helpers';

const MSG_NO_DATA_RESPONSE = 'Ocurrió un error al cargar el documento.';

export const getEmpoweredInformation = async (idGroup, user, profile = 'FC') => {
   try {
      //1.- En la primera carga de la página debo obtener los datos del grupo
      const result = await genericFetch({
         url: `/credit/getResolution?idGroup=${idGroup}&username=${user}&profile=${profile}`,
         method: 'get',
      });

      if (result.status != 200) {
         getError(result);
         localStorage.removeItem('ACTIVE_APPLICANT');
         return [];
      }

      let newData = structuredClone(result.data);
      newData.isGroup = result.data.requests?.length > 1;
      newData.countRequest = result.data.requests?.length;

      // Steamos el aplicante activo en LS
      const lsApplicant = JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'));
      if (!lsApplicant || newData.idGroup !== lsApplicant.idGroup) {
         localStorage.setItem(
            'ACTIVE_APPLICANT',
            JSON.stringify({
               idGroup: newData.idGroup,
               idRequest: newData.requests[0].idRequest,
            })
         );
      }
      return newData;
   } catch (error) {
      getError({ status: 500, error });
      return [];
   }
};

export const getLoadDocuments = async (idRequest, idClient, typeDocument) => {
   let objResponse = { url: '', error: '' };

   try {
      const cacheData = validateDocumentsLocalStorage(idRequest, typeDocument);
      if (cacheData) {
         return { url: createUrlPdf(cacheData) };
      }

      const { status, data, error } = await downloadCoverStudio(idRequest, idClient, typeDocument);
      if (status !== 200 || !data.response) {
         objResponse.error = error?.response?.message || MSG_NO_DATA_RESPONSE;
         return objResponse;
      }

      objResponse.url = createUrlPdf(data.response);
      return objResponse;
   } catch (error) {
      console.error(error);
      objResponse.error = error;
      return objResponse;
   }
};

export const postSaveAuthorization = async (idRequest, userAD, authorizedDecision) => {
   try {
      const result = await genericFetch({
         url: `/credit/Authorization/signRequest`,
         method: 'post',
         data: JSON.stringify({ idRequest, userAD, authorizedDecision }),
      });

      if ([400, 404, 500].includes(result.status)) {
         getError(result);
         return false;
      } else if (result.status === 409) {
         sweetNormal({ txt: result.error.response.message || '- MENSAJE NO DEFINIDO -', icon: 'info' });
         return false;
      }

      return true;
   } catch (error) {
      console.error(error);
      getError({ status: 500, error });
      return false;
   }
};

/**
 * Se encarga de habilitar o deshabilitar los botones Rechazar y Autorizar, con base a la validación por tipo de facultado
 * y su usario.
 *
 * @function validateAuthorizationForRequest
 * @param {Array} authorizations - Arreglo de objetos con las decisiones con los facultados
 * @param {string} userAD - Usuario activo en sesión
 * @param {COMERCIAL|CREDITO} profileType - Tipo de facultado del usuario activo en sesión.
 * @return Boleano para indicar si los botones deben ser deshabilitados o no.
 *
 * @example return false;
 * Los botones se habilitan.
 *
 * @example return true;
 * Lo botones se deshabilitan.
 * */
export const validateAuthorizationForRequest = (authorizations, userAD, profileType) => {
   const listCommercial = authorizations.filter((item) => item.typeFaculty === EnumTypeFaculty.FACULTY_COMMERCIAL);
   const listCredit = authorizations.filter((item) => item.typeFaculty === EnumTypeFaculty.FACULTY_CREDIT);

   //Se realiza la busqueda si un COMMERCIAL y un CREDIT ya emitieron un AUTORIZAR
   let isAuthorizadedForCommercial = listCommercial.some((item) => item.decisionFaculty === DecisionFaculty.YES);
   let isAuthorizadedForCredit = listCredit.some((item) => item.decisionFaculty === DecisionFaculty.YES);

   //Se valida si la solicitud ya tiene las firmas necesarias se bloquean los dos botones.
   if (isAuthorizadedForCommercial && isAuthorizadedForCredit) {
      return true;
   }

   // Buscamos si algún facultado del mismo tipo del usuario logeado ya AUTORIZO
   let definedDecisionForFacultyType = authorizations.find(
      (item) => item.decisionFaculty === DecisionFaculty.YES && item.typeFaculty === profileType
   );

   if (definedDecisionForFacultyType) {
      return definedDecisionForFacultyType.userAD !== userAD;
   }

   return false;
};

const saveInLocalStorageDocument = (idRequest, typeDoc, url) => {
   let cacheLS = JSON.parse(localStorage.getItem('CACHE_DOCUMENTS')) || {};
   if (!cacheLS[idRequest]) {
      cacheLS[idRequest] = { [typeDoc]: url };
   } else {
      cacheLS[idRequest][typeDoc] = url;
   }

   localStorage.setItem('CACHE_DOCUMENTS', JSON.stringify(cacheLS));
};

const validateDocumentsLocalStorage = (idRequest, typeDoc) => {
   let cacheLS = JSON.parse(localStorage.getItem('CACHE_DOCUMENTS'));
   if (!cacheLS || !cacheLS[idRequest] || !cacheLS[idRequest][typeDoc]) {
      return null;
   }

   return cacheLS[idRequest][typeDoc];
};
