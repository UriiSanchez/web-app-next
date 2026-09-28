import { genericFetch } from '../hooks';
import { setOnlyIsToSave } from '../helpers';

const onlySave = [
   'idClient',
   'neighborhood',
   'address',
   'city',
   'state',
   'zipCode',
   'exteriorNumber',
   'interiorNumber',
   'municipality',
   'creditReference',
   'accountType',
   'userModify',
   'idRequest',
];

export const updateInfoClient = (data) => {
   let newData = setOnlyIsToSave(onlySave, data);
   return genericFetch({
      url: '/credit/Related/updateInfo',
      method: 'patch',
      data: JSON.stringify(newData),
   }).catch((error) => ({ status: 500, error }));
};

export const onBureauConfirmation = (data) => {
   return genericFetch({
      url: '/credit/Related/updateInfo',
      method: 'patch',
      data: JSON.stringify(data),
   }).catch((error) => ({ status: 500, error }));
};

export const execCreditBureuQuery = (data) => {
   return genericFetch({
      url: '/financial/bureau',
      method: 'post',
      data: JSON.stringify(data),
   }).catch((error) => ({ status: 500, error }));
};
