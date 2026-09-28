import Swal from 'sweetalert2';

import {
   getBalanceSheet,
   saveBalanceSheet,
   statusGeneralBalance,
   partialTypeBGMapping,
} from '../../services/servBalanceSheet';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const balanceResponse = (periods, extra = {}) => ({
   status: 200,
   data: { dateElaboration: '2024-01-24T12:05:20', periods, ...extra },
});

describe('servBalanceSheet', () => {
   beforeEach(() => {
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getBalanceSheet', () => {
      test('requests the balance sheet by rfc, request and client', async () => {
         genericFetch.mockResolvedValueOnce(balanceResponse([]));

         await getBalanceSheet('RFC123', 7, 99);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/financial/getBalanceSheet/RFC123/7?idClient=99&dataOriginEnum=MANUAL',
            method: 'get',
         });
      });

      test('flags every concept as summary, automatic or tooltip according to its id', async () => {
         genericFetch.mockResolvedValueOnce(
            balanceResponse([
               {
                  periodType: 'ANNUAL',
                  concepts: [
                     { idItemChild: 43 },
                     { idItemChild: 101 },
                     { idItemChild: 66 },
                     { idItemChild: 97 },
                     { idItemChild: 1 },
                  ],
               },
            ])
         );

         const { data } = await getBalanceSheet('RFC', 1, 1);
         const flags = data.periods[0].concepts.map(({ summary, automatic, toolTip }) => ({
            summary,
            automatic,
            toolTip,
         }));

         expect(flags).toEqual([
            { summary: true, automatic: false, toolTip: false },
            { summary: false, automatic: true, toolTip: false },
            { summary: false, automatic: false, toolTip: true },
            { summary: false, automatic: true, toolTip: true },
            { summary: false, automatic: false, toolTip: false },
         ]);
      });

      test('defaults percentage to "0" and value to null on regular concepts but keeps the financial liability concepts as they come', async () => {
         genericFetch.mockResolvedValueOnce(
            balanceResponse([
               {
                  periodType: 'ANNUAL',
                  concepts: [
                     { idItemChild: 1, percentage: '', value: '' },
                     { idItemChild: 2, percentage: '12.5', value: '300' },
                     { idItemChild: 97, percentage: '', value: '' },
                  ],
               },
            ])
         );

         const { data } = await getBalanceSheet('RFC', 1, 1);
         const [empty, filled, financial] = data.periods[0].concepts;

         expect(empty).toMatchObject({ percentage: '0', value: null });
         expect(filled).toMatchObject({ percentage: '12.5', value: '300' });
         expect(financial).toMatchObject({ percentage: '', value: '' });
      });

      test('calculates the difference between financial and bureau liabilities', async () => {
         genericFetch.mockResolvedValueOnce(
            balanceResponse([
               {
                  periodType: 'ANNUAL',
                  concepts: [
                     { idItemChild: 97, value: '1000' },
                     { idItemChild: 100, value: '400' },
                     { idItemChild: 101, value: '' },
                  ],
               },
            ])
         );

         const { data } = await getBalanceSheet('RFC', 1, 1);

         expect(data.periods[0].concepts.find((c) => c.idItemChild === 101).value).toBe('600');
      });

      test('removes monthIncludes from annual periods and sets the internal source for partial ones', async () => {
         genericFetch.mockResolvedValueOnce(
            balanceResponse([
               { periodType: 'ANNUAL', monthIncludes: 12, officeOrAccountant: 'Office', concepts: [] },
               { periodType: 'PARTIAL', monthIncludes: 6, officeOrAccountant: 'Office', concepts: [] },
            ])
         );

         const { data } = await getBalanceSheet('RFC', 1, 1);

         expect(data.periods[0]).not.toHaveProperty('monthIncludes');
         expect(data.periods[0].officeOrAccountant).toBe('Office');
         expect(data.periods[1].sourceInformation).toBe('Interno');
         expect(data.periods[1]).not.toHaveProperty('officeOrAccountant');
         expect(data.periods[1].monthIncludes).toBe(6);
      });

      test('formats the elaboration date and keeps the other fields of the response', async () => {
         genericFetch.mockResolvedValueOnce(balanceResponse([], { rfc: 'RFC123' }));

         const result = await getBalanceSheet('RFC', 1, 1);

         expect(result.status).toBe(200);
         expect(result.data.dateElaboration).toBe('24-01-2024');
         expect(result.data.rfc).toBe('RFC123');
      });

      test('uses the "-" placeholder when the response has no elaboration date', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { periods: [] } });

         const { data } = await getBalanceSheet('RFC', 1, 1);

         expect(data.dateElaboration).toBe('-');
      });

      test('replaces the cached balance sheet with the new one', async () => {
         localStorage.setItem('BS_Page', JSON.stringify({ stale: true }));
         genericFetch.mockResolvedValueOnce(balanceResponse([], { rfc: 'RFC123' }));

         const { data } = await getBalanceSheet('RFC', 1, 1);

         expect(JSON.parse(localStorage.getItem('BS_Page'))).toEqual(data);
      });

      test('clears the cache, shows the error dialog and returns the response when the status is not 200', async () => {
         localStorage.setItem('BS_Page', JSON.stringify({ stale: true }));
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getBalanceSheet('RFC', 1, 1);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(localStorage.getItem('BS_Page')).toBeNull();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('shows the server error dialog and returns a 500 object when the payload cannot be processed', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         const result = await getBalanceSheet('RFC', 1, 1);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });
   });

   describe('saveBalanceSheet', () => {
      test('sends the balance sheet as JSON with PUT', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await saveBalanceSheet({ rfc: 'RFC', periods: [] });

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/financial/saveBalanceSheet',
            method: 'put',
            data: JSON.stringify({ rfc: 'RFC', periods: [] }),
         });
         expect(result).toEqual({ status: 204 });
      });

      test('returns the response untouched when the status is not successful', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(saveBalanceSheet({})).resolves.toEqual({ status: 400, error: 'Bad request' });
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(saveBalanceSheet({})).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al guardar la información',
            error,
         });
      });
   });

   describe('statusGeneralBalance', () => {
      test('returns false when every period is completely filled', () => {
         const form = {
            periods: [
               { year: 2023, concepts: [{ value: 1 }] },
               { year: 2022, concepts: [{ value: 2 }] },
            ],
         };

         expect(statusGeneralBalance(form)).toBe(false);
      });

      test.each([
         ['an empty string', { year: '', concepts: [] }],
         ['a null', { year: 2023, concepts: [{ value: null }] }],
         ['an undefined', { year: 2023, concepts: [{ value: undefined }] }],
      ])('returns true when a period has %s, even nested', (_label, incomplete) => {
         const form = { periods: [{ year: 2022, concepts: [] }, incomplete] };

         expect(statusGeneralBalance(form)).toBe(true);
      });

      test('returns false when there are no periods', () => {
         expect(statusGeneralBalance({ periods: [] })).toBe(false);
      });
   });

   describe('partialTypeBGMapping', () => {
      test('PARTIAL sets the internal source and removes the office or accountant', () => {
         const period = { officeOrAccountant: 'Office', monthIncludes: 3 };

         partialTypeBGMapping.PARTIAL(period);

         expect(period).toEqual({ sourceInformation: 'Interno', monthIncludes: 3 });
      });

      test('ANNUAL removes the months included', () => {
         const period = { officeOrAccountant: 'Office', monthIncludes: 12 };

         partialTypeBGMapping.ANNUAL(period);

         expect(period).toEqual({ officeOrAccountant: 'Office' });
      });
   });
});
