import Swal from 'sweetalert2';

import { getStateResults, saveStateResults, statusStateResults } from '../../services/servStateResults';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

describe('servStateResults', () => {
   beforeEach(() => {
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getStateResults', () => {
      const apiData = {
         rfc: 'RFC123',
         idRequest: 7,
         idClient: 99,
         userModify: 'analyst',
         status: 'OPEN',
         fullName: 'Client SA',
         idCatTypePerson: 2,
         dateElaboration: '2024-01-24T12:05:20',
         periods: [
            {
               periodType: 'ANNUAL',
               year: 2023,
               month: 'December',
               sourceInformation: 'Internal',
               officeOrAccountant: 'Office',
               monthIncludes: '12',
               concepts: [
                  { description: 'Net sales', id: '1', amount: '1000', percentage: '100' },
                  { description: 'Gross profit', id: '3', amount: '', percentage: '55' },
                  { description: 'Costs', id: '2', amount: '450', percentage: '45' },
               ],
               depreciationSchedule: [{ description: 'Depreciation', id: '21', amount: '10', percentage: '1' }],
               analyseOperating: [{ description: 'Domestic sales', id: '23', amount: '800', percentage: '80' }],
            },
         ],
      };

      test('requests the state results by request and client', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData });

         await getStateResults(7, 99);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/financial/getResultState/7/99?dataOriginEnum=MANUAL',
            method: 'get',
         });
      });

      test('maps the header fields and formats the elaboration date', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData });

         const { status, data } = await getStateResults(7, 99);

         expect(status).toBe(200);
         expect(data).toMatchObject({
            rfc: 'RFC123',
            idRequest: 7,
            idClient: 99,
            userModify: 'analyst',
            status: 'OPEN',
            fullName: 'Client SA',
            idCatTypePerson: 2,
            dateElaboration: '24-01-2024',
         });
      });

      test('maps the periods and flags the automatic and tooltip concepts', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData });

         const { data } = await getStateResults(7, 99);
         const [period] = data.periods;

         expect(period).toMatchObject({
            periodType: 'ANNUAL',
            year: 2023,
            month: 'December',
            sourceInformation: 'Internal',
            officeOrAccountant: 'Office',
            monthIncludes: 12,
         });
         expect(period.concepts).toEqual([
            { description: 'Net sales', id: '1', amount: '1000', percentage: '100', automatic: false, toolTip: true },
            { description: 'Gross profit', id: '3', amount: null, percentage: '0', automatic: true, toolTip: false },
            { description: 'Costs', id: '2', amount: '450', percentage: '45', automatic: false, toolTip: false },
         ]);
         expect(period.depreciationSchedule).toEqual([
            { description: 'Depreciation', id: '21', amount: '10', percentage: '1', automatic: false, toolTip: false },
         ]);
         expect(period.analyseOperating).toHaveLength(1);
      });

      test('applies defaults when the period fields are missing', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: { periods: [{ periodType: 'PARTIAL', month: null }] },
         });

         const { data } = await getStateResults(7, 99);

         expect(data.dateElaboration).toBe('-');
         expect(data.periods[0]).toMatchObject({
            year: 0,
            month: '',
            monthIncludes: 0,
            concepts: [],
            depreciationSchedule: [],
            analyseOperating: [],
         });
      });

      test('returns no periods when the response has no data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         const { data } = await getStateResults(7, 99);

         expect(data.periods).toEqual([]);
      });

      test('replaces the cached state results with the new ones', async () => {
         localStorage.setItem('SR_Page', JSON.stringify({ stale: true }));
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData });

         const { data } = await getStateResults(7, 99);

         expect(JSON.parse(localStorage.getItem('SR_Page'))).toEqual(data);
      });

      test('clears the cache, shows the error dialog and returns the response when the status is not 200', async () => {
         localStorage.setItem('SR_Page', JSON.stringify({ stale: true }));
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getStateResults(7, 99);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(localStorage.getItem('SR_Page')).toBeNull();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         const result = await getStateResults(7, 99);

         expect(result).toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });
   });

   describe('saveStateResults', () => {
      const payload = { rfc: 'RFC123', periods: [] };

      test('sends the state results as JSON with PUT and caches them when the server answers 204', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await saveStateResults(payload);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/financial/saveResultState',
            method: 'put',
            data: JSON.stringify(payload),
         });
         expect(result).toEqual({ status: 204 });
         expect(JSON.parse(localStorage.getItem('SR_Page'))).toEqual(payload);
      });

      test('shows the error dialog, returns the response and does not cache when the status is not 204', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         const result = await saveStateResults(payload);

         expect(result).toEqual({ status: 400, error: 'Bad request' });
         expect(localStorage.getItem('SR_Page')).toBeNull();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('La solicitud no pudo procesarse') })
         );
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         const result = await saveStateResults(payload);

         expect(result).toEqual({ status: 500, error });
         expect(localStorage.getItem('SR_Page')).toBeNull();
      });
   });

   describe('statusStateResults', () => {
      const period = (overrides = {}) => ({
         concepts: [
            { id: '1', amount: '100' },
            { id: '2', amount: '40' },
         ],
         depreciationSchedule: [{ id: '21', amount: '5' }],
         ...overrides,
      });

      test('returns true when every required amount has a value', () => {
         expect(statusStateResults([period(), period()])).toBe(true);
      });

      test('returns true when there are no periods', () => {
         expect(statusStateResults([])).toBe(true);
      });

      test('ignores the automatic concepts (gross profit and operating profit)', () => {
         const automaticEmpty = period({
            concepts: [
               { id: '1', amount: '100' },
               { id: '3', amount: null },
               { id: '5', amount: null },
            ],
         });

         expect(statusStateResults([automaticEmpty])).toBe(true);
      });

      test.each([
         ['a null concept amount', period({ concepts: [{ id: '1', amount: null }] })],
         ['a non numeric concept amount', period({ concepts: [{ id: '1', amount: 'abc' }] })],
         ['a null depreciation amount', period({ depreciationSchedule: [{ id: '21', amount: null }] })],
         ['a non numeric depreciation amount', period({ depreciationSchedule: [{ id: '21', amount: 'abc' }] })],
      ])('returns false when a period has %s', (_label, incomplete) => {
         expect(statusStateResults([period(), incomplete])).toBe(false);
      });
   });
});
