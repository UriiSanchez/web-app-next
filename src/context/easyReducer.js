import { EASY_INITIAL_STATE } from './';
import { initContext, typesReducer as types } from '../helpers';

export const easyReducer = (state = EASY_INITIAL_STATE, action) => {
   switch (action.type) {
      case types.Login:
         const {
            user: { settings, ...others },
         } = action.payload;
         return {
            ...state,
            settings,
            user: { ...others, path: settings.path, status: settings.status },
         };
      case types.Logout:
         return {
            ...state,
            user: undefined,
         };
      case types.OpenVerification:
         const {
            verifyProperty: { item, open },
            user,
         } = state;
         let attribute = (action?.item?.idCheckOwnership && 'userModify') || 'userCreate';
         return {
            ...state,
            verifyProperty: {
               open: !open,
               item:
                  action.item != undefined ? { ...item, ...action.item, [attribute]: user.userAD } : { ...initContext },
            },
         };
      case types.SetAnalyst:
         return {
            ...state,
            listAnalyst: action.payload.data,
            isReloading: action.payload?.reloading,
         };
      case types.SetExpandedRows:
         let newRows = state.expandedRows.includes(action.rowId)
            ? state.expandedRows.filter((id) => id !== action.rowId)
            : [...state.expandedRows, action.rowId];
         return {
            ...state,
            expandedRows: newRows,
         };
      case types.SetGeneral:
         return {
            ...state,
            general: {
               ...state.general,
               ...action.payload,
            },
         };
      case types.SetLedears:
         return {
            ...state,
            listLeaders: action.payload.data,
            isReloading: action.payload?.reloading || false,
         };
      case types.SetLoading:
         return {
            ...state,
            loader: {
               isShow: !state.loader.isShow,
               msg: action.text,
            },
         };
      case types.SetPagination:
         return {
            ...state,
            pagination: { ...state.pagination, ...action.pagination },
         };
      case types.SetReloading:
         return {
            ...state,
            isReloading: !state.isReloading,
         };
      case types.SetStepper:
         return {
            ...state,
            stepper: { ...state.stepper, ...action.payload },
         };
      case types.ShowPDF:
         return {
            ...state,
            showPDF: { isShow: !state.showPDF.isShow, ...action.pdf },
         };
      default:
         return state;
   }
};
