import { isEmpty } from 'lodash';

import { genericFetch } from '../hooks';
import {
   areAllObjectFilled,
   DerivativesClass,
   getError,
   hasArrObjectFilled,
   hasObjectFilled,
   initDerivatives,
   templateCommonsPCD,
   templateDerivatives,
} from '../helpers';
import { calcExchangeData } from '../helpers/calculates';

export const getCustomerProfile = async (idRequest, editInfo = false) => {
   try {
      const result = await genericFetch({
         url: `/credit/Format/getFormatById?idRequest=${idRequest}`,
         method: 'get',
      });

      if (result.status !== 200) {
         return getError(result);
      }

      //* Si editInfo es true realiza un parseo de la información de lo contrario se devuelve la respuesta de back.
      return { ...result, data: parseDerivaties(result?.data, idRequest, editInfo) };
   } catch (error) {
      return getError({ status: 500, error });
   }
};

export const saveCustomerProfile = async (info, step, user) => {
   try {
      const csDerivates = new DerivativesClass(info, step, user);
      return genericFetch({
         url: `/credit/Format/updateFormat`,
         method: 'patch',
         data: csDerivates.body,
      });
   } catch (error) {
      return { status: 500, error };
   }
};

export const parseDerivaties = (data, idRequest, editInfo) => {
   try {
      localStorage.removeItem('PCD_Page');
      initDerivatives.pages.forEach((item) => {
         data[item] = isEmpty(data[item]) ? templateDerivatives[item] : JSON.parse(data[item]);
      });

      if (editInfo) {
         //* Se añaden variables locales al state
         data['idRequest'] = idRequest;
         data['selectedCalculator'] = data.coverageProfile.calculatorType.isType || '';
         data['isCompleted'] = checkCompletePCD(data).allPCD;
         localStorage.setItem('PCD_Page', JSON.stringify(data));
      }

      return data;
   } catch (error) {
      console.log(error);
      return data;
   }
};

export const checkCompletePCD = (info) => {
   let isCompleteCalculate = false;
   let isCompletCoverage = validationIfCompleted(info.coverageProfile);
   if (!isEmpty(info.selectedCalculator)) {
      let howCalculate = info.selectedCalculator === 'rate' ? 'calculatorRate' : 'calculatorRateExchange';
      isCompleteCalculate = validationIfCompleted(info[howCalculate]);
   }
   let isCompleteSummary = validationIfCompleted(info.profileResume);
   let allPCD = isCompletCoverage && isCompleteCalculate && isCompleteSummary;
   return {
      coverageProfile: isCompletCoverage,
      calculator: isCompleteCalculate,
      profileSummary: isCompleteSummary,
      allPCD: allPCD,
   };
};

export const checkDataVerification = (info, fnCompare) => {
   //* 1.- Formato NO completo: Se guarda en false
   if (!info.isCompleted) {
      return false;
   }

   let storageData = JSON.parse(localStorage.getItem('PCD_Page'));
   let cloneInfo = structuredClone(info);
   //* Quitamos isCompleted y veracity
   delete storageData.isCompleted;
   delete storageData.veracity;
   delete cloneInfo.isCompleted;
   delete cloneInfo.veracity;

   //* Comparamos si los objetos son iguales
   return fnCompare(cloneInfo, storageData);
};

export const handleVerifyCalculators = (data, dollar = 0) => {
   try {
      //* Se realiza la logica para las Calculadoras acorde al perfil EMG
      const { calculatorType, customerImports, customerExports } = data.coverageProfile;
      if (calculatorType?.isType === 'rate') {
         data.calculatorRate.rateCalculator.requestedLineAmount = parseInt(data?.requestAmount);
         data.calculatorRateExchange = templateDerivatives.calculatorRateExchange;
         return;
      }

      if (data.selectedCalculator === 'typechange') {
         //* Validar si Imports y Exports vienen como Sí
         let setObject = validateIsImportOrExport(customerImports, customerExports);
         data.calculatorRateExchange.customerPosition = setObject.customerPosition;
         data.calculatorRateExchange.percentageInForeignCurrency = setObject.percentageCurrency;
         data.calculatorRateExchange.coveragePolicy = setObject.coveragePolicy;
         calcExchangeData(data.calculatorRateExchange, dollar);
         data.calculatorRate = templateDerivatives.calculatorRate;
         return;
      }
   } catch (error) {
      console.error(error);
   }
};

const validateIsImportOrExport = (_imports, _exports) => {
   const areImports = _imports?.isType == 'Si';
   const areExports = _exports?.isType == 'Si';

   if (areImports && areExports) {
      return parseInt(_imports.whatPercentage) > parseInt(_exports.whatPercentage)
         ? {
              percentageCurrency: _imports.whatPercentage,
              coveragePolicy: _imports.currencyHedgingPolicy,
              customerPosition: 'Compra moneda extranjera',
           }
         : {
              percentageCurrency: _exports.whatPercentage,
              coveragePolicy: _exports.currencyHedgingPolicy,
              customerPosition: 'Venta moneda extranjera',
           };
   }

   if (!areImports && !areExports) {
      return parseInt(_imports.foreignCurrencyInputs) > parseInt(_exports.foreignCurrencyDomesticSales)
         ? {
              percentageCurrency: _imports.foreignCurrencyInputs,
              coveragePolicy: _imports.currencyHedgingPolicy,
              customerPosition: 'Compra moneda extranjera',
           }
         : {
              percentageCurrency: _exports.foreignCurrencyDomesticSales,
              coveragePolicy: _exports.currencyHedgingPolicy,
              customerPosition: 'Venta moneda extranjera',
           };
   }

   return areImports && !areExports
      ? {
           percentageCurrency: _imports.whatPercentage,
           coveragePolicy: _imports.currencyHedgingPolicy,
           customerPosition: 'Compra moneda extranjera',
        }
      : {
           percentageCurrency: _exports.whatPercentage,
           coveragePolicy: _exports.currencyHedgingPolicy,
           customerPosition: 'Venta moneda extranjera',
        };
};

