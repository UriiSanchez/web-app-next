import Swal from 'sweetalert2';

import {
   getExchangeValue,
   initExchangeValue,
   getChatsForRequest,
   postChatAndResponse,
   getListAnalyst,
   getListLeader,
   getTokenAPI,
} from '../../services/servCommon';
import { genericFetch, customAxios } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn(), customAxios: jest.fn() }));

const exchangeUrl = (type) => ({ url: `/credit/getExchangeValue?exchange=${type}`, method: 'GET' });

describe('servCommon', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getExchangeValue', () => {
      test('requests the DOLLAR value by default and returns it', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { value: '17.5' } });

         const result = await getExchangeValue();

         expect(genericFetch).toHaveBeenCalledWith(exchangeUrl('DOLLAR'));
         expect(result).toBe('17.5');
      });

      test('requests the given exchange type', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { value: '7.8' } });

         const result = await getExchangeValue('UDI');

         expect(genericFetch).toHaveBeenCalledWith(exchangeUrl('UDI'));
         expect(result).toBe('7.8');
      });

      test.each([
         ['the status is not 200', { status: 404 }],
         ['the response has no value', { status: 200, data: {} }],
         ['the response has no data', { status: 200 }],
         ['the value is empty', { status: 200, data: { value: '' } }],
      ])('returns 0 when %s', async (_label, response) => {
         genericFetch.mockResolvedValueOnce(response);

         await expect(getExchangeValue()).resolves.toBe(0);
      });

      test('returns an object with value 0 and the error message when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         const result = await getExchangeValue('UDI');

         expect(result.status).toBe(500);
         expect(result.value).toBe(0);
         expect(result.message).toContain('UDI');
         expect(result.message).toContain('Network down');
      });
   });

   describe('initExchangeValue', () => {
      const fetchByType = (values) =>
         genericFetch.mockImplementation(async ({ url }) => {
            const type = url.split('exchange=')[1];
            return { status: 200, data: { value: values[type] } };
         });

      test('requests the DOLLAR and the UDI when nothing is stored', async () => {
         fetchByType({ DOLLAR: '17.5', UDI: '7.8' });

         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '17.5', UDI: '7.8' });
         expect(genericFetch).toHaveBeenCalledTimes(2);
      });

      test('requests them too when the stored value is empty', async () => {
         localStorage.setItem('exchangeValue', JSON.stringify({}));
         fetchByType({ DOLLAR: '17.5', UDI: '7.8' });

         await expect(initExchangeValue()).resolves.toEqual({ DOLLAR: '17.5', UDI: '7.8' });
      });

      test('returns the stored values without requesting anything when both are valid', async () => {
         localStorage.setItem('exchangeValue', JSON.stringify({ DOLLAR: '18', UDI: '8' }));

         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '18', UDI: '8' });
         expect(genericFetch).not.toHaveBeenCalled();
      });

      test.each([
         ['missing', { UDI: '8' }],
         ['zero', { DOLLAR: '0', UDI: '8' }],
         ['not numeric', { DOLLAR: 'abc', UDI: '8' }],
         ['empty', { DOLLAR: '', UDI: '8' }],
      ])('requests only the DOLLAR when the stored DOLLAR is %s', async (_label, stored) => {
         localStorage.setItem('exchangeValue', JSON.stringify(stored));
         fetchByType({ DOLLAR: '17.5' });

         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '17.5', UDI: '8' });
         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(genericFetch).toHaveBeenCalledWith(exchangeUrl('DOLLAR'));
      });

      test.each([
         ['missing', { DOLLAR: '18' }],
         ['zero', { DOLLAR: '18', UDI: '0' }],
         ['not numeric', { DOLLAR: '18', UDI: 'abc' }],
      ])('requests only the UDI when the stored DOLLAR is valid and the UDI is %s', async (_label, stored) => {
         localStorage.setItem('exchangeValue', JSON.stringify(stored));
         fetchByType({ UDI: '7.8' });

         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '18', UDI: '7.8' });
         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(genericFetch).toHaveBeenCalledWith(exchangeUrl('UDI'));
      });

      // Con un DOLLAR inválido el else-if impide revisar la UDI: se conserva el valor guardado aunque sea inválido.
      test('does not refresh an invalid UDI when the DOLLAR is also invalid', async () => {
         localStorage.setItem('exchangeValue', JSON.stringify({ DOLLAR: '0', UDI: '0' }));
         fetchByType({ DOLLAR: '17.5', UDI: '7.8' });

         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '17.5', UDI: '0' });
      });

      test('returns undefined when the stored value is not valid JSON', async () => {
         localStorage.setItem('exchangeValue', 'not json');

         await expect(initExchangeValue()).resolves.toBeUndefined();
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });

   describe('getChatsForRequest', () => {
      const chat = {
         fullName: 'Ana Maria Lopez',
         messageResponse: [
            { text: 'Hi', fullName: 'Luis Perez' },
            { text: 'Hello', fullName: 'Carlos' },
         ],
      };

      test('requests the chat of the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { chatConversation: [] } });

         await getChatsForRequest(7);

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/getChat?idRequest=7', method: 'GET' });
      });

      test('adds the initials of the author to every conversation and message', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { chatConversation: [chat] } });

         const result = await getChatsForRequest(7);

         expect(result).toEqual([
            {
               fullName: 'Ana Maria Lopez',
               firstLetters: 'AM',
               messageResponse: [
                  { text: 'Hi', fullName: 'Luis Perez', firstLetters: 'LP' },
                  { text: 'Hello', fullName: 'Carlos', firstLetters: 'C' },
               ],
            },
         ]);
      });

      test('returns an empty list without showing an error when there is no chat', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404 });

         await expect(getChatsForRequest(7)).resolves.toEqual([]);
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('shows the error dialog and returns an empty list when the status is not 200 or 404', async () => {
         genericFetch.mockResolvedValueOnce({ status: 500, error: 'Failure' });

         await expect(getChatsForRequest(7)).resolves.toEqual([]);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });

      test('returns an empty list when the response has no data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await expect(getChatsForRequest(7)).resolves.toEqual([]);
      });

      test('returns an empty list when the conversation cannot be processed', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         await expect(getChatsForRequest(7)).resolves.toEqual([]);
      });

      test('returns an empty list when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(getChatsForRequest(7)).resolves.toEqual([]);
      });
   });

   describe('postChatAndResponse', () => {
      test('posts the body with SAVE_FATHER as the default operation', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         const result = await postChatAndResponse('{"text":"Hi"}');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/chat?chatOperationTypeEnum=SAVE_FATHER',
            method: 'POST',
            data: '{"text":"Hi"}',
         });
         expect(result).toEqual({ status: 200 });
      });

      test('posts the body with the given operation', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await postChatAndResponse('{"text":"Hi"}', 'SAVE_RESPONSE');

         expect(genericFetch).toHaveBeenCalledWith(
            expect.objectContaining({ url: '/credit/chat?chatOperationTypeEnum=SAVE_RESPONSE' })
         );
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(postChatAndResponse('{}')).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al guardar los representantes',
            error,
         });
      });
   });

   describe('getListAnalyst', () => {
      test('maps the analysts, returns them and caches them with a timestamp', async () => {
         jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [{ idUser: 'ana.ad', name: 'Ana Maria Lopez', profile: 'LDC' }],
         });

         const result = await getListAnalyst();

         const expectedList = [{ profile: 'LDC', userAD: 'ana.ad', fullName: 'Ana Maria Lopez', firstLetters: 'AM' }];
         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/Related/getAnalyst', method: 'GET' });
         expect(result).toEqual({ status: 200, data: expectedList });
         expect(JSON.parse(localStorage.getItem('listAnalyst'))).toEqual({
            list: expectedList,
            timeStamp: 1700000000000,
         });
      });

      test('returns an empty list and does not cache when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(getListAnalyst()).resolves.toEqual({ status: 404, error: 'Not found', data: [] });
         expect(localStorage.getItem('listAnalyst')).toBeNull();
      });

      test.each([
         ['rejects', () => genericFetch.mockRejectedValueOnce(new Error('Network down'))],
         ['returns data that is not a list', () => genericFetch.mockResolvedValueOnce({ status: 200, data: {} })],
      ])('returns a 500 object with an empty list when the fetch %s', async (_label, arrange) => {
         arrange();

         await expect(getListAnalyst()).resolves.toEqual({ status: 500, data: [] });
         expect(localStorage.getItem('listAnalyst')).toBeNull();
      });
   });

   describe('getListLeader', () => {
      const leader = {
         idUser: 1,
         firstName: 'Ana',
         secondName: 'Maria',
         firstSurname: 'Lopez',
         secondSurname: 'Perez',
      };

      test('requests all the users when there is no profile filter', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [] });

         await getListLeader();

         expect(genericFetch).toHaveBeenCalledWith({ url: '/v1/users', method: 'GET', addToken: true });
      });

      test('filters the users by profile', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [] });

         await getListLeader('LDC');

         expect(genericFetch).toHaveBeenCalledWith({ url: '/v1/users?profileId=LDC', method: 'GET', addToken: true });
      });

      test('adds the full name of every leader and caches the list with a timestamp', async () => {
         jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
         genericFetch.mockResolvedValueOnce({ status: 200, data: [leader] });

         const result = await getListLeader();

         const expectedList = [{ ...leader, fullName: 'Ana Maria Lopez Perez' }];
         expect(result).toEqual({ status: 200, data: expectedList });
         expect(JSON.parse(localStorage.getItem('listLeader'))).toEqual({
            list: expectedList,
            timeStamp: 1700000000000,
         });
      });

      test('leaves an empty space in the full name when the leader has no second name', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [{ ...leader, secondName: null }] });

         const { data } = await getListLeader();

         expect(data[0].fullName).toBe('Ana  Lopez Perez');
      });

      test('returns an empty list and does not cache when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 401, error: 'Unauthorized' });

         await expect(getListLeader()).resolves.toEqual({ status: 401, error: 'Unauthorized', data: [] });
         expect(localStorage.getItem('listLeader')).toBeNull();
      });

      test.each([
         ['rejects', () => genericFetch.mockRejectedValueOnce(new Error('Network down'))],
         ['returns data that is not a list', () => genericFetch.mockResolvedValueOnce({ status: 200, data: {} })],
      ])('returns a 500 object with an empty list when the fetch %s', async (_label, arrange) => {
         arrange();

         await expect(getListLeader()).resolves.toEqual({ status: 500, data: [] });
         expect(localStorage.getItem('listLeader')).toBeNull();
      });
   });

   describe('getTokenAPI', () => {
      const originalRandomUUID = global.crypto?.randomUUID;

      beforeEach(() => {
         process.env.NEXT_SECRET_CLIENT = 'secret';
         process.env.NEXT_SECRET_ID = 'client-id';
         Object.defineProperty(global.crypto, 'randomUUID', { value: () => 'trace-uuid', configurable: true });
      });

      afterEach(() => {
         delete process.env.NEXT_SECRET_CLIENT;
         delete process.env.NEXT_SECRET_ID;
         Object.defineProperty(global.crypto, 'randomUUID', { value: originalRandomUUID, configurable: true });
      });

      test('requests the token with the client credentials and a trace id', async () => {
         customAxios.mockResolvedValueOnce({ status: 200, data: { token: 'abc' } });

         const result = await getTokenAPI();

         expect(customAxios).toHaveBeenCalledWith('/v1/auth/token', 'POST', {
            'X-Trace-Id': 'trace-uuid',
            'X-Client-Secret': 'secret',
            'X-Client-ID': 'client-id',
         });
         expect(result).toEqual({ status: 200, message: '', token: 'abc' });
      });

      test('returns an empty token when the response has none', async () => {
         customAxios.mockResolvedValueOnce({ status: 200 });

         await expect(getTokenAPI()).resolves.toEqual({ status: 200, message: '', token: '' });
      });

      test('returns the status, the error and an empty token when the status is not 200', async () => {
         customAxios.mockResolvedValueOnce({ status: 401, error: 'Bad credentials' });

         await expect(getTokenAPI()).resolves.toEqual({
            status: 401,
            message: 'La solicitud no pudo ser procesada: Bad credentials',
            token: '',
         });
      });

      test('returns the status of the response error when the request rejects', async () => {
         customAxios.mockRejectedValueOnce({ response: { status: 503 }, toString: () => 'Service unavailable' });

         await expect(getTokenAPI()).resolves.toEqual({
            status: 503,
            message: 'Ocurrió el siguiente error al obtener el token:Service unavailable',
         });
      });

      test('returns status 500 when the request rejects without a response', async () => {
         customAxios.mockRejectedValueOnce(new Error('Network down'));

         const result = await getTokenAPI();

         expect(result.status).toBe(500);
         expect(result.message).toContain('Network down');
      });
   });
});
