import _ from 'lodash';
import { Fragment, useMemo } from 'react';

import { Tooltip, NumericInput } from '../../../../components/Controls';
import { tooltipGB, constSectionsGB, constConceptsGB, formatMoneyMiles } from '../../../../helpers';
import { calcDiffPasivoFinVsBuroPercentage } from '../../../../helpers/calculates';

export default function ItemBalance({ info, fnSet, disabled }) {
   const { PASIVO_BURO_DE_CRED, DIFF_PASIVO_FIN_VS_BC, PASIVO_FINANCIERO } = constConceptsGB;

   const pasivosFinancieros = useMemo(
      () =>
         info?.periods?.map((period) => period.concepts.find(({ idItemChild }) => idItemChild === PASIVO_FINANCIERO)),
      [PASIVO_FINANCIERO, info?.periods]
   );

   const filterByIdItem =
      (section) =>
      ({ idItem }) =>
         idItem === section.idItem;

   const isPasivoBuro = (idItemChild) => idItemChild === PASIVO_BURO_DE_CRED;
   const isDiffPasivoVsBc = (idItemChild) => idItemChild === DIFF_PASIVO_FIN_VS_BC;
   const showInfo = (concept) => {
      let info;
      if (!_.isEmpty(concept.value)) {
         info = formatMoneyMiles(concept.value, 5);
      } else {
         info = isPasivoBuro(concept.idItemChild) ? 'null' : 'N/A';
      }
      return info;
   };

   return constSectionsGB.map((section) => (
      <Fragment key={section.idItem}>
         {section.title && <div className='px-4 text-lg xl:text-2xl'>{section.title}</div>}
         {section.subTitle && (
            <div className='w-full px-4 py-2 text-white bg-black rounded-md rounded-b-none'>{section.subTitle}</div>
         )}
         <div className='pl-8 pr-8 space-y-2'>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  {info?.periods[0]?.concepts
                     ?.filter(filterByIdItem(section))
                     .map(({ description, toolTip, idItemChild }) => (
                        <div key={idItemChild} className='flex items-center justify-end col-span-1 gap-2 text-right'>
                           {description}
                           {toolTip && <Tooltip msg={tooltipGB[idItemChild] || ''} />}
                        </div>
                     ))}
               </div>
               {info?.periods?.map((period, index) => (
                  <div key={`${period.year}-${period.periodType}-item`} className='grid items-center grid-cols-1 gap-2'>
                     {period?.concepts?.filter(filterByIdItem(section)).map((concept) => (
                        <div key={concept.idItemChild} className='flex items-center justify-end col-span-1 gap-2'>
                           {isPasivoBuro(concept.idItemChild) || isDiffPasivoVsBc(concept.idItemChild) ? (
                              <label
                                 className={`flex-auto w-full text-sm ${
                                    isDiffPasivoVsBc(concept.idItemChild) &&
                                    calcDiffPasivoFinVsBuroPercentage(concept.value, pasivosFinancieros[index]?.value) >
                                       5
                                       ? 'text-red-500'
                                       : 'text-black'
                                 } bg-[#f2f2f2] flex items-center justify-center border rounded-md outline-none border-black-500 h-9`}>
                                 {showInfo(concept)}
                              </label>
                           ) : (
                              <NumericInput
                                 allowNegative={true}
                                 disabled={disabled || concept.automatic}
                                 onChange={(value) => fnSet(value, index, concept.idItemChild)}
                                 percentage={concept.percentage}
                                 percentageId={`period${index}-percentage-${concept.idItemChild}`}
                                 value={concept.value}
                                 valueId={`period${index}-value-${concept.idItemChild}`}
                                 viewDecimals={disabled || concept.idItemChild === constConceptsGB.PASIVO_FINANCIERO}
                                 withPercentage={section.idItem != 117}
                              />
                           )}
                        </div>
                     ))}
                  </div>
               ))}
            </div>
         </div>
      </Fragment>
   ));
}
