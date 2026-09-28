import { isEmpty } from 'lodash';

export const getClassInput = (info, disabled, isSave, isWrong = false) => {
   if (disabled) return 'disabled';
   if (isWrong) return 'wrong';
   if (isEmpty(info) && isSave) return 'mandatory';
   return '';
};
