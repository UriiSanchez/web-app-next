import _ from 'lodash';
import { sumGenericDecimal } from '../helpOperations';
import { initGeneralSummary, initSummaryIndiviual } from '../initials';

export const calcIndividualSummary = (properties, summary) => {
   const onlyPropertiesActives = properties.filter((pv) => !pv.deleted);
   let newResumInd = structuredClone(summary);
   let newSummary = structuredClone(initSummaryIndiviual);
   let verified = onlyPropertiesActives.filter((pv) => pv.idCheckOwnership != null);
   let noVerified = onlyPropertiesActives.filter((pv) => pv.idCheckOwnership == null);

   try {
      //* Se cuentan Propiedades No Verificadas y si al menos una está modificada.
      newSummary.inmuebles.numero = noVerified.length;

      //* Se obtiene el valor total estimado por el usuario de las propiedades
      let customValue = sumGenericDecimal(noVerified, 'customerValue');
      newSummary.inmuebles.valor = customValue;

      newResumInd['totalCustomerValue'] = sumGenericDecimal(onlyPropertiesActives, 'customerValue');

      //* Se suma el total del Área Construida & Dimensiones de Terreno
      newResumInd['totalBuildArea'] = sumGenericDecimal(onlyPropertiesActives, 'buildArea');
      newResumInd['totalAreaDimension'] = sumGenericDecimal(onlyPropertiesActives, 'areaDimension');

      //* Propiedades No Verificadas
      if (noVerified?.length > 0) {
         newSummary.pendientes.numero = noVerified?.length;
         newSummary.pendientes.valor = sumGenericDecimal(noVerified, 'customerValue');
      }

      //* Se contabilizan las propiedades Verificadas por tipo
      if (verified.length > 0) {
         verified.forEach(({ idCheckOwnership: { ownerType, ownershipStatus, ownershipValue, countable } }) => {
            if (['APPLICANT', 'CO_OBLIGED'].includes(ownerType)) {
               schemaSetStatusResume[ownershipStatus](newSummary, ownershipValue, countable);
               //* Se suma el valor de las Verificadas.
               newSummary.inmuebles.numero += 1;
               newSummary.inmuebles.valor += ownershipValue || 0;
            }
         });
      }

      return { ...newResumInd, resume: newSummary };
   } catch (error) {
      console.log('Resumen Individual: ', error);
      return newResumInd;
   }
};

export const calcGlobalSummary = (info) => {
   try {
      const { applicant, obligedList } = info;
      let remg = structuredClone(info.resumeGeneral);
      let summary = structuredClone(initGeneralSummary);
      if (applicant.properties.length > 0) {
         let newProperties = applicant.properties.filter((apr) => !apr.deleted);
         summary.inmueblesApplicant.pending.numero = newProperties.length || 0;
         summary.inmueblesApplicant.pending.valor = sumGenericDecimal(newProperties, 'customerValue');
         setSummaryGeneric(summary, newProperties, 'inmueblesApplicant');
      }

      //* Se obtienen todas las propiedades del obligado
      obligedList?.forEach((obly) => {
         if (!_.isEmpty(obly.properties)) {
            let newProperties = obly.properties.filter((apr) => !apr.deleted);
            summary.inmueblesObligated.pending.numero += newProperties.length || 0;
            summary.inmueblesObligated.pending.valor += sumGenericDecimal(newProperties, 'customerValue');
            setSummaryGeneric(summary, newProperties, 'inmueblesObligated');
         }
      });

      remg.coverageRatio = summary.libres.valor / remg.creditRisk;
      let sumClientPropertys = summary.inmueblesApplicant.pending.valor + summary.inmueblesObligated.pending.valor;
      summary['coverageRatioClient'] = sumClientPropertys / remg.creditRisk;
      return { ...info, resumeGeneral: { ...remg, resume: summary } };
   } catch (error) {
      console.log('resumen general: ', error);
      return info;
   }
};

const setSummaryGeneric = (summary, arrayData, typeAttr) => {
   let noVerified = arrayData.filter((pv) => pv.idCheckOwnership == null);
   if (noVerified?.length > 0) {
      summary.pendientes.pending.numero += noVerified?.length;
      summary.pendientes.pending.valor += sumGenericDecimal(noVerified, 'customerValue');
   }

   let verified = arrayData.filter((pv) => pv.idCheckOwnership != null);
   if (verified.length === 0) {
      return;
   }

   verified.forEach(({ idCheckOwnership: { ownerType, ownershipValue = 0, ownershipStatus, countable } }) => {
      if (['APPLICANT', 'CO_OBLIGED'].includes(ownerType)) {
         //? Identificar si se Suma a APPLICANT o a CO_OBLIGED
         if (ownerType === 'APPLICANT') {
            summary[typeAttr].verify.numero += 1;
            summary[typeAttr].verify.valor += ownershipValue;
         } else {
            summary.copropiedadWithOS.numero += 1;
            summary.copropiedadWithOS.valor += ownershipValue;
         }

         schemaSetStatusResume[ownershipStatus](summary, ownershipValue, countable);
      } else {
         summary.copropiedadOthers.numero += 1;
         summary.copropiedadOthers.valor += ownershipValue;
      }
   });
};

const schemaSetStatusResume = {
   embargado: (data, monto) => {
      data.embargados.numero += 1;
      data.embargados.valor += monto;
   },
   gravado: (data, monto) => {
      data.gravados.numero += 1;
      data.gravados.valor += monto;
   },
   libre: (data, monto, countable) => {
      if (countable) {
         data.libres.numero += 1;
         data.libres.valor += monto;
      }
   },
   pendiente: (data, monto) => {
      data.pendientes.numero += 1;
      data.pendientes.valor += monto;
   },
   escrituracion: (data, monto) => {
      data.escrituracion.numero += 1;
      data.escrituracion.valor += monto;
   },
};
