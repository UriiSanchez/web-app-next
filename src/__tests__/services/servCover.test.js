import Swal from 'sweetalert2';

import { getCoverInfo, saveCoverInfo, validateCoverCompleted, downloadCoverStudio } from '../../services/servCover';
import { genericFetch } from '../../hooks';
import { limitLines } from '../../helpers';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const completeCover = (overrides = {}) => ({
   generalDataCifResponse: { personType: 'PF', rfc: 'RFC1' },
   relationshipCredit: 'Client',
   commercialAddress: 'Main St',
   targetMarket: 'Retail',
   strategicMarket: 'Yes',
   specificDescriptionActivity: 'Trade',
   modelAuthorization: { amountEm: '100' },
   solidaryObliged: 'None',
   warranty: 'Mortgage',
   precedentCondition: 'A',
   followingCondition: 'B',
   contractCondition: 'C',
   operatingCondition: 'D',
   cumulativeAmount: '1',
   coverageIndex: '2',
   notional: '3',
   shareholding: [],
   ...overrides,
});

const person = (name, directParticipation) => ({ name, directParticipation });

const apiApplicant = ({ shareholding = [], previousLines = '{}', ...overrides } = {}) => ({
   idRequest: 1,
   generalDataCifResponse: { personType: 'PM', rfc: 'RFC1' },
   resolutionLinesResponse: {
      previousLines,
      requestLinesResponse: '{"lines":[1]}',
      modelAuthorization: '{"amountEm":"100"}',
   },
   infoFinancialResponse: { revenue: 10, shareholding },
   ...overrides,
});

