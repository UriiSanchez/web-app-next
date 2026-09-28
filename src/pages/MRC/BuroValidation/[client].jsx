import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

import { getInfoClient, onBureauConfirmation, updateInfoClient } from '../../../services';
import { BuroSkeleton } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext, useLocalStorage } from '../../../hooks';
import { compareJSON, getError, onPasteOnlyNumbers, sweetConfirmation, sweetSnackbar } from '../../../helpers';
import { constCountrys, constStates, mapRoutePages } from '../../../helpers/config';

import MethodConsult from './components/MethodConsult';

export default function BuroValidation({ idClient, idRequest, idGroup }) {
   const { push } = useRouter();
   const { actions } = useGlobalContext();
   const [storage] = useLocalStorage('infoMRC');
   const { formState, getValues, handleSubmit, register, reset, trigger, watch, setValue } = useForm({
      mode: 'onChange',
   });
   const [screen, setScreen] = useState({ title: '', signatureDate: '', signatureName: '', showSignature: '' });
   const [MCBC, setMCBC] = useState({});
   const [settings, setSettings] = useState({ update: true, confirm: false });
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      let method = storage?.documentation?.find((dc) => dc._id == 'MCBC');
      setScreen({ ...method.screenBureau });
      setMCBC(method);
      const fetchDataAsync = async () => {
         const { status, data } = await getInfoClient(idClient, storage?.userActive, idRequest);
         if (status !== 200) {
            return;
         }

         setIsLoading(false);
         let newData = { ...data, nationality: constCountrys[data.nationality] };
         localStorage.setItem('BureData', JSON.stringify(newData));
         reset(newData);
      };

      fetchDataAsync();
   }, []);

   useEffect(() => {
      const subscription = watch((obj) => {
         let update = true;
         let confirm = false;
         let dataBure = JSON.parse(localStorage.getItem('BureData'));
         if (!compareJSON(obj, dataBure)) {
            update = false;
            confirm = true;
         }
         setSettings({ update, confirm });
      });
      return () => subscription.unsubscribe();
   }, [watch]);

   const onUpdateInfo = async (data) => {
      try {
         actions.toggleLoading('Guardando...');
         const result = await updateInfoClient({ ...data, userModify: storage.userActive });
         if (result.status !== 200) {
            getError(result);
            return;
         }

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>',
         });
         localStorage.setItem('BureData', JSON.stringify(data));
         setSettings({ update: true, confirm: false });
      } catch (error) {
         console.log('Validación de Datos', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onConfirmData = async () => {
      try {
         actions.toggleLoading('Procesando...');
         if (!(await trigger())) {
            return;
         }

         let data = {
            idRequest: storage.idRequest,
            idClient: storage.idClient,
            confirmInfoBureau: true,
            userModify: storage.userActive,
         };

         const result = await onBureauConfirmation(data);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         sweetConfirmation({
            html: `
               <div class='flex flex-col justify-center items-center gap-4 h-56 w-72 mx-auto'>
                  <img src='/icons/ico_success.svg' alt='Proceso éxitoso' width='78' />
                  <p class='text-center text-black select-none'>Se validó la información correctamente</p>
               </div>
            `,
         });

         setTimeout(() => {
            localStorage.removeItem('infoMRC');
            push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'MRC'));
         }, 1500);
      } catch (error) {
         console.log('Confirmación Buró', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <MainLayout title='Validación de datos para consulta de Buró de Crédito'>
         <HeaderTitle
            {...{
               title: 'Validación de datos para consulta de Buró de Crédito',
               buttons: [
                  {
                     id: 'back',
                     isVisible: true,
                     label: 'Regresar',
                     sx: 'bg-black text-white',
                     toAction: () => {
                        localStorage.removeItem('BureData');
                        push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'MRC'));
                     },
                  },
               ],
            }}
         />
         {isLoading ? (
            <BuroSkeleton />
         ) : (
            <form
               onSubmit={handleSubmit(onUpdateInfo)}
               className='relative grid grid-flow-row grid-cols-3 gap-4 px-16 py-4 auto-rows-max'>
               <div className='flex flex-col col-span-2 gap-4 container-overflow'>
                  <h1 className='text-xl font-semibold'>{screen.title}</h1>
                  {getValues('accountType') !== 'PM' && (
                     <div className='flex flex-col gap-1.5 w-1/2 pt-5'>
                        <label htmlFor='birthdate' className='text-sm font-semibold 2xl:text-base'>
                           Fecha de nacimiento
                        </label>
                        <input
                           disabled
                           type='date'
                           {...register('birthdate')}
                           className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                        />
                     </div>
                  )}
                  <div className='flex flex-col gap-1.5 w-1/2 pt-2'>
                     <p className='pb-3 text-lg'>Persona</p>
                     <label htmlFor='accountType' className='text-sm 2xl:text-base'>
                        Tipo de persona
                     </label>
                     <select
                        id='accountType'
                        defaultValue=''
                        {...register('accountType')}
                        className='p-1 border border-gray-400 rounded h-9 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 focus:text-blue-800'>
                        <option disabled value=''>
                           - Seleccionar -
                        </option>
                        {getValues('accountType') == 'PM' ? (
                           <option value='PM'> Persona Moral</option>
                        ) : (
                           <>
                              <option value='PF'> Persona Física</option>
                              <option value='PFAE'> Persona Física con Actividad Empresarial</option>
                           </>
                        )}
                     </select>
                  </div>
                  <div className='flex flex-col gap-1.5 w-1/2 pt-2'>
                     <p className='pb-3 text-lg'>Identificador</p>
                     <label
                        htmlFor='rfc'
                        className={clsx('text-sm 2xl:text-base font-semibold ', {
                           "after:content-['*'] after:ml-1 after:text-red-500 after:font-light": formState?.errors.rfc,
                        })}>
                        RFC
                     </label>
                     <input
                        id='rfc'
                        type='text'
                        disabled
                        {...register('rfc', {
                           required: 'Este campo es obligatorio',
                        })}
                        className='w-3/4 p-1 text-gray-600 bg-gray-400 border rounded h-9'
                     />
                     {formState?.errors.rfc && (
                        <span className='pl-1 text-xs text-red-500 fadeIn'>{formState?.errors.rfc?.message}</span>
                     )}
                  </div>
                  <p className='w-full pt-4 text-lg'>Dirección</p>
                  <div className='grid grid-cols-4 gap-4 text-sm 2xl:text-base'>
                     <div className='flex flex-col col-span-2'>
                        <label
                           htmlFor='address'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.address,
                           })}>
                           Calle
                        </label>
                        <input
                           id='address'
                           type='text'
                           maxLength={40}
                           {...register('address', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ\s.0-9#-]*$/,
                                 message: 'Solo puedes ingresar números y letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.address,
                              }
                           )}
                        />
                        {formState?.errors.address && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>
                              {formState?.errors.address?.message}
                           </span>
                        )}
                     </div>
                     <div className='flex flex-col col-span-2'>
                        <label
                           htmlFor='neighborhood'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.neighborhood,
                           })}>
                           Colonia
                        </label>
                        <input
                           id='neighborhood'
                           type='text'
                           maxLength={60}
                           {...register('neighborhood', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ\s.0-9#-]*$/,
                                 message: 'Solo puedes ingresar números y letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded  hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.neighborhood,
                              }
                           )}
                        />
                        {formState?.errors.neighborhood && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>
                              {formState?.errors.neighborhood?.message}
                           </span>
                        )}
                     </div>
                     <div className='flex flex-col col-span-2'>
                        <label
                           htmlFor='city'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.city,
                           })}>
                           Ciudad
                        </label>
                        <input
                           id='city'
                           type='text'
                           maxLength={60}
                           {...register('city', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ\s.-]*$/,
                                 message: 'Solo puedes ingresar letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.city,
                              }
                           )}
                        />
                        {formState?.errors.city && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>{formState?.errors.city?.message}</span>
                        )}
                     </div>
                     <div className='flex flex-col col-span-2'>
                        <label
                           htmlFor='state'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.state,
                           })}>
                           Estado
                        </label>
                        <select
                           id='state'
                           placeholder='Selecciona el estado...'
                           defaultValue='-- Selecciona un estado --'
                           {...register('state', {
                              required: 'Este campo no puede quedar vacío',
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.state,
                              }
                           )}>
                           <option disabled>-- Selecciona un estado --</option>
                           {Object.values(constStates).map((st) => (
                              <option key={st} value={st.toUpperCase()}>
                                 {st.toUpperCase()}
                              </option>
                           ))}
                        </select>
                        {formState?.errors.state && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>{formState?.errors.state?.message}</span>
                        )}
                     </div>
                     <div className='flex flex-col'>
                        <label
                           htmlFor='zipCode'
                           className={clsx('font-semibold', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.zipCode,
                           })}>
                           C.P
                        </label>
                        <input
                           id='zipCode'
                           type='text'
                           maxLength={5}
                           {...register('zipCode', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: { value: /^\d{0,5}$/, message: 'Solo puedes ingresar números' },
                              maxLength: { value: 5, message: 'Longitud inválida' },
                              minLength: { value: 5, message: 'Longitud inválida' },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.zipCode,
                              }
                           )}
                           onPaste={onPasteOnlyNumbers}
                           onChange={(e) =>
                              setValue('zipCode', e.target.value.replace(/\D/g, ''), { shouldValidate: true })
                           }
                        />
                        {formState?.errors.zipCode && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>
                              {formState?.errors.zipCode?.message}
                           </span>
                        )}
                     </div>
                     <div className='flex flex-col'>
                        <label
                           htmlFor='exteriorNumber'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.exteriorNumber,
                           })}>
                           Núm. exterior
                        </label>
                        <input
                           id='exteriorNumber'
                           type='text'
                           maxLength={10}
                           {...register('exteriorNumber', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ'\s.0-9#-]*$/,
                                 message: 'Solo puedes ingresar números y letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.exteriorNumber,
                              }
                           )}
                        />
                        {formState?.errors.exteriorNumber && (
                           <span className='pl-1 text-xs text-red-500 fadeIn'>
                              {formState?.errors.exteriorNumber?.message}
                           </span>
                        )}
                     </div>
                     <div className='flex flex-col'>
                        <label htmlFor='interiorNumber'>
                           Núm. interior <span className='text-xs'>(opcional)</span>
                        </label>
                        <input
                           id='interiorNumber'
                           type='text'
                           maxLength={30}
                           {...register('interiorNumber', {
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ'\s.0-9#-]*$/,
                                 message: 'Solo puedes ingresar números y letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.interiorNumber,
                              }
                           )}
                        />
                        {formState?.errors.interiorNumber && (
                           <span className='pl-1 text-xs text-red-500'>
                              {formState?.errors.interiorNumber?.message}
                           </span>
                        )}
                     </div>
                     <div className='flex flex-col'>
                        <label
                           htmlFor='country'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.country,
                           })}>
                           País
                        </label>
                        <input
                           id='country'
                           type='text'
                           disabled
                           maxLength={40}
                           {...register('country', {
                              required: 'Este campo es obligatorio',
                           })}
                           className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                        />
                        {formState?.errors.country && (
                           <span className='pl-1 text-xs text-red-500'>{formState?.errors.country?.message}</span>
                        )}
                     </div>
                     <div className='flex flex-col col-span-2'>
                        <label
                           htmlFor='municipality'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.municipality,
                           })}>
                           Municipio
                        </label>
                        <input
                           id='municipality'
                           type='text'
                           maxLength={100}
                           {...register('municipality', {
                              required: 'Este campo no puede quedar vacío',
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ\s.-]*$/,
                                 message: 'Solo puedes ingresar letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400 ',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.municipality,
                              }
                           )}
                        />
                        {formState?.errors.municipality && (
                           <span className='pl-1 text-xs text-red-500'>{formState?.errors.municipality?.message}</span>
                        )}
                     </div>
                  </div>
                  <p className='w-full pt-2 text-lg'>Adicionales</p>
                  <div className='grid grid-cols-3 gap-4 pb-3 text-sm 2xl:text-base'>
                     <div className='flex flex-col'>
                        <label
                           htmlFor='nationality'
                           className={clsx('font-semibold ', {
                              "after:content-['*'] after:ml-1 after:text-red-500 after:font-light":
                                 formState?.errors.nationality,
                           })}>
                           Nacionalidad
                        </label>
                        <input
                           id='nationality'
                           type='text'
                           disabled
                           {...register('nationality', {
                              required: 'Este campo es obligatorio',
                           })}
                           className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                        />
                        {formState?.errors.nationality && (
                           <span className='pl-1 text-xs text-red-500'>{formState?.errors.nationality?.message}</span>
                        )}
                     </div>
                     <div className='flex flex-col'>
                        <label htmlFor='phone' className='font-semibold'>
                           Teléfono <span className='text-xs'>(opcional)</span>
                        </label>
                        <input
                           id='phone'
                           type='text'
                           disabled
                           {...register('phone')}
                           className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                        />
                     </div>
                     <div className='flex flex-col'>
                        <label htmlFor='creditReference' className='font-semibold'>
                           Rerefencia Crediticia <span className='text-xs'>(opcional)</span>
                        </label>
                        <input
                           id='creditReference'
                           type='text'
                           maxLength={100}
                           {...register('creditReference', {
                              pattern: {
                                 value: /^[a-zA-ZñÑáÁéÉíÍóÓúÚäÄëËïÏöÖüÜÿŸ'\s.0-9#-]*$/,
                                 message: 'Solo puedes ingresar números y letras',
                              },
                           })}
                           className={clsx(
                              'p-1 h-9 border rounded hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 border-gray-400',
                              {
                                 'border-red-500 focus:text-red-500 hover:border-red-500 ring-red-500':
                                    formState?.errors.creditReference,
                              }
                           )}
                        />
                        {formState?.errors.creditReference && (
                           <span className='pl-1 text-xs text-red-500'>
                              {formState?.errors.creditReference?.message}
                           </span>
                        )}
                     </div>
                  </div>
                  {screen.showSignature && (
                     <>
                        <p className='w-full pt-2 text-lg'>Autorización</p>
                        <div className='grid grid-cols-3 gap-4 pb-5 text-sm 2xl:text-base'>
                           <div className='flex flex-col'>
                              <label htmlFor='signatureDate'>Fecha de firma de autorización</label>
                              <input
                                 id='signatureDate'
                                 name='signatureDate'
                                 type='text'
                                 disabled
                                 value={screen.signatureDate ?? ''}
                                 className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                              />
                           </div>
                           {/*
                              //Tatis pide ocultar de momento este campo, revisar ticket https://bancobase.atlassian.net/browse/ESYC-302
                              <div className='flex flex-col col-span-2'>
                                 <label htmlFor='signatureName'>Nombre de la persona que firma la autorización</label>
                                 <input
                                    id='signatureName'
                                    name='signatureName'
                                    type='text'
                                    disabled
                                    value={screen.signatureName ?? ''}
                                    className='p-1 text-gray-600 bg-gray-200 border border-gray-400 rounded h-9'
                                 />
                              </div> */}
                        </div>
                     </>
                  )}
               </div>
               <MethodConsult {...{ docMCBC: MCBC }} />
               <div className='sticky bottom-0 z-50 flex justify-center w-full col-span-3 gap-4 py-3 text-xs bg-white '>
                  <button
                     disabled={settings.update}
                     type='submit'
                     className='pt-1 pb-1 text-white bg-blue-800 rounded-full pl-7 pr-7'>
                     Actualizar
                  </button>
                  <button
                     type='button'
                     disabled={settings.confirm || MCBC?.folio === 0}
                     onClick={onConfirmData}
                     className='pt-1 pb-1 text-white rounded-full pl-7 pr-7 bg-black-900'>
                     Confirmar
                  </button>
               </div>
            </form>
         )}
      </MainLayout>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { client = 0, idRequest = 0, idGroup } = query;
   return {
      props: { idClient: client, idRequest, idGroup },
   };
};
