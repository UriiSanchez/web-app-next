import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NumericFormat } from 'react-number-format';
import Image from 'next/image';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { onChangeRequestStatusOrAssignUser, savePropertyFormat } from '../../services';
import { MainModal } from '../Modal';
import { useGlobalContext } from '../../hooks';
import { getCurrentDate, getError, sweetConditional, sweetNormal } from '../../helpers';
import { constProfiles as Profile, EnumStatus, mapRoutePages } from '../../helpers/config';

import icoWarning from '../../../public/icons/ico_warning.svg';

/**
 * Vista de la pantalla Relación de Propiedades, permite al usuario capturar el resultado de la verificación
 * de sociedad. Si el resultado es `EMBARGADA` muestra un modal para cancelar toda la solicitud.
 * @param {Object} info - Es la información general de toda la pantalla
 * @param {function} onUpdateData - Función que hereda del componente padre para actualizar el state principal.
 * @param {string} idGroup - ID del grupo que permite poder realizar redireccionamientos.
 * @param {Object} btnState - Un objeto donde debería de venir el atributo `freezeDisabled` que permite habilitar el botón de congelado de formato.
 * @param {string} genericUrl - Url de redireccionamiento heredado del componente padre.
 * @return JSX.Element - Vista de Verificación de propiedad para capturar el resultado de la sociedad/propiedad.
 * */
