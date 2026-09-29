import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import GeneralInformation, { getServerSideProps } from '../../../../pages/EMG/GeneralInformation/[client]';
import { getGeneralInfo, postCreateRequest } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getGeneralInfo: jest.fn(),
   postCreateRequest: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), showLoading: jest.fn() },
}));

const specialist = { userAD: 'emg.ad', path: 'EMG', idProfile: 3, status: [] };

const applicant = {
   idClient: 100,
   fullName: 'Empresa Alfa',
   group: 'Grupo Alfa',
   rfc: 'ALF010101AAA',
   email: 'alfa@correo.com',
};
const buildResponse = ({ group, requests, appli = applicant } = {}) => ({
   status: 200,
   data: {
      appli,
      group: group ?? [
         { idClient: 200, fullName: 'Beta SA', email: 'beta@correo.com', isInProgress: false },
         { idClient: 300, fullName: 'Gama SA', email: 'gama@correo.com', isInProgress: false },
      ],
      requests: {
         applicant: requests ?? [
            {
               lineNumber: 1001,
               typeActiveProduct: 'Crédito simple',
               startDate: '01-01-2023',
               endDate: '01-01-2025',
               authorizedAmount: 1500000,
               currency: 'USD',
            },
         ],
      },
   },
});

const setup = async ({ response = buildResponse(), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getGeneralInfo.mockResolvedValue(response);
   const utils = renderPage(<GeneralInformation idClient={100} />, {
      context: { user: specialist },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   if (response.status === 200) await screen.findByText('alfa@correo.com');
   return utils;
};
const createButton = () => screen.getByRole('button', { name: 'Crear solicitud' });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (EMG GeneralInformation)', () => {
   test('passes the client of the route as a number', async () => {
      expect(await getServerSideProps({ params: { client: '55' } })).toEqual({ props: { idClient: 55 } });
   });

   test('defaults the client to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idClient: 0 } });
   });
});

describe('EMG GeneralInformation page', () => {
   describe('loading', () => {
      test('requests the information of the client and shows it', async () => {
         const { context } = await setup();

         expect(getGeneralInfo).toHaveBeenCalledWith(100);
         expect(screen.getByTestId('client-name')).toHaveTextContent('Empresa Alfa');
         expect(screen.getByTestId('client-group')).toHaveTextContent('Grupo Alfa');
         expect(screen.getByTestId('client-idClient')).toHaveTextContent('100');
         expect(screen.getByTestId('client-rfc')).toHaveTextContent('ALF010101AAA');
         expect(context.actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('shows dashes for the missing values', () => {
         getGeneralInfo.mockReturnValue(new Promise(() => {}));

         renderPage(<GeneralInformation idClient={100} />, { context: { user: specialist } });

         expect(screen.getByTestId('client-name')).toHaveTextContent('-');
         expect(screen.getByTestId('client-rfc')).toHaveTextContent('-');
         expect(createButton()).toBeDisabled();
      });

      test('keeps the empty information and hides the loader when the service answers with another status', async () => {
         getGeneralInfo.mockResolvedValue({ status: 500, data: null });
         const { context } = renderPage(<GeneralInformation idClient={100} />, { context: { user: specialist } });

         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenCalledTimes(2));
         expect(screen.getByTestId('client-name')).toHaveTextContent('-');
         expect(createButton()).toBeDisabled();
      });

      test('lists the previous credit lines of the client', async () => {
         await setup();

         expect(screen.getByText('Crédito simple')).toBeInTheDocument();
         expect(screen.getByText('1001')).toBeInTheDocument();
      });

      test('shows an empty message when the client has no active products', async () => {
         await setup({ response: buildResponse({ requests: [] }) });

         expect(screen.getByText('Sin productos activos')).toBeInTheDocument();
      });

      test('lists the members of the economic group', async () => {
         await setup();

         expect(screen.getByText('Beta SA')).toBeInTheDocument();
         expect(screen.getByText('Gama SA')).toBeInTheDocument();
      });
   });

   describe('navigation', () => {
      test('goes back to the search page', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/');
      });
   });

   describe('alternative email', () => {
      test('disables the creation while a member with alternative email has none typed', async () => {
         const { user } = await setup();
         await user.click(document.querySelector('#client-200'));
         expect(createButton()).toBeEnabled();

         await user.click(screen.getByTestId('edit-alternative-200'));

         expect(createButton()).toBeDisabled();
         await user.type(screen.getByTestId('input-alternative-200'), 'alterno@correo.com');
         expect(createButton()).toBeEnabled();
      });
   });

   describe('creating the request', () => {
      test('warns that the request cannot be created when a member already has one in progress', async () => {
         const group = [{ idClient: 200, fullName: 'Beta SA', email: 'beta@correo.com', isInProgress: true }];
         const { user } = await setup({ response: buildResponse({ group }) });

         await user.click(createButton());

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ title: '¡No podemos crear la solicitud!', icon: 'warning' })
         );
         expect(postCreateRequest).not.toHaveBeenCalled();
      });

      test('asks for confirmation before creating and does not create when cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = await setup();

         await user.click(createButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¡Recuerda que!' })));
         expect(postCreateRequest).not.toHaveBeenCalled();
      });

      test('creates the request with the selected members and goes to the solidary obligors after a second', async () => {
         postCreateRequest.mockResolvedValue({ status: 200, data: { groupRequest: 88 } });
         const { user, router, context } = await setup({ fakeTimers: true });
         await user.click(document.querySelector('#client-200'));

         await user.click(createButton());

         await waitFor(() =>
            expect(postCreateRequest).toHaveBeenCalledWith(
               [applicant, expect.objectContaining({ idClient: 200 })],
               'emg.ad',
               'Grupo Alfa'
            )
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: '¡Se guardo la información correctamente!', icon: 'success' })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(1000);
         });
         expect(router.push).toHaveBeenCalledWith('/EMG/Solidary/88');
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('creates the request when the client has no economic group members', async () => {
         postCreateRequest.mockResolvedValue({ status: 200, data: { groupRequest: 89 } });
         const { user } = await setup({ response: buildResponse({ group: [] }) });

         await user.click(createButton());

         await waitFor(() => expect(postCreateRequest).toHaveBeenCalledWith([applicant], 'emg.ad', 'Grupo Alfa'));
      });

      test('does not navigate when the service answers with another status', async () => {
         postCreateRequest.mockResolvedValue({ status: 500 });
         const { user, router, context } = await setup();

         await user.click(createButton());

         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when creating throws', async () => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         postCreateRequest.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(createButton());

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
