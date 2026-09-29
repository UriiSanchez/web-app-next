import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import ApplicationEvaluation, { getServerSideProps } from '../../../../pages/LDC/ApplicationEvaluation/[group]';
import { getOneRequest } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getOneRequest: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const leader = { userAD: 'lc.ad', path: 'LDC', idProfile: 4, status: [] };

const buildRequest = (idRequest, extra = {}, personExtra = {}) => ({
   idRequest,
   resultExecEm: true,
   coverComplete: true,
   recommendationLc: true,
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
   const utils = renderPage(<ApplicationEvaluation idGroup='7' />, { context: { user: leader } });
   if (response.status === 200) await screen.findByText('Grupo Ejemplo');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (LDC ApplicationEvaluation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('LDC ApplicationEvaluation page', () => {
   describe('loading', () => {
      test('requests the group and shows the request number and the group name', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByTestId('title-request')).toHaveTextContent('Solicitud 0000000007');
         expect(screen.getByRole('heading', { name: 'Grupo Ejemplo' })).toBeInTheDocument();
      });

      test('shows the request title without a number when the group has no id', async () => {
         await setup(buildResponse([buildRequest(1)], { idGroup: undefined }));

         expect(screen.getByTestId('title-request')).toHaveTextContent(/^Solicitud\s*$/);
      });

      test('shows a dash when the group has no name', async () => {
         getOneRequest.mockResolvedValue(buildResponse([buildRequest(1)], { groupName: undefined }));

         renderPage(<ApplicationEvaluation idGroup='7' />, { context: { user: leader } });

         expect(await screen.findByRole('heading', { name: '-' })).toBeInTheDocument();
      });

      test('shows the error and keeps the skeleton when the service answers with another status', async () => {
         await setup({ status: 500, data: { message: 'Fallo' } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByTestId('title-request')).not.toBeInTheDocument();
      });

      test('sends the leader to the checklist when a client changed the financial documents', async () => {
         const response = buildResponse([buildRequest(1, {}, { financialDocsChanges: true })]);

         const { router } = await setup(response);

         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/7');
      });

      test('does not redirect when no client changed the financial documents', async () => {
         const { router } = await setup();

         expect(router.push).not.toHaveBeenCalled();
      });
   });

   describe('steps', () => {
      test('goes back to the checklist of the group', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/7');
      });

      test('enables every step when the model, the cover and the recommendation are complete', async () => {
         const { user, router } = await setup();

         await user.click(button('Visualizar'));
         expect(router.push).toHaveBeenLastCalledWith('/Shared/Model/7');
         await user.click(button('Editar'));
         expect(router.push).toHaveBeenLastCalledWith('/Shared/Cover/7');
         await user.click(button('Recomendar'));
         expect(router.push).toHaveBeenLastCalledWith('/LDC/Recomendation/7');
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

      test('marks each step icon as done only when it is complete', async () => {
         await setup(buildResponse([buildRequest(1, { recommendationLc: null })]));
         const icons = screen.getAllByText('check_circle');

         expect(icons[0]).toHaveClass('text-yellow-500');
         expect(icons[1]).toHaveClass('text-yellow-500');
         expect(icons[2]).toHaveClass('text-gray');
      });

      test('shows the icons in gray while nothing is complete', async () => {
         await setup(
            buildResponse([buildRequest(1, { resultExecEm: null, coverComplete: false, recommendationLc: null })])
         );

         screen.getAllByText('check_circle').forEach((icon) => expect(icon).toHaveClass('text-gray'));
      });

      test('returns the request to the analyst', async () => {
         const { user, router } = await setup();

         await user.click(button(/Devolver solicitud al analista/));

         expect(router.push).toHaveBeenCalledWith('/LDC/ReturnRequest/7?origin=ApplicationEvaluation');
      });
   });
});