export const validationIfCompleted = (data) => {
   for (const key in data) {
      if (!data.hasOwnProperty(key)) {
         return false;
      }

      if (key in schemaPCDValidator) {
         if (!schemaPCDValidator[key](data[key])) {
            return false;
         }
      }

      if (!data[key] && data[key] !== 0) {
         return false;
      }
   }

   return true;
};

export const validationIfSaved = (data) => {
   let exceptions = [
      'sourcerOfCredit',
      'coverageIndex',
      'customerPosition',
      'percentageInForeignCurrency',
      'coveragePolicy',
      'annualConsistencyValidation',
      'mpa',
   ];
   for (const key in data) {
      if (data.hasOwnProperty(key) && !exceptions.includes(key)) {
         const valor = data[key];

         if (key in hasDataPCDSchema) {
            if (hasDataPCDSchema[key](valor)) {
               return true;
            }
         } else {
            if (
               valor !== null &&
               valor !== undefined &&
               valor !== 0 &&
               !(typeof valor === 'string' && valor.trim() === '') &&
               !(Array.isArray(valor) && valor.length === 0) &&
               !(typeof valor === 'object' && !Array.isArray(valor) && Object.keys(valor).length === 0)
            )
               return true;
         }
      }
   }

   return false;
};

const isCompletedCreditors = (creditItem) => {
   return templateCommonsPCD.propertiesForCredit.every((property) => {
      const value = creditItem[property];

      if (value === undefined || value === null || value === '' || value === 0) {
         return false;
      }
      return true;
   });
};

const schemaPCDValidator = {
   descriptionOfStrategy: (value) => !isEmpty(value),
   rateCalculator: (data) => areAllObjectFilled(data),
   annualConsistencyValidation: (value) => !isEmpty(value),
   calculatorType: (info) => {
      let { isType, data } = info;
      if (isEmpty(isType) || isEmpty(data)) {
         return false;
      }

      if (!isEmpty(data)) {
         //* Dependiendo del tipo de tasa cambia el key value
         let isVariableKey = isType === 'rate' ? 'rateType' : 'cross';
         return data?.every((value) => !isEmpty(value?.[isVariableKey]) && !isEmpty(value?.porcentage));
      }

      return true;
   },
   customerImports: (info) => {
      let { isType, currencyHedgingPolicy, whatPercentage, ...others } = info;
      if (isEmpty(isType) || isEmpty(currencyHedgingPolicy)) {
         return false;
      }

      let result =
         isType === 'Si' ? isEmpty(whatPercentage) || isEmpty(others.fromWhere) : isEmpty(others.foreignCurrencyInputs);
      return !result;
   },
   customerExports: (info) => {
      let { isType, currencyHedgingPolicy, whatPercentage, ...others } = info;
      if (isEmpty(isType) || isEmpty(currencyHedgingPolicy)) {
         return false;
      }

      let result =
         isType === 'Si'
            ? isEmpty(whatPercentage) || isEmpty(others.toWhere)
            : isEmpty(others.foreignCurrencyDomesticSales);
      return !result;
   },
   customerHasExperience: (info) => {
      let { isType, data } = info;
      if (isEmpty(isType)) {
         return false;
      }

      if (isType === 'No') {
         return true;
      }

      if (isEmpty(data)) {
         return false;
      }

      return data?.every((value) => !isEmpty(value?.counterpart) && !isEmpty(value?.condition));
   },
   creditors: (info) => {
      if (isEmpty(info)) {
         return false;
      }

      return info.every((credit) => isCompletedCreditors(credit));
   },
   whoMadeTheVisit: (info) => {
      if (isEmpty(info)) {
         return false;
      }

      return info?.every((value) => !isEmpty(value?.visitorName) && !isEmpty(value?.visitorPosition));
   },
   news: (info) => {
      if (info?.noNewsWereFound) {
         return true;
      }

      if (isEmpty(info?.positives) || isEmpty(info?.negatives)) {
         return false;
      }

      let positive = info.positives?.every((value) => !isEmpty(value?.description) && !isEmpty(value?.url));

      let negative = info.negatives?.every((value) => !isEmpty(value?.description) && !isEmpty(value?.url));

      return positive && negative;
   },
};

const hasDataPCDSchema = {
   descriptionOfStrategy: (value) => !isEmpty(value),
   rateCalculator: (data) => hasObjectFilled(data, ['requestedLineAmount']),
   calculatorType: (info) => {
      let { isType } = info;
      return !isEmpty(isType);
   },
   customerImports: (info) => {
      let { isType } = info;
      return !isEmpty(isType);
   },
   customerExports: (info) => {
      let { isType } = info;
      return !isEmpty(isType);
   },
   customerHasExperience: (info) => {
      let { isType } = info;
      return !isEmpty(isType);
   },
   creditors: (info) => {
      if (!isEmpty(info)) {
         return hasArrObjectFilled(info);
      }
      return false;
   },
   whoMadeTheVisit: (info) => {
      if (!isEmpty(info)) {
         return hasArrObjectFilled(info);
      }
      return false;
   },
   news: (info) => {
      if (info?.noNewsWereFound) {
         return true;
      }

      if (!isEmpty(info?.positives)) {
         if (hasArrObjectFilled(info.positives)) return true;
      }

      if (!isEmpty(info?.negatives)) {
         if (hasArrObjectFilled(info.negatives)) return true;
      }

      return false;
   },
};
