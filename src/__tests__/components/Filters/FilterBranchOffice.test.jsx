import { screen } from '@testing-library/react';

import { FilterBranchOffice } from '../../../components/Filters/FilterBranchOffice';
import { renderComponent } from '../../utils/render';

const renderFilter = (data = [], onSet = jest.fn()) => ({
   onSet,
   ...renderComponent(<FilterBranchOffice data={data} onSet={onSet} />),
});

const openList = (user) => user.click(screen.getByRole('button', { name: /Sucursal/ }));

describe('FilterBranchOffice', () => {
   test('keeps the branches hidden until the button is clicked', async () => {
      const { user } = renderFilter();
      expect(screen.queryByLabelText('Guadalajara')).not.toBeInTheDocument();

      await openList(user);

      expect(screen.getByLabelText('Ciudad de México')).toBeInTheDocument();
      expect(screen.getByLabelText('Guadalajara')).toBeInTheDocument();
   });

   test('groups the branches by region', async () => {
      const { user } = renderFilter();
      await openList(user);

      ['Bajío', 'Foráneas', 'Norte'].forEach((region) => expect(screen.getByText(region)).toBeInTheDocument());
      ['San Luis Potosí', 'Aguascalientes', 'Querétaro', 'León', 'Tijuana', 'Chihuahua', 'Torreón', 'Cancún', 'Valle Oriente']
         .forEach((branch) => expect(screen.getByLabelText(branch)).toBeInTheDocument());
   });

   test('marks the branches included in data', async () => {
      const { user } = renderFilter(['LOMAS', 'TIJUANA']);
      await openList(user);

      expect(screen.getByLabelText('Ciudad de México')).toBeChecked();
      expect(screen.getByLabelText('Tijuana')).toBeChecked();
      expect(screen.getByLabelText('Guadalajara')).not.toBeChecked();
   });

   test('adds a checked branch using its backend value', async () => {
      const { user, onSet } = renderFilter(['LOMAS']);
      await openList(user);

      await user.click(screen.getByLabelText('San Luis Potosí'));

      expect(onSet).toHaveBeenCalledWith('byBranches', ['LOMAS', 'SAN LUIS POTOSI']);
   });

   test('removes an unchecked branch', async () => {
      const { user, onSet } = renderFilter(['LOMAS', 'LEON']);
      await openList(user);

      await user.click(screen.getByLabelText('León'));

      expect(onSet).toHaveBeenCalledWith('byBranches', ['LOMAS']);
   });

   test('closes the list when clicking outside', async () => {
      const { user } = renderFilter();
      await openList(user);

      await user.click(document.body);

      expect(screen.queryByLabelText('Guadalajara')).not.toBeInTheDocument();
   });
});