describe('servCover', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getCoverInfo', () => {
      test('requests the cover of the group', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [] });

         await getCoverInfo(5);

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/Cover/getCover?idGroup=5', method: 'get' });
      });

      test('parses the JSON lines of every applicant', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [apiApplicant({ previousLines: '{"riskApplicantAmountIsi":"5","linesActives":[{"lineNumber":1}]}' })],
         });

         const { status, data } = await getCoverInfo(5);
         const { resolutionLinesResponse } = data[0];

         expect(status).toBe(200);
         expect(resolutionLinesResponse.previousLines).toEqual({
            riskApplicantAmountIsi: '5',
            linesActives: [{ lineNumber: 1 }],
         });
         expect(resolutionLinesResponse.requestLinesResponse).toEqual({ lines: [1] });
         expect(resolutionLinesResponse.modelAuthorization).toEqual({ amountEm: '100' });
         expect(data[0].infoFinancialResponse.revenue).toBe(10);
      });

      test.each([
         ['empty', '{}'],
         ['null', 'null'],
      ])('builds the default previous lines when they come %s', async (_label, previousLines) => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [apiApplicant({ previousLines })] });

         const { data } = await getCoverInfo(5);
         const { previousLines: parsed } = data[0].resolutionLinesResponse;

         expect(parsed.previousLines.linesActives).toHaveLength(limitLines);
         expect(parsed.previousLines.linesActives.map((l) => l.lineNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
         expect(parsed.modelAuthorization).toHaveProperty('amountEm', '');
      });

      test('builds the active lines when the previous lines have none', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [apiApplicant({ previousLines: '{"riskApplicantAmountIsi":"5","linesActives":null}' })],
         });

         const { data } = await getCoverInfo(5);
         const { previousLines } = data[0].resolutionLinesResponse;

         expect(previousLines.riskApplicantAmountIsi).toBe('5');
         expect(previousLines.linesActives).toHaveLength(limitLines);
      });

      test('fills the shareholding up to five rows with "Otros" as the last one when it comes empty', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [apiApplicant({ shareholding: [] })] });

         const { data } = await getCoverInfo(5);
         const { shareholding } = data[0].infoFinancialResponse;

         expect(shareholding.map(({ id, name }) => ({ id, name }))).toEqual([
            { id: 0, name: '' },
            { id: 1, name: '' },
            { id: 2, name: '' },
            { id: 3, name: '' },
            { id: 4, name: 'Otros' },
         ]);
      });

      test('completes a partial shareholding keeping its rows and adding "Otros" at the end', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [apiApplicant({ shareholding: [person('Ana', '60'), person('Luis', '40')] })],
         });

         const { data } = await getCoverInfo(5);
         const { shareholding } = data[0].infoFinancialResponse;

         expect(shareholding.map((s) => s.name)).toEqual(['Ana', 'Luis', '', '', 'Otros']);
         expect(shareholding.map((s) => s.id)).toEqual([0, 1, 2, 3, 4]);
         expect(shareholding[0].directParticipation).toBe('60');
      });

      test('does not duplicate "Otros" when the shareholding already has it', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [
               apiApplicant({ shareholding: [person('Otros', '10'), person('Ana', '90'), person('B'), person('C')] }),
            ],
         });

         const { data } = await getCoverInfo(5);
         const names = data[0].infoFinancialResponse.shareholding.map((s) => s.name);

         expect(names).toEqual(['Otros', 'Ana', 'B', 'C', '']);
      });

      test('only renumbers a shareholding with more than four rows', async () => {
         const rows = ['A', 'B', 'C', 'D', 'E', 'F'].map((name) => person(name, '1'));
         genericFetch.mockResolvedValueOnce({ status: 200, data: [apiApplicant({ shareholding: rows })] });

         const { data } = await getCoverInfo(5);
         const { shareholding } = data[0].infoFinancialResponse;

         expect(shareholding.map((s) => s.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
         expect(shareholding.map((s) => s.id)).toEqual([0, 1, 2, 3, 4, 5]);
      });

      test('marks the cover as incomplete when required data is missing', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [apiApplicant()] });

         const { data } = await getCoverInfo(5);

         expect(data[0].coverComplete).toBe(false);
      });

      test('marks the cover as complete when all the required data is filled and the participation adds up to 100', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [
               apiApplicant({
                  ...completeCover({ generalDataCifResponse: { personType: 'PM', rfc: 'RFC1' } }),
                  shareholding: undefined,
                  infoFinancialResponse: { shareholding: [person('Ana', '100')] },
               }),
            ],
         });

         const { data } = await getCoverInfo(5);

         expect(data[0].coverComplete).toBe(true);
      });

      test('returns undefined data when the response has no data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await expect(getCoverInfo(5)).resolves.toEqual({ status: 200, data: undefined });
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getCoverInfo(5);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('returns a 500 object with the message when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(getCoverInfo(5)).resolves.toEqual({ status: 500, message: 'Network down' });
      });

      test('returns a 500 object with the message when the response cannot be parsed', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [{ idRequest: 1 }] });

         const result = await getCoverInfo(5);

         expect(result.status).toBe(500);
         expect(result.message).toEqual(expect.any(String));
      });
   });

   describe('validateCoverCompleted', () => {
      test('returns true for a natural person with all the required data', () => {
         expect(validateCoverCompleted(completeCover())).toBe(true);
      });

      test.each([
         ['a text field', { commercialAddress: '' }],
         ['a numeric field', { notional: null }],
         ['a field of the model authorization', { modelAuthorization: { amountEm: '' } }],
      ])('returns false for a natural person with %s empty', (_label, overrides) => {
         expect(validateCoverCompleted(completeCover(overrides))).toBe(false);
      });

      const legalEntity = (shareholding) =>
         completeCover({ generalDataCifResponse: { personType: 'PM', rfc: 'RFC1' }, shareholding });

      test('returns true for a legal entity whose participation adds up to 100 with a named shareholder', () => {
         expect(
            validateCoverCompleted(legalEntity([person('Ana', '60'), person('Luis', '40'), person('', null)]))
         ).toBe(true);
      });

      test('returns false for a legal entity whose participation does not add up to 100', () => {
         expect(validateCoverCompleted(legalEntity([person('Ana', '60'), person('Luis', '30')]))).toBe(false);
      });

      test('returns false for a legal entity without a shareholder with name and participation', () => {
         expect(validateCoverCompleted(legalEntity([person('', '100'), person('Ana', '')]))).toBe(false);
      });

      test('returns false for a legal entity without shareholding', () => {
         expect(validateCoverCompleted(legalEntity(undefined))).toBe(false);
      });

      test('returns false for a legal entity with another required field empty', () => {
         const data = { ...legalEntity([person('Ana', '100')]), warranty: '' };

         expect(validateCoverCompleted(data)).toBe(false);
      });
   });

   describe('saveCoverInfo', () => {
      const cover = (overrides = {}) => ({
         idRequest: 1,
         idClient: 5,
         generalDataCifResponse: { rfc: 'RFC1', personType: 'PM' },
         shareholding: [person('Ana', '60')],
         modelAuthorization: { amountEm: '100' },
         previousLines: { linesActives: [] },
         notSaved: 'ignored',
         ...overrides,
      });

      const sentRequests = () => JSON.parse(genericFetch.mock.calls[0][0].data).requests;

      test('posts the whitelisted fields with the JSON columns serialized and the rfc of the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await saveCoverInfo([cover()]);

         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/Cover/saveCoverInfo', method: 'post' });
         expect(sentRequests()).toEqual([
            {
               idRequest: 1,
               idClient: 5,
               rfc: 'RFC1',
               shareholding: JSON.stringify([person('Ana', '60')]),
               modelAuthorization: JSON.stringify({ amountEm: '100' }),
               previousLines: JSON.stringify({ linesActives: [] }),
            },
         ]);
         expect(result).toEqual({ status: 204 });
      });

      test('looks up the rfc of each request by its id', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCoverInfo([
            cover({ idRequest: 1, generalDataCifResponse: { rfc: 'RFC1' } }),
            cover({ idRequest: 2, generalDataCifResponse: { rfc: 'RFC2' } }),
         ]);

         expect(sentRequests().map((r) => r.rfc)).toEqual(['RFC1', 'RFC2']);
      });

      test('keeps only the shareholders with data and drops the empty ones', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const shareholding = [
            { name: 'Ana', rfc: null, directParticipation: null, indirectParticipation: null },
            { name: '', rfc: 'RFCX', directParticipation: null, indirectParticipation: null },
            { name: '', rfc: null, directParticipation: '5', indirectParticipation: null },
            { name: '', rfc: null, directParticipation: null, indirectParticipation: '7' },
            { name: 'Otros', rfc: null, directParticipation: '10', indirectParticipation: null },
            { name: 'Otros', rfc: null, directParticipation: '', indirectParticipation: '' },
            { name: '', rfc: '', directParticipation: '', indirectParticipation: '' },
         ];

         await saveCoverInfo([cover({ shareholding })]);

         const saved = JSON.parse(sentRequests()[0].shareholding);
         expect(saved.map((s) => [s.name, s.rfc, s.directParticipation, s.indirectParticipation])).toEqual([
            ['Ana', null, null, null],
            ['', 'RFCX', null, null],
            ['', null, '5', null],
            ['', null, null, '7'],
            ['Otros', null, '10', null],
         ]);
      });

      test('sends null as shareholding when no shareholder has data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCoverInfo([cover({ shareholding: [{ name: '', rfc: '' }, { name: 'Otros' }] })]);

         expect(sentRequests()[0].shareholding).toBeNull();
      });

      test('returns the response untouched when the status is not 204', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(saveCoverInfo([cover()])).resolves.toEqual({ status: 400, error: 'Bad request' });
      });

      test('returns a 500 object with the message when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(saveCoverInfo([cover()])).resolves.toEqual({ status: 500, message: 'Network down' });
      });

      test('returns a 500 object with the message when the data cannot be processed', async () => {
         const result = await saveCoverInfo(undefined);

         expect(result.status).toBe(500);
         expect(result.message).toEqual(expect.any(String));
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });

   describe('downloadCoverStudio', () => {
      test('requests the cover PDF by default', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { response: 'base64' } });

         const result = await downloadCoverStudio(7, 99);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Studio/generateStudio?idRequest=7&idClient=99&typeDocument=PDF_COVER',
            method: 'get',
         });
         expect(result).toEqual({ status: 200, data: { response: 'base64' } });
      });

      test('requests the given document type', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await downloadCoverStudio(7, 99, 'PDF_STUDY');

         expect(genericFetch).toHaveBeenCalledWith(
            expect.objectContaining({
               url: '/credit/Studio/generateStudio?idRequest=7&idClient=99&typeDocument=PDF_STUDY',
            })
         );
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(downloadCoverStudio(7, 99)).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al descargar el documento',
            error,
         });
      });
   });
});
