import { getBalanceSheet, saveBalanceSheet, statusGeneralBalance } from '../../services/servBalanceSheet';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servBalanceSheet', () => {
   describe('getBalanceSheet service', () => {
      const rfc = 'ABCDEFG12345';
      const idRequest = 1;
      const idClient = '100';
      let genericFetchMock;

      beforeEach(() => {
         genericFetchMock = {
            status: 200,
            data: {
               dateElaboration: '2024-01-24T12:05:20',
               periods: [
                  {
                     periodType: 'ANNUAL',
                     concepts: [
                        { idItemChild: 43, percentage: '10.5' },
                        { idItemChild: 101, percentage: '49.4' },
                        { idItemChild: 66, percentage: '60.12' },
                     ],
                  },
                  {
                     periodType: 'ANNUAL',
                     concepts: [{ idItemChild: 97, percentage: '30.44' }],
                  },
                  { periodType: 'PARTIAL', concepts: [] },
               ],
            },
         };

         genericFetch.mockImplementation(async () => genericFetchMock);
      });

      test('it should return data as null when the response status is different than 200', async () => {
         genericFetch.mockImplementation(async () => ({ status: 500, error: '' }));

         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result).toEqual({ status: 500, error: '' });
      });

      test('it should add a boolean property to every concept for summary, automatic and tooltip', async () => {
         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result.data.periods[0].concepts[0].summary).toBe(true);
         expect(result.data.periods[0].concepts[0].automatic).toBe(false);
         expect(result.data.periods[0].concepts[0].toolTip).toBe(false);
         expect(result.data.periods[0].concepts[1].summary).toBe(false);
         expect(result.data.periods[0].concepts[1].automatic).toBe(true);
         expect(result.data.periods[0].concepts[1].toolTip).toBe(false);
         expect(result.data.periods[0].concepts[2].summary).toBe(false);
         expect(result.data.periods[0].concepts[2].automatic).toBe(false);
         expect(result.data.periods[0].concepts[2].toolTip).toBe(true);
         expect(result.data.periods[1].concepts[0].summary).toBe(false);
         expect(result.data.periods[1].concepts[0].automatic).toBe(true);
         expect(result.data.periods[1].concepts[0].toolTip).toBe(true);
      });

      test('it should parse percentage property of concepts into a float value', async () => {
         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result.data.periods[0].concepts[0].percentage).toBe('10.5');
         expect(result.data.periods[0].concepts[1].percentage).toBe('49.4');
         expect(result.data.periods[0].concepts[2].percentage).toBe('60.12');
         expect(result.data.periods[1].concepts[0].percentage).toBe('30.44');
      });

      test('it should set source information value for the third period', async () => {
         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result.data.periods[2].sourceInformation).toBe('Interno');
      });

      test('it should add the date elaboration value when is defined in request response', async () => {
         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result.data.dateElaboration).toBe('24-01-2024');
      });

      test('it should use a default date when date elaboration field is missing in request response', async () => {
         genericFetchMock.data.dateElaboration = null;

         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result.data.dateElaboration).toBeDefined();
      });

      test('it should return an object with the error message when generic fetch throws an error', async () => {
         genericFetch.mockImplementation(async () => {
            throw new Error('Test Error 101');
         });

         const result = await getBalanceSheet(rfc, idRequest, idClient);

         expect(result).toEqual({ status: 500, error: new Error('Test Error 101') });
      });
   });

   describe('saveBalanceSheet service', () => {
      beforeEach(() => {
         genericFetch.mockImplementation(async () => ({ status: 204 }));
      });

      test('it should call generic fetch with data object as a string', async () => {
         await saveBalanceSheet({ data: 'save data' });

         expect(genericFetch.mock.calls[0][0].data).toBe('{"data":"save data"}');
      });

      test('it should return an object with the error message when generic fetch throws an error', async () => {
         genericFetch.mockImplementation(async () => {
            throw new Error('Test Error 101');
         });

         const result = await saveBalanceSheet({ data: 'save data' });

         expect(result).toEqual({
            status: 500,
            message: 'Ocurrió un error al guardar la información',
            error: new Error('Test Error 101'),
         });
      });
   });

   describe('statusGeneralBalance service', () => {
      let formMock;

      beforeEach(() => {
         const concepts = [
            { idItemChild: 30, value: '1' },
            { idItemChild: 43, value: '2' },
            { idItemChild: 85, value: '2' },
            { idItemChild: 94, value: '2' },
            { idItemChild: 75, value: '2' },
            { idItemChild: 81, value: '2' },
            { idItemChild: 82, value: '2' },
            { idItemChild: 59, value: '2' },
            { idItemChild: 97, value: '2' },
            { idItemChild: 100, value: '2' },
            { idItemChild: 101, value: '2' },
            { idItemChild: 62, value: '2' },
            { idItemChild: 66, value: '2' },
            { idItemChild: 73, value: '2' },
         ];

         formMock = {
            periods: [
               {
                  periodType: 'ANNUAL',
                  year: '2022',
                  sourceInformation: 'test source',
                  officeOrAccountant: 'test office',
                  concepts,
               },
               {
                  periodType: 'ANNUAL',
                  year: '2023',
                  sourceInformation: 'test source',
                  officeOrAccountant: 'test office',
                  concepts,
               },
               {
                  periodType: 'PARTIAL',
                  year: '2024',
                  month: 'junio',
                  sourceInformation: 'Interno',
                  monthIncludes: 6,
                  concepts,
               },
            ],
         };
      });

      test('it should return false when all period and concept values are defined', () => {
         const result = statusGeneralBalance(formMock);

         expect(result).toBe(false);
      });

      test('it should return true when a period is missing data', () => {
         formMock.periods[0].sourceInformation = null;

         const result = statusGeneralBalance(formMock);

         expect(result).toBe(true);
      });

      test('it should return true when a concept is missing value and is not disabled', () => {
         const concept = formMock.periods[0].concepts.find(({ idItemChild }) => idItemChild === 30);
         concept.value = null;

         const result = statusGeneralBalance(formMock);

         expect(result).toBe(true);
      });

      test('it should return true when a concept of the disabled category is missing value', () => {
         const concept = formMock.periods[0].concepts.find(({ idItemChild }) => idItemChild === 97);
         concept.value = null;

         const result = statusGeneralBalance(formMock);

         expect(result).toBe(true);
      });
   });
});
