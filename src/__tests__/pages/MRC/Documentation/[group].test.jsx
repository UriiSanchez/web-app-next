import Documentation from '../../../../pages/MRC/Documentation/[group]';

import { getDocumentation, getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getDocumentation: jest.fn(),
   getOneRequest: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
// Se usa este modo porque marca error el useToogle de la forma normal
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return {
      ...originalModule,
      useGlobalContext: jest.fn(),
   };
});

const togglePDFMock = jest.fn();
const mockUserMR = {
   path: 'MRC',
   status: [2],
   idProfile: 2,
   userAD: 'UserMR',
};

describe('Documentation page', () => {
   let globalContextMock;
   let oneRequestMock;

   beforeEach(() => {
      globalContextMock = {
         user: mockUserMR,
         actions: { toggleLoading: jest.fn(), togglePDF: togglePDFMock },
      };

      oneRequestMock = {
         status: 200,
         data: {
            requestResponseList: [
               {
                  idRequest: 1,
                  relatedPersonResponseList: [{ idClient: '313', idCatTypePerson: 1, fullName: 'test name 1' }],
               },
            ],
            idCatStatus: 1,
         },
      };

      useGlobalContext.mockReturnValue(globalContextMock);
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

      const radioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(radioBtn);

      expect(getDocumentation).toHaveBeenCalledWith(
         { idClient: '313', idCatTypePerson: 1, fullName: 'test name 1', idGroup: 1, idStatusGroup: 1 },
         { idProfile: 2, userAD: 'UserMR', status:[2], path: "MRC" }
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
         waitFor
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
         waitFor
      } = await renderPage(Documentation, { idGroup: 1 });

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByText('Test Title')).toBeVisible());
   });
});
