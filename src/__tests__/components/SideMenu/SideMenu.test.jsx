import { screen } from '@testing-library/react';

import { SideMenu } from '../../../components/SideMenu';
import { renderComponent } from '../../utils/render';

const data = [
   {
      idRequest: 10,
      applicant: {
         idClient: 1,
         fullName: 'Ana Solicitante',
         participantType: 'Solicitante',
         docs: ['INE', 'Comprobante'],
      },
      obligated: [{ idClient: 2, fullName: 'Beto Obligado', participantType: 'Obligado', docs: ['Acta'] }],
   },
];

const renderMenu = (props = {}) => renderComponent(<SideMenu data={data} onFunc={jest.fn()} idActive={1} {...props} />);
const openMenu = (user) => user.click(screen.getByRole('button', { name: 'Icono menú' }));

describe('SideMenu', () => {
   test('keeps the list hidden until the menu button is clicked', async () => {
      const { user } = renderMenu();
      expect(screen.queryByText('Ana Solicitante')).not.toBeInTheDocument();

      await openMenu(user);

      expect(screen.getByText('Ana Solicitante')).toBeInTheDocument();
      expect(screen.getByText('Beto Obligado')).toBeInTheDocument();
   });

   // El fondo de cierre no tiene rol ni texto: se localiza por su clase.
   test('locks page scroll while open and releases it on close', async () => {
      const { user } = renderMenu();
      await openMenu(user);
      expect(document.documentElement).toHaveClass('overflow-hidden');

      await user.click(document.querySelector('.backdrop-blur-sm'));

      expect(document.documentElement).not.toHaveClass('overflow-hidden');
      expect(screen.queryByText('Ana Solicitante')).not.toBeInTheDocument();
   });

   test('shows the check icon only for the active applicant', async () => {
      const { user } = renderMenu({ idActive: 1 });
      await openMenu(user);

      expect(screen.getByText('check_circle')).toBeInTheDocument();
      expect(screen.queryByText('done')).not.toBeInTheDocument();
   });

   test('shows the plain icon when the applicant is not active', async () => {
      const { user } = renderMenu({ idActive: 99 });
      await openMenu(user);

      expect(screen.getByText('done')).toBeInTheDocument();
      expect(screen.queryByText('check_circle')).not.toBeInTheDocument();
   });

   test('selecting an applicant reports the request and the person, then closes', async () => {
      const onFunc = jest.fn();
      const { user } = renderMenu({ onFunc });
      await openMenu(user);

      await user.click(screen.getByText('Ana Solicitante'));

      expect(onFunc).toHaveBeenCalledWith({ idRequest: 10 }, data[0].applicant);
      expect(screen.queryByText('Ana Solicitante')).not.toBeInTheDocument();
   });

   test('selecting an obligated person reports it with the request', async () => {
      const onFunc = jest.fn();
      const { user } = renderMenu({ onFunc });
      await openMenu(user);

      await user.click(screen.getByText('Beto Obligado'));

      expect(onFunc).toHaveBeenCalledWith({ idRequest: 10 }, data[0].obligated[0]);
   });

   test('expands and collapses the documents of a person', async () => {
      const { user } = renderMenu();
      await openMenu(user);
      expect(screen.queryByText('INE')).not.toBeInTheDocument();

      await user.click(screen.getAllByText('expand_less')[0].closest('button'));
      expect(screen.getByText('INE')).toBeInTheDocument();
      expect(screen.getByText('Comprobante')).toBeInTheDocument();

      await user.click(screen.getByText('expand_more').closest('button'));
      expect(screen.queryByText('INE')).not.toBeInTheDocument();
   });

   test('expanding documents does not select the person', async () => {
      const onFunc = jest.fn();
      const { user } = renderMenu({ onFunc });
      await openMenu(user);

      await user.click(screen.getAllByText('expand_less')[0].closest('button'));

      expect(onFunc).not.toHaveBeenCalled();
      expect(screen.getByText('Ana Solicitante')).toBeInTheDocument();
   });

   test('renders no people when data is empty', async () => {
      const { user } = renderMenu({ data: [] });
      await openMenu(user);

      expect(screen.queryByText('done')).not.toBeInTheDocument();
      expect(document.querySelector('.container-overflow')).toBeEmptyDOMElement();
   });

   test('renders applicants without obligated or docs', async () => {
      const simple = [{ idRequest: 5, applicant: { idClient: 7, fullName: 'Solo Uno', participantType: 'Solicitante' } }];
      const { user } = renderMenu({ data: simple });
      await openMenu(user);

      expect(screen.getByText('Solo Uno')).toBeInTheDocument();
      expect(screen.queryByText('expand_less')).not.toBeInTheDocument();
   });
});
