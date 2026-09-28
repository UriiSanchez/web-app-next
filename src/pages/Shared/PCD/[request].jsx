import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { getCustomerProfile } from '../../../services';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import {
   CoverageProfileView,
   ExchangeRateCalculatorView,
   RateCalculatorView,
   ProfileSummaryView,
} from '../../../components/PCD';
import { useGlobalContext } from '../../../hooks';
import { mapRoutePages } from '../../../helpers/config';

export default function DerivativesClientProfile({ idGroup, idRequest }) {
   const { push } = useRouter();
   const { user } = useGlobalContext();
   const [customerProfile, setCustomerProfile] = useState({});

   useEffect(() => {
      const fetchDataAsync = async () => {
         const { status, data } = await getCustomerProfile(idRequest);
         if (status !== 200) {
            return;
         }

         setCustomerProfile(data);
      };
      fetchDataAsync();
   }, []);

   return (
      <MainLayout title='Perfil Cliente de Derivados'>
         <HeaderTitle
            title={`Solicitante: ${customerProfile.clientName || ''}`}
            buttons={[
               {
                  id: 'back',
                  isVisible: true,
                  label: 'Regresar',
                  sx: 'text-white bg-black',
                  toAction: () => push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path)),
               },
            ]}
         />
         <CoverageProfileView info={customerProfile?.coverageProfile} isDisabled={true} />
         <hr className='mb-8' />
         {customerProfile?.coverageProfile?.calculatorType?.isType === 'rate' ? (
            <RateCalculatorView info={customerProfile?.calculatorRate} isDisabled={true} />
         ) : (
            <ExchangeRateCalculatorView info={customerProfile?.calculatorRateExchange} isDisabled={true} />
         )}
         <hr className='mb-5' />
         <ProfileSummaryView info={customerProfile.profileResume} isDisabled={true} />
      </MainLayout>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { request = 0, idGroup = 0 } = query;
   return {
      props: { idRequest: request, idGroup },
   };
};
