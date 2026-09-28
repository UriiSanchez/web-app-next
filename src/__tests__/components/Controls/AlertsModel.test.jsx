import { screen } from '@testing-library/react';

import { AlertsModel } from '../../../components/Controls/AlertsModel';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const renderAlerts = (alerts) => {
   const actions = createActions();
   const wrapper = createContextWrapper({ general: { alertsModel: { show: true, alerts } }, actions });
   return { actions, ...renderComponent(<AlertsModel />, { wrapper }) };
};

describe('AlertsModel', () => {
   test('lists every alert description from the context', () => {
      renderAlerts([
         { id: 1, descripcion: 'Primera alerta' },
         { id: 2, descripcion: 'Segunda alerta' },
      ]);

      expect(screen.getByRole('heading', { name: 'Alertas' })).toBeInTheDocument();
      expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
         'Primera alerta.',
         'Segunda alerta.',
      ]);
   });

   test('renders an empty list when there are no alerts', () => {
      renderAlerts([]);

      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
   });

   test('closing resets the alertsModel configuration', async () => {
      const { user, actions } = renderAlerts([{ id: 1, descripcion: 'Alerta' }]);

      await user.click(screen.getByRole('button', { name: 'Cerrar' }));

      expect(actions.setConfig).toHaveBeenCalledWith({ alertsModel: { show: false, alerts: [] } });
   });
});
