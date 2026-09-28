import axios from 'axios';

class AxiosSingleton {
   static instance;

   constructor() {
      if (!AxiosSingleton.instance) {
         AxiosSingleton.instance = axios.create({ baseURL: API_ADDRESS, timeout: 120000, headers: defaultHeaders });
      }
      return AxiosSingleton.instance;
   }
}

const API_ADDRESS = process.env.NEXT_PUBLIC_API_URL;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const defaultHeaders = {
   'X-Content-Type-Options': 'nosniff',
   'Content-Type': 'application/json',
   'Cache-Control': 'no-cache',
   'X-Application-Name': APP_NAME,
};

export const customAxios = async (endPoint, method, customHeaders = {}, data = undefined) => {
   try {
      const client = new AxiosSingleton();
      let config = {
         method,
         url: endPoint,
         headers: { ...customHeaders },
         data,
      };

      const response = await client(config);
      return { status: response?.status, data: response.data };
   } catch ({ status, response, message }) {
      const errorMessage = message || 'Error interno en el servicio';
      console.error(`[Axios Error] - ${message}.`, response?.data);
      return { status: response?.status, error: response?.data || errorMessage };
   }
};
