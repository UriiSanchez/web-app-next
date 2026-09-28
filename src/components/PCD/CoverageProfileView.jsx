import _ from 'lodash';

import { CardGenericContainer } from './Controls/CardGenericContainer';
import { IncompleteSectionAlert } from './Controls/IncompleteSectionAlert';
import { CustomPercentage } from '../Controls';
import { cleanAttributeForObject, getClassInput, onKeyNumbers, onPasteOnlyNumbers } from '../../helpers';

export const CoverageProfileView = ({ info, onUpdateData, isDisabled = true, isSave, isComplete }) => {
   const onChangeVirtual = (e, attribute) => {
      let { name, value, type } = e.target;
      let newInfo = structuredClone(info);
      let newName = name.includes('isType') ? name.split('-')[0] : name;
      if (type == 'number') {
         const regex = /^.{0,3}$/;
         if (!regex.test(value) || value > 100) {
            return;
         }
      }

      let findAttribute = newInfo[attribute];
      if (_.isObject(findAttribute)) {
         let setObj = name.includes('isType') ? cleanAttributeForObject(findAttribute) : findAttribute;
         newInfo[attribute] = { ...setObj, [newName]: value };
      } else {
         newInfo[newName] = value;
      }

      onUpdateData('coverageProfile', newInfo);
   };

   const handleSetData = (newData, attribute) => {
      let newInfo = structuredClone(info);
      newInfo[attribute].data = newData;
      onUpdateData('coverageProfile', newInfo);
   };

   return (
      <section className='relative px-8 pb-8'>
         <h1 className='text-xl font-semibold text-black-light'>Perfil de cobertura</h1>
         <p className='font-light text-gray-500'>Completa y responde las preguntas para completar esta sección</p>
         {isSave && !isComplete && <IncompleteSectionAlert />}
         <form id='form-coverage' className='mt-8 ml-6'>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 1.</span>
                  &nbsp;¿Cuál es el tipo de subyacente a cubrir?
               </p>
               <div className='flex flex-col gap-2 my-4 ml-5'>
                  <label htmlFor='rate' className='w-1/5 cursor-pointer select-none'>
                     <input
                        id='rate'
                        data-testid='rate'
                        type='radio'
                        name='isType-0'
                        value='rate'
                        disabled={isDisabled}
                        checked={info?.calculatorType?.isType == 'rate'}
                        onChange={(e) => onChangeVirtual(e, 'calculatorType')}
                        className={`radio option-input ${getClassInput(
                           info?.calculatorType?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     Tasa
                  </label>
                  <label htmlFor='typechange' className='w-1/5 cursor-pointer select-none'>
                     <input
                        id='typechange'
                        data-testid='typechange'
                        type='radio'
                        name='isType-0'
                        value='typechange'
                        disabled={isDisabled}
                        checked={info?.calculatorType?.isType == 'typechange'}
                        onChange={(e) => onChangeVirtual(e, 'calculatorType')}
                        className={`radio option-input ${getClassInput(
                           info?.calculatorType?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     Tipo de cambio
                  </label>
               </div>
               {!_.isEmpty(info?.calculatorType?.isType) && (
                  <>
                     <h4 className='mb-4'>
                        {info?.calculatorType?.isType == 'rate' ? (
                           <>
                              Modalidad de cobertura de tasa&nbsp;
                              <span className='text-gray-300'>
                                 (la sumatoria de tus tasas no deberá sobrepasar el 100%)
                              </span>
                           </>
                        ) : (
                           'Tipo de subyacente: Cruces de divisas a operar'
                        )}
                     </h4>
                     <CardGenericContainer
                        item={info?.calculatorType?.data}
                        onSetData={handleSetData}
                        attribute={info?.calculatorType?.isType}
                        disabled={isDisabled}
                        isSave={isSave}
                     />
                  </>
               )}
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 2.</span>
                  &nbsp;¿El cliente realiza importaciones?
               </p>
               <div className='flex flex-col gap-2 my-4 ml-5'>
                  <label htmlFor='imports-0' className='w-20 cursor-pointer select-none'>
                     <input
                        id='imports-0'
                        data-testid='imports-0'
                        type='radio'
                        name='isType-1'
                        value='Si'
                        disabled={isDisabled}
                        checked={info?.customerImports?.isType == 'Si'}
                        onChange={(e) => onChangeVirtual(e, 'customerImports')}
                        className={`radio option-input ${getClassInput(
                           info?.customerImports?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     Sí
                  </label>
                  <label htmlFor='imports-1' className='w-20 cursor-pointer select-none'>
                     <input
                        id='imports-1'
                        data-testid='imports-1'
                        type='radio'
                        name='isType-1'
                        value='No'
                        disabled={isDisabled}
                        checked={info?.customerImports?.isType == 'No'}
                        onChange={(e) => onChangeVirtual(e, 'customerImports')}
                        className={`radio option-input ${getClassInput(
                           info?.customerImports?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     No
                  </label>
               </div>
               {!_.isEmpty(info?.customerImports?.isType) && (
                  <div className='flex items-center gap-4 px-4 pt-2 pb-5 fadeIn'>
                     {info?.customerImports?.isType == 'Si' ? (
                        <>
                           <p>¿Qué porcentaje? </p>
                           <CustomPercentage
                              id='whatPercentage'
                              data-testid='import-whatPercentage'
                              name='whatPercentage'
                              type='number'
                              min={0}
                              max={100}
                              placeholder='0'
                              disabled={isDisabled}
                              value={info?.customerImports?.whatPercentage || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerImports')}
                              onPaste={onPasteOnlyNumbers}
                              onKeyDown={onKeyNumbers}
                              className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                              sxContainer={getClassInput(info?.customerImports?.whatPercentage, isDisabled, isSave)}
                           />
                           <p>De dónde:</p>
                           <input
                              id='fromWhere'
                              data-testid='fromWhere'
                              name='fromWhere'
                              type='text'
                              placeholder='Escribe el lugar'
                              maxLength={100}
                              disabled={isDisabled}
                              value={info?.customerImports?.fromWhere || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerImports')}
                              className={`flex-none ml-1 text-sm text-center w-60 h-9 input-form ${getClassInput(
                                 info?.customerImports?.fromWhere,
                                 isDisabled,
                                 isSave
                              )}`}
                           />
                        </>
                     ) : (
                        <>
                           <p>Insumos en moneda extranjera: </p>
                           <CustomPercentage
                              id='foreignCurrencyInputs'
                              data-testid='import-foreignCurrency'
                              name='foreignCurrencyInputs'
                              type='number'
                              min={0}
                              max={100}
                              placeholder='0'
                              maxLength={3}
                              disabled={isDisabled}
                              value={info?.customerImports?.foreignCurrencyInputs || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerImports')}
                              onPaste={onPasteOnlyNumbers}
                              onKeyDown={onKeyNumbers}
                              className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                              sxContainer={getClassInput(
                                 info?.customerImports?.foreignCurrencyInputs,
                                 isDisabled,
                                 isSave
                              )}
                           />
                        </>
                     )}
                     <p>Política de cobertura de divisas: </p>
                     <CustomPercentage
                        id='currencyHedgingPolicy'
                        data-testid='import-currencyHedgingPolicy'
                        name='currencyHedgingPolicy'
                        type='number'
                        min={0}
                        max={100}
                        placeholder='0'
                        disabled={isDisabled}
                        value={info?.customerImports?.currencyHedgingPolicy || ''}
                        onChange={(e) => onChangeVirtual(e, 'customerImports')}
                        onPaste={onPasteOnlyNumbers}
                        onKeyDown={onKeyNumbers}
                        className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                        sxContainer={getClassInput(info?.customerImports?.currencyHedgingPolicy, isDisabled, isSave)}
                     />
                  </div>
               )}
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 3.</span>
                  &nbsp;¿El cliente realiza exportaciones?
               </p>
               <div className='flex flex-col gap-2 my-4 ml-5'>
                  <label htmlFor='exports-0' className='w-20 cursor-pointer select-none'>
                     <input
                        id='exports-0'
                        data-testid='exports-0'
                        type='radio'
                        name='isType-2'
                        value='Si'
                        disabled={isDisabled}
                        checked={info?.customerExports?.isType === 'Si'}
                        onChange={(e) => onChangeVirtual(e, 'customerExports')}
                        className={`radio option-input ${getClassInput(
                           info?.customerExports?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     Sí
                  </label>
                  <label htmlFor='exports-1' className='w-20 cursor-pointer select-none'>
                     <input
                        id='exports-1'
                        data-testid='exports-1'
                        type='radio'
                        name='isType-2'
                        value='No'
                        disabled={isDisabled}
                        checked={info?.customerExports?.isType === 'No'}
                        onChange={(e) => onChangeVirtual(e, 'customerExports')}
                        className={`radio option-input ${getClassInput(
                           info?.customerExports?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     No
                  </label>
               </div>
               {!_.isEmpty(info?.customerExports?.isType) && (
                  <div className='flex items-center gap-4 px-4 pt-2 pb-5 fadeIn'>
                     {info?.customerExports?.isType === 'Si' ? (
                        <>
                           <p>¿Qué porcentaje? </p>
                           <CustomPercentage
                              id='whatPercentage'
                              data-testid='exports-whatPercentage'
                              name='whatPercentage'
                              type='number'
                              min={0}
                              max={100}
                              placeholder='0'
                              disabled={isDisabled}
                              value={info?.customerExports?.whatPercentage || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerExports')}
                              onPaste={onPasteOnlyNumbers}
                              onKeyDown={onKeyNumbers}
                              className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                              sxContainer={getClassInput(info?.customerExports?.whatPercentage, isDisabled, isSave)}
                           />
                           <p>A dónde:</p>
                           <input
                              id='toWhere'
                              data-testid='toWhere'
                              name='toWhere'
                              type='text'
                              placeholder='Escribe el lugar'
                              maxLength={100}
                              disabled={isDisabled}
                              value={info?.customerExports?.toWhere || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerExports')}
                              className={`flex-none text-sm text-center h-9 w-60 input-form ${getClassInput(
                                 info?.customerExports?.toWhere,
                                 isDisabled,
                                 isSave
                              )}`}
                           />
                        </>
                     ) : (
                        <>
                           <p>Ventas nacionales en moneda extranjera: </p>
                           <CustomPercentage
                              id='foreignCurrencyDomesticSales'
                              data-testid='export-foreignCurrency'
                              name='foreignCurrencyDomesticSales'
                              type='number'
                              min={0}
                              max={100}
                              placeholder='0'
                              disabled={isDisabled}
                              value={info?.customerExports?.foreignCurrencyDomesticSales || ''}
                              onChange={(e) => onChangeVirtual(e, 'customerExports')}
                              onPaste={onPasteOnlyNumbers}
                              onKeyDown={onKeyNumbers}
                              className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                              sxContainer={getClassInput(
                                 info?.customerExports?.foreignCurrencyDomesticSales,
                                 isDisabled,
                                 isSave
                              )}
                           />
                        </>
                     )}
                     <p>Política de cobertura de divisas: </p>
                     <CustomPercentage
                        id='currencyHedgingPolicy'
                        data-testid='export-currencyHedgingPolicy'
                        name='currencyHedgingPolicy'
                        type='number'
                        min={0}
                        max={100}
                        placeholder='0'
                        disabled={isDisabled}
                        value={info?.customerExports?.currencyHedgingPolicy || ''}
                        onChange={(e) => onChangeVirtual(e, 'customerExports')}
                        onPaste={onPasteOnlyNumbers}
                        onKeyDown={onKeyNumbers}
                        className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
                        sxContainer={getClassInput(info?.customerExports?.currencyHedgingPolicy, isDisabled, isSave)}
                     />
                  </div>
               )}
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 4.</span>
                  &nbsp;Descripción de la estrategia de cobertura
               </p>
               <textarea
                  id='descriptionOfStrategy'
                  data-testid='descriptionOfStrategy'
                  name='descriptionOfStrategy'
                  placeholder='Escribe aquí la estrategia...'
                  value={info?.descriptionOfStrategy || ''}
                  disabled={isDisabled}
                  onChange={(e) => onChangeVirtual(e, 'descriptionOfStrategy')}
                  maxLength={500}
                  className={`px-4 py-2.5 h-32 max-h-32 text-sm w-1/2 gap-2 my-4 ml-5 input-form ${getClassInput(
                     info?.descriptionOfStrategy,
                     isDisabled,
                     isSave
                  )}`}
               />
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 5.</span>
                  &nbsp;¿El cliente tiene experiencia con derivados?
               </p>
               <div className='flex flex-col gap-2 my-4 ml-5'>
                  <label htmlFor='experience-0' className='w-20 cursor-pointer select-none'>
                     <input
                        id='experience-0'
                        data-testid='experience-0'
                        type='radio'
                        name='isType-3'
                        value='Si'
                        disabled={isDisabled}
                        checked={info?.customerHasExperience?.isType == 'Si'}
                        onChange={(e) => onChangeVirtual(e, 'customerHasExperience')}
                        className={`radio option-input ${getClassInput(
                           info?.customerHasExperience?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     Sí
                  </label>
                  <label htmlFor='experience-1' className='w-20 cursor-pointer select-none'>
                     <input
                        id='experience-1'
                        data-testid='experience-1'
                        type='radio'
                        name='isType-3'
                        value='No'
                        disabled={isDisabled}
                        checked={info?.customerHasExperience?.isType == 'No'}
                        onChange={(e) => onChangeVirtual(e, 'customerHasExperience')}
                        className={`radio option-input ${getClassInput(
                           info?.customerHasExperience?.isType,
                           isDisabled,
                           isSave
                        )}`}
                     />
                     No
                  </label>
               </div>
               {info?.customerHasExperience?.isType === 'Si' && (
                  <>
                     <h4 className='mb-4 font-bold'>
                        Instituciones financieras con las que opera el cliente. (máx. 5 instituciones)
                     </h4>
                     <CardGenericContainer
                        item={info?.customerHasExperience?.data}
                        onSetData={handleSetData}
                        attribute='experience'
                        disabled={isDisabled}
                        isSave={isSave}
                     />
                  </>
               )}
            </div>
         </form>
      </section>
   );
};