export default function VerificationCompanyView({ info, onUpdateData, idGroup, btnState, genericUrl }) {
   const router = useRouter();
   const { user, actions } = useGlobalContext();
   const [pageVerification, setPageVerification] = useState({
      isTax: false,
      showCancel: false,
   });

   //* Deshabilita los campos solo para el perfil de Mesa Receptora.
   const disableInputs = user?.idProfile === Profile.MRC;

   useEffect(() => {
      if (!_.isEmpty(info)) {
         setPageVerification({
            isTax: info?.propertiesFormat?.result === 'gravamen',
            showCancel: info?.propertiesFormat?.result === 'embargada',
         });
      }
   }, [info]);

   const handleChangeVirtual = (e) => {
      const { name, value } = e.target;
      const cloneData = structuredClone(info.propertiesFormat);
      if (name === 'result' && value !== 'gravamen') {
         cloneData.description = '';
      }

      onUpdateData('propertiesFormat', { ...cloneData, [name]: value });
   };

   const handleCancelForEmbargo = async () => {
      try {
         setPageVerification({ ...pageVerification, showCancel: false });
         actions.toggleLoading('Cancelando solicitud');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO,
            userCreate: user?.userAD,
            nextProfile: 'EF',
         });

         if (result.status !== 204) {
            sweetNormal({ txt: 'No se pudo asignar la solicitud', icon: 'info' });
            return;
         }
         router.push(mapRoutePages.GO_TO_REQUESTS_PAGE(user.path));
      } catch (error) {
         console.log('Error al intentar cancelar la solicitud: ', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const handleFreezeProperty = () => {
      sweetConditional({
         icon: 'warning',
         title: '¿Estás seguro de continuar?',
         text: 'La información se guardará en el expediente digital en formato PDF y ya no se podrá modificar después.',
         onFunc: fnSaveFreeze,
         accept: 'Continuar',
         cancel: 'Cancelar',
      });
   };

   const fnSaveFreeze = async () => {
      try {
         actions.toggleLoading('Guardando en expediente digital...');
         let newInfo = structuredClone(info);
         newInfo.propertiesFormat.userModify = user?.userAD;
         const result = await savePropertyFormat(newInfo, user?.idProfile, true);
         if (result.status !== 200) {
            getError(result);
            return;
         }
         router.push(genericUrl);
         return;
      } catch (error) {
         console.log('Congelado Relación de Propiedad', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <>
         <MainModal isOpened={pageVerification.showCancel} xs='max-w-sm fixed-position-modal fadeIn'>
            <div className='flex flex-col items-center justify-center gap-4 py-2'>
               <Image src={icoWarning} alt='¡Warning! Al continuar finalizarás el proceso de la solicitud' />
               <h1 className='text-lg font-bold text-center'>¡Sociedad embargada!</h1>
               <p className='text-base text-center text-black-light'>
                  Si la verificación resulto ser <b>&quot;embargada&quot;</b>, la solicitud sera cancelada y se enviará
                  al historial. Si no lo es, haz clic en &quot;Regresar&quot; y modifica el resultado.
               </p>
               <div className='w-4/6 space-y-2 text-sm font-bold 2xl:w-3/6'>
                  <button
                     onClick={handleCancelForEmbargo}
                     className='w-full px-4 py-1 text-white bg-black-900 hover:bg-black-light rounded-3xl'>
                     Sí, cancelar
                  </button>
                  <button
                     onClick={() => setPageVerification({ ...pageVerification, showCancel: false })}
                     className='w-full px-4 py-1 text-blue-800 hover:bg-blue-800 hover:text-white rounded-3xl'>
                     Regresar
                  </button>
               </div>
            </div>
         </MainModal>
         <div className='px-8 pb-5 fadeIn'>
            <div className='flex flex-col w-1/2'>
               <div className='flex gap-4'>
                  <div className='flex flex-col gap-2 basis-1/3'>
                     <label htmlFor='uniqueFolio' className='text-xs'>
                        Folio único
                     </label>
                     <NumericFormat
                        id='uniqueFolio'
                        name='uniqueFolio'
                        disabled={disableInputs}
                        type='text'
                        maxLength='12'
                        allowNegative={false}
                        decimalScale={0}
                        value={info?.propertiesFormat?.uniqueFolio || ''}
                        placeholder='Escribe el folio'
                        onValueChange={(_v, source) => {
                           source.source !== 'prop' && handleChangeVirtual(source.event);
                        }}
                        className={clsx('w-full h-9 px-2 py-1 text-sm text-center input-form', {
                           disabled: disableInputs,
                        })}
                     />
                  </div>
                  <div className='flex flex-col gap-2 basis-1/3'>
                     <label htmlFor='result' className='text-xs'>
                        Resultado
                     </label>
                     <select
                        id='result'
                        name='result'
                        disabled={disableInputs}
                        value={info?.propertiesFormat?.result || ''}
                        onChange={handleChangeVirtual}
                        className={clsx('w-full p-1 text-sm h-9 text-center input-form', {
                           disabled: disableInputs,
                           'cursor-pointer': !disableInputs,
                        })}>
                        <option value=''>- Seleccionar -</option>
                        <option value='libre'>Libre</option>
                        <option value='gravamen'>Gravamen</option>
                        <option value='embargada'>Embargada</option>
                     </select>
                  </div>
                  <div className='flex flex-col gap-2 basis-1/3'>
                     <label htmlFor='verificationDate' className='text-xs'>
                        Fecha verificación
                     </label>
                     <input
                        id='verificationDate'
                        name='verificationDate'
                        disabled={disableInputs}
                        type='date'
                        placeholder='00-00-000'
                        value={info?.propertiesFormat?.verificationDate || ''}
                        max={getCurrentDate('YYYY-MM-DD')}
                        onChange={handleChangeVirtual}
                        className={clsx('h-9 py-0.5 text-center input-form', {
                           'cursor-pointer': !disableInputs,
                           disabled: disableInputs,
                        })}
                     />
                  </div>
               </div>
               <div className='w-full py-4 space-y-1.5 text-sm mb-2'>
                  <label htmlFor='description' className='text-xs text-gray'>
                     Descripción (solo en caso de resultado gravada)
                  </label>
                  <textarea
                     id='description'
                     name='description'
                     disabled={!pageVerification.isTax || disableInputs}
                     placeholder='Escriba aquí...'
                     value={info?.propertiesFormat?.description || ''}
                     onChange={handleChangeVirtual}
                     maxLength={500}
                     className={clsx('w-full p-2 text-sm h-32 resize-none input-form', {
                        disabled: disableInputs || !pageVerification.isTax,
                     })}
                  />
               </div>
            </div>
            {[Profile.LDC, Profile.ADC].includes(user?.idProfile) && (
               <div className='w-full pb-8 text-sm'>
                  <button
                     disabled={btnState.freezeDisabled}
                     className='absolute float-right px-4 py-2 text-white bg-black border w-[16rem] rounded-2xl bottom-20 right-20'
                     onClick={handleFreezeProperty}>
                     {info?.propertiesFormat?.freezeTitle}
                  </button>
               </div>
            )}
         </div>
      </>
   );
}

VerificationCompanyView.propTypes = {
   info: PropTypes.object,
   onUpdateData: PropTypes.func,
   idGroup: PropTypes.string,
   btnState: PropTypes.object,
   genericUrl: PropTypes.string,
};
