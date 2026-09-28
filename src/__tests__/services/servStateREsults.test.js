import { getStateResults, saveStateResults, statusStateResults } from '../../services/servStateResults';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servStateResults', () => {
   describe('getStateResults service', () => {
      let fetchResponse;

      beforeEach(() => {
         fetchResponse = {
            status: 200,
            data: {
               rfc: 'ABCDE1234',
               idRequest: 1,
               idClient: '10',
               userModify: 'testuser',
               status: '1',
               fullName: 'Test User Name',
               idCatTypePerson: '1',
               dateElaboration: '2024-01-15T12:34:13',
               periods: [
                  {
                     periodType: 'ANNUAL',
                     year: 2022,
                     month: 'diciembre',
                     sourceInformation: 'Dictamen fiscal',
                     officeOrAccountant: 'despacho 1',
                     monthIncludes: null,
                     concepts: [
                        {
                           description: 'Ventas Netas',
                           id: '1',
                           amount: '200',
                           percentage: '100',
                        },
                     ],
                     depreciationSchedule: [
                        {
                           description: 'Depreciación y amortización',
                           id: '21',
                           amount: '1000',
                           percentage: '0',
                        },
                     ],
                     analyseOperating: [
                        {
                           description: 'Ventas y/o servicios nacionales netas',
                           id: '23',
                           amount: '1000',
                           percentage: '0',
                        },
                     ],
                  },
               ],
            },
         };

         genericFetch.mockImplementation(async () => fetchResponse);
      });

      test('it calls fetch function with the correct parameters', async () => {
         await getStateResults(1, '10');

         expect(genericFetch.mock.calls[0][0].url).toBe('/financial/getResultState/1/10?dataOriginEnum=MANUAL');
      });

      test('when response status is different than 200 it returns the plain response object', async () => {
         fetchResponse = { status: 500, error: 'Test Error Message' };

         const result = await getStateResults(1, '10');
         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('when dateElaboration is missing it is set to the default value', async () => {
         delete fetchResponse.data.dateElaboration;

         const result = await getStateResults(1, '10');
         expect(result.data.dateElaboration).toBeDefined();
      });

      test('id defines automatic and tooltip properties for every concept', async () => {
         fetchResponse.data.periods[0].concepts.push({
            description: 'Utilidad Bruta',
            id: '3',
            amount: '999',
            percentage: '99.99',
         });

         const result = await getStateResults(1, '10');
         expect(result.data.periods[0].concepts[0].automatic).toBe(false);
         expect(result.data.periods[0].concepts[0].toolTip).toBe(true);
         expect(result.data.periods[0].concepts[1].automatic).toBe(true);
         expect(result.data.periods[0].concepts[1].toolTip).toBe(false);
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getStateResults(1, '10');
         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });
   });

   describe('saveStateResults service', () => {
      test('it sends the fetch request with the data parameter as body', async () => {
         genericFetch.mockImplementationOnce(async () => ({}));

         await saveStateResults({ value: 'test' });

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData).toEqual({ value: 'test' });
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await saveStateResults({});
         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });
   });

   describe('statusStateResults service', () => {
      let periods;

      beforeEach(() => {
         periods = [
            {
               concepts: [
                  { id: '1', amount: '100' },
                  { id: '2', amount: '100' },
                  { id: '3', amount: '100' },
               ],
               depreciationSchedule: [
                  { id: '4', amount: '100' },
                  { id: '5', amount: '100' },
               ],
            },
            {
               concepts: [{ id: '6', amount: '100' }],
               depreciationSchedule: [
                  { id: '7', amount: '100' },
                  { id: '8', amount: '100' },
               ],
            },
         ];
      });

      test('when all concept fields are defined with a numeric value it returns true', () => {
         const result = statusStateResults(periods);
         expect(result).toBe(true);
      });

      test('when one of the concept values is not defined it returns false', () => {
         periods[0].concepts[1].amount = null;

         const result = statusStateResults(periods);
         expect(result).toBe(false);
      });
   });
});
