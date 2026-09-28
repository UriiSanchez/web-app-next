import { getDocumentation, getLegalRepresent, saveRepresent, dowloadDocumentFetch } from '../../services/servCheckList';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servCheckList', () => {
   describe('getDocumentation service', () => {
      let user;
      let info;
      let serviceMock;
      let documentsEMG;
      let documentsMRC;
      let documentsADC;

      beforeEach(() => {
         documentsEMG = [
            { documentType: 'perfil cliente de derivados', folio: 0, status: '13', mandatory: true },
            { documentType: 'formato de validacion de inmuebles', folio: 0, status: '18', mandatory: true },
            { documentType: 'Estados Financieros al Cierre Anual', folio: null, status: null, mandatory: true },
            { documentType: 'estados financieros parciales', folio: null, status: null, mandatory: true },
            {
               documentType: 'método de consulta de buró de crédito',
               folio: null,
               status: 'test status',
               mandatory: true,
            },
            { documentType: 'dictamen juridico', folio: null, status: null, mandatory: true },
            { documentType: 'relacion patrimonial', folio: null, status: null, mandatory: true },
         ];

         documentsMRC = [
            { documentType: 'perfil cliente de derivados', folio: 0, status: '13', mandatory: true },
            { documentType: 'método de consulta de buró de crédito', folio: null, status: null, mandatory: true },
            { documentType: 'reporte buro de credito', folio: null, status: null, mandatory: true },
            {
               documentType: 'interpretacion siscore del reporte de buró crédito',
               folio: null,
               status: null,
               mandatory: true,
            },
            { documentType: 'formato de validacion de inmuebles', folio: 0, status: '18', mandatory: true },
            { documentType: 'Estados Financieros al Cierre Anual', folio: null, status: null, mandatory: true },
            { documentType: 'estados financieros parciales', folio: null, status: null, mandatory: true },
            { documentType: 'dictamen juridico', folio: null, status: null, mandatory: true },
            { documentType: 'relacion patrimonial', folio: null, status: null, mandatory: true },
         ];

         documentsADC = [
            { documentType: 'perfil cliente de derivados', folio: 0, status: '13', mandatory: true },
            { documentType: 'formato de validacion de inmuebles', folio: 0, status: '18', mandatory: true },
            { documentType: 'balance general', folio: null, status: null, mandatory: true },
            { documentType: 'estado de resultados', folio: null, status: null, mandatory: true },
            { documentType: 'Estados Financieros al Cierre Anual', folio: null, status: null, mandatory: true },
            { documentType: 'estados financieros parciales', folio: null, status: null, mandatory: true },
            { documentType: 'reporte buro de credito', folio: null, status: null, mandatory: true },
            {
               documentType: 'interpretacion siscore del reporte de buró crédito',
               folio: null,
               status: null,
               mandatory: true,
            },
            { documentType: 'dictamen juridico', folio: null, status: null, mandatory: true },
            { documentType: 'relacion patrimonial', folio: null, status: null, mandatory: true },
         ];

         user = { userAD: 'testuser', idProfile: 3, status: [1, 7, 8, 9] };
         info = { idCatTypePerson: 1, idClient: '100', idRequest: 1, legalRepresentatives: [], personType: 'PFAE' };
         serviceMock = {
            status: 200,
            data: {
               documents: documentsEMG,
               personType: 'PM',
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it should call generic fetch with the correct data', async () => {
         await getDocumentation(info, user);

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data).toEqual({
            idClient: '100',
            idRequest: 1,
            modifyUser: 'testuser',
            typePerson: 'PFAE',
            applicantType: 'APPLICANT',
            representatives: null,
            typeCheckList: 'ONE',
         });
      });

      test('when idCatTypePerson is not defined it should default applicantType to APPLICANT', async () => {
         info.idCatTypePerson = null;

         await getDocumentation(info, user);

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data.applicantType).toBe('APPLICANT');
      });

      test('when personType is not defined it should default to PM', async () => {
         info.personType = null;

         await getDocumentation(info, user);

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data.typePerson).toBe('PM');
      });

      test('it should filter documents based on profile and person type', async () => {
         const { data } = await getDocumentation(info, user);

         expect(data.documentation.length).toBe(5);

         const hasAllDocuments = ['PCD', 'FVI', 'EFCA', 'EFP', 'MCBC'].reduce(
            (hasAll, id) => hasAll && data.documentation.find(({ _id }) => _id === id) !== undefined,
            true
         );
         expect(hasAllDocuments).toBe(true);
      });

      test('when user request person type is PF and has married status it should include the marriage document', async () => {
         info.personType = 'PF';
         info.maritalStatus = 'casado';
         info.idCatTypePerson = 2;

         serviceMock.data.documents = [
            { documentType: 'método de consulta de buró de crédito', folio: null, status: null, mandatory: true },
            { documentType: 'relacion patrimonial', folio: null, status: null, mandatory: true },
            { documentType: 'acta registro civil', folio: null, status: null, mandatory: true },
         ];

         const { data } = await getDocumentation(info, user);

         expect(data.documentation.length).toBe(3);

         const hasAllDocuments = ['MCBC', 'RP', 'ARC'].reduce(
            (hasAll, id) => hasAll && data.documentation.find(({ _id }) => _id === id) !== undefined,
            true
         );
         expect(hasAllDocuments).toBe(true);
      });

      test('it should add legal representatives in request to service when profile is MRC or EMG', async () => {
         info.legalRepresentatives = [{ idClient: '1' }, { idClientManual: '2' }];

         await getDocumentation(info, user);

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data.representatives).toEqual([{ id: '1' }, { id: '2' }]);
      });

      test('when service response status is different than 200 it should return an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getDocumentation(info, user);

         expect(result.status).toBe(500);
         expect(result.error).toBe('Test Error Message');
      });

      test('when generic fetch function throws an error it should return an object with the error and empty documentation', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});

         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error 101');
         });

         const result = await getDocumentation(info, user);

         expect(result).toEqual(
            {
               status: 500,
               data: {
                  idCatTypePerson: 1,
                  idClient: '100',
                  idRequest: 1,
                  legalRepresentatives: [],
                  personType: 'PFAE',
                  documentation: [],
               },
               error: "Test Error 101"
            },

         );
      });

      test('it should display visualize label for PCD document when profile is not EMG', async () => {
         user.idProfile = 2;
         serviceMock.data.documents = documentsMRC;

         const { data } = await getDocumentation(info, user);

         const pcdDoc = data.documentation.find(({ _id }) => _id === 'PCD');

         expect(pcdDoc.toAction[0].label).toBe('Visualizar');
      });

      test('it should display visualize label for FVI document when profile is ADC', async () => {
         user.idProfile = 4;
         serviceMock.data.documents = documentsADC;

         const { data } = await getDocumentation(info, user);

         const fviDoc = data.documentation.find(({ _id }) => _id === 'FVI');

         expect(fviDoc.toAction[1].label).toBe('Visualizar');
      });

      describe('when profile is EMG and selected type is "Carta nueva no validada"', () => {
         test('it should set isEnable for MCBC document based on user status', async () => {
            documentsEMG[4].selectedType = 'Carta nueva no validada';
            info.idStatusGroup = 7;
            const { data } = await getDocumentation(info, user);

            const mcbcDoc = data.documentation.find(({ _id }) => _id === 'MCBC');
            expect(mcbcDoc.isEnable).toBe(true);
            expect(mcbcDoc.status).toBe('test status');
         });

         test('it should set status as "Finalizado" when person type is not PM', async () => {
            documentsEMG[4].selectedType = 'Carta nueva no validada';
            serviceMock.data.personType = 'PFAE';
            info.idStatusGroup = 7;

            const { data } = await getDocumentation(info, user);

            const mcbcDoc = data.documentation.find(({ _id }) => _id === 'MCBC');
            expect(mcbcDoc.status).toBe('Finalizado');
         });
      });

      test('when docs array is no empty for EFCA document it should set status to "Finalizado" when all docs have that status', async () => {
         documentsEMG[2].docs = [{ status: 'Finalizado' }, { status: 'Finalizado' }];

         const { data } = await getDocumentation(info, user);

         const efcaDoc = data.documentation.find(({ _id }) => _id === 'EFCA');
         expect(efcaDoc.status).toBe('Finalizado');
      });

      test('when status is "Finalizado" for EFCA document it should set layout value', async () => {
         documentsEMG[2].status = 'Finalizado';

         const { data } = await getDocumentation(info, user);

         const efcaDoc = data.documentation.find(({ _id }) => _id === 'EFCA');
         expect(efcaDoc.layout).toBe('No aplica');
      });

      test('when docs is not empty for EFP document it should define some properties based on first item in docs', async () => {
         documentsEMG[3].docs = [
            { folio: 1, status: 'test status' },
            { folio: 0, status: 'Finalizado' },
         ];

         const { data } = await getDocumentation(info, user);

         const efpDoc = data.documentation.find(({ _id }) => _id === 'EFP');
         expect(efpDoc.isVisible).toBe(true);
         expect(efpDoc.folio).toBe(1);
         expect(efpDoc.status).toBe('test status');
      });

      test('when docs is empty and status is "Finalizado" for EFP document it should layout field', async () => {
         documentsEMG[3].status = 'Finalizado';

         const { data } = await getDocumentation(info, user);
         const efpDoc = data.documentation.find(({ _id }) => _id === 'EFP');

         expect(efpDoc.layout).toBe('No aplica');
      });

      describe('for document RBC when profile is MRC and idStatusGroup is 2', () => {
         beforeEach(() => {
            serviceMock.data.documents = documentsMRC;
            user.idProfile = 2;
            info.idStatusGroup = 2;
            info.confirmInfoBureau = true;
         });

         test('it should disable actions when confirmInfoBureau is false', async () => {
            info.confirmInfoBureau = false;

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.toAction[0].enable).toBe(false);
            expect(rbcDoc.toAction[1].enable).toBe(false);
         });

         test('it should set first action to consult when statusCreditBureau is "Por Iniciar"', async () => {
            serviceMock.data.statusCreditBureau = 'Por Iniciar';

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.toAction[0].enable).toBe(true);
            expect(rbcDoc.toAction[0].label).toBe('Consultar');
         });

         test('it should disable first action when statusCreditBureau is "En Proceso"', async () => {
            serviceMock.data.statusCreditBureau = 'En Proceso';

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.toAction[0].enable).toBe(false);
            expect(rbcDoc.toAction[0].label).toBe('En Proceso');
         });

         test('it should enable first action based on retrieveBureau when statusCreditBureau is "Finalizado"', async () => {
            serviceMock.data.statusCreditBureau = 'Finalizado';
            serviceMock.data.retrieveBureau = true;

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.toAction[0].enable).toBe(true);
            expect(rbcDoc.toAction[0].label).toBe('Consultar');
         });

         test('it should enable first action when statusCreditBureau has any other value', async () => {
            serviceMock.data.statusCreditBureau = 'Otro';

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.toAction[0].enable).toBe(true);
            expect(rbcDoc.toAction[0].label).toBe('Consultar');
         });

         test('when controlCreateDate is not empty it should add it to the layout string', async () => {
            serviceMock.data.documents[2].controlCreateDate = '2023-01-25';
            serviceMock.data.documents[2].status = 'Finalizado';
            serviceMock.data.documents[2].folio = 2;
            serviceMock.data.statusCreditBureau = 'Otro';

            const { data } = await getDocumentation(info, user);
            const rbcDoc = data.documentation.find(({ _id }) => _id === 'RBC');

            expect(rbcDoc.layout).toBe('Último reporte al: 25-01-2023');
         });
      });
   });

   describe('getLegalRepresent service', () => {
      let data;
      let userSession;
      let serviceMock;

      beforeEach(() => {
         data = {
            legalRepresentatives: [],
            idClient: '100',
            idRequest: 1,
         };
         userSession = {
            userAD: 'testuser',
         };
         serviceMock = {
            status: 200,
            data: {
               thirdRepresentatives: [
                  {
                     idThird: '1',
                     relationType: 'Apoderado',
                     personType: 'PF',
                     name: 'Juan',
                     paternalSurname: 'Perez',
                     maternalSurname: 'Garduño',
                     rfc: 'ABCDE12345',
                  },
                  {
                     idThird: '2',
                     relationType: 'Otro',
                     personType: 'PF',
                     name: 'Jesus',
                     paternalSurname: 'Gonzales',
                     maternalSurname: 'Hernandez',
                     rfc: 'ABCDE12345',
                  },
               ],
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it returns plain service response when status is different than 200', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getLegalRepresent(data, userSession);

         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('it filter third representatives to return only of relation type "Apoderado"', async () => {
         const result = await getLegalRepresent(data, userSession);

         expect(result).toEqual({
            status: 200,
            data: {
               thirdRepresentatives: [
                  {
                     deleted: false,
                     idCatTypePerson: 3,
                     idClient: '1',
                     idClientManual: '',
                     idClientRelated: '100',
                     idRequest: 1,
                     isSelected: false,
                     fullName: 'Juan Perez Garduño',
                     personType: 'PF',
                     rfc: 'ABCDE12345',
                     userCreate: 'testuser',
                     userModify: 'testuser',
                  },
               ],
            },
         });
      });

      test('it should set legal representative selected as true when service response matches a representative from parameters', async () => {
         data.legalRepresentatives = [
            { idClient: '1', fullName: 'Juan Perez Garduño', idRelatedPerson: '22', idClientManual: '33' },
         ];

         const result = await getLegalRepresent(data, userSession);

         const representative = result.data.thirdRepresentatives.find(({ idClient }) => idClient === '1');

         expect(representative.isSelected).toBe(true);
         expect(representative.idRelatedPerson).toBe('22');
         expect(representative.idClientManual).toBe('33');
      });

      test('when generic fetch throws an error it should return an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});

         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getLegalRepresent(data, userSession);

         expect(result).toEqual({
            status: 500,
            error: new Error('Test Error Message'),
         });
      });
   });

   describe('saveRepresent service', () => {
      let selectRepresent;

      beforeEach(() => {
         selectRepresent = [{ id: 1 }];

         genericFetch.mockImplementation(async () => ({ status: 204 }));
      });

      test('it should call the service with the related person list', async () => {
         const result = await saveRepresent(selectRepresent);

         expect(result).toEqual({ status: 204 });

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data).toEqual({ relatedPersonList: [{ id: 1 }] });
      });

      test('when generic fetch throws an error it should return an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await saveRepresent(selectRepresent);

         expect(result).toEqual({
            status: 500,
            message: 'Ocurrió un error al guardar los representantes',
            error: new Error('Test Error Message'),
         });
      });
   });

   describe('dowloadDocumentFetch service', () => {
      test('it should call generic service with the correct folio', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 200 }));

         await dowloadDocumentFetch('1234');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/File/downloadFileByDataBuffer?folio=1234',
            method: 'get',
         });
      });

      test('when generic fetch throws an error it should return an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await dowloadDocumentFetch('1234');

         expect(result).toEqual({
            status: 500,
            message: 'Ocurrió un error al descargar el documento',
            error: new Error('Test Error Message'),
         });
      });
   });
});
