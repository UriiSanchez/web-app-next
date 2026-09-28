import { getCoverInfo, saveCoverInfo, downloadCoverStudio } from '../../services/servCover';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servCover', () => {
   describe('getCoverInfo service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: [
               {
                  idRequest: '1',
                  generalDataCifResponse: {
                     relationshipCredit: 'SI',
                     commercialAddress: 'address',
                  },
                  resolutionLinesResponse: {
                     previousLines: '{"linesActives":{"type":"test"}}',
                     requestLinesResponse: '{"linesActives":{"type":"test"}}',
                     modelAuthorization: '{"linesActives":{"type":"test"}}',
                  },
                  sectorInformationResponse: {
                     specificDescriptionActivity: 'description',
                     strategicMarket: 'SI',
                     targetMarket: 'SI',
                  },
                  infoFinancialResponse: {
                     shareholding: [
                        {
                           id: 0,
                           name: 'shareholding1',
                           directParticipation: '3',
                        },
                        { id: 1, name: 'shareholding2', directParticipation: '1' },
                        { id: 2, name: 'shareholding3', directParticipation: '2' },
                        { id: 3, name: 'shareholding4', directParticipation: '2' },
                        { id: 4, name: 'Otros', directParticipation: '2' },
                     ],
                  },
                  termsAndConditionsResponse: {
                     solidaryObliged: 'solidary obliged',
                     warranty: 'warranty',
                     precedentCondition: 'precedent',
                     followingCondition: 'following',
                     contractCondition: 'contract',
                     operatingCondition: 'operating',
                     cumulativeAmount: '100',
                     coverageIndex: '10',
                     notional: '110',
                  },
               },
            ],
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('when fetch response status is different than 200 it returns the plain response', async () => {
         serviceMock.status = 500;
         serviceMock.data = { test: 'data' };

         const result = await getCoverInfo('1');

         expect(result).toEqual({ status: 500, data: { test: 'data' } });
      });

      test('it parses resolution lines if they are defined', async () => {
         const result = await getCoverInfo('1');

         expect(result.data[0].resolutionLinesResponse).toEqual({
            previousLines: { linesActives: { type: 'test' } },
            requestLinesResponse: { linesActives: { type: 'test' } },
            modelAuthorization: { linesActives: { type: 'test' } },
         });
      });

      test('when previousLines is empty it defines it with a default object', async () => {
         serviceMock.data[0].resolutionLinesResponse.previousLines = '{}';

         const result = await getCoverInfo('1');

         expect(result.data[0].resolutionLinesResponse.previousLines).toEqual({
            previousLines: {
               riskApplicantAmountIsi: '',
               riskGroupAmountIsi: '',
               riskPotentialAmountIsi: '',
               riskApplicantBalanceIsi: '',
               riskGroupBalanceIsi: '',
               riskPotentialBalanceIsi: '',
               linesActives: [
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 1,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 2,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 3,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 4,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 5,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 6,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 7,
                  },
                  {
                     type: '',
                     authDateIsi: '',
                     issueDateIsi: '',
                     amountIsi: '',
                     currencyIsi: '',
                     balanceIsi: '',
                     warrantyIsi: '',
                     lineNumber: 8,
                  },
               ],
            },
            modelAuthorization: {
               amountEm: '',
               currencyEm: '',
               termEm: '',
               warrantyEm: '',
               riskApplicantAmountEm: '',
               riskGroupAmountEm: '',
               riskPotentialAmountEm: '',
            },
         });
      });

      test('it sorts shareholding list based on directParticipation value, highest to lowest', async () => {
         const result = await getCoverInfo('1');

         expect(result.data[0].infoFinancialResponse.shareholding[0].name).toBe('shareholding1');
         expect(result.data[0].infoFinancialResponse.shareholding[1].name).toBe('shareholding2');
         expect(result.data[0].infoFinancialResponse.shareholding[2].name).toBe('shareholding3');
      });

      test('it sorts shareholding list based on name when directParticipation values are equal', async () => {
         serviceMock.data[0].infoFinancialResponse.shareholding = [
            { directParticipation: '10', name: 'Xavier' },
            { directParticipation: '10', name: 'Juan' },
            { directParticipation: '10', name: 'Andres' },
         ];

         const result = await getCoverInfo('1');

         expect(result.data[0].infoFinancialResponse.shareholding[0].name).toBe('Xavier');
         expect(result.data[0].infoFinancialResponse.shareholding[1].name).toBe('Juan');
         expect(result.data[0].infoFinancialResponse.shareholding[2].name).toBe('Andres');
      });

      test('it returns coverCompleted as true when all required fields are defined', async () => {
         const result = await getCoverInfo('1');

         expect(result.data[0].coverComplete).toBe(true);
      });

      test('it deletes shareholding property when is an empty array', async () => {
         serviceMock.data[0].infoFinancialResponse.shareholding = [];

         const result = await getCoverInfo('1');

         expect(result.data[0].shareholding).toBeUndefined();
      });

      test('when generic fetch throws an error it returns an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});

         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getCoverInfo('1');

         expect(result).toEqual({ status: 500, message: 'Test Error Message' });
      });
   });

   describe('saveCoverInfo service', () => {
      let dataMock;

      beforeEach(() => {
         dataMock = {
            idRequest: 1,
            generalDataCifResponse: {
               relationshipCredit: 'SI',
               idClient: '11111',
               rfc: 'ABCDE12345',
               commercialAddress: null,
            },
            infoFinancialResponse: {
               shareholding: [
                  {
                     id: 0,
                     name: 'shareholding1',
                     directParticipation: '3',
                  },
                  { id: 1, name: 'shareholding2', directParticipation: '1' },
                  { id: 2, name: 'shareholding3', directParticipation: '2' },
                  { id: 3, name: 'shareholding4', directParticipation: '2' },
                  { id: 4, name: 'Otros', directParticipation: '2' },
               ],
            },
            sectorInformationResponse: {
               targetMarket: 'SI',
               strategicMarket: 'SI',
               specificDescriptionActivity: 'aaa',
            },
            resolutionLinesResponse: {
               previousLines: '',
               modelAuthorization: '',
            },
            termsAndConditionsResponse: {
               solidaryObliged: '',
               warranty: null,
               precedentCondition: 'test',
               followingCondition: null,
               contractCondition: null,
               cumulativeAmount: '6120.8',
               coverageIndex: '79.98954385047706',
               notional: '100',
               operatingCondition: 'test',
            },
            coverComplete: false,
            userCreate: 'testuser',
         };

         genericFetch.mockImplementation(async () => {});
      });

      test('it sends a request to save only with the allowed properties', async () => {
         dataMock.invalidProperty = 'test';

         await saveCoverInfo([dataMock]);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.invalidProperty).toBeUndefined();
      });

      test('it sets shareholding as null if is an empty object', async () => {
         dataMock.infoFinancialResponse.shareholding = [];

         await saveCoverInfo([dataMock]);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.requests[0].shareholding).toBe(null);
      });

      test('when a property has a circular reference, it returns an object with an error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         dataMock.resolutionLinesResponse.previousLines = {};
         dataMock.resolutionLinesResponse.previousLines.a = { b: dataMock.resolutionLinesResponse.previousLines };

         const result = await saveCoverInfo([dataMock]);

         expect(result).toEqual({ status: 500, message: 'Maximum call stack size exceeded' });
      });
   });

   describe('downloadCoverStudio service', () => {
      beforeEach(() => {
         genericFetch.mockImplementation(async () => {});
      });

      test('it calls fetch service with idRequest and idClient parameters', async () => {
         await downloadCoverStudio(10, '22', 'PDF_COVER');

         expect(genericFetch.mock.calls[0][0].url).toBe(
            '/credit/Studio/generateStudio?idRequest=10&idClient=22&typeDocument=PDF_COVER'
         );
      });

      test('when fetch service throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await downloadCoverStudio(10, '22', 'PDF_COVER');

         expect(result).toEqual({
            status: 500,
            message: 'Ocurrió un error al descargar el documento',
            error: new Error('Test Error Message'),
         });
      });
   });
});
