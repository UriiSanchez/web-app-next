import { screen } from '@testing-library/react';

import { SideCover } from '../../../components/Cover/SideCover';
import { renderComponent } from '../../utils/render';

const data = [
   { idRequest: 1, coverComplete: true, generalDataCifResponse: { applicant: 'Ana Pérez' } },
   { idRequest: 2, coverComplete: false, generalDataCifResponse: { applicant: 'Luis Gómez' } },
];

const setup = (props = {}) => {
   const onFunc = jest.fn();
   return { onFunc, ...renderComponent(<SideCover data={data} onFunc={onFunc} {...props} />) };
};

const openMenu = (user) => user.click(screen.getByRole('button'));

describe('SideCover', () => {
   test('keeps the applicants hidden until the menu button is clicked', async () => {
      const { user } = setup();
      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();

      await openMenu(user);

      expect(screen.getAllByTestId('applicant').map((p) => p.textContent)).toEqual(['Ana Pérez', 'Luis Gómez']);
   });

   test('marks the applicants with a complete cover', async () => {
      const { user } = setup();

      await openMenu(user);

      expect(screen.getByText('check_circle')).toHaveClass('text-yellow-500');
      expect(screen.getByText('done')).not.toHaveClass('text-yellow-500');
   });

   test('selects an applicant, reports its request and closes the menu', async () => {
      const { onFunc, user } = setup();
      await openMenu(user);

      await user.click(screen.getByText('Luis Gómez'));

      expect(onFunc).toHaveBeenCalledWith(2);
      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
   });

   test('only closes the menu when there is a single applicant', async () => {
      const { onFunc, user } = setup({ data: [data[0]] });
      await openMenu(user);

      await user.click(screen.getByText('Ana Pérez'));

      expect(onFunc).not.toHaveBeenCalled();
      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
   });

   test('closes the menu when clicking the backdrop', async () => {
      const { user, container } = setup();
      await openMenu(user);

      // El fondo desenfocado es un div sin rol ni texto; se ubica por su clase.
      await user.click(document.querySelector('.backdrop-blur-sm'));

      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
      expect(container).toBeInTheDocument();
   });

   test('blocks the page scroll only while the menu is open', async () => {
      const { user } = setup();
      expect(document.documentElement).not.toHaveClass('overflow-hidden');

      await openMenu(user);
      expect(document.documentElement).toHaveClass('overflow-hidden');

      await user.click(document.querySelector('.backdrop-blur-sm'));
      expect(document.documentElement).not.toHaveClass('overflow-hidden');
   });

   test('renders an empty menu when there are no applicants', async () => {
      const { user } = setup({ data: undefined });

      await openMenu(user);

      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
   });
});
