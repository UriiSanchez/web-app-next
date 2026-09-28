import { constProfiles, EnumStatus } from '../../helpers/config';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

// DocumentsClass comparte los arreglos toAction de sus documentos base y el servicio los modifica:
// se reinician los módulos en cada caso para que ninguno herede el estado de otro.
let service;
let genericFetch;
let Swal;

const TYPES = {
   PCD: 'perfil cliente de derivados',
   FVI: 'formato de validacion de inmuebles',
   BG: 'balance general',
   ER: 'estado de resultados',
   MCBC: 'método de consulta de buró de crédito',
   EFCA: 'estados financieros al cierre anual',
   EFP: 'estados financieros parciales',
   RBC: 'reporte buro de credito',
   ISRBC: 'interpretacion siscore del reporte de buró crédito',
   DJ: 'dictamen juridico',
   RP: 'relacion patrimonial',
   ARC: 'acta registro civil',
   CEFI: 'cedula de identificacion fiscal',
   CDD: 'comprobante de domicilio',
};

const CARTA_NUEVA = 'Carta nueva no validada';
const IN_MESA = EnumStatus.EN_MESA_RECEPTORA;
const DATE = '2024-03-05T10:00:00';

const adc = { idProfile: constProfiles.ADC, userAD: 'adc.user', status: [4] };
const mrc = { idProfile: constProfiles.MRC, userAD: 'mrc.user', status: [IN_MESA] };
const emg = { idProfile: constProfiles.EMG, userAD: 'emg.user', status: [1] };
const ldc = { idProfile: constProfiles.LDC, userAD: 'ldc.user', status: [5] };

const baseInfo = (overrides = {}) => ({
   idClient: 10,
   idRequest: 20,
   idGroup: 30,
   rfc: 'RFC123',
   fullName: 'Client SA',
   personType: 'PM',
   idCatTypePerson: 1,
   idStatusGroup: 4,
   legalRepresentatives: [],
   ...overrides,
});

const dialogWith = (text) => expect.objectContaining({ html: expect.stringContaining(text) });
const sentBody = () => JSON.parse(genericFetch.mock.calls[0][0].data);

const found = (id, extra = {}) => ({ documentType: TYPES[id], ...extra });

const run = async ({ user = adc, info = baseInfo(), documents = [], data = {} } = {}) => {
   genericFetch.mockResolvedValueOnce({ status: 200, data: { documents, ...data } });
   return service.getDocumentation(info, user);
};

const docOf = (result, id) => result.data.documentation.find((d) => d._id === id);

