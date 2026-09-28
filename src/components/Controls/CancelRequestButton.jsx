import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { onChangeRequestStatusOrAssignUser } from '../../services';
import { MainModal } from '../Modal';
import { useGlobalContext } from '../../hooks';
import { sweetNormal, sweetSnackbar } from '../../helpers';
import { constProfiles as Profile, EnumStatus, mapRoutePages } from '../../helpers/config';

import imgCancel from '../../../public/icons/ico_cancel.svg';
import icoWarning from '../../../public/icons/ico_warning.svg';

/**
 * Botón que permite cancelar una solicitud y solo se muestra para el Especialista y al Líder de Contraparte.
 * @param {number} idCatStatus - Determinar si el botón se encuentra habilitado o no con base al usuario en sesión.
 * @param {number} idGroup - Se utiliza para realizar la cancelación
 * @returns {JSX.Element}
 */
export const CancelRequestButton = ({ idCatStatus, idGroup }) => {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
   const [showModal, setShowModal] = useState(false);
   const youCanCancel = useMemo(() => {
      if (!_.isEmpty(user) && (user.idProfile === Profile.EMG || user.idProfile === Profile.LDC)) {
         return user?.status?.includes(idCatStatus);
      }
      return false;
   }, [idCatStatus]);

   const onCancelRequest = async () => {
      try {
         setShowModal(true);
         actions.toggleLoading('Cancelando solicitud...');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: EnumStatus.SOLICITUD_CANCELADA,
            nextProfile: 'EF',
            userCreate: user.userAD,
         });

         if (result.status !== 204) {
            sweetNormal({ txt: result?.error?.response?.message, icon: 'warning' });
            return;
         }

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">Solicitud cancelada.</p>',
         });

         setTimeout(() => {
            push(mapRoutePages.GO_TO_REQUESTS_PAGE(user?.path));
         }, 3000);
      } catch (error) {
         console.log('Cancelación de solicitud: ', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <>
         {showModal && (
            <MainModal isOpened={showModal} xs='max-w-sm fixed-position-modal fadeIn'>
               <div className='flex flex-col items-center justify-center gap-4 py-4'>
                  <Image src={icoWarning} alt='¡Warning! Al continuar cancelaras el proceso de esta solicitud' />
                  <h1 className='text-xl font-semibold text-center'>¿Estás seguro?</h1>
                  <p className='px-4 text-base text-center text-gray-500'>
                     Al hacer clic en "Cancelar" se eliminará por definitivo tu solicitud
                  </p>
                  <div className='w-4/6 space-y-2 text-sm 2xl:w-3/6'>
                     <button
                        onClick={onCancelRequest}
                        className='w-full px-4 py-1 text-white bg-black hover:bg-black-900 rounded-3xl'>
                        Cancelar
                     </button>
                     <button
                        onClick={() => setShowModal(false)}
                        className='w-full px-4 py-1 text-blue-800 hover:underline rounded-3xl'>
                        Regresar
                     </button>
                  </div>
               </div>
            </MainModal>
         )}
         <button
            data-testid='Boton cancelar solicitud'
            disabled={!youCanCancel}
            onClick={() => setShowModal(true)}
            className='relative p-2 rounded-full bg-black-900 group'>
            <Image src={imgCancel} alt='Botón cancelar solicitud' />
            {youCanCancel && (
               <div className='absolute z-10 justify-center hidden w-full group-hover:flex -top-2 -right-[5rem] fadeIn'>
                  <div className='self-center px-2 py-1 text-xs text-white rounded-tl-md rounded-r-md bg-black-900 whitespace-nowrap'>
                     Cancelar solicitud
                  </div>
               </div>
            )}
         </button>
      </>
   );
};

CancelRequestButton.propTypes = {
   idCatStatus: PropTypes.number,
   idGroup: PropTypes.number,
};
