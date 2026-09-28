import _ from 'lodash';

const parseRevolvencia = {
   semanal: [52, 4],
   quincenal: [26, 2],
   mensual: [12, 1],
   bimestral: [6, 0.5],
   trimestral: [4, 0.333333333333333000000000],
};

export const calcExchangeData = (info, dollar) => {
   try {
      const {
         salesForLastFiscalYear,
         percentageInForeignCurrency,
         coveragePolicy,
         averageTransactionAmount,
         maximumCoverageTermInMonths,
      } = info;
      //? Flujo de moneda extranjera anualizado = [(salesForLastFiscalYear" / Tipo de cambio) * Porcentaje en moneda extranjera]
      info.foreignCurrencyFlow = !_.isEmpty(salesForLastFiscalYear)
         ? (parseInt(salesForLastFiscalYear) / dollar) * (parseInt(percentageInForeignCurrency) / 100)
         : 0;

      //? Posición acumulada estimada anual = [Flujo de moneda extranjera anualizado * Política de cobertura como porcentaje máximo]
      info.estimatedCumulativePosition = parseInt(info.foreignCurrencyFlow) * (parseInt(coveragePolicy) / 100) || 0;

      //? MPA (Máxima posición abierta) = ((Monto promedio por operación * Revolvencia estimada) * Plazo máximo cobertura)
      let revolvency = parseRevolvencia[info.estimatedRevolving] || [0, 0];
      let transactionAmount = !_.isEmpty(averageTransactionAmount) ? parseInt(averageTransactionAmount) : 0;
      info.mpa = transactionAmount * revolvency[1] * maximumCoverageTermInMonths || 0;

      /**
       *? Congruencia válida = [Si la validación de congruencia anual < Posición acumulada estimada anual]
       ** No congruencia = [Si la validación de congruencia anual > Posición acumulada estimada anual]
       */
      let consistency = {};
      consistency['value'] = transactionAmount * parseInt(revolvency[0]) || 0;

      if (consistency.value != 0 && consistency.value < info.estimatedCumulativePosition) {
         consistency['color'] = 'bg-emerald-600';
         consistency['title'] = 'Congruencia válida';
      } else if (consistency.value != 0 && consistency.value > info.estimatedCumulativePosition) {
         consistency['color'] = 'bg-red-500';
         consistency['title'] = 'No congruencia';
      }

      info.annualConsistencyValidation = consistency;

      //? Línea estimada = (MPA * Spread)
      info.estimatedLine = info.mpa * info.spread || 0;

      //? Índice de cobertura anual = ("Congruencia anual" / "Flujo de moneda extranjera anualizado")
      info.coverageIndex = (consistency.value / parseInt(info.estimatedCumulativePosition)) * 100;
   } catch (error) {
      console.error('Error al realizar los calculos en Exchange ', error);
      return info;
   }
};

export const calcRateData = (info, dollar) => {
   try {
      const {
         rateCalculator: { amountOfCredit, pointsToCover, tableDerivaties, requestedLineAmount },
      } = info;
      //? Monto del crédito USD = [Monto del crédito a cubrir / Tipo de cambio]
      info.rateCalculator.amountOfCreditUS = _.isEmpty(amountOfCredit) ? '' : parseInt(amountOfCredit) / dollar;

      // * Se valida si PV01 Mesa y Puntos PV01 son diferentes a vacios
      if (!_.isEmpty(tableDerivaties) && !_.isEmpty(pointsToCover)) {
         //? Línea teórica = PV01 de la mesa de derivados (Puntos) * PV01(Puntos)
         info.rateCalculator.theoreticalLine = parseFloat(tableDerivaties) * parseInt(pointsToCover);

         //? Suficiencia =  [Monto de línea solicitado / (Puntos a cubrir * PV01 proporcionado por la MESA)]
         let porcentage = parseInt(pointsToCover) * parseFloat(tableDerivaties);
         let sufficiency = _.divide(requestedLineAmount, porcentage) * 100;
         info.rateCalculator.sufficiency = sufficiency;

         /**
          *? Validación de congruencia =
          *! "Línea insuficiente, revisar", Color amarillo = [ Suficiencia < 80% ]
          ** "Línea suficiente", Color verde = [ Suficiencia > 80% Y Suficiencia < 110% ]
          *! "Línea excedida", Color rojo = [ Suficiencia > 110% ]
          */
         if (sufficiency <= 80) {
            info.rateCalculator.congruenceCalculator = 3;
         } else if (sufficiency > 80 && sufficiency <= 110) {
            info.rateCalculator.congruenceCalculator = 1;
         } else if (sufficiency > 110) {
            info.rateCalculator.congruenceCalculator = 2;
         } else {
            info.rateCalculator.congruenceCalculator = 0;
         }
      }
   } catch (error) {
      console.error('Error al realizar los calculos en tasa', error);
      return info;
   }
};

export const calcCheckCreditor = (info) => {
   try {
      const { sourcerOfCredit, creditors } = info;
      let amount = 0;
      let amountCover = 0;
      let flag_congruence = 0;

      //* Si alguno de los acreedores no ha seleccionado la naturaleza del crédito no se cuenta la congruencia
      let allHaveTheNOC = creditors.some((cr) => _.isEmpty(cr?.natureOfCredit));
      if (allHaveTheNOC) {
         info.congruenceCreditors = 0;
      } else {
         //TODO Esto sin duda alguna se puede mejorar;
         creditors.forEach((item) => {
            const result = schemaCongruenceValidator[sourcerOfCredit](item);
            amount += result.amount;
            amountCover += parseInt(item?.amountCover) || 0;
            flag_congruence = result.congrounce;
         });

         info.congruenceCreditors = flag_congruence;
      }

      info.valueCongruence = amount - amountCover;
      info.balanceMxn = amount;
   } catch (error) {
      console.error('Error al realizar los calculos en tasa', error);
      return info;
   }
};

const schemaCongruenceValidator = {
   other: (item) => {
      let object = { amount: 0, congrounce: 0 };
      if (!item?.lineAmount || !item?.balanceInNationalCurrency || !item?.amountCover) {
         return object;
      }

      switch (item?.natureOfCredit) {
         case 'revolvente':
            object.congrounce = parseInt(item?.lineAmount) < parseInt(item?.amountCover) ? 2 : 1;
            object.amount = parseInt(item?.lineAmount) || 0;
            break;
         case 'amortizable':
            object.congrounce = parseInt(item?.balanceInNationalCurrency) < parseInt(item?.amountCover) ? 2 : 1;
            object.amount += parseInt(item?.balanceInNationalCurrency) || 0;
            break;
         default:
            object = { amount: 0, congrounce: 0 };
            break;
      }

      return object;
   },
   base: (item) => {
      let object = { amount: 0, congrounce: 0 };
      if (!item?.lineAmount || !item?.balanceInNationalCurrency || !item?.amountCover) {
         return object;
      }

      switch (item?.natureOfCredit) {
         case 'revolvente':
            object.congrounce = parseInt(item?.balanceInNationalCurrency) < parseInt(item?.amountCover) ? 2 : 1;
            object.amount += parseInt(item?.balanceInNationalCurrency) || 0;
            break;
         case 'amortizable':
            object.congrounce = parseInt(item?.lineAmount) < parseInt(item?.amountCover) ? 2 : 1;
            object.amount += parseInt(item?.lineAmount) || 0;
            break;
         default:
            object = { amount: 0, congrounce: 0 };
            break;
      }

      return object;
   },
};
