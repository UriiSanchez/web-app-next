import Swal from 'sweetalert2';

import Documentation from '../../../../pages/LDC/Documentation/[group]';

import { useRouter } from 'next/router';
import { getDocumentation, getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import { sweetConfirmation, templateSweetAlert, getChangedFinancialClients, getError } from '../../../../helpers';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getDocumentation: jest.fn(), getOneRequest: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return { ...originalModule, useGlobalContext: jest.fn() };
});
jest.mock('../../../../helpers', () => {
   const original = jest.requireActual('../../../../helpers');

   return {
      ...original,
      __esModule: true,
      sweetConfirmation: jest.fn(),
      getChangedFinancialClients: jest.fn().mockReturnValue([]),
      templateSweetAlert: {
         CHANGE_FINANCIAL: jest.fn(),
         NO_ASSIGNED_LEADER: jest.fn(),
      },
   };
});
jest.mock('sweetalert2', () => ({
   mixin: jest.fn(() => ({ fire: jest.fn() })),
   fire: jest.fn(),
}));

describe('Documentation page', () => {
   const props = { idGroup: '1' };
   let routerMock;
   let globalContextMock;
   let serviceMock;
   let getDocServiceMock;

   beforeEach(() => {
      routerMock = {
         push: jest.fn(),
      };

      globalContextMock = {
         user: { userAD: 'testuser', idProfile: 4, path: 'LDC' },
         actions: { toggleReloading: jest.fn(), toggleLoading: jest.fn() },
         isReloading: false,
         listAnalyst: [{ idUser: 'testanalyst', color: 'blue', name: 'Test Analyst' }],
      };

      serviceMock = {
         status: 200,
         data: {
            requestResponseList: [
               {
                  idRequest: 1,
                  hasVerification: true,
                  relatedPersonResponseList: [
                     { idClient: '10', fullName: 'Test requester', idCatTypePerson: 1, financialDocsChanges: false },
                  ],
               },
            ],
            idCatStatus: 5,
            idLeader: 'testuser',
         },
      };

      getDocServiceMock = {
         status: 200,
         data: {},
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue(globalContextMock);
      getOneRequest.mockResolvedValue(serviceMock);
      getDocumentation.mockResolvedValue(getDocServiceMock);
      Swal.fire.mockResolvedValue({ isConfirmed: true });
   });

   test('it displays an error when service response is not status 200', async () => {
      serviceMock.status = 500;
      serviceMock.error = { response: { message: 'Test Error 101' }, traceId: '123' };

      const { waitFor } = await renderPage(Documentation, props);

      await waitFor(() =>
         expect(Swal.fire).toHaveBeenCalledWith({
            confirmButtonColor: '#222222',
            confirmButtonText: 'Aceptar',
            html: `<h2 class='text-2xl font-semibold my-4'>¡Error interno del servidor!</h2>
         <p class='text-sm'>Hubo un problema al ejecutar la petición. Por favor, verifica tu conexión a internet o vuelve a intentarlo de nuevo más tarde.</p>
         <details open class='text-left px-9 mt-2'>
            <summary class='text-sm font-bold cursor-pointer'>
               Detalles:
            </summary>
            <p class='text-xs text-gray-700 mt-3 text-center'>[ Test Error 101 ]</p>
            <p class='text-xs text-gray-700 font-semibold text-center'>Trace ID: 123</p>
         </details>`,
            icon: 'error',
            title: '',
         })
      );
   });

   test('it redirects to requests review page when clicking on back button ', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(Documentation, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(routerMock.push).toHaveBeenCalledWith('/LDC/RequestsReview');
   });

   test('it redirects to return request page when clicking on return request button', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(Documentation, props);

      await user.click(getByRole('button', { name: 'Devolver solicitud' }));

      expect(routerMock.push).toHaveBeenCalledWith('/LDC/ReturnRequest/1?origin=Documentation');
   });

   test('it redirects to evaluation page when clicking on finish button', async () => {
      serviceMock.data.idAnalyst = 'testanalyst';

      const {
         user,
         queries: { getByRole },
      } = await renderPage(Documentation, props);

      await user.click(getByRole('button', { name: 'Evaluar solicitud' }));

      expect(routerMock.push).toHaveBeenCalledWith('/LDC/ApplicationEvaluation/1');
   });

   test('it triggers loading action when clicking on requester checkbox', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(Documentation, props);

      await user.click(getByLabelText('Solicitante: Test requester'));

      expect(globalContextMock.actions.toggleLoading.mock.calls.length).toBe(2);
   });

   test('it calls the get documentation service when clicking on requester checkbox', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(Documentation, props);

      await user.click(getByLabelText('Solicitante: Test requester'));

      expect(getDocumentation).toHaveBeenCalled();
   });

   test('it should display an error message when the service called when clicking on requester checkbox respond with an error', async () => {
      getDocServiceMock.status = 500;
      getDocServiceMock.error = { response: { message: 'Get document test error 202' } };

      const {
         user,
         queries: { getByLabelText },
         waitFor,
      } = await renderPage(Documentation, props);

      await user.click(getByLabelText('Solicitante: Test requester'));

      /* Nueva forma de validar la respuesta del swalalert*/
      await waitFor(() =>
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               html: expect.stringContaining('¡Error interno del servidor!'),
               html: expect.stringContaining(
                  'Hubo un problema al ejecutar la petición. Por favor, verifica tu conexión a internet o vuelve a intentarlo de nuevo más tarde.'
               ),
               html: expect.stringContaining('[ Get document test error 202 ]'),
               html: expect.stringContaining('Trace ID: Sin Trace ID'),
               icon: 'error',
            })
         )
      );
   });

   test('it should fetch data when isReloading variable is true', async () => {
      globalContextMock.isReloading = true;

      await renderPage(Documentation, props);

      expect(getOneRequest.mock.calls.length).toBe(2);
   });

   test('it should show the financial alert and when clicking on the button it should redirect us to the return screen for the analyst', async () => {
      serviceMock.data = {
         requestResponseList: [
            {
               idRequest: 1,
               hasVerification: true,
               relatedPersonResponseList: [
                  { idClient: '10', fullName: 'Test requester', idCatTypePerson: 1, financialDocsChanges: true },
               ],
            },
         ],
         idCatStatus: 5,
         idLeader: 'testuser',
      };
      getChangedFinancialClients.mockReturnValue(['Test requester']);

      const { waitFor } = await renderPage(Documentation, props);

      await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

      expect(Swal.fire).toHaveBeenCalledWith(
         expect.objectContaining(
            { confirmButtonText: 'Devolver al analista' },
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

      expect(routerMock.push).toHaveBeenCalledWith('/LDC/ReturnRequest/1?origin=ApplicationEvaluation');
   });

   test('the financial alert should not be displayed', async () => {
      serviceMock.data = {
         requestResponseList: [
            {
               idRequest: 1,
               hasVerification: true,
               relatedPersonResponseList: [
                  { idClient: '10', fullName: 'Test requester', idCatTypePerson: 1, financialDocsChanges: false },
               ],
            },
         ],
         idCatStatus: 5,
         idLeader: 'testuser',
      };
      getChangedFinancialClients.mockReturnValue([]);

      const { waitFor } = await renderPage(Documentation, props);

      await waitFor(() => expect(Swal.fire).not.toHaveBeenCalled());
   });

   test('it should render assigned leader alert modal', async () => {
      serviceMock.data.idLeader = 'testuser2';

      const {} = await renderPage(Documentation, props);

      expect(sweetConfirmation).toHaveBeenCalled();
   });
});
