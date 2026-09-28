import _ from 'lodash';

//* Para el objeto de profileResume no todos los campos son obligatorios. Por lo cual se eliminan para que no se guarde basura en BD
export const templateDerivatives = {
   coverageProfile: {
      calculatorType: {
         isType: '',
         data: [],
      },
      customerImports: {
         isType: '',
         whatPercentage: '',
         fromWhere: '',
         currencyHedgingPolicy: '',
         foreignCurrencyInputs: '',
      },
      customerExports: {
         isType: '',
         whatPercentage: '',
         toWhere: '',
         currencyHedgingPolicy: '',
         foreignCurrencyDomesticSales: '',
      },
      descriptionOfStrategy: '',
      customerHasExperience: {
         isType: '',
         data: [],
      },
   },
   calculatorRate: {
      creditors: [],
      balanceMxn: '',
      valueCongruence: 0,
      congruenceCreditors: 0, // 0 init, 1 congruente, 2 incongruente
      sourcerOfCredit: 'base',
      rateCalculator: {
         amountOfCredit: '',
         amountOfCreditUS: '',
         creditTermValue: '',
         creditTermType: '',
         coverageType: '',
         amortizationStyle: '',
         tableDerivaties: '',
         pointsToCover: '',
         swapRate: '',
         theoreticalLine: '',
         requestedLineAmount: '',
         sufficiency: '',
         congruenceCalculator: 0,
      },
   },
   calculatorRateExchange: {
      customerPosition: '',
      salesForLastFiscalYear: '',
      percentageInForeignCurrency: '',
      foreignCurrencyFlow: '',
      coveragePolicy: '',
      estimatedCumulativePosition: '',
      coverageIndex: '',
      averageTransactionAmount: '',
      estimatedRevolving: '',
      maximumCoverageTermInMonths: '',
      mpa: '',
      spread: '',
      estimatedLine: '',
      annualConsistencyValidation: {
         value: '',
         color: 'bg-gray',
         title: '',
      },
   },
   profileResume: {
      mainBusinessActivity: '',
      whoTargetYouServicesOrProducts: '',
      presence: '',
      productsAndServicesSold: '',
      brands: '',
      mainCustomers: '',
      mainSuppliers: '',
      bussinesCyclicality: '',
      strategicAlliancesOrPartners: '',
      whoMadeTheVisit: [],
      whoVisitedName: '',
      whoVisitedPosition: '',
      numberOfEmployees: '',
      physicalConditionOfTheFacilities: '',
      physicalContionOfInventoriesAndObsolescences: '',
      news: {
         positives: [],
         negatives: [],
         noNewsWereFound: false,
      },
      industryRisksDetected: '',
      competitiveAdvantageOrDifferentiator: '',
      additionalCommentsOrProjectsInThePipeline: '',
      perceptionOfTheCompanysManagement: '',
      whosePerceptionIsCollected: '',
      whyYouDOrecommendTheCompany: '',
   },
   version: 2,
};

/**
 * @typedef {object} CongruenceCalculator
 * @property {string} label - Etiqueta descriptiva para el estado de congruencia
 * @property {string} color - Clase de color TailwindCSS para el estado de congruencia
 * */

/**
 * @typedef {object} CardConfig
 * @property {string} attribute - El atributo clave para la tarjeta.
 * @property {string} component - El nombre del componente React a renderizar para la tarjeta.
 * @property {number} limit - El número límite de elementos a mostrar para las tarjetas.
 * @property {string} [sxCard] - Clases CSS opcionales para aplicar al estilo de la tarjeta.
 * @property {object} [sxGneral] - Estilos CSS generales opcionales.
 * @property {string} [sxGeneral.container] - Clases CSS para el contenedor general
 * @property {string} [sxGeneral.add] - Clases CSS para el botón agregar.
 */

/**
 * @typedef {object} StepConfig
 * @property {number} step - Número del paso o sección actual.
 * @property {string} title - Título del paso o sección actual
 */

/**
 * @typedef {object} ValidationRule
 * @property {function(object): boolean} conditional: Función condicional que retorna un booleano basado en los datos.
 * @property {string} attr - Atributo relevante para la validación.
 * */

/**
 *  @typedef {object} EnumConfig
 *  @property {number} COVERAGE -
 *  @property {number} CALCULATORS -
 *  @property {number} SUMMARY -
 */

