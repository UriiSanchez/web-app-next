import { HeaderTitle } from '../../../components/Controls';

describe('HeaderTitle component', () => {
   const buttons = [
      { id: 'btn1', isVisible: true, isDisabled: false, toAction: jest.fn(), label: 'button 1' },
      { id: 'btn2', isVisible: true, isDisabled: false, toAction: jest.fn(), label: 'button 2' },
   ];
   const request = {};

   test('it display the correct amount of buttons', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(HeaderTitle, { title: 'Test title', buttons, request });

      expect(getByRole('button', { name: 'button 1' })).toBeVisible();
      expect(getByRole('button', { name: 'button 2' })).toBeVisible();
   });

   test('it should call the correct function when a button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(HeaderTitle, { title: 'Test title', buttons, request });

      await user.click(getByRole('button', { name: 'button 2' }));

      expect(buttons[1].toAction).toHaveBeenCalled();
   });
});
