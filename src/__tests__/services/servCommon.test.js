import { getExchangeValue, initExchangeValue } from '../../services/servCommon';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servCommon', () => {
   let serviceMock;

   beforeEach(() => {
      serviceMock = { status: 200, data: { value: 10 } };

      genericFetch.mockImplementation(async () => serviceMock);
   });

   describe('getExchangeValue service', () => {
      test('when typeExchange parameter is not defined it uses "DOLLAR" as default value for the fetch', async () => {
         await getExchangeValue();

         expect(genericFetch.mock.calls[0][0].url).toBe('/credit/getExchangeValue?exchange=DOLLAR');
      });

      test('when fetch response status is different than 200 it returns 0', async () => {
         serviceMock.status = 500;

         const result = await getExchangeValue();

         expect(result).toBe(0);
      });

      test('when the value in the response is not defined it should return 0', async () => {
         delete serviceMock.data.value;

         const result = await getExchangeValue();

         expect(result).toBe(0);
      });

      test('when genericFetch throws an error it should return an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getExchangeValue();

         expect(result).toEqual({
            status: 500,
            value: 0,
            message: 'Ocurrió un error al consultar el valor de DOLLAR | error: Error: Test Error Message',
         });
      });
   });

   describe('initExchangeValue service', () => {
      let dollarMock;
      let udiMock;

      beforeEach(() => {
         dollarMock = { status: 200, data: { value: '10' } };
         udiMock = { status: 200, data: { value: '5' } };

         genericFetch.mockImplementation(async ({ url }) =>
            url === '/credit/getExchangeValue?exchange=DOLLAR' ? dollarMock : udiMock
         );
      });

      test('when DOLLAR and UDI are not defined in local storage it retrieves with getExchangeValue', async () => {
         const result = await initExchangeValue();

         expect(result).toEqual({ DOLLAR: '10', UDI: '5' });
      });

      test('when only DOLLAR is defined in local storage it retrieves the value of UDI only', async () => {
         localStorage.setItem('exchangeValue', JSON.stringify({ DOLLAR: '12' }));

         const result = await initExchangeValue();

         expect(genericFetch.mock.calls.length).toBe(1);
         expect(result).toEqual({ DOLLAR: '12', UDI: '5' });
      });

      test('when only UDI is defined in local storage it retrieves the value of DOLLAR only', async () => {
         localStorage.setItem('exchangeValue', JSON.stringify({ UDI: '4' }));

         const result = await initExchangeValue();

         expect(genericFetch.mock.calls.length).toBe(1);
         expect(result).toEqual({ DOLLAR: '10', UDI: '4' });
      });

      test('when fetch throws an error it logs that error', async () => {
         const consoleMock = jest.fn();
         jest.spyOn(console, 'log').mockImplementationOnce(consoleMock);
         jest.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
            throw new Error('Test Error Message');
         });

         await initExchangeValue();

         expect(consoleMock).toHaveBeenCalledWith(new Error('Test Error Message'));
      });
   });
});
