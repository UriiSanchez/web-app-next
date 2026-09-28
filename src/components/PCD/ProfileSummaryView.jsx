import { CardGenericContainer } from './Controls/CardGenericContainer';
import { NewsContainer } from './Controls/NewsContainer';
import { IncompleteSectionAlert } from './Controls/IncompleteSectionAlert';
import { getClassInput } from '../../helpers';

export const ProfileSummaryView = ({ info, onUpdateData, isDisabled, isSave, isComplete }) => {
   const onChangeVirtual = (e) => {
      const { name, value } = e.target;
      let setName = name.split('-')[0];
      onUpdateData('profileResume', { ...info, [setName]: value });
   };

   const handleSetData = (newData, attribute) => {
      onUpdateData('profileResume', { ...info, [attribute]: newData });
   };

   return (
      <div className='flex flex-col px-8'>
         <h1 className='text-xl font-semibold text-black-light'>Perfil del Cliente</h1>
         <p className='pb-3 text-sm font-light text-gray-500'>Completa la información referente al Cliente</p>
         {isSave && !isComplete && <IncompleteSectionAlert />}
         <form id='form-summary' className='flex flex-col gap-4 py-4 ml-6'>
            <div className='flex flex-col w-full grid-cols-2 gap-4'>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 1.</span>&nbsp;Definición de modelo de negocio
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='mainBusinessActivity' className='select-none'>
                        Actividad principal del negocio
                     </label>
                     <textarea
                        id='mainBusinessActivity'
                        data-testid='mainBusinessActivity'
                        name='mainBusinessActivity'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.mainBusinessActivity || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.mainBusinessActivity,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='whoTargetYouServicesOrProducts' className='select-none'>
                        ¿A quién va dirigidos sus productos o servicios?
                     </label>
                     <textarea
                        id='whoTargetYouServicesOrProducts'
                        data-testid='whoTargetYouServicesOrProducts'
                        name='whoTargetYouServicesOrProducts'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.whoTargetYouServicesOrProducts || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.whoTargetYouServicesOrProducts,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col col-span-2 gap-2'>
                     <p className='select-none'>Presencia:</p>
                     <label htmlFor='local' className='w-1/6 cursor-pointer select-none radio'>
                        <input
                           id='local'
                           data-testid='local'
                           name='presence-group'
                           type='radio'
                           value='local'
                           disabled={isDisabled}
                           checked={info?.presence == 'local'}
                           onChange={onChangeVirtual}
                           className={`radio option-input ${getClassInput(info?.presence, isDisabled, isSave)}`}
                        />
                        Local
                     </label>
                     <label htmlFor='regional' className='w-1/6 cursor-pointer select-none radio'>
                        <input
                           id='regional'
                           data-testid='regional'
                           name='presence-group'
                           type='radio'
                           value='regional'
                           disabled={isDisabled}
                           checked={info?.presence == 'regional'}
                           onChange={onChangeVirtual}
                           className={`radio option-input ${getClassInput(info?.presence, isDisabled, isSave)}`}
                        />
                        Regional
                     </label>
                     <label htmlFor='national' className='w-1/6 cursor-pointer select-none radio'>
                        <input
                           id='national'
                           data-testid='national'
                           name='presence-group'
                           type='radio'
                           value='national'
                           disabled={isDisabled}
                           checked={info?.presence == 'national'}
                           onChange={onChangeVirtual}
                           className={`radio option-input ${getClassInput(info?.presence, isDisabled, isSave)}`}
                        />
                        Nacional
                     </label>
                     <label htmlFor='international' className='w-1/6 cursor-pointer select-none radio'>
                        <input
                           id='international'
                           data-testid='international'
                           name='presence-group'
                           type='radio'
                           value='international'
                           disabled={isDisabled}
                           checked={info?.presence == 'international'}
                           onChange={onChangeVirtual}
                           className={`radio option-input ${getClassInput(info?.presence, isDisabled, isSave)}`}
                        />
                        Internacional
                     </label>
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='productsAndServicesSold' className='select-none'>
                        Productos y servicios que vende
                     </label>
                     <textarea
                        id='productsAndServicesSold'
                        data-testid='productsAndServicesSold'
                        name='productsAndServicesSold'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.productsAndServicesSold || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.productsAndServicesSold,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='brands' className='select-none'>
                        Marcas
                     </label>
                     <textarea
                        id='brands'
                        data-testid='brands'
                        name='brands'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        value={info?.brands || ''}
                        disabled={isDisabled}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.brands,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='mainCustomers' className='select-none'>
                        Principales clientes
                     </label>
                     <textarea
                        id='mainCustomers'
                        data-testid='mainCustomers'
                        name='mainCustomers'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        value={info?.mainCustomers || ''}
                        disabled={isDisabled}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.mainCustomers,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='mainSuppliers' className='select-none'>
                        Principales proveedores
                     </label>
                     <textarea
                        id='mainSuppliers'
                        data-testid='mainSuppliers'
                        name='mainSuppliers'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.mainSuppliers || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.mainSuppliers,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='bussinesCyclicality' className='select-none'>
                        Ciclicidad del negocio
                     </label>
                     <textarea
                        id='bussinesCyclicality'
                        data-testid='bussinesCyclicality'
                        name='bussinesCyclicality'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.bussinesCyclicality || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.bussinesCyclicality,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='strategicAlliancesOrPartners' className='select-none'>
                        Alianzas o socios estratégicos
                     </label>
                     <textarea
                        id='strategicAlliancesOrPartners'
                        data-testid='strategicAlliancesOrPartners'
                        name='strategicAlliancesOrPartners'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.strategicAlliancesOrPartners || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.strategicAlliancesOrPartners,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <h2 className='my-5 text-xl text-black-900'>Resultados de la visita</h2>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 1.</span>&nbsp;¿Quién realizo la visita?
               </p>
               <CardGenericContainer
                  item={info?.whoMadeTheVisit}
                  onSetData={handleSetData}
                  attribute='visitors'
                  disabled={isDisabled}
                  isSave={isSave}
               />
            </div>
            <div className='flex flex-wrap w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 2.</span>&nbsp;¿A quién se realizó la visita?
               </p>
               <div className='grid w-1/2 grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col '>
                     <label htmlFor='whoVisitedName' className='mb-3 select-none'>
                        Nombre
                     </label>
                     <input
                        id='whoVisitedName'
                        data-testid='whoVisitedName'
                        name='whoVisitedName'
                        type='text'
                        maxLength='200'
                        disabled={isDisabled}
                        placeholder='Escribe aquí...'
                        value={info?.whoVisitedName || ''}
                        onChange={onChangeVirtual}
                        className={`flex-auto w-full px-2 text-sm h-9 input-form ${getClassInput(
                           info?.whoVisitedName,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col '>
                     <label htmlFor='whoVisitedPosition' className='mb-3 select-none'>
                        Puesto
                     </label>
                     <input
                        id='whoVisitedPosition'
                        data-testid='whoVisitedPosition'
                        name='whoVisitedPosition'
                        type='text'
                        maxLength='200'
                        disabled={isDisabled}
                        placeholder='Escribe aquí...'
                        value={info?.whoVisitedPosition || ''}
                        onChange={onChangeVirtual}
                        className={`flex-auto w-full px-2 text-sm h-9 input-form ${getClassInput(
                           info?.whoVisitedPosition,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 3.</span>&nbsp;Número de empleados (operativos
                  y administrativos)
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <label htmlFor='small' className='w-3/6 cursor-pointer select-none radio'>
                        <input
                           id='small'
                           data-testid='small'
                           name='numberOfEmployees-group'
                           type='radio'
                           value='small'
                           disabled={isDisabled}
                           checked={info?.numberOfEmployees == 'small'}
                           onChange={onChangeVirtual}
                           className={`radio w-full option-input ${getClassInput(
                              info?.numberOfEmployees,
                              isDisabled,
                              isSave
                           )}`}
                        />
                        31-100 (Pequeña)
                     </label>
                     <label htmlFor='middle' className='w-3/6 cursor-pointer select-none radio'>
                        <input
                           id='middle'
                           data-testid='middle'
                           type='radio'
                           name='numberOfEmployees-group'
                           value='middle'
                           disabled={isDisabled}
                           checked={info?.numberOfEmployees == 'middle'}
                           onChange={onChangeVirtual}
                           className={`radio w-full option-input ${getClassInput(
                              info?.numberOfEmployees,
                              isDisabled,
                              isSave
                           )}`}
                        />
                        101 -500 (Mediana)
                     </label>
                     <label htmlFor='big' className='w-3/6 cursor-pointer select-none radio'>
                        <input
                           id='big'
                           data-testid='big'
                           type='radio'
                           name='numberOfEmployees-group'
                           value='big'
                           disabled={isDisabled}
                           checked={info?.numberOfEmployees == 'big'}
                           onChange={onChangeVirtual}
                           className={`radio w-full option-input ${getClassInput(
                              info?.numberOfEmployees,
                              isDisabled,
                              isSave
                           )}`}
                        />
                        500+ (Grande)
                     </label>
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 4.</span>&nbsp;Estado físico de las
                  instalaciones
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='physicalConditionOfTheFacilities'
                        data-testid='physicalConditionOfTheFacilities'
                        name='physicalConditionOfTheFacilities'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.physicalConditionOfTheFacilities || ''}
                        onChange={onChangeVirtual}
                        placeholder='Son adecuadas para la prestación del servicio o la fabricación de los productos que comercializa, cuenta con espacios adecuados para el trabajo del equipo administrativo y/u operativo. Son propias o rentadas, vida útil del espacio donde desarrolla su actividad.'
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.physicalConditionOfTheFacilities,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 5.</span>&nbsp;Estado físico de los
                  inventarios y obsolescencias
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='physicalContionOfInventoriesAndObsolescences'
                        data-testid='physicalContionOfInventoriesAndObsolescences'
                        name='physicalContionOfInventoriesAndObsolescences'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.physicalContionOfInventoriesAndObsolescences || ''}
                        onChange={onChangeVirtual}
                        placeholder='Refiere a la calidad que guarda el inventario en las bodegas o almacenes propiedad del solicitante, obligado solidario o tercero (rentadas), tiene la ubicación y condiciones necesarias para que no se dañe (humedad, polvo, demasiada luz), cuenta con medidas de seguridad como sistemas contra incendios o de refrigeración especializados para evitar su deterioro.'
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.physicalContionOfInventoriesAndObsolescences,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <NewsContainer item={info?.news} onSetData={handleSetData} disabled={isDisabled} isSave={isSave} />
            <div className='flex flex-col flex-1 gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 7.</span>&nbsp;Riesgos de la industria
                  detectados
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='industryRisksDetected'
                        data-testid='industryRisksDetected'
                        name='industryRisksDetected'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.industryRisksDetected || ''}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.industryRisksDetected,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-col flex-1 gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 8.</span>&nbsp;Ventaja o diferenciador
                  competitivo
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='competitiveAdvantageOrDifferentiator'
                        data-testid='competitiveAdvantageOrDifferentiator'
                        name='competitiveAdvantageOrDifferentiator'
                        placeholder='Escribe aquí...'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.competitiveAdvantageOrDifferentiator}
                        onChange={onChangeVirtual}
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.competitiveAdvantageOrDifferentiator,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 9.</span>&nbsp;Comentarios adicionales o
                  proyectos en puerta
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='additionalCommentsOrProjectsInThePipeline'
                        data-testid='additionalCommentsOrProjectsInThePipeline'
                        name='additionalCommentsOrProjectsInThePipeline'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.additionalCommentsOrProjectsInThePipeline || ''}
                        onChange={onChangeVirtual}
                        placeholder='Cuales son sus expectativas del cierre del año en curso (si cuentan con proyecciones para proporcionar) planes a largo plazo o licitaciones que permitan alcanzar las expectativas de crecimiento a corto y mediano plazo. Aquí se pueden incluir las referencias de consejeros y/o comerciales (clientes, proveedores, etc.)'
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.additionalCommentsOrProjectsInThePipeline,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
            <div className='flex flex-wrap w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 10.</span>&nbsp;Percepción de la
                  administración de la empresa
               </p>
               <div className='grid flex-none w-1/2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col col-span-2 gap-2'>
                     <textarea
                        id='perceptionOfTheCompanysManagement'
                        data-testid='perceptionOfTheCompanysManagement'
                        name='perceptionOfTheCompanysManagement'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.perceptionOfTheCompanysManagement || ''}
                        onChange={onChangeVirtual}
                        placeholder='Considera que las personas encargadas de la administración tienen la experiencia suficiente para alcanzar los planes del negocio.'
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.perceptionOfTheCompanysManagement,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
                  <div className='flex flex-col gap-2 '>
                     <select
                        id='whosePerceptionIsCollected'
                        data-testid='whosePerceptionIsCollected'
                        name='whosePerceptionIsCollected'
                        disabled={isDisabled}
                        value={info?.whosePerceptionIsCollected || ''}
                        onChange={onChangeVirtual}
                        className={`w-full px-1.5 h-8 cursor-pointer input-form ${getClassInput(
                           info?.whosePerceptionIsCollected,
                           isDisabled,
                           isSave
                        )}`}>
                        <option value=''>- Seleccionar -</option>
                        <option value='soleAdministrator'>Administrador único</option>
                        <option value='familyCompany'>Empresa familiar</option>
                        <option value='boardOfDirectors'>Consejo de administración</option>
                     </select>
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-full gap-4 '>
               <p className='w-full'>
                  <span className='font-semibold text-black-900'>Pregunta 11.</span>&nbsp;¿Por qué SI recomiendas la
                  empresa?
               </p>
               <div className='grid grid-cols-2 gap-5 auto-rows-auto'>
                  <div className='flex flex-col gap-2 '>
                     <textarea
                        id='whyYouDOrecommendTheCompany'
                        data-testid='whyYouDOrecommendTheCompany'
                        name='whyYouDOrecommendTheCompany'
                        maxLength='500'
                        disabled={isDisabled}
                        value={info?.whyYouDOrecommendTheCompany || ''}
                        onChange={onChangeVirtual}
                        placeholder='Describe aquí por qué recomiendas a esta empresa'
                        className={`px-4 py-2.5 h-32 max-h-32 text-sm w-full input-form ${getClassInput(
                           info?.whyYouDOrecommendTheCompany,
                           isDisabled,
                           isSave
                        )}`}
                     />
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
};
