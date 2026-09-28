import { genericFetch } from '../hooks';
import { ModelClass } from '../helpers';

export const getValidateModel = async (idGroup, user) => {
   return genericFetch({
      url: `/financial/model/validateModel/${idGroup + '/' + user}`,
      method: 'get',
   }).catch((error) => ({ status: 500, message: error?.message }));
};

export const postExecutionModel = async (idGroup, user) => {
   return genericFetch({
      url: `/financial/model/executeModel/${idGroup + '/' + user}`,
      method: 'post',
   }).catch((error) => ({ status: 500, message: error?.message }));
};

export const getResultModel = async (idGroup) => {
   try {
      const result = await genericFetch({
         url: `/financial/model/retrieveModelResult/${idGroup}`,
         method: 'get',
      });

      if (result.status != 200) {
         return result;
      }
      return { ...result, data: ModelClass.initialization(result.data) };
   } catch (error) {
      console.log(error);
      return { status: 500, message: error?.message };
   }
};
