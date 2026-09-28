import { screen } from '@testing-library/react';

import { CustomSelect } from '../../../components/Controls/CustomSelect';
import { renderComponent } from '../../utils/render';

const list = [
   { userAD: 'ana', fullName: 'Ana Lopez' },
   { userAD: 'luis', fullName: 'Luis Perez' },
];

describe('CustomSelect', () => {
   test('shows the name of the selected leader', () => {
      renderComponent(<CustomSelect list={list} idLeader='luis' onSelectChange={jest.fn()} />);

      expect(screen.getByText('Luis Perez')).toBeInTheDocument();
      expect(screen.queryByTestId('option-ana')).not.toBeInTheDocument();
   });

   test('shows "Sin asignar" when nobody is selected or the list is missing', () => {
      const { rerender } = renderComponent(<CustomSelect list={list} idLeader='' onSelectChange={jest.fn()} />);
      expect(screen.getByText('Sin asignar')).toBeInTheDocument();

      rerender(<CustomSelect onSelectChange={jest.fn()} />);
      expect(screen.getByText('Sin asignar')).toBeInTheDocument();
   });

   test('opens the options, marks the selected one and reports the chosen userAD', async () => {
      const onSelectChange = jest.fn();
      const { user } = renderComponent(<CustomSelect list={list} idLeader='luis' onSelectChange={onSelectChange} />);

      await user.click(screen.getByText('Luis Perez'));
      expect(screen.getByTestId('option-luis')).toHaveTextContent('check');
      expect(screen.getByTestId('option-ana')).not.toHaveTextContent('check');

      await user.click(screen.getByTestId('option-ana'));

      expect(onSelectChange).toHaveBeenCalledWith('ana');
      expect(screen.queryByTestId('option-ana')).not.toBeInTheDocument();
   });

   test('closes when clicking outside', async () => {
      const { user } = renderComponent(<CustomSelect list={list} idLeader='' onSelectChange={jest.fn()} />);
      await user.click(screen.getByText('Sin asignar'));
      expect(screen.getByTestId('option-ana')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByTestId('option-ana')).not.toBeInTheDocument();
   });
});
