import { getServerSession } from 'next-auth';

import handler from '../../../pages/api/genericRequest';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import { customAxios } from '../../../hooks';
import { getTokenAPI } from '../../../services';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
// authOptions se importa real; estos módulos externos cargan `jose` (ESM), que Jest no transforma.
jest.mock('next-auth/next', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('next-auth/providers/credentials', () => ({ __esModule: true, default: jest.fn(() => ({})) }));
jest.mock('../../../hooks', () => ({ customAxios: jest.fn() }));
jest.mock('../../../services', () => ({ getTokenAPI: jest.fn() }));

const TRACE_ID = '11111111-2222-3333-4444-555555555555';

const createRes = () => {
   const res = { status: jest.fn(), json: jest.fn() };
   res.status.mockReturnValue(res);
   return res;
};
const createReq = (body) => ({ body });

beforeEach(() => {
   Object.defineProperty(globalThis, 'crypto', { value: { randomUUID: () => TRACE_ID }, configurable: true });
   getServerSession.mockResolvedValue({ user: { fullName: 'Ana Lopez' } });
});

describe('genericRequest handler', () => {
   describe('validation', () => {
      test.each([
         ['there is no body', undefined],
         ['the url is missing', { method: 'GET' }],
         ['the url is empty', { url: '', method: 'GET' }],
         ['the method is missing', { url: '/api/clients' }],
         ['the method is empty', { url: '/api/clients', method: '' }],
      ])('responds 400 without calling the API when %s', async (_label, body) => {
         const res = createRes();

         await handler(createReq(body), res);

         expect(res.status).toHaveBeenCalledWith(400);
         expect(res.json).toHaveBeenCalledWith({
            message: 'Es necesario pasar url/metodo para procesar la petición',
         });
         expect(customAxios).not.toHaveBeenCalled();
      });

      test('checks the session with the request, the response and the auth options', async () => {
         const req = createReq({ url: '/api/clients', method: 'GET' });
         const res = createRes();
         customAxios.mockResolvedValue({ status: 200 });

         await handler(req, res);

         expect(getServerSession).toHaveBeenCalledWith(req, res, authOptions);
      });
   });

   describe('authorization', () => {
      test('responds 401 when there is no session', async () => {
         getServerSession.mockResolvedValue(null);
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(401);
         expect(res.json).toHaveBeenCalledWith({ message: 'Proceso no autorizado' });
      });

      // Defecto documentado: tras responder 401 el handler no hace `return` y sigue procesando la
      // petición. La prueba fija el comportamiento actual; si se corrige, debe invertirse.
      test('keeps processing the request after responding 401 (missing return)', async () => {
         getServerSession.mockResolvedValue(null);
         customAxios.mockResolvedValue({ status: 200, data: [] });
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(customAxios).toHaveBeenCalledTimes(1);
         expect(res.status).toHaveBeenNthCalledWith(1, 401);
         expect(res.status).toHaveBeenNthCalledWith(2, 200);
      });
   });

   describe('request forwarding', () => {
      test('forwards url, method, trace header and data to customAxios and returns its result', async () => {
         const result = { status: 200, data: [{ id: 1 }] };
         customAxios.mockResolvedValue(result);
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'POST', data: { name: 'Ana' } }), res);

         expect(customAxios).toHaveBeenCalledWith('/api/clients', 'POST', { 'X-Trace-Id': TRACE_ID }, { name: 'Ana' });
         expect(getTokenAPI).not.toHaveBeenCalled();
         expect(res.status).toHaveBeenCalledWith(200);
         expect(res.json).toHaveBeenCalledWith(result);
      });

      test('uses the status returned by customAxios', async () => {
         const result = { status: 404, data: { message: 'No existe' } };
         customAxios.mockResolvedValue(result);
         const res = createRes();

         await handler(createReq({ url: '/api/clients/9', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(404);
         expect(res.json).toHaveBeenCalledWith(result);
      });

      test('defaults to status 200 when the result has no status', async () => {
         customAxios.mockResolvedValue({ data: 'ok' });
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(200);
         expect(res.json).toHaveBeenCalledWith({ data: 'ok' });
      });

      test('defaults to status 200 and a null body when customAxios returns nothing', async () => {
         customAxios.mockResolvedValue(undefined);
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(200);
         expect(res.json).toHaveBeenCalledWith(undefined);
      });
   });

   describe('API token', () => {
      test('adds the bearer token header when addToken is true', async () => {
         getTokenAPI.mockResolvedValue({ token: 'abc123' });
         customAxios.mockResolvedValue({ status: 200 });
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET', addToken: true, data: null }), res);

         expect(getTokenAPI).toHaveBeenCalledTimes(1);
         expect(customAxios).toHaveBeenCalledWith(
            '/api/clients',
            'GET',
            { 'X-Trace-Id': TRACE_ID, Authorization: 'Bearer abc123' },
            null
         );
      });

      test.each([
         ['false', false],
         ['a non-boolean truthy value', 'true'],
         ['undefined', undefined],
      ])('does not request a token when addToken is %s', async (_label, addToken) => {
         customAxios.mockResolvedValue({ status: 200 });
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET', addToken }), res);

         expect(getTokenAPI).not.toHaveBeenCalled();
         expect(customAxios).toHaveBeenCalledWith('/api/clients', 'GET', { 'X-Trace-Id': TRACE_ID }, undefined);
      });
   });

   describe('errors', () => {
      test('responds 500 with the error message when customAxios throws', async () => {
         customAxios.mockRejectedValue(new Error('Network down'));
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(500);
         expect(res.json).toHaveBeenCalledWith('Network down');
      });

      test('responds 500 when the session check throws', async () => {
         getServerSession.mockRejectedValue(new Error('Session error'));
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET' }), res);

         expect(res.status).toHaveBeenCalledWith(500);
         expect(res.json).toHaveBeenCalledWith('Session error');
         expect(customAxios).not.toHaveBeenCalled();
      });

      test('responds 500 when the token request throws', async () => {
         getTokenAPI.mockRejectedValue(new Error('Token error'));
         const res = createRes();

         await handler(createReq({ url: '/api/clients', method: 'GET', addToken: true }), res);

         expect(res.status).toHaveBeenCalledWith(500);
         expect(res.json).toHaveBeenCalledWith('Token error');
         expect(customAxios).not.toHaveBeenCalled();
      });
   });
});
