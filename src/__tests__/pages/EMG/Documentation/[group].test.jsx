import Documentation from '../../../../pages/EMG/Documentation/[group]';

import { getDocumentation, getOneRequest } from '../../../../services';

const togglePDFMock = jest.fn();
jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getDocumentation: jest.fn(),
   getOneRequest: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return {
      ...originalModule,
      useGlobalContext: () => ({
         user: { idProfile: 1, userAD: 'test user' },
         actions: { toggleLoading: jest.fn(), togglePDF: togglePDFMock },
      }),
   };
});

describe('Documentation page', () => {
   let oneRequestMock;
   beforeEach(() => {
      oneRequestMock = {
         status: 200,
         data: {
            requestResponseList: [
               {
                  idRequest: 7,
                  relatedPersonResponseList: [{ idClient: '10', idCatTypePerson: 1, fullName: 'test name 1' }],
               },
            ],
            idCatStatus: 1,
            sendOtherProfile: false,
         },
      };

      getOneRequest.mockResolvedValue(oneRequestMock);
      getDocumentation.mockResolvedValue({
         status: 200,
         data: {
            personType: 'PF',
            documentation: [
               {
                  _id: '1',
                  folio: 'folio1',
                  title: 'Test Title',
                  subtitle: 'test subtitle',
                  selectedType: 'selected type',
                  status: 'Pendiente',
                  layout: 'CNNV',
                  isEnable: true,
                  docs: [],
                  toAction: [{ type: 'btn', label: 'Empezar', enable: true }],
               },
               {
                  _id: '2',
                  folio: 'folio2',
                  title: 'Test Title 2',
                  subtitle: 'test subtitle 2',
                  selectedType: 'selected type',
                  status: 'Finalizado',
                  layout: 'CNNV',
                  isEnable: true,
                  docs: [],
                  toAction: [{ type: 'btn', label: 'Editar', enable: true }],
               },
            ],
         },
      });
      togglePDFMock.mockClear();
   });

   test('when clicking on a applicant or OS from the list it should send a request to get documentation', async () => {
      const {
         user,
         queries: { findByRole },
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      expect(getDocumentation).toHaveBeenCalledWith(
         { idClient: '10', idCatTypePerson: 1, fullName: 'test name 1', idGroup: 1, idStatusGroup: 1 },
         { idProfile: 1, userAD: 'test user' }
      );
   });

   test('when clicking on a applicant or OS from the list it should show a error modal if the requests response has an error', async () => {
      getDocumentation.mockResolvedValue({
         status: 500,
         error: { response: { message: 'Test Error Message' }, traceId: '123' },
      });

      const {
         user,
         queries: { findByRole, getByText },
         waitFor,
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test Error Message ]')).toBeVisible();
   });

   test('when clicking on a applicant or OS from the list it should display the list of documents', async () => {
      const {
         user,
         queries: { findByRole, getByText },
         waitFor,
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByText('Test Title')).toBeVisible());
   });

   test('when list of documents is visible it should show an begin button if that document has not been edited', async () => {
      const {
         user,
         queries: { findByRole, getByRole },
         waitFor,
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByRole('button', { name: 'Empezar' })).toBeVisible());
   });

   test('when list of documents is visible it should show an edit button if that document has been edited before', async () => {
      const {
         user,
         queries: { findByRole, getByRole },
         waitFor,
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByRole('button', { name: 'Editar' })).toBeVisible());
   });

   test('it should show a modal when clicking the view button of BC requirements', async () => {
      const {
         user,
         queries: { findByRole },
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      const beginBtn = await findByRole('button', { name: 'Empezar' });
      await user.click(beginBtn);

      expect(togglePDFMock).toHaveBeenCalledWith({ folio: 'folio1', title: 'Test Title' });
   });

   test('it should enable send button when all documents are fulfilled', async () => {
      oneRequestMock.data.sendOtherProfile = true;
      getOneRequest.mockResolvedValue(oneRequestMock);

      const {
         queries: { findByRole },
      } = await renderPage(Documentation, { idGroup: 1 });

      const nextBtn = await findByRole('button', { name: 'Enviar solicitud' });
      expect(nextBtn).toBeEnabled();
   });
});
