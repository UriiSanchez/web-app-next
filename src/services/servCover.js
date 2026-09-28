import _ from 'lodash';

import { genericFetch } from '../hooks';
import {
   areAllObjectFilled,
   getError,
   initItemShareholding,
   initLines,
   itemLine,
   limitLines,
   onlyCoverCompletedItems,
   onlySaveCover,
   setOnlyIsToSave,
   sumGenericDecimal,
} from '../helpers';

export const getCoverInfo = async (idGroup) => {
   try {
      const result = await genericFetch({
         url: `/credit/Cover/getCover?idGroup=${idGroup}`,
         method: 'get',
      });

      if (result?.status != 200) {
         return getError(result);
      }

      let parsedApplicants = parseCoverInfo(result.data);
      return { ...result, data: parsedApplicants };
   } catch (error) {
      console.log(error);
      return { status: 500, message: error?.message };
   }
};

const parseCoverInfo = (data) => {
   return data?.map((rd) => {
      let applicant = {
         ...rd,
         resolutionLinesResponse: {
            previousLines: validIsEmpty(rd.resolutionLinesResponse.previousLines, 1),
            requestLinesResponse: validIsEmpty(rd.resolutionLinesResponse.requestLinesResponse),
            modelAuthorization: validIsEmpty(rd.resolutionLinesResponse.modelAuthorization),
         },
         infoFinancialResponse: {
            ...rd.infoFinancialResponse,
            shareholding: validateShareholding(rd.infoFinancialResponse.shareholding),
         },
      };
      applicant.coverComplete = validateCoverCompleted(applicant);
      return applicant;
   });
};

const validIsEmpty = (info, type) => {
   let infoParsed = JSON.parse(info);
   if (type == 1 && _.isEmpty(infoParsed)) {
      initLines.previousLines['linesActives'] = [...Array(limitLines)].map((o, i) => ({
         ...itemLine,
         lineNumber: i + 1,
      }));
      return initLines;
   }

   if (type == 1) {
      infoParsed.linesActives =
         infoParsed.linesActives != null
            ? infoParsed.linesActives
            : [...Array(limitLines)].map((o, i) => ({
                 ...itemLine,
                 lineNumber: i + 1,
              }));
      return infoParsed;
   }

   return infoParsed;
};

const validateShareholding = (info) => {
   if (_.isEmpty(info)) {
      return [...Array(5)].map((o, i) => ({ ...initItemShareholding, name: i === 4 ? 'Otros' : '', id: i }));
   }

   if (info?.length > 4) return info.map((sh, i) => ({ ...sh, id: i }));

   const newInfo = [...info];
   while (newInfo.length < 5) {
      let name = newInfo.length === 4 && !newInfo.some((sh) => sh.name === 'Otros') ? 'Otros' : '';
      newInfo.push({
         ...initItemShareholding,
         name,
      });
   }

   return newInfo.map((sh, i) => ({ ...sh, id: i }));
};

export const saveCoverInfo = async (data) => {
   try {
      let dataCover = data.map((item) => setOnlyIsToSave(onlySaveCover, item));
      let newData = dataCover.map((item) => {
         let newShareholding = item?.shareholding.filter((u) => {
            if (
               u.name != 'Otros' &&
               (!_.isEmpty(u.name) ||
                  !_.isEmpty(u.rfc) ||
                  !_.isEmpty(u.directParticipation) ||
                  !_.isEmpty(u.indirectParticipation))
            ) {
               return u;
            }
            if (!_.isEmpty(u.directParticipation) || !_.isEmpty(u.indirectParticipation)) {
               return u;
            }
         });
         return {
            ...item,
            rfc: data.find((r) => r.idRequest == item.idRequest).generalDataCifResponse.rfc,
            shareholding: !_.isEmpty(newShareholding) ? JSON.stringify(newShareholding) : null,
            modelAuthorization: JSON.stringify(item['modelAuthorization']),
            previousLines: JSON.stringify(item['previousLines']),
         };
      });
      return genericFetch({
         url: '/credit/Cover/saveCoverInfo',
         method: 'post',
         data: JSON.stringify({ requests: newData }),
      });
   } catch (error) {
      console.log(error);
      return { status: 500, message: error?.message };
   }
};

export const validateCoverCompleted = (data) => {
   let newData = setOnlyIsToSave(onlyCoverCompletedItems, data);
   let isCompleteCover;
   if (data.generalDataCifResponse.personType === 'PM') {
      let findShareholding = newData.shareholding?.find((u) => !_.isEmpty(u.name) && !_.isEmpty(u.directParticipation));
      let totalDirectParticipation = sumGenericDecimal(newData.shareholding, 'directParticipation');
      delete newData.shareholding;
      isCompleteCover =
         areAllObjectFilled(Object.values(newData)) && !_.isEmpty(findShareholding) && totalDirectParticipation == 100;
   } else {
      delete newData.shareholding;
      isCompleteCover = areAllObjectFilled(Object.values(newData));
   }

   return isCompleteCover;
};

export const downloadCoverStudio = (idRequest, idClient, typeDocument = 'PDF_COVER') => {
   return genericFetch({
      url: `/credit/Studio/generateStudio?idRequest=${idRequest}&idClient=${idClient}&typeDocument=${typeDocument}`,
      method: 'get',
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al descargar el documento', error }));
};