describe('servCheckList', () => {
   beforeEach(() => {
      jest.resetModules();
      ({ genericFetch } = require('../../hooks'));
      service = require('../../services/servCheckList');
      const sweetalert = require('sweetalert2');
      Swal = sweetalert.default || sweetalert;
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getDocumentation', () => {
      describe('request', () => {
         test('posts the identifiers, the person and the checklist type of the user profile', async () => {
            await run({ documents: [found('DJ')] });

            expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/checkListAsync', method: 'post' });
            expect(sentBody()).toEqual({
               idClient: 10,
               idRequest: 20,
               modifyUser: 'adc.user',
               typePerson: 'PM',
               applicantType: 'APPLICANT',
               representatives: null,
               typeCheckList: 'THREE',
            });
         });

         test('sends the obligated checklist type and defaults the person type to PM', async () => {
            const info = baseInfo({ personType: undefined, idCatTypePerson: 2 });

            await run({ info, documents: [found('DJ')] });

            expect(sentBody()).toMatchObject({
               typePerson: 'PM',
               applicantType: 'SOLIDARY_OBLIGED',
               typeCheckList: 'SIX',
            });
         });

         test('sends the legal representatives, using the manual id when there is one, for the reception desk', async () => {
            const info = baseInfo({ legalRepresentatives: [{ idClientManual: 'M1', idClient: 1 }, { idClient: 2 }] });

            await run({ user: mrc, info, documents: [found('DJ')] });

            expect(sentBody().representatives).toEqual([{ id: 'M1' }, { id: 2 }]);
         });
      });

      describe('when there is nothing to map', () => {
         test.each([
            ['the status is not 200', { status: 404, error: 'Not found' }, 404, 'Not found'],
            ['the response has no documents', { status: 200, data: { documents: [] } }, 200, undefined],
         ])('returns the default documents of the profile when %s', async (_label, response, status, error) => {
            genericFetch.mockResolvedValueOnce(response);
            const info = baseInfo();

            const result = await service.getDocumentation(info, adc);

            expect(result.status).toBe(status);
            expect(result.error).toBe(error);
            expect(result.data).toMatchObject(info);
            expect(result.data.documentation.map((d) => d._id)).toEqual([
               'PCD',
               'FVI',
               'BG',
               'ER',
               'EFCA',
               'EFP',
               'RBC',
               'ISRBC',
               'DJ',
            ]);
         });

         test('returns a 500 object with the message and no documents when the response has no data', async () => {
            genericFetch.mockResolvedValueOnce({ status: 200 });
            const info = baseInfo();

            const result = await service.getDocumentation(info, adc);

            expect(result).toEqual({ status: 500, data: { ...info, documentation: [] }, error: expect.any(String) });
         });

         test('returns a 500 object with the message and no documents when the fetch rejects', async () => {
            genericFetch.mockRejectedValueOnce(new Error('Network down'));
            const info = baseInfo();

            await expect(service.getDocumentation(info, adc)).resolves.toEqual({
               status: 500,
               data: { ...info, documentation: [] },
               error: 'Network down',
            });
         });
      });

      describe('documents of each profile', () => {
         test.each([
            ['the analyst', adc, baseInfo(), ['PCD', 'FVI', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ']],
            ['the reception desk', mrc, baseInfo(), ['PCD', 'MCBC', 'RBC', 'ISRBC', 'FVI', 'EFCA', 'EFP', 'DJ']],
            ['the specialist', emg, baseInfo(), ['PCD', 'FVI', 'EFCA', 'EFP', 'MCBC', 'DJ']],
            ['the leader', ldc, baseInfo(), ['PCD', 'FVI', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ']],
         ])('lists for %s the documents of a legal entity applicant', async (_label, user, info, ids) => {
            const result = await run({ user, info, documents: [found('DJ', { status: 'Finalizado', folio: 1 })] });

            expect(result.status).toBe(200);
            expect(result.data.documentation.map((d) => d._id)).toEqual(ids);
         });

         test('adds the marriage certificate for a married natural person who is an obligated', async () => {
            const info = baseInfo({ personType: 'PF', idCatTypePerson: 2, maritalStatus: 'Casado' });

            const result = await run({
               user: mrc,
               info,
               documents: [found('ARC', { folio: 3, status: 'Finalizado' })],
            });

            expect(docOf(result, 'ARC')).toMatchObject({ folio: 3, status: 'Finalizado' });
         });

         test('keeps the retrieveBureau flag of the response and the info of the client', async () => {
            const info = baseInfo();

            const result = await run({ info, documents: [found('DJ')], data: { retrieveBureau: true } });

            expect(result.data).toMatchObject({ ...info, retrieveBureau: true });
         });

         test('matches the document types ignoring the case', async () => {
            const result = await run({
               documents: [{ documentType: 'DICTAMEN JURIDICO', folio: 4, status: 'Finalizado' }],
            });

            expect(docOf(result, 'DJ')).toMatchObject({ folio: 4, status: 'Finalizado' });
         });

         test('keeps a document that the response does not include with its default values', async () => {
            const result = await run({ documents: [found('DJ', { folio: 4, status: 'Finalizado' })] });

            expect(docOf(result, 'BG')).toMatchObject({ folio: null, status: 'Pendiente', mandatory: false });
            expect(docOf(result, 'BG').toAction[0].enable).toBe(false);
         });
      });

      describe('documents without a specific mapping', () => {
         test('takes the folio and the status and enables the action when it is finished', async () => {
            const result = await run({ documents: [found('ISRBC', { folio: 9, status: 'Finalizado' })] });

            const doc = docOf(result, 'ISRBC');
            expect(doc).toMatchObject({ folio: 9, status: 'Finalizado' });
            expect(doc.toAction[0].enable).toBe(true);
         });

         test('keeps the defaults and disables the action when it is not finished', async () => {
            const result = await run({ documents: [found('ISRBC', { status: 'Pendiente' })] });

            const doc = docOf(result, 'ISRBC');
            expect(doc).toMatchObject({ folio: null, status: 'Pendiente' });
            expect(doc.toAction[0].enable).toBe(false);
         });
      });

      describe('PCD', () => {
         test.each([
            ['without a folio', 0, false],
            ['with a folio', 9, true],
         ])('shows a frozen format as finished and only viewable %s', async (_label, folio, enable) => {
            const result = await run({ documents: [found('PCD', { folio, status: '25' })] });

            const doc = docOf(result, 'PCD');
            expect(doc.status).toBe('Finalizado');
            expect(doc.toAction).toEqual([{ enable, label: 'Visualizar', type: 'btn' }]);
         });

         test.each([
            ['pending', '13', 'Pendiente', 'Empezar'],
            ['finished', '15', 'Finalizado', 'Editar'],
         ])(
            'lets the specialist %s the format when the request is in their status',
            async (_label, status, text, label) => {
               const result = await run({
                  user: emg,
                  info: baseInfo({ idStatusGroup: 1 }),
                  documents: [found('PCD', { folio: 1, status })],
               });

               const doc = docOf(result, 'PCD');
               expect(doc.status).toBe(text);
               expect(doc.toAction[0]).toMatchObject({ label, enable: true, url: '/EMG/PCD/20?idGroup=30' });
            }
         );

         test('disables the action of the specialist when the request is in another status', async () => {
            const result = await run({
               user: emg,
               info: baseInfo({ idStatusGroup: 9 }),
               documents: [found('PCD', { status: '13' })],
            });

            expect(docOf(result, 'PCD').toAction[0].enable).toBe(false);
         });

         test('lets the other profiles view the format through the shared page', async () => {
            const result = await run({ documents: [found('PCD', { folio: 1, status: '14' })] });

            const doc = docOf(result, 'PCD');
            expect(doc.status).toBe('Incompleto');
            expect(doc.toAction[0]).toMatchObject({
               label: 'Visualizar',
               enable: true,
               url: '/Shared/PCD/20?idGroup=30',
            });
         });

         test('returns a 500 object when the status is not in the catalog', async () => {
            const result = await run({ documents: [found('PCD', { status: '99' })] });

            expect(result.status).toBe(500);
         });
      });

      describe('FVI', () => {
         const url = '/Shared/PropertyVerification/20?idGroup=30';

         test.each([
            ['without a folio', 0, false],
            ['with a folio', 9, true],
         ])('shows a frozen format as finished and only viewable %s', async (_label, folio, enable) => {
            const result = await run({ documents: [found('FVI', { folio, status: '25' })] });

            const doc = docOf(result, 'FVI');
            expect(doc.status).toBe('Finalizado');
            expect(doc.toAction).toEqual([{ enable, label: 'Visualizar', type: 'btn' }]);
         });

         test.each([
            ['pending', '16', 'Pendiente', 'Empezar'],
            ['finished', '18', 'Finalizado', 'Editar'],
         ])('lets the specialist %s the format', async (_label, status, text, label) => {
            const result = await run({ user: emg, documents: [found('FVI', { status })] });

            const doc = docOf(result, 'FVI');
            expect(doc.status).toBe(text);
            expect(doc.toAction).toEqual([{ enable: true, label, type: 'link', url }]);
         });

         test('lets the reception desk only view the format', async () => {
            const result = await run({ user: mrc, documents: [found('FVI', { status: '17' })] });

            const doc = docOf(result, 'FVI');
            expect(doc.status).toBe('Incompleto');
            expect(doc.toAction).toEqual([{ enable: true, label: 'Visualizar', type: 'link', url }]);
         });

         describe.each([
            ['analyst', adc, 4, 5],
            ['leader', ldc, 5, 4],
         ])('for the %s', (_name, user, ownStatus, otherStatus) => {
            test.each([
               ['is in their status and has a pending verification', ownStatus, true, true],
               ['is in their status without a pending verification', ownStatus, false, false],
               ['has a pending verification but is in another status', otherStatus, true, false],
            ])(
               'enables the validation only when the request %s',
               async (_label, idStatusGroup, hasVerification, enable) => {
                  const result = await run({
                     user,
                     info: baseInfo({ idStatusGroup, hasVerification }),
                     documents: [found('FVI', { status: '16' })],
                  });

                  const [validate, view] = docOf(result, 'FVI').toAction;
                  expect(validate).toMatchObject({ label: 'Validar', enable, url });
                  expect(view).toEqual({ type: 'link', label: 'Visualizar', enable: true, url });
               }
            );
         });

         test('returns a 500 object when the status is not in the catalog', async () => {
            const result = await run({ documents: [found('FVI', { status: '99' })] });

            expect(result.status).toBe(500);
         });
      });

      describe.each([
         ['BG', '/Shared/GeneralBalance/20?idGroup=30&rfc=RFC123&idClient=10'],
         ['ER', '/Shared/StateResults/20?idGroup=30&rfc=RFC123&idClient=10'],
      ])('%s', (id, url) => {
         test('lets the analyst edit a document that has a folio when the request is in their status', async () => {
            const result = await run({ documents: [found(id, { folio: 5, status: '19' })] });

            const doc = docOf(result, id);
            expect(doc.status).toBe('Finalizado');
            expect(doc.toAction[0]).toMatchObject({ label: 'Editar', enable: true, url });
         });

         test('lets the analyst start a document without folio', async () => {
            const result = await run({ documents: [found(id, { folio: 0, status: '19' })] });

            const doc = docOf(result, id);
            expect(doc.status).toBe('Pendiente');
            expect(doc.toAction[0].label).toBe('Empezar');
         });

         test('disables the action of the analyst when the request is in another status', async () => {
            const result = await run({
               info: baseInfo({ idStatusGroup: 9 }),
               documents: [found(id, { folio: 5, status: '19' })],
            });

            expect(docOf(result, id).toAction[0].enable).toBe(false);
         });

         test('lets the leader only view the document', async () => {
            const result = await run({
               user: ldc,
               info: baseInfo({ idStatusGroup: 9 }),
               documents: [found(id, { folio: 5, status: '19' })],
            });

            expect(docOf(result, id).toAction[0]).toMatchObject({ label: 'Visualizar', enable: true, url });
         });
      });

      describe('MCBC', () => {
         const representatives = [
            {
               name: 'Ana',
               number: 1,
               statusNautilus: 'OK',
               documents: [{ documentType: 'Identificacion Personal', folio: 7 }],
            },
            { name: 'Luis', number: 2, statusNautilus: '', documents: [{ documentType: 'Otro', folio: 3 }] },
         ];
         const mcbc = (extra = {}) =>
            found('MCBC', { folio: 5, status: 'Finalizado', selectedType: CARTA_NUEVA, ...extra });
         const info = (overrides = {}) => baseInfo({ idStatusGroup: IN_MESA, confirmInfoBureau: true, ...overrides });

         describe('for the reception desk', () => {
            test.each([
               ['the information was confirmed and there is a folio', true, 5, 'Completado'],
               ['the information was not confirmed', false, 5, 'Pendiente'],
               ['there is no folio', true, 0, 'Pendiente'],
            ])('shows it as %s', async (_label, confirmInfoBureau, folio, status) => {
               const result = await run({
                  user: mrc,
                  info: info({ confirmInfoBureau }),
                  documents: [mcbc({ folio })],
               });

               expect(docOf(result, 'MCBC').status).toBe(status);
            });

            test.each([
               ['the request is in the reception desk', IN_MESA, true],
               ['the request is in another status', 4, false],
            ])('links to the validation page and enables it when %s', async (_label, idStatusGroup, enable) => {
               const result = await run({ user: mrc, info: info({ idStatusGroup }), documents: [mcbc()] });

               expect(docOf(result, 'MCBC').toAction[0]).toEqual({
                  type: 'link',
                  label: 'Validar',
                  enable,
                  url: '/MRC/BuroValidation/10?idRequest=20&idGroup=30',
               });
            });

            test('builds the bureau screen with the signature data and the legal representatives', async () => {
               const result = await run({
                  user: mrc,
                  info: info(),
                  documents: [mcbc({ controlCreateDate: DATE, selectedType: 'Otro' })],
                  data: { representatives },
               });

               const doc = docOf(result, 'MCBC');
               expect(doc.selectedType).toBe('Otro');
               expect(doc.screenBureau).toMatchObject({
                  title: 'Solicitante: Client SA',
                  showSignature: true,
                  signatureName: 'Ana, Luis',
                  signatureDate: '05-03-2024',
               });
               expect(doc.screenBureau.docs).toEqual([
                  {
                     _id: 'IDRL',
                     number: 1,
                     title: 'ID Representante Legal',
                     status: '',
                     layout: '1 - OK',
                     folio: 7,
                     enable: true,
                     label: 'Visualizar',
                     type: 'RL',
                  },
                  {
                     _id: 'IDRL',
                     number: 2,
                     title: 'ID Representante Legal',
                     status: false,
                     layout: 'Luis',
                     folio: 0,
                     enable: false,
                     label: 'Visualizar',
                     type: 'RL',
                  },
               ]);
            });

            test('signs with the name of the client when there are no legal representatives', async () => {
               const result = await run({
                  user: mrc,
                  info: info(),
                  documents: [mcbc()],
                  data: { representatives: [] },
               });

               expect(docOf(result, 'MCBC').screenBureau.signatureName).toBe('Client SA');
            });

            test('adds the documents of the new letter that the response includes for a legal entity', async () => {
               const result = await run({
                  user: mrc,
                  info: info(),
                  documents: [mcbc(), found('DJ', { folio: 4, status: 'Finalizado' })],
                  data: { representatives: [] },
               });

               const docs = docOf(result, 'MCBC').screenBureau.docs;
               expect(docs.map((d) => d._id)).toEqual(['DJ', 'CEFI', 'CDD']);
               expect(docs[0]).toMatchObject({ folio: 4, status: 'Finalizado', enable: true });
               expect(docs[1]).toMatchObject({ folio: null, status: 'Pendiente' });
            });

            test.each([
               ['an applicant natural person with business activity', { personType: 'PFAE' }, ['CEFI', 'IDV', 'CDD']],
               ['an obligated natural person', { personType: 'PF', idCatTypePerson: 2 }, ['IDV', 'CDD']],
            ])('adds the new letter documents that correspond to %s', async (_label, overrides, ids) => {
               const result = await run({
                  user: mrc,
                  info: info(overrides),
                  documents: [mcbc()],
                  data: { representatives: [] },
               });

               expect(docOf(result, 'MCBC').screenBureau.docs.map((d) => d._id)).toEqual(ids);
            });

            test('does not add the new letter documents for another selected type', async () => {
               const result = await run({
                  user: mrc,
                  info: info(),
                  documents: [mcbc({ selectedType: 'Otro' })],
                  data: { representatives: [] },
               });

               expect(docOf(result, 'MCBC').screenBureau.docs).toEqual([]);
            });

            test('titles the screen for a legal entity obligated and asks for its signature', async () => {
               const result = await run({ user: mrc, info: info({ idCatTypePerson: 2 }), documents: [mcbc()] });

               expect(docOf(result, 'MCBC').screenBureau).toMatchObject({
                  title: 'Obligado Solidario: Client SA',
                  showSignature: true,
               });
            });

            test('does not ask for the signature of a natural person obligated', async () => {
               const result = await run({
                  user: mrc,
                  info: info({ idCatTypePerson: 2, personType: 'PF' }),
                  documents: [mcbc()],
               });

               expect(docOf(result, 'MCBC').screenBureau).toMatchObject({
                  title: 'Obligado Solidario: Client SA',
                  showSignature: false,
               });
            });

            test('has no title and does not ask for a signature when the type of person is not recognized', async () => {
               const result = await run({ user: mrc, info: info({ idCatTypePerson: 9 }), documents: [mcbc()] });

               expect(docOf(result, 'MCBC').screenBureau).toMatchObject({ showSignature: false, title: '' });
            });
         });

         describe('for the specialist', () => {
            const emgInfo = (overrides = {}) => info({ idStatusGroup: 1, ...overrides });

            test('shows the new letter validation for a legal entity', async () => {
               const result = await run({
                  user: emg,
                  info: emgInfo(),
                  documents: [mcbc({ status: 'Pendiente' })],
                  data: { personType: 'PM', representatives: [] },
               });

               const doc = docOf(result, 'MCBC');
               expect(doc).toMatchObject({ layout: 'CNNV', isEnable: true, status: 'Pendiente' });
               expect(doc.docs.map((d) => d._id)).toEqual(['DJ', 'CEFI', 'CDD']);
               expect(doc.toAction).toEqual([
                  { enable: true, label: 'Validar', type: 'func' },
                  { enable: true, label: 'Visualizar', type: 'btn' },
               ]);
            });

            test('disables the validation when the request is in another status and there is no folio', async () => {
               const result = await run({
                  user: emg,
                  info: emgInfo({ idStatusGroup: 9 }),
                  documents: [mcbc({ folio: 0 })],
                  data: { personType: 'PM', representatives: [] },
               });

               const doc = docOf(result, 'MCBC');
               expect(doc.isEnable).toBe(false);
               expect(doc.toAction.map((a) => a.enable)).toEqual([false, false]);
            });

            test('shows the new letter as finished when the person is not a legal entity', async () => {
               const result = await run({
                  user: emg,
                  info: emgInfo(),
                  documents: [mcbc({ status: 'Pendiente' })],
                  data: { personType: 'PF', representatives: [] },
               });

               const doc = docOf(result, 'MCBC');
               expect(doc.status).toBe('Finalizado');
               expect(doc.toAction[0].enable).toBe(true);
            });

            test.each([
               ['there is a folio', 5, true],
               ['there is no folio', 0, false],
            ])(
               'takes the status of the document and enables the action when %s for another selected type',
               async (_label, folio, enable) => {
                  const result = await run({
                     user: emg,
                     info: emgInfo(),
                     documents: [mcbc({ folio, selectedType: 'Otro', status: 'En proceso' })],
                     data: { representatives: [] },
                  });

                  const doc = docOf(result, 'MCBC');
                  expect(doc.status).toBe('En proceso');
                  expect(doc.toAction[0].enable).toBe(enable);
               }
            );
         });
      });

      describe('EFCA', () => {
         const years = (...statuses) => statuses.map((status, i) => ({ year: 2020 + i, status }));

         test('shows the document as finished and enables the list when every year is finished', async () => {
            const result = await run({
               documents: [found('EFCA', { status: 'Pendiente', docs: years('Finalizado', 'finalizado') })],
            });

            const doc = docOf(result, 'EFCA');
            expect(doc.status).toBe('Finalizado');
            expect(doc.toAction[0]).toMatchObject({ enable: true, label: 'Ver', type: 'list' });
            expect(doc.toAction[0].data.map((d) => d.year)).toEqual([2021, 2020]);
         });

         test('enables the list but keeps the status when only some years are finished', async () => {
            const result = await run({ documents: [found('EFCA', { docs: years('Finalizado', 'Pendiente') })] });

            const doc = docOf(result, 'EFCA');
            expect(doc.status).toBe('Pendiente');
            expect(doc.toAction[0].enable).toBe(true);
         });

         test('keeps the list disabled when no year is finished', async () => {
            const result = await run({ documents: [found('EFCA', { docs: years('Pendiente') })] });

            expect(docOf(result, 'EFCA').toAction[0].enable).toBe(false);
         });

         test('marks the document as not applicable when it has no years and comes finished', async () => {
            const result = await run({ documents: [found('EFCA', { status: 'Finalizado', docs: [] })] });

            expect(docOf(result, 'EFCA')).toMatchObject({ layout: 'No aplica', status: 'Finalizado' });
         });

         test('keeps the defaults when it has no years and is not finished', async () => {
            const result = await run({ documents: [found('EFCA', { status: 'Pendiente' })] });

            const doc = docOf(result, 'EFCA');
            expect(doc.status).toBe('Pendiente');
            expect(doc.layout).toBeUndefined();
            expect(doc.toAction[0].enable).toBe(false);
         });
      });

      describe('EFP', () => {
         test('shows an optional document that has a folio as viewable when it is finished', async () => {
            const result = await run({
               documents: [found('EFP', { mandatory: false, docs: [{ folio: 5, status: 'Finalizado' }] })],
            });

            const doc = docOf(result, 'EFP');
            expect(doc).toMatchObject({ folio: 5, status: 'Finalizado', layout: 'Opcional', isVisible: true });
            expect(doc.toAction[0].enable).toBe(true);
         });

         test('hides an optional document that has no folio', async () => {
            const result = await run({
               documents: [found('EFP', { mandatory: false, docs: [{ folio: 0, status: 'Pendiente' }] })],
            });

            expect(docOf(result, 'EFP')).toBeUndefined();
         });

         test('shows a required document without folio as required and not viewable', async () => {
            const result = await run({
               documents: [found('EFP', { mandatory: true, docs: [{ folio: 0, status: 'Pendiente' }] })],
            });

            const doc = docOf(result, 'EFP');
            expect(doc).toMatchObject({ folio: 0, status: 'Pendiente', layout: 'Requerido' });
            expect(doc.toAction[0].enable).toBe(false);
         });

         test('keeps the default status when the first document has none', async () => {
            const result = await run({
               documents: [found('EFP', { mandatory: true, docs: [{ folio: 2, status: '' }] })],
            });

            expect(docOf(result, 'EFP').status).toBe('Pendiente');
         });

         test('marks the document as not applicable when it has no documents and comes finished', async () => {
            const result = await run({ documents: [found('EFP', { status: 'Finalizado' })] });

            expect(docOf(result, 'EFP')).toMatchObject({ layout: 'No aplica', status: 'Finalizado' });
         });

         test('keeps the defaults when it has no documents and is not finished', async () => {
            const result = await run({ documents: [found('EFP', { status: 'Pendiente' })] });

            expect(docOf(result, 'EFP')).toMatchObject({ status: 'Pendiente', layout: '' });
         });
      });

      describe('RBC', () => {
         const rbc = (extra = {}) =>
            found('RBC', { folio: 5, status: 'Finalizado', controlCreateDate: DATE, ...extra });
         const inMesa = (overrides = {}) => baseInfo({ idStatusGroup: IN_MESA, confirmInfoBureau: true, ...overrides });
         const bureau = (statusCreditBureau, extra = {}) => ({ statusCreditBureau, ...extra });

         describe('outside the reception desk', () => {
            test('shows the report as viewable with its date when it is finished and has a folio', async () => {
               const result = await run({ documents: [rbc()] });

               const doc = docOf(result, 'RBC');
               expect(doc).toMatchObject({ folio: 5, status: 'Finalizado', layout: 'Último reporte al: 05-03-2024' });
               expect(doc.toAction).toEqual([{ enable: true, label: 'Visualizar', type: 'btn' }]);
            });

            test('shows the date of the last report even when it is not viewable', async () => {
               const result = await run({ documents: [rbc({ folio: 0, status: 'Pendiente' })] });

               const doc = docOf(result, 'RBC');
               expect(doc.layout).toBe('Último reporte al: 05-03-2024');
               expect(doc.toAction[0].enable).toBe(false);
            });

            test('shows a dash and the default values when there is no report', async () => {
               const result = await run({ documents: [found('RBC')] });

               const doc = docOf(result, 'RBC');
               expect(doc).toMatchObject({ folio: 0, status: 'Pendiente', layout: 'Último reporte al: -' });
               expect(doc.toAction[0].enable).toBe(false);
            });

            test('shows a dash when the report is viewable but has no date', async () => {
               const result = await run({ documents: [rbc({ controlCreateDate: undefined })] });

               expect(docOf(result, 'RBC').layout).toBe('Último reporte al: -');
            });

            test('treats the reception desk with the request in another status as any other profile', async () => {
               const result = await run({ user: mrc, info: inMesa({ idStatusGroup: 4 }), documents: [rbc()] });

               expect(docOf(result, 'RBC').toAction).toEqual([{ enable: true, label: 'Visualizar', type: 'btn' }]);
            });
         });

         describe('at the reception desk', () => {
            test('blocks both buttons while the bureau information is not confirmed', async () => {
               const result = await run({ user: mrc, info: inMesa({ confirmInfoBureau: false }), documents: [rbc()] });

               const [consult, view] = docOf(result, 'RBC').toAction;
               expect(consult).toMatchObject({ enable: false, label: 'Consultar' });
               expect(view.enable).toBe(false);
            });

            test('enables the query when the bureau query has not started', async () => {
               const result = await run({
                  user: mrc,
                  info: inMesa(),
                  documents: [rbc()],
                  data: bureau('Por Iniciar'),
               });

               const doc = docOf(result, 'RBC');
               expect(doc.toAction[0]).toMatchObject({ enable: true, label: 'Consultar' });
               expect(doc.toAction[1].enable).toBe(true);
               expect(doc).toMatchObject({ folio: 5, status: 'Finalizado', icon: '' });
               expect(doc.layout).toBe('Último reporte al: 05-03-2024');
            });

            test('disables the query and forgets the stored error while the bureau query is in process', async () => {
               localStorage.setItem('BureauError_10', 'true');

               const result = await run({
                  user: mrc,
                  info: inMesa(),
                  documents: [rbc({ folio: 0, status: 'En proceso' })],
                  data: bureau('En Proceso'),
               });

               const doc = docOf(result, 'RBC');
               expect(doc.toAction[0]).toMatchObject({ enable: false, label: 'En Proceso' });
               expect(doc.toAction[1].enable).toBe(false);
               expect(doc.layout).toBe('Último reporte al: -');
               expect(localStorage.getItem('BureauError_10')).toBeNull();
            });

            test.each([
               ['can be retrieved', true, true, 'Consultar'],
               ['cannot be retrieved', false, false, 'Finalizado'],
            ])(
               'lets the user query again when the bureau query is finished and it %s',
               async (_label, retrieveBureau, enable, label) => {
                  localStorage.setItem('BureauError_10', 'true');

                  const result = await run({
                     user: mrc,
                     info: inMesa(),
                     documents: [rbc()],
                     data: bureau('Finalizado', { retrieveBureau }),
                  });

                  expect(docOf(result, 'RBC').toAction[0]).toMatchObject({ enable, label });
                  expect(localStorage.getItem('BureauError_10')).toBeNull();
                  expect(result.data.retrieveBureau).toBe(retrieveBureau);
               }
            );

            describe('when the bureau query failed', () => {
               const failed = (errorBureau) => ({
                  user: mrc,
                  info: inMesa({ errorBureau }),
                  documents: [rbc()],
                  data: bureau('Error'),
               });

               test('warns the user once and stores that it did', async () => {
                  const first = await run(failed('Timeout'));
                  await run(failed('Timeout'));

                  expect(docOf(first, 'RBC').toAction[0]).toMatchObject({ enable: true, label: 'Consultar' });
                  expect(Swal.fire).toHaveBeenCalledTimes(1);
                  expect(Swal.fire).toHaveBeenCalledWith(
                     expect.objectContaining({
                        html: expect.stringContaining('Error al realizar la consulta a Buró de Crédito'),
                        icon: 'warning',
                     })
                  );
                  expect(localStorage.getItem('BureauError_10')).toBe('true');
               });

               test('shows the description of a JSON error in the icon', async () => {
                  const result = await run(failed(JSON.stringify({ description: 'Bureau timeout' })));

                  const { icon } = docOf(result, 'RBC');
                  expect(icon).toContain('Bureau timeout');
                  expect(icon).toContain('min-width:200px');
                  expect(icon).not.toContain('\n');
               });

               test.each([
                  ['there is no error', undefined],
                  ['the error is not JSON', 'plain text'],
                  ['the error has no description', JSON.stringify({ code: 1 })],
               ])('shows a generic description in the icon when %s', async (_label, errorBureau) => {
                  const result = await run(failed(errorBureau));

                  const { icon } = docOf(result, 'RBC');
                  expect(icon).toContain('Error no definido - Recarga la página');
                  expect(icon).toContain('min-width: 140px');
               });

               test('shows an undefined error in the dialog when the error is not defined', async () => {
                  await run(failed(undefined));

                  expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error no definido'));
               });
            });

            test.each([
               ['without a folio', { folio: 0, status: 'Pendiente' }, 'Último reporte al: -'],
               ['finished without a date', { controlCreateDate: undefined }, 'Último reporte al: -'],
               ['finished with a date', {}, 'Último reporte al: 05-03-2024'],
            ])('shows the layout date for a report %s', async (_label, extra, layout) => {
               const result = await run({
                  user: mrc,
                  info: inMesa(),
                  documents: [rbc(extra)],
                  data: bureau('Por Iniciar'),
               });

               expect(docOf(result, 'RBC').layout).toBe(layout);
            });
         });
      });

      describe('DJ', () => {
         test('takes the folio, the status and the creation date and enables the action with a folio', async () => {
            const result = await run({
               documents: [found('DJ', { folio: 4, status: 'Finalizado', controlCreateDate: DATE })],
            });

            const doc = docOf(result, 'DJ');
            expect(doc).toMatchObject({ folio: 4, status: 'Finalizado', controlCreateDate: DATE });
            expect(doc.toAction[0].enable).toBe(true);
         });

         test('keeps the defaults and disables the action when the document has no data', async () => {
            const result = await run({ documents: [found('DJ')] });

            const doc = docOf(result, 'DJ');
            expect(doc).toMatchObject({ folio: null, status: 'Pendiente', controlCreateDate: '' });
            expect(doc.toAction[0].enable).toBe(false);
         });
      });
   });

   describe('getLegalRepresent', () => {
      const attorney = (overrides = {}) => ({
         idThird: 1,
         name: 'Ana',
         paternalSurname: 'Lopez',
         maternalSurname: 'Perez',
         personType: 'PF',
         rfc: 'RFC1',
         relationType: 'Apoderado Legal',
         ...overrides,
      });
      const client = { idClient: 10, idRequest: 20, legalRepresentatives: [] };
      const session = { userAD: 'analyst' };

      const legalTemplate = {
         idRequest: 20,
         idCatTypePerson: 3,
         userCreate: 'analyst',
         userModify: 'analyst',
         idClientRelated: 10,
         isSelected: false,
         deleted: false,
      };

      test('requests the attorneys of the client', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { thirdRepresentatives: [] } });

         await service.getLegalRepresent(client, session);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/getLegalRepresentative/10?representativeEnum=ATTORNEY',
            method: 'get',
         });
      });

      test('keeps only the attorneys and builds their full name', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: {
               total: 2,
               thirdRepresentatives: [attorney(), attorney({ idThird: 2, relationType: 'Accionista' })],
            },
         });

         const result = await service.getLegalRepresent(client, session);

         expect(result).toEqual({
            status: 200,
            data: {
               total: 2,
               thirdRepresentatives: [
                  {
                     ...legalTemplate,
                     idClient: 1,
                     idClientManual: '',
                     personType: 'PF',
                     fullName: 'Ana Lopez Perez',
                     rfc: 'RFC1',
                  },
               ],
            },
         });
      });

      test('marks as selected the attorneys already saved and keeps their related person and manual id', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: { thirdRepresentatives: [attorney(), attorney({ idThird: 2, name: 'Luis' })] },
         });
         const saved = { idClient: 1, fullName: 'Ana Lopez Perez', idRelatedPerson: 77, idClientManual: 'M1' };

         const { data } = await service.getLegalRepresent({ ...client, legalRepresentatives: [saved] }, session);

         expect(data.thirdRepresentatives[0]).toMatchObject({
            isSelected: true,
            idRelatedPerson: 77,
            idClientManual: 'M1',
         });
         expect(data.thirdRepresentatives[1]).toMatchObject({ isSelected: false, idClientManual: '' });
         expect(data.thirdRepresentatives[1]).not.toHaveProperty('idRelatedPerson');
      });

      test('does not select an attorney saved with another name', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { thirdRepresentatives: [attorney()] } });
         const saved = { idClient: 1, fullName: 'Another Name', idRelatedPerson: 77 };

         const { data } = await service.getLegalRepresent({ ...client, legalRepresentatives: [saved] }, session);

         expect(data.thirdRepresentatives[0].isSelected).toBe(false);
      });

      test('leaves the session user undefined when there is no session', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { thirdRepresentatives: [attorney()] } });

         const { data } = await service.getLegalRepresent(client, undefined);

         expect(data.thirdRepresentatives[0]).toMatchObject({ userCreate: undefined, userModify: undefined });
      });

      test('returns undefined attorneys when the response has none', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         await expect(service.getLegalRepresent(client, session)).resolves.toEqual({
            status: 200,
            data: { thirdRepresentatives: undefined },
         });
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await service.getLegalRepresent(client, session);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(service.getLegalRepresent(client, session)).resolves.toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
      });

      test('shows the server error dialog and returns a 500 object when an attorney has no relation type', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: { thirdRepresentatives: [attorney({ relationType: undefined })] },
         });

         const result = await service.getLegalRepresent(client, session);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });

   describe('saveRepresent', () => {
      test('posts the selected representatives as related persons', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const selected = [{ idClient: 1, isSelected: true }];

         const result = await service.saveRepresent(selected);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Related/savePerson',
            method: 'post',
            data: JSON.stringify({ relatedPersonList: selected }),
         });
         expect(result).toEqual({ status: 204 });
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(service.saveRepresent([])).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al guardar los representantes',
            error,
         });
      });
   });

   describe('dowloadDocumentFetch', () => {
      test('requests the file by folio', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { buffer: 'x' } });

         const result = await service.dowloadDocumentFetch(55);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/File/downloadFileByDataBuffer?folio=55',
            method: 'get',
         });
         expect(result).toEqual({ status: 200, data: { buffer: 'x' } });
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(service.dowloadDocumentFetch(55)).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al descargar el documento',
            error,
         });
      });
   });
});
