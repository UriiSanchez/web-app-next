import _ from 'lodash';
import { useEffect, useMemo, useReducer } from 'react';
import { useSession } from 'next-auth/react';

import { EasyContext, easyReducer } from './';
import { getListAnalyst, getListLeader, initExchangeValue } from '../services';
import { typesReducer as types } from '../helpers';
import { constProfiles as Profile } from '../helpers/config';

export const EASY_INITIAL_STATE = {
   expandedRows: [],
   general: {
      DOLLAR: 0,
      UDI: 0,
      alertsModel: {
         show: false,
         alerts: [],
      },
   },
   isReloading: false,
   listAnalyst: [],
   listLeaders: [],
   loader: {
      isShow: false,
      msg: 'Procesando...',
   },
   settings: {
      menu: [],
      path: '',
      startPage: '',
   },
   showPDF: {
      folio: 0,
      isShow: false,
      src: '',
      title: '',
      idRequest: '',
      idClient: '',
      prefixName: '',
      typePDF: 'DOCUMENTS',
   },
   stepper: {
      isShow: false,
      step: 1,
      options: [],
      config: {
         bgColorContainer: 'bg-black',
         bgOption: 'bg-white',
         bgOptionActive: 'bg-blue-800',
         color: 'text-white',
         txtColorActive: 'text-white',
         txtOption: 'text-black',
      },
   },
   user: undefined,
   verifyProperty: {
      open: false,
      item: {
         catTypePerson: 0,
         check: false,
         checkDate: '',
         checkNumber: 0,
         currency: 'MXN',
         description: '',
         idCheckOwnership: null,
         idRelOwnership: null,
         otherName1: '',
         otherName2: '',
         otherName3: '',
         otherName4: '',
         ownerName: '',
         ownershipStatus: '',
         ownershipValue: '',
         ownerType: '',
         typeValue: '',
      },
   },
   pagination: {
      currentPage: 1,
      sourcePage: 0,
      sourceTotalPages: 0,
      totalPages: 1,
      type: '',
   },
};

export const EasyProvider = ({ children }) => {
   const { status, data } = useSession();
   const [state, dispatch] = useReducer(easyReducer, EASY_INITIAL_STATE);

   useEffect(() => {
      if (status === 'authenticated') {
         // Setea los datos del inicio de sesión
         dispatch({ type: types.Login, payload: { ...data } });
         // Se obtienen datos de uso común
         setInitData();
      }
   }, [status, data]);

   const setDataAnalyst = async (reloading = false) => {
      try {
         // * Carga el listado de Analistas en el Context y se actualiza cada hora.
         const listAnalyst = JSON.parse(localStorage.getItem('listAnalyst'));
         const fiveMinutes = 300000;
         const currentTime = Date.now();
         let data;
         if (
            _.isEmpty(listAnalyst) ||
            _.isEmpty(listAnalyst?.list) ||
            currentTime - listAnalyst?.timeStamp >= fiveMinutes
         ) {
            const result = await getListAnalyst();
            data = result?.data;
         } else {
            data = listAnalyst?.list || [];
         }
         //* Reloading sirve para recargar el listado de solicitudes
         dispatch({ type: types.SetAnalyst, payload: { data, reloading } });
      } catch (error) {
         console.log(error);
      }
   };

   const setDataLeader = async (reloading = false) => {
      try {
         //* Carga el listado de Analistas en el Context y se actualiza cada hora.
         const listLeader = JSON.parse(localStorage.getItem('listLeader'));
         const fiveMinutes = 60 * 5 * 1000,
            currentTime = Date.now();
         let payload = {
            data: [],
            reloading,
         };
         if (_.isEmpty(listLeader?.list) || currentTime - listLeader?.timeStamp >= fiveMinutes) {
            const result = await getListLeader('LC');
            payload.data = result?.data;
         } else {
            payload.data = listLeader?.list;
         }
         //* Reloading sirve para recargar el listado de solicitudes
         dispatch({ type: types.SetLedears, payload });
      } catch (error) {
         console.log(error);
      }
   };

   const setInitData = async () => {
      let payload = {};
      try {
         payload = await initExchangeValue();
         localStorage.setItem('exchangeValue', JSON.stringify(payload));
         dispatch({ type: types.SetGeneral, payload });

         if (data?.user?.idProfile === Profile.LDC) {
            setDataAnalyst();
         }

         if ([Profile.LDC, Profile.MRC].includes(data?.user?.idProfile)) {
            setDataLeader();
         }
      } catch (error) {}
   };

   const setConfig = (config) => dispatch({ type: types.SetGeneral, payload: config });

   const toggleLoading = (text = 'Procesando...') => dispatch({ type: types.SetLoading, text });

   const toggleReloading = () => dispatch({ type: types.SetReloading });

   const togglePDF = (pdf) => dispatch({ type: types.ShowPDF, pdf });

   const toggleVerification = (item) => dispatch({ type: types.OpenVerification, item });

   const setExpandedRows = (rowId) => dispatch({ type: types.SetExpandedRows, rowId });

   const setStepper = (payload) => dispatch({ type: types.SetStepper, payload });

   const setPagination = (pagination) => dispatch({ type: types.SetPagination, pagination });

   const contextProps = useMemo(() => {
      let actions = {
         setConfig,
         setExpandedRows,
         setDataAnalyst,
         setPagination,
         setStepper,
         toggleLoading,
         togglePDF,
         toggleReloading,
         toggleVerification,
      };

      return { ...state, actions };
   }, [state]);

   return <EasyContext.Provider value={contextProps}>{children}</EasyContext.Provider>;
};