/**
 * Constante que agrupa configuraciones iniciales y datos derivados para la aplicación.
 * Incluye configuraciones para las calculadoras de congruencia, tarjetas UI, secciones,
 * títulos y reglas de validación.
 *
 * @type {Object}
 * @property {Object.<number, CongruenceCalculator>} congruenceCalculator - Mapeo de estados numéricos a etiquetas y colores para el cálculo de congruencia.
 * @property {object} cards - Configuraciones para diferentes tipos de tarjetas de UI.
 * @property {CardConfig} cards.creditors - Configuración para la tarjeta acreedores.
 * @property {CardConfig} cards.experience - Configuración para la tarjeta de experiencia del cliente.
 * @property {CardConfig} cards.rate - Configuración para la tarjeta tasa.
 * @property {CardConfig} cards.typechange - Configuración para la tarjeta tipo de cambio.
 * @property {CardConfig} cards.visitors - Configuración para la tarjeta visitante.
 * @property {string[]} pages - Lista de nombres de secciones disponibles en la pantalla PCD.
 * @property {StepConfig[]} steps - Definición de los pasos del flujo de la pantalla PCD.
 * @property {object} validationsRules - Reglas de validación para los diferentes tipos flujos.
 * @property {object} validationsRules.base - reglas de validación para banco BASE.
 * @property {EnumConfig} Enum - Enumeración de los pasos principales de la pantalla PCD.
 */
export const initDerivatives = {
   congruenceCalculator: {
      0: {
         label: '',
         color: 'bg-gray',
      },
      1: {
         label: 'Línea suficiente',
         color: 'bg-emerald-600',
      },
      2: {
         label: 'Línea excedida',
         color: 'bg-red-500',
      },
      3: {
         label: 'Línea insuficiente, revisar',
         color: 'bg-yellow-500',
      },
   },
   cards: {
      creditors: {
         attribute: 'creditors',
         component: 'CardCreditorItem',
         limit: 10,
         index: ['CRD1', 'CRD2', 'CRD3', 'CRD4', 'CRD5', 'CRD6', 'CRD7', 'CRD8', 'CRD9', 'CRD10'],
         sxCard: 'box-border relative w-full border rounded border-gray',
         sxGeneral: { container: 'flex flex-col h-auto gap-4', add: 'absolute bottom-[-2rem] left-[50%]' },
      },
      experience: {
         attribute: 'customerHasExperience',
         component: 'CardExperienceItem',
         limit: 5,
         index: ['CST1', 'CST2', 'CST3', 'CST4', 'CST5'],
         sxCard: '',
      },
      rate: {
         attribute: 'calculatorType',
         component: 'CardRateItem',
         limit: 2,
         index: ['RT1', 'RT2'],
         sxCard: '',
      },
      typechange: {
         attribute: 'calculatorType',
         component: 'CardExchangeItem',
         limit: 5,
         index: ['EXC1', 'EXC2', 'EXC3', 'EXC4', 'EXC5'],
         sxCard: '',
      },
      visitors: {
         attribute: 'whoMadeTheVisit',
         component: 'CardVisitorsItem',
         limit: 5,
         index: ['VST1', 'VST2', 'VST3', 'VST4', 'VST5'],
         sxCard: 'flex-none w-[18rem] box-border ring-gray relative',
      },
   },
   pages: ['coverageProfile', 'calculatorRate', 'calculatorRateExchange', 'profileResume'],
   steps: [
      {
         step: 1,
         title: 'Perfil de cobertura',
      },
      {
         step: 2,
         title: 'Calculadora de parámetros',
      },
      {
         step: 3,
         title: 'Resumen de perfil',
      },
   ],
   title: {
      1: 'Perfil de cobertura',
      2: 'Calculadora de parámetros',
      3: 'Resumen de perfil',
   },
   validationRules: {
      base: {
         revolvente: {
            conditional: (data) => fnCalculateRule(data?.amountCover, data?.balanceInNationalCurrency),
            attr: 'balanceInNational',
         },
         amortizable: {
            conditional: (data) => fnCalculateRule(data?.amountCover, data?.lineAmount),
            attr: 'lineAmount',
         },
      },
      other: {
         revolvente: {
            conditional: (data) => fnCalculateRule(data?.amountCover, data?.lineAmount),
            attr: 'lineAmount',
         },
         amortizable: {
            conditional: (data) => fnCalculateRule(data?.amountCover, data?.balanceInNationalCurrency),
            attr: 'balanceInNational',
         },
      },
   },
   Enum: {
      LOAD_INFORMATION: 0,
      COVERAGE: 1,
      CALCULATORS: 2,
      SUMMARY: 3,
   },
};

