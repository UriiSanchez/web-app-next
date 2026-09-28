import _ from 'lodash';
import dayjs from 'dayjs';

import { genericFetch } from '../hooks';
import { dateToString, getError, initGeneralSummary, initSummaryIndiviual, statusProperty } from '../helpers';
import { calcGlobalSummary, calcIndividualSummary } from '../helpers/calculates';
import { constTypePerson as TypePerson, constProfiles as Profile } from '../helpers/config';

export const getPropertyFormat = async (idRequest) => {
   try {
      const result = await genericFetch({
         url: `/credit/Relationship/Ownership/getAllRelOwn?idRequest=${idRequest}`,
         method: 'get',
      });

      if (result?.status !== 200) {
         return getError(result);
      }

      let info = parsInfo(result?.data);
      localStorage.setItem('Property_Page', JSON.stringify(info));
      return { status: result.status, data: info };
   } catch (error) {
      console.log(error);
      return getError({ status: 500, error });
   }
};

export const savePropertyFormat = async (data, idProfile, isFreeze = false) => {
   try {
      let newInfo = structuredClone(data);
      let listProperties = [];
      //* Se transforma a json el resumen de Aplicante
      if (!_.isEmpty(data?.applicant?.properties)) {
         newInfo.applicant = {
            ...data.applicant,
            resumeInd: { ...data.applicant?.resumeInd, resume: JSON.stringify(data.applicant?.resumeInd?.resume) },
         };

         listProperties.push(...data.applicant.properties);
      } else {
         delete newInfo.applicant;
      }

      //* Se transforma a json el resumen de OS
      let newOblys = data.obligedList
         .filter((ob) => !_.isEmpty(ob.properties))
         .map(({ resumeInd, ...oblys }) => {
            listProperties.push(...oblys.properties);
            return {
               ...oblys,
               resumeInd: { ...resumeInd, resume: JSON.stringify(resumeInd?.resume) },
            };
         });

      if (!_.isEmpty(newOblys)) {
         newInfo['obligedList'] = newOblys;
      } else {
         delete newInfo.obligedList;
      }

      //* Se transforma a JSON el Resumen General
      newInfo.resumeGeneral = { ...data?.resumeGeneral, resume: JSON.stringify(data?.resumeGeneral?.resume) };
      //* se revisa si viene el uniqueFolio lleno
      newInfo['propertiesFormat'].idCatStatus = getStatusProperty(isFreeze, newInfo.propertiesFormat?.uniqueFolio);
      //* Se realiza la validación de verificación.
      if (idProfile && [Profile.ADC, Profile.LDC].includes(idProfile) && listProperties.length > 0) {
         newInfo['propertiesFormat'].disableVerification = setValidationProperty(listProperties);
      }

      const result = await genericFetch({
         url: '/credit/Relationship/Ownership/savePartial',
         method: 'patch',
         data: JSON.stringify({ ...newInfo }),
      });

      return result;
   } catch (error) {
      console.log(error);
      return { status: 500, error };
   }
};

export const saveVerification = async (data) => {
   try {
      const result = await genericFetch({
         url: '/credit/Relationship/Ownership/saveVerification',
         method: 'post',
         data: JSON.stringify({ ...data }),
      });

      if (result.status !== 200) {
         return getError(result);
      }

      return result;
   } catch (error) {
      console.log('verification save', error);
      return getError({ status: 500, error });
   }
};

export const savePropertyAfterVerification = async (data, propertyInfo) => {
   try {
      //* Se vuelve a calcular los resumenes y se guarda la info.
      let newObj = null;
      if (data?.catTypePerson == TypePerson.APPLICANT) {
         let applicant = structuredClone(propertyInfo.applicant);
         applicant.properties[data.idx].idCheckOwnership = data;
         //* Se realiza el cálculo del resumen individual
         applicant.resumeInd = calcIndividualSummary(applicant.properties, applicant.resumeInd);
         newObj = { ...propertyInfo, applicant };
      } else {
         let obligedList = propertyInfo.obligedList?.map((o) => {
            if (o.idClient == data?.idClient) {
               let newProperties = o.properties?.map((prop) =>
                  prop.idRelOwnership == data.idRelOwnership ? { ...prop, idCheckOwnership: data } : prop
               );

               //* Se realiza el cálculo del Resumen Individual
               let resumeInd = calcIndividualSummary(newProperties, o.resumeInd);
               return { ...o, properties: newProperties, resumeInd };
            }

            return o;
         });

         newObj = { ...propertyInfo, obligedList };
      }

      //* Se realiza el calculo global
      let newInfo = calcGlobalSummary(newObj);
      return savePropertyFormat(newInfo);
   } catch (error) {
      console.log('savePropertyAfterVerification', error);
      return { status: 500, error };
   }
};

const parsInfo = (data) => {
   const { propertiesFormat, resumeGeneral, applicant, obligedList } = data;
   // *Se aplica formato a las fechas
   let modifyDate = propertiesFormat?.verificationDate
      ? dateToString(propertiesFormat?.verificationDate)
      : dayjs().format('DD-MM-YYYY');
   data.propertiesFormat = { ...propertiesFormat, modifyDate };

   // *Se valida si el resumenIndividual viene diff a null
   let summaryApplicant = _.isEmpty(applicant.resumeInd.resume)
      ? initSummaryIndiviual
      : JSON.parse(applicant.resumeInd.resume);
   data['applicant'] = { ...applicant, resumeInd: { ...applicant.resumeInd, resume: summaryApplicant } };

   // *Se valida si viene diff a null resume en Resumen General
   let summaryGeneral = _.isEmpty(resumeGeneral.resume) ? initGeneralSummary : JSON.parse(resumeGeneral.resume);
   data['resumeGeneral'] = {
      ...resumeGeneral,
      resume: summaryGeneral,
   };

   let hasPropertyOS = false;
   //* Se valida si no si hay obligados solidarios se obtiene del storage
   if (!_.isEmpty(obligedList)) {
      let setOblys = obligedList
         .map(({ resumeInd, ...ob }) => ({
            ...ob,
            resumeInd: {
               ...resumeInd,
               resume: _.isEmpty(resumeInd.resume) ? initSummaryIndiviual : JSON.parse(resumeInd.resume),
            },
         }))
         .sort((a, b) => a.idClient - b.idClient);
      hasPropertyOS = obligedList.some((o) => !_.isEmpty(o.properties));
      data['obligedList'] = setOblys;
   }

   let hasProperty = applicant?.properties?.length > 0;
   data['propertiesFormat'].freezeTitle =
      hasProperty || hasPropertyOS ? 'Cumple seguridad y sociedad' : 'Cumple sociedad';
   data['hasProperty'] = hasProperty;
   data['hasPropertyOS'] = hasPropertyOS;
   return calcGlobalSummary(data);
};

const setValidationProperty = (properties, hasVerification) => {
   //*Se filtran solo las propiedades que verificadas
   let listVerify = properties.filter((pp) => pp.idCheckOwnership);
   if (listVerify.length > 0) {
      //* Se revisa si todas las propiedades verificadas ya se validaron por ADC o LDC.
      return listVerify.every((pv) => pv.validation);
   }

   return hasVerification;
};

const getStatusProperty = (freezing, folio) => {
   if (freezing) {
      return statusProperty.FREEZE;
   }

   return !_.isEmpty(folio) ? statusProperty.FINALIZADO : statusProperty.INCOMPLETO;
};
