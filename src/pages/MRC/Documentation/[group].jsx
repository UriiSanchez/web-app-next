import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { execCreditBureuQuery, getDocumentation, getOneRequest } from '../../../services';
import { DocumentationTable, ParticipantsTable } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { getError, sweetConditional, sweetNormal } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function Documentation({ idGroup }) {
   const { push, reload } = useRouter();
   const { user, actions } = useGlobalContext();
   const [application, setApplication] = useState({});
   const [docs, setDocs] = useState({});
   const [btnSend, setBtnSend] = useState(true);

   const buttons = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: 'text-white bg-black',
         toAction: () => push(mapRoutePages.GO_TO_REQUESTS_PAGE('MRC')),
      },
      {
         id: 'next',
         isVisible: true,
         isDisable: btnSend,
         label: 'Validar Solicitud',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_VALIDATION_REQUEST_PAGE(idGroup)),
      },
   ];

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         const { requestResponseList, idCatStatus } = result.data;
         setApplication({
            applicants: requestResponseList,
            idCatStatus,
         });

         setBtnSend(idCatStatus !== EnumStatus.EN_MESA_RECEPTORA);
      };

      fetchDataAsync();
   }, []);

   const onGetDocumentation = async (idClient, idRequest) => {
      try {
         actions.toggleLoading('Buscando documentos...');
         const objApply = application.applicants.find((u) => u.idRequest == idRequest);
         let docs = objApply?.relatedPersonResponseList.find((i) => i.idClient == idClient);
         const result = await getDocumentation({ ...docs, idGroup, idStatusGroup: application.idCatStatus }, user);

         //? Se utiliza en VDBC y VS
         localStorage.setItem('infoMRC', JSON.stringify({ ...result.data, userActive: user.userAD }));
         if (result.status !== 200) {
            getError(result);
         }

         setDocs({ ...result.data });
      } catch (error) {
         console.log(error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onConsultBuroCredit = async () => {
      try {
         actions.toggleLoading('Ejecutando consulta a Buró...');
         localStorage.removeItem('BureauError');
         const { idClient, idRequest } = docs;
         const result = await execCreditBureuQuery({
            idClient,
            idRequest,
            userConsulting: user?.userAD,
            process: 'BUREA_MODEL',
         });

         if (result.status !== 200) {
            getError(result);
            return;
         }

         sweetNormal({
            title: '¡En proceso!',
            txt: '<p>La consulta a <b>Buró de Crédito</b> puede demorar hasta 30 minutos.</p>',
            icon: 'success',
         });

         //* Se recarga la página para que el usuario no pulse nuevamente el botón de consultar
         setTimeout(() => {
            reload();
         }, 1000);
      } catch (error) {
         console.log('Ejecución de Buró de Crédito: ', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onCallFunction = () => {
      if (docs.retrieveBureau) {
         sweetConditional({
            icon: 'info',
            title: 'Buró de Crédito',
            accept: 'Sí, ejecutar',
            cancel: 'No, cancelar',
            text: '<p>Volveras a ejecutar la consulta de Buró de Crédito. <br/>¿Estás de acuerdo?</p>',
            onFunc: onConsultBuroCredit,
         });
      } else {
         onConsultBuroCredit();
      }
   };
   return (
      <MainLayout title='Documentación requerida'>
         <HeaderTitle title='Documentación requerida del Solicitante & Obligado Solidario' buttons={buttons} />
         <div className='flex gap-4 px-8 mb-4 max-w-screen-2xl 2xl:mx-auto'>
            <ParticipantsTable {...{ applycants: application.applicants, onSelect: onGetDocumentation }} />
            <DocumentationTable {...{ docs, onFunc: onCallFunction }} />
         </div>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
