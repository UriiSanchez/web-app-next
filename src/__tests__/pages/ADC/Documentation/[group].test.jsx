import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import Documentation from '../../../../pages/ADC/Documentation/[group]';
import { getDocumentation, getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
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
jest.mock('sweetalert2', () => ({
   mixin: jest.fn(() => ({ fire: jest.fn() })),
   fire: jest.fn(),
}));

const togglePDFMock = jest.fn();

describe('Documentation Analyst Page', () => {
   const props = { idGroup: 1 };
   let globalContextMock;
   let oneRequestMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         user: mockUsers.ADC,
         actions: { toggleLoading: jest.fn(), togglePDF: togglePDFMock },
      };

      oneRequestMock = {
         status: 200,
         data: {
            requestResponseList: [
               {
                  idRequest: 1,
                  hasVerification: false,
                  relatedPersonResponseList: [
                     { idClient: '313', idCatTypePerson: 1, fullName: 'test name 1', financialDocsChanges: false },
                  ],
               },
            ],
            idCatStatus: 4,
         },
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getOneRequest.mockResolvedValue(oneRequestMock);
      getDocumentation.mockResolvedValue({
         status: 200,
         data: {
            personType: 'PFAE',
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
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      togglePDFMock.mockClear();
   });

   test('when clicking on a applicant or OS from the list it should send a request to get documentation', async () => {
      const {
         user,
         queries: { findByRole },
      } = await renderPage(Documentation, props);

      const radioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(radioBtn);

      expect(getDocumentation).toHaveBeenCalledWith(
         {
            idClient: '313',
            idCatTypePerson: 1,
            fullName: 'test name 1',
            idGroup: 1,
            hasVerification: false,
            idStatusGroup: 4,
            financialDocsChanges: false,
         },
         mockUsers.ADC
      );
   });

   test('when clicking on a applicant or OS from the list it should show a error modal if the requests response has an error', async () => {
      getDocumentation.mockResolvedValue({
         status: 500,
         error: { response: { message: 'Test Error Message' }, traceId: '123' },
      });

      const {
         user,
         queries: { findByRole },
         waitFor,
      } = await renderPage(Documentation, props);

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      /* Segunda forma de validar la respuesta del swalalert*/
      await waitFor(() => {
         const callArgs = Swal.fire.mock.calls[0][0];

         expect(callArgs.html).toContain("¡Error interno del servidor!");
         expect(callArgs.html).toContain("[ Test Error Message ]");
         expect(callArgs.html).toContain("Trace ID: 123");
      });
   });

   test('when clicking on a applicant or OS from the list it should display the list of documents', async () => {
      const {
         user,
         queries: { findByRole, getByText },
         waitFor,
      } = await renderPage(Documentation, props);

      const applicantRadioBtn = await findByRole('radio', { name: 'Solicitante: test name 1' });
      await user.click(applicantRadioBtn);

      await waitFor(() => expect(getByText('Test Title')).toBeVisible());
   });

   test('it redirects to requests review page when clicking on back button ', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(Documentation, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(pushMock).toHaveBeenCalledWith('/ADC/RequestsReview');
   });

   test('it redirects to return request page when clicking on return request button', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(Documentation, props);

      await user.click(getByRole('button', { name: 'Devolver solicitud' }));

      expect(pushMock).toHaveBeenCalledWith('/ADC/ReturnRequest/1?origin=Documentation');
   });

   test('it display the change modal in financial documents', async () => {
      oneRequestMock.data = {
         requestResponseList: [
            {
               idRequest: 1,
               hasVerification: false,
               relatedPersonResponseList: [
                  { idClient: '313', idCatTypePerson: 1, fullName: 'test name 1', financialDocsChanges: true },
               ],
            },
         ],
         idCatStatus: 4,
      };
      await renderPage(Documentation, props);

      expect(Swal.fire).toHaveBeenCalledWith(
         expect.objectContaining(
            { confirmButtonText: 'Aceptar' },
            { allowEscapeKey: false },
            { allowOutsideClick: false },
            {
               customClass: {
                  confirmButton: ' btn-modal-primary font-medium text-sm w-44 h-8 text-white bg-black-900 rounded-3xl',
                  htmlContainer: 'px-6 w-full',
                  popup: 'w-[632px] max-h-[468px]',
               },
            },
            { focusConfirm: true }
         )
      );
   });

   test('the financial alert should not be displayed when financialDocsChanges is false', async () => {
      oneRequestMock.data = {
         requestResponseList: [
            {
               idRequest: 1,
               hasVerification: false,
               relatedPersonResponseList: [
                  { idClient: '313', idCatTypePerson: 1, fullName: 'test name 1', financialDocsChanges: false },
               ],
            },
         ],
         idCatStatus: 4,
      };

      const { waitFor } = await renderPage(Documentation, props);

      await waitFor(() => expect(Swal.fire).not.toHaveBeenCalled());
   });
});
