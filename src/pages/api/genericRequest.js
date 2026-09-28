import _ from 'lodash';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { customAxios } from '../../hooks';
import { getTokenAPI } from '../../services';

export default async function handler(req, res) {
   try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
         res.status(401).json({ message: 'Proceso no autorizado' });
      }

      if (_.isEmpty(req.body?.url) || _.isEmpty(req.body?.method)) {
         return res.status(400).json({ message: 'Es necesario pasar url/metodo para procesar la petición' });
      }

      let header = { 'X-Trace-Id': crypto.randomUUID() };

      if (!_.isUndefined(req.body?.addToken) && req.body?.addToken === true) {
         let result = await getTokenAPI();
         header['Authorization'] = `Bearer ${result?.token}`;
      }

      const result = await customAxios(req.body?.url, req.body?.method, header, req.body?.data);
      res.status(result?.status || 200).json(result);
   } catch (error) {
      res.status(500).json(error?.message);
   }
}
