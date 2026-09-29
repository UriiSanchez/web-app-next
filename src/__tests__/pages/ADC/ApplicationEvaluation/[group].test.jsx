import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import ApplicationEvaluation, { getServerSideProps } from '../../../../pages/ADC/ApplicationEvaluation/[group]';
import { getOneRequest, getValidateModel, postExecutionModel } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getOneRequest: jest.fn(),
   getValidateModel: jest.fn(),
   postExecutionModel: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildRequest = (idRequest, extra = {}, personExtra = {}) => ({
   idRequest,
   resultExecEm: true,
   coverComplete: true,
   recommendationAc: true,
   relatedPersonResponseList: [
      { idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}`, ...personExtra },
   ],
   ...extra,
});
const buildResponse = (requests = [buildRequest(1)], extra = {}) => ({
   status: 200,
   data: { idGroup: 7, groupName: 'Grupo Ejemplo', requestResponseList: requests, ...extra },
});

const setup = async (response = buildResponse()) => {
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<ApplicationEvaluation idGroup='7' />, { context: { user: analyst } });
   if (response.status === 200) await screen.findByText('Grupo Ejemplo');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (ADC ApplicationEvaluation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('ADC ApplicationEvaluation page', () => {
   describe('loading', () => {
      test('requests the group and shows the request number and the group name', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: /Solicitud\s+0000000007/ })).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Grupo Ejemplo' })).toBeInTheDocument();
      });

      test('shows a dash when the group has no name', async () => {
         getOneRequest.mockResolvedValue(buildResponse([buildRequest(1)], { groupName: undefined }));

         renderPage(<ApplicationEvaluation idGroup='7' />, { context: { user: analyst } });

         expect(await screen.findByRole('heading', { name: '-' })).toBeInTheDocument();
      });

      test('shows a message with the service error when the group cannot be loaded', async () => {
         await setup({ status: 404, data: null, error: 'Folio inexistente' });

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: 'Folio inexistente', icon: 'info' }))
         );
         expect(screen.queryByRole('heading', { name: /Solicitud\s+0000000007/ })).not.toBeInTheDocument();
      });

      test('shows a default message when the service gives no error text', async () => {
         await setup({ status: 404, data: null });

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: 'No se pudo cargar la información o no existe este folio' })
            )
         );
      });
   });

   describe('steps', () => {
      test('goes back to the checklist of the group', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
      });

      test('enables every step when the model, the cover and the recommendation are complete', async () => {
         const { user, router } = await setup();

         await user.click(button('Visualizar'));
         expect(router.push).toHaveBeenLastCalledWith('/Shared/Model/7');
         await user.click(button('Editar'));
         expect(router.push).toHaveBeenLastCalledWith('/Shared/Cover/7');
         await user.click(button('Recomendar'));
         expect(router.push).toHaveBeenLastCalledWith('/ADC/Recomendation/7');
      });

      test('disables the model view and the cover editor until every request has a model result', async () => {
         await setup(buildResponse([buildRequest(1), buildRequest(2, { resultExecEm: null })]));

         expect(button('Visualizar')).toBeDisabled();
         expect(button('Editar')).toBeDisabled();
      });

      test('disables the recommendation until every cover is complete', async () => {
         await setup(buildResponse([buildRequest(1), buildRequest(2, { coverComplete: false })]));

         expect(button('Visualizar')).toBeEnabled();
         expect(button('Recomendar')).toBeDisabled();
      });

      test('marks the model, cover and recommendation icons as done only when complete', async () => {
         await setup(buildResponse([buildRequest(1, { recommendationAc: null })]));
         const icons = screen.getAllByText('check_circle');

         expect(icons[0]).toHaveClass('text-yellow-500');
         expect(icons[1]).toHaveClass('text-yellow-500');
         expect(icons[2]).toHaveClass('text-gray');
      });

      test('shows the model card icon in gray while the model was not executed', async () => {
         await setup(buildResponse([buildRequest(1, { resultExecEm: null })]));

         expect(screen.getAllByText('check_circle')[0]).toHaveClass('text-gray');
      });
   });

   describe('model errors', () => {
      const mistake = { statusModel: 'Mistake', errorModel: JSON.stringify({ message: 'Fallo', description: 'sin datos', traceID: 'T-1' }) };

      test('warns with the details of each participant whose model failed and marks the icon in red', async () => {
         await setup(buildResponse([buildRequest(1, {}, mistake)]));

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               html: expect.stringContaining('Ocurrió un error en la ejecución del Modelo'),
               timer: 8000,
               width: 450,
            })
         );
         const { html } = Swal.fire.mock.calls[0][0];
         expect(html).toContain('Solicitante 1');
         expect(html).toContain('Fallo: sin datos');
         expect(html).toContain('T-1');
         expect(screen.getByText('error')).toHaveClass('text-red-500');
      });

      test('does not warn when no participant failed', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
         expect(screen.getAllByText('check_circle')[0]).toHaveClass('text-yellow-500');
      });
   });

   describe('model execution', () => {
      test('runs the validation and the execution for the group with the active user', async () => {
         getValidateModel.mockResolvedValue({ status: 200 });
         postExecutionModel.mockResolvedValue({ status: 200 });
         const { user } = await setup();

         await user.click(button('Ejecutar modelo'));

         await waitFor(() => expect(postExecutionModel).toHaveBeenCalledWith('7', 'ana.ad'));
         expect(getValidateModel).toHaveBeenCalledWith('7', 'ana.ad');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Ejecución en proceso') })
            )
         );
      });

      test('shows the validation error and does not execute the model', async () => {
         getValidateModel.mockResolvedValue({ status: 400, error: { response: { message: 'Falta el balance' } } });
         const { user } = await setup();

         await user.click(button('Ejecutar modelo'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Falta el balance') })
            )
         );
         expect(postExecutionModel).not.toHaveBeenCalled();
      });
   });
});
