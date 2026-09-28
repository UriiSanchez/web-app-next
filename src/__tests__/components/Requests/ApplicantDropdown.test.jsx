import { fireEvent, screen, within } from '@testing-library/react';

import { ApplicantDropdown } from '../../../components/Requests/ApplicantDropdown';
import { renderComponent } from '../../utils/render';

const FAC = 6;
const EMG = 3;
const SOLICITUD_RECHAZADA = 11;

const ana = { idRequest: 1, idClient: 10, fullName: 'Ana Pérez', idCatStatus: 4, sealed: false };
const luis = { idRequest: 2, idClient: 20, fullName: 'Luis Gómez', idCatStatus: 4, sealed: true };
const marta = { idRequest: 3, idClient: 30, fullName: 'Marta Ruiz', idCatStatus: SOLICITUD_RECHAZADA };
const list = [ana, luis, marta];

function setup(props = {}) {
   const onSet = jest.fn();
   const utils = renderComponent(
      <ApplicantDropdown
         applicantActive={ana}
         listRequest={list}
         onSet={onSet}
         isGroup
         userActive={{ idProfile: EMG }}
         {...props}
      />
   );
   return { onSet, ...utils };
}

const openList = (user) => user.click(screen.getByText('keyboard_arrow_down'));
const rowOf = (name) => screen.getAllByText(name).find((node) => node.classList.contains('truncate')).parentElement;

describe('ApplicantDropdown', () => {
   test('shows only the applicant name (plus its tooltip) when the request is not a group', () => {
      setup({ isGroup: false });

      expect(screen.getAllByText('Ana Pérez')).toHaveLength(2);
      expect(screen.queryByText('keyboard_arrow_down')).not.toBeInTheDocument();
   });

   test('keeps the list closed until the header is clicked', async () => {
      const { user } = setup();
      expect(screen.getAllByText('Ana Pérez')).toHaveLength(1);
      expect(screen.queryByText('Luis Gómez')).not.toBeInTheDocument();

      await openList(user);

      expect(screen.getByText('keyboard_arrow_up')).toBeInTheDocument();
      expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
      expect(screen.getByText('Marta Ruiz')).toBeInTheDocument();
   });

   test('shows pending, stamped and rejected statuses for a non faculty profile', async () => {
      const { user } = setup();
      await openList(user);

      expect(within(rowOf('Ana Pérez')).getByText('Pendiente')).toBeInTheDocument();
      expect(within(rowOf('Luis Gómez')).getByText('Sellado')).toBeInTheDocument();
      expect(within(rowOf('Marta Ruiz')).getByText('Rechazado')).toBeInTheDocument();
   });

   test('shows the faculty resolution of the profile type for faculty users', async () => {
      const commercial = [
         { ...ana, resolutionByCommercial: 'APPROVED', resolutionByCredit: 'REJECTED' },
         { ...luis, resolutionByCommercial: 'PENDING', resolutionByCredit: 'APPROVED' },
         { ...marta },
      ];
      const { user } = setup({
         listRequest: commercial,
         applicantActive: commercial[0],
         userActive: { idProfile: FAC, profileType: 'COMERCIAL' },
      });
      await openList(user);

      expect(within(rowOf('Ana Pérez')).getByText('Autorizado')).toBeInTheDocument();
      expect(within(rowOf('Luis Gómez')).getByText('Pendiente')).toBeInTheDocument();
      expect(within(rowOf('Marta Ruiz')).queryByText(/Autorizado|Pendiente|Rechazado|Sellado/)).not.toBeInTheDocument();
   });

   test('uses the credit resolution for credit faculty users', async () => {
      const credit = [{ ...ana, resolutionByCommercial: 'APPROVED', resolutionByCredit: 'REJECTED' }];
      const { user } = setup({
         listRequest: credit,
         applicantActive: credit[0],
         userActive: { idProfile: FAC, profileType: 'CREDITO' },
      });
      await openList(user);

      expect(within(rowOf('Ana Pérez')).getByText('Rechazado')).toBeInTheDocument();
   });

   test('reports the selected request and closes the list', async () => {
      const { onSet, user } = setup();
      await openList(user);

      await user.click(screen.getByText('Luis Gómez'));

      expect(onSet).toHaveBeenCalledWith(luis);
      expect(screen.queryByText('Marta Ruiz')).not.toBeInTheDocument();
   });

   test('does not report the request that is already active but closes the list', async () => {
      const { onSet, user } = setup();
      await openList(user);

      await user.click(rowOf('Ana Pérez'));

      expect(onSet).not.toHaveBeenCalled();
      expect(screen.queryByText('Marta Ruiz')).not.toBeInTheDocument();
   });

   test('closes the list when clicking outside', async () => {
      const { user } = setup();
      await openList(user);

      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('Marta Ruiz')).not.toBeInTheDocument();
   });

   test('toggles the list from the header', async () => {
      const { user } = setup();

      await openList(user);
      await user.click(screen.getByText('keyboard_arrow_up'));

      expect(screen.queryByText('Marta Ruiz')).not.toBeInTheDocument();
   });
});
