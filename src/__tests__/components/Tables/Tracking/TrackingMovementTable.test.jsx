import { screen, within } from '@testing-library/react';

import { TrackingMovementTable } from '../../../../components/Tables/Tracking/TrackingMovementTable';
import { renderComponent } from '../../../utils/render';

const details = [
   {
      idTracking: 1,
      profile: 'ESPECIALISTA',
      flagDevolution: false,
      fullName: 'Ana Lopez',
      createDate: '2025-06-03T08:46:12',
      totalTime: '2 dias',
   },
   {
      idTracking: 2,
      profile: 'ANALISTA',
      flagDevolution: true,
      fullName: '',
      createDate: null,
   },
   {
      idTracking: 3,
      profile: 'FACULTADO',
      flagDevolution: false,
      createDate: '2025-06-04T10:00:00',
      totalTime: '1 hora',
      authorizationFacultyResponse: [
         { userAD: 'fac1', fullName: 'Luis Perez', decisionFaculty: 'YES' },
         { userAD: 'fac2', fullName: 'Marta Diaz', decisionFaculty: 'NO' },
      ],
   },
];

describe('TrackingMovementTable', () => {
   test('shows the loading skeleton while loading', () => {
      renderComponent(<TrackingMovementTable isLoading details={details} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getAllByTestId('skeleton-item')).toHaveLength(3);
      expect(screen.queryByText('Área Y Responsable')).not.toBeInTheDocument();
   });

   test.each([[[]], [undefined]])('shows the empty message when details is %p', (value) => {
      renderComponent(<TrackingMovementTable isLoading={false} details={value} />);

      expect(screen.getByText('No se encontraron movimientos')).toBeInTheDocument();
   });

   test('lists every movement with its profile, person, arrival date and total time', () => {
      renderComponent(<TrackingMovementTable isLoading={false} details={details} />);
      const [first, second] = screen.getAllByTestId('tracking-timeline');

      expect(screen.getByText('Área Y Responsable')).toBeInTheDocument();
      expect(screen.getAllByTestId('tracking-timeline')).toHaveLength(3);
      expect(within(first).getByText('ESPECIALISTA')).toBeInTheDocument();
      expect(within(first).getByText('Ana Lopez')).toBeInTheDocument();
      expect(within(first).getByText('03/06/2025 08:46:12 AM')).toBeInTheDocument();
      expect(within(first).getByText('2 dias')).toBeInTheDocument();
      // Sin nombre, fecha ni tiempo total se muestran guiones.
      expect(within(second).getAllByText('-')).toHaveLength(3);
   });

   test('marks returned movements with the sync icon and the others with a check', () => {
      renderComponent(<TrackingMovementTable isLoading={false} details={details} />);
      const [first, second, third] = screen.getAllByTestId('tracking-timeline');

      expect(within(first).getByText('check')).toBeInTheDocument();
      expect(within(second).getByText('sync')).toBeInTheDocument();
      expect(within(third).getByText('check')).toBeInTheDocument();
   });

   test('lists the authorizing faculties instead of the person for FACULTADO profiles', () => {
      renderComponent(<TrackingMovementTable isLoading={false} details={details} />);
      const third = screen.getAllByTestId('tracking-timeline')[2];

      expect(within(third).getByText('Luis Perez')).toBeInTheDocument();
      expect(within(third).getByText('Marta Diaz')).toBeInTheDocument();
   });

   test('shows a dash when a FACULTADO movement has no faculties', () => {
      renderComponent(
         <TrackingMovementTable
            isLoading={false}
            details={[{ idTracking: 9, profile: 'FACULTADO', flagDevolution: false, authorizationFacultyResponse: [] }]}
         />
      );

      expect(within(screen.getByTestId('tracking-timeline')).getAllByText('-').length).toBeGreaterThan(0);
   });
});