export const templateCommonsPCD = {
   propertiesForCredit: [
      'amountCover',
      'balanceInNationalCurrency',
      'creditor',
      'expirationMonth',
      'expirationYear',
      'grantMonth',
      'lineAmount',
      'natureOfCredit',
      'termToCover',
      'typeOfCredit',
      'yearOfGrant',
   ],
};

export const EnumCongruence = {
   INIT_CONGRUENCE: 0,
   SUFFICIENCY: 1,
   EXCEEDED: 2,
   INSUFFICIENCY: 3,
};

export const crossingsListCP = [
   'BRLJPY',
   'BRLMXN',
   'CADBRL',
   'CADJPY',
   'CADMXN',
   'EURBRL',
   'EURCAD',
   'EURGBP',
   'EURJPY',
   'EURMXN',
   'EURUSD',
   'GBPBRL',
   'GBPCAD',
   'GBPJPY',
   'GBPMXN',
   'GBPUSD',
   'JPYMXN',
   'UDIMXN',
   'USDBRL',
   'USDCAD',
   'USDJPY',
   'USDMXN',
];

export const typeCreditList = {
   revolvente: [
      'RENOVADOS',
      'REDESCUENTO',
      'O. REDESCUENTO',
      'T. CRED. EMPRESARIAL CORPORATIVA',
      'CARTAS DE CREDITO',
      'ANT.A.C.P.P.FACTORAJE',
      'CARTAS DE CRÉDITOS NO DISPUESTAS',
      'TARJETA DE SERVICIO',
      'LÍNEA DE CRÉDITO',
   ],
   amortizable: [
      'QUIROG',
      'PRENDAR',
      'SIMPLE',
      'P.G.U.I.',
      'HABILITACION',
      'REFACC',
      'I.E.P.B.S.',
      'VIVIENDA',
      'O.C. GARANTIA INMOB',
      'C.V.A.',
      'ARREN VIGENTE',
      'ARREN SINDICADO',
      'ARREND',
      'PRESTAMOS C/FIDEICOMISOS GARANTÍA',
      'ADEUDOS POR AVAL',
      'CRÉDITO AUTOMOTRIZ',
      'FIDEICOMISOS PLANTA PRODUCTIVA',
   ],
};

export class DerivativesClass {
   formatStep = {
      0: (data) => {
         return { needsHistory: data.needsHistory };
      },
      1: (data, typeCalculator) => {
         let obj = {
            coverageProfile: JSON.stringify(data?.coverageProfile),
         };

         if (typeCalculator) {
            let howCalculator = typeCalculator === 'typechange' ? 'calculatorRateExchange' : 'calculatorRate';
            obj[howCalculator] = JSON.stringify(data[howCalculator]);
         }

         return obj;
      },
      2: (data, typeCalculator) => {
         let howCalculator = typeCalculator === 'typechange' ? 'calculatorRateExchange' : 'calculatorRate';
         return {
            [howCalculator]: JSON.stringify(data[howCalculator]),
         };
      },
      3: (data) => ({
         profileResume: JSON.stringify(data.profileResume),
      }),
   };

   status = {
      INCOMPLETO: 14,
      FINALIZADO: 15,
   };

   constructor(data, step, userSession) {
      this.body = '';
      this.initialization(data, step, userSession);
   }

   initialization(data, step, modifyUser) {
      const { isCompleted, selectedCalculator, idRequest, veracity } = data;
      const _section = this.formatStep[step](data, selectedCalculator);
      this.body = {
         idRequest,
         ..._section,
         idStatus: isCompleted ? this.status.FINALIZADO : this.status.INCOMPLETO,
         modifyUser,
         veracity,
      };
   }
}

const fnCalculateRule = (val1, val2) => {
   if (_.isEmpty(val1) || _.isEmpty(val2)) {
      return true;
   }

   return parseInt(val1) <= parseInt(val2);
};
