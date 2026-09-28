import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import clsx from 'clsx';

import { postSavePersons, patchRequestAndApplicants, getInfoSolidary } from '../../../services';
import { MainLayout } from '../../../components/Layout';
import { MainModal } from '../../../components/Modal';
import { HeaderTitle } from '../../../components/Controls';
import { SolidaryContainer } from '../../../components/Solidary';
import { useGlobalContext, useToggle } from '../../../hooks';
import { formatId, formatMoney, sumGeneric, getError } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

import icoWarning from '../../../../public/icons/ico_info.svg';

export default function SolidaryPage({ idGroup }) {
   const { push } = useRouter();
   const { user, actions, general } = useGlobalContext();
   const [data, setData] = useState({});
   const [nextIsDisabled, setNextIsDisabled] = useState(true);
   const [showModal, setShowModal] = useToggle();
   const [validAmount, setValidAmount] = useState({ valid: true, message: '' });
   const { applicants, total, credits } = data;

   const limit = useMemo(() => {
      let totalUDIS = (!_.isEmpty(general?.UDI) && 2000000 * general?.UDI - 1) || 0;
      return totalUDIS == 0 ? totalUDIS : totalUDIS - (credits?.creditTotalAmount || 0);
   }, [general?.UDI, data?.credits]);
   const isNotEditable = useMemo(() => {
      return ![
         EnumStatus.EN_ESPECIALISTA_FINANCIAMIENTO,
         EnumStatus.DEVUELTA_EF_POR_MESA,
         EnumStatus.DEVUELTA_EF_POR_LIDER,
         EnumStatus.DEVUELTA_EF_POR_ANALISTA,
      ].includes(data?.idCatStatus);
   }, [data?.idCatStatus]);

   const fetchAsyncData = useCallback(async () => {
      const result = await getInfoSolidary(idGroup);
      if (result.status !== 200) {
         return;
      }

      setData(result.data);
      if (!_.isEmpty(result.data.credits.applicantNotParticipateInRequest)) {
         setShowModal();
      }
   }, []);

   useEffect(() => {
      fetchAsyncData().catch((error) => console.log('Error al cargar la información: ', error));
   }, []);

   useEffect(() => {
      if (!_.isEmpty(applicants)) {
         let isNotCompleted = false;
         applicants.forEach((u) => {
            if (_.isEmpty(u.kindProcedure)) {
               isNotCompleted = true;
            }
            if (_.isEmpty(u?.requestAmount?.toString()) || u.requestAmount === '0') {
               isNotCompleted = true;
            }
            if (!u?.validate?.valid || u?.requestAmount <= 0) {
               isNotCompleted = true;
            }
         });

         let total = sumGeneric(applicants, 'requestAmount');
         setData({ ...data, total });

         if (total > limit) {
            isNotCompleted = true;
         }
         setNextIsDisabled(isNotCompleted);
         setValidAmount(onValidateTotalAmount(total));
      }
   }, [applicants, total, limit]);

   const handleUpdateInfo = (idRequest, newObj) => {
      let newApplicants = applicants.map((aply) => (aply.idRequest == idRequest ? newObj : aply));
      setData({ ...data, applicants: newApplicants });
   };

   const handleSaveApplicants = async () => {
      let areChanges = _.isEqual(data, JSON.parse(localStorage.getItem('Solidary_Page')));
      try {
         if (!areChanges && !isNotEditable) {
            actions.toggleLoading('Guardando información...');
            const result = await patchRequestAndApplicants(
               applicants,
               { requestAmount: total, idGroup, idCatStatus: data?.idCatStatus },
               user?.userAD
            );

            if (result.status !== 204) {
               getError(result);
               return;
            }

            const { status, error } = await postSavePersons(applicants, user?.userAD);
            if (status !== 200) {
               getError({ status, error });
               return;
            }
         }

         localStorage.removeItem('Solidary_Page');
         push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'EMG'));
      } catch (error) {
         console.log('Aplicantes & Obligados: ' + error);
      } finally {
         !areChanges && actions.toggleLoading();
      }
   };

   const onValidateTotalAmount = (total) => {
      if (limit == 0) {
         return { valid: false, message: 'No se encuentra disponible el valor de la UDI' };
      }
      if (total > limit) {
         return {
            valid: false,
            message: `Sobrepasaste el límite de ${formatMoney(
               limit
            )} millones de pesos de monto disponible. Revisa y modifica tus montos`,
         };
      }
      if (total <= limit) {
         return {
            valid: true,
            message: `Estás solicitando ${formatMoney(total) || 0} de tus ${formatMoney(
               limit
            )} millones de pesos de monto disponible`,
         };
      }
   };

   return (
      <>
         {showModal && (
            <MainModal isOpened={showModal} onClose={setShowModal} xs='max-w-lg fixed-position-modal fadeIn'>
               <div className='flex flex-col items-center justify-center gap-4 py-2 text-center text-gray-500'>
                  <Image src={icoWarning} alt='¡Atención!' />
                  {limit === 0 ? (
                     <>
                        <p className='text-lg font-bold text-black'>Posibles soluciones</p>
                        <p> 1. Pulsar Ctrl + F5, para actualizar la página.</p>
                        <p> 2. Cierra sesión e ingresa nuevamente a EasyCredit.</p>
                        <p> 3. Si el error persiste ponte en contacto con soporte.</p>
                     </>
                  ) : (
                     <>
                        <h1>{`Existen otros miembros del grupo económico que han utilizado 
                        ${formatMoney(credits?.creditTotalAmount)} pesos por lo que solo cuentas con 
                        ${formatMoney(limit)} pesos disponibles `}</h1>
                        {credits?.applicantNotParticipateInRequest.map((c) => (
                           <p className='text-base font-bold text-center' key={'creditLine-' + c.lineNumber}>{`${
                              c.nameClient
                           } - ${formatMoney(c.authorizedAmount)}`}</p>
                        ))}
                     </>
                  )}
               </div>
            </MainModal>
         )}
         <MainLayout title='Solicitantes & Obligados Solidarios' sx='mb-4'>
            <HeaderTitle
               title='Solicitantes & Obligados Solidarios'
               buttons={[
                  {
                     id: 'next',
                     isVisible: true,
                     isDisable: nextIsDisabled,
                     label: 'Continuar',
                     sx: `text-white bg-black`,
                     toAction: () => handleSaveApplicants(),
                  },
               ]}
               request={{ idCatStatus: data.idCatStatus, idGroup }}
               showCancel={true}
            />
            <h1 className='px-8 text-xl text-black-900'>Solicitud Núm.&nbsp;{formatId(idGroup)} </h1>
            <SolidaryContainer
               applicants={data.applicants}
               isNotEditable={isNotEditable}
               onUpdateInfo={handleUpdateInfo}
               creditLimit={limit}
            />
            <div className='sticky w-full bottom-2 px-8 min-w-max'>
               <div
                  className={clsx('w-full text-center rounded min-w-max bg-black', {
                     'bg-emerald-600': validAmount?.valid && total > 0,
                     'bg-red-400': !validAmount?.valid,
                  })}>
                  <p className='flex items-center justify-center w-full text-white rounded h-9 min-w-max'>
                     {validAmount?.message}
                     &nbsp;
                     <span
                        className='cursor-pointer material-symbols-outlined filled icon-size-20'
                        onClick={() =>
                           (!_.isEmpty(credits?.applicantNotParticipateInRequest) || limit === 0) && setShowModal()
                        }>
                        info
                     </span>
                  </p>
               </div>
            </div>
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: parseInt(group) },
   };
};
