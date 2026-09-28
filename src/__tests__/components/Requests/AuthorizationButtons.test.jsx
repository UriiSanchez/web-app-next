import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import { AuthorizationButtons } from '../../../components/Requests/AuthorizationButtons';
import { renderComponent } from '../../utils/render';

// La regla de bloqueo es lógica pura del módulo; no se sustituye.
jest.mock('../../../services', () => ({
   validateAuthorizationForRequest: (...args) =>
      jest.requireActual('../../../services/servEmpowered').validateAuthorizationForRequest(...args),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const SOLICITUD_AUTORIZADA = 10;
const EN_REVISION_FACULTADO = 26;

const sign = (userAD, typeFaculty, decisionFaculty) => ({ userAD, typeFaculty, decisionFaculty });

function setup({ authorizations = [], props = {} } = {}) {
   const onSet = jest.fn();
   const utils = renderComponent(
      <AuthorizationButtons
         authorizations={authorizations}
         userAD='yo'
         profileType='COMERCIAL'
         onSet={onSet}
         idStatusRequest={EN_REVISION_FACULTADO}
         {...props}
      />
   );
   return { onSet, ...utils };
}

const authorize = () => screen.getByLabelText(/Autorizar/);
const reject = () => screen.getByLabelText(/Rechazar/);

describe('AuthorizationButtons', () => {
   test('offers both options enabled and unchecked when nobody has decided', () => {
      setup();

      expect(authorize()).toBeEnabled();
      expect(reject()).toBeEnabled();
      expect(authorize()).not.toBeChecked();
      expect(reject()).not.toBeChecked();
   });

   test('checks and marks the decision already taken by the active user', () => {
      setup({ authorizations: [sign('yo', 'COMERCIAL', 'YES')] });

      expect(authorize()).toBeChecked();
      expect(reject()).not.toBeChecked();
      expect(screen.getByText('check')).toBeInTheDocument();
      expect(authorize()).toBeEnabled();
   });

   test('disables the options when another faculty of the same type already authorized', () => {
      setup({ authorizations: [sign('otro', 'COMERCIAL', 'YES')] });

      expect(authorize()).toBeDisabled();
      expect(reject()).toBeDisabled();
   });

   test('keeps the options enabled when the authorization comes from the other faculty type', () => {
      setup({ authorizations: [sign('otro', 'CREDITO', 'YES')] });

      expect(authorize()).toBeEnabled();
   });

   test('disables the options once commercial and credit both authorized', () => {
      setup({ authorizations: [sign('yo', 'COMERCIAL', 'YES'), sign('otro', 'CREDITO', 'YES')] });

      expect(authorize()).toBeDisabled();
      expect(reject()).toBeDisabled();
   });

   test.each([SOLICITUD_AUTORIZADA, 11])('disables the options when the request status is %p', (idStatusRequest) => {
      setup({ authorizations: [sign('otro', 'CREDITO', 'NO')], props: { idStatusRequest } });

      expect(authorize()).toBeDisabled();
      expect(reject()).toBeDisabled();
   });

   test('reports the chosen option', async () => {
      const { onSet, user } = setup();

      await user.click(authorize());
      expect(onSet).toHaveBeenLastCalledWith('YES');

      await user.click(reject());
      expect(onSet).toHaveBeenLastCalledWith('NO');
   });

   test('does not report anything when the options are disabled', async () => {
      const { onSet, user } = setup({ authorizations: [sign('otro', 'COMERCIAL', 'YES')] });

      await user.click(authorize());

      expect(onSet).not.toHaveBeenCalled();
   });

   describe('last faculty of the area', () => {
      test('asks for confirmation before reporting a rejection', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: true });
         const { onSet, user } = setup({ props: { lastRejection: true } });

         await user.click(reject());

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Eres el último de tu área') })
         );
         await screen.findByLabelText(/Rechazar/);
         expect(onSet).toHaveBeenCalledWith('NO');
      });

      test('does not report the rejection when the confirmation is cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { onSet, user } = setup({ props: { lastRejection: true } });

         await user.click(reject());

         expect(Swal.fire).toHaveBeenCalledTimes(1);
         expect(onSet).not.toHaveBeenCalled();
      });

      test('authorizing does not ask for confirmation', async () => {
         const { onSet, user } = setup({ props: { lastRejection: true } });

         await user.click(authorize());

         expect(Swal.fire).not.toHaveBeenCalled();
         expect(onSet).toHaveBeenCalledWith('YES');
      });
   });
});
