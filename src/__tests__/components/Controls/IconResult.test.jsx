import { IconResult } from '../../../components/Controls';

jest.mock('next/image', () => (props) => <img {...props} />);

describe('IconResult component', () => {
   test('displays a slash when result is null', async () => {
      const {
         queries: { getByText },
      } = await renderPage(IconResult);

      expect(getByText('-')).toBeInTheDocument();
   });

   test('displays the “like” icon when result is true', async () => {
      const {
         queries: { getByAltText },
      } = await renderPage(IconResult, { result: true, alt: 'like icon' });
      const img = getByAltText('like icon');

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', "/icons/ico_like.svg");
   });

   test('displays the “dislike” icon when result is false', async () => {
      const {
         queries: { getByAltText },
      } = await renderPage(IconResult, { result: false, alt: 'dislike icon' });
      const img = getByAltText('dislike icon');

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', "/icons/ico_dislike.svg");
   });

   test("use the correct class and size in the icon", async () =>{
      const {
         queries: { getByAltText },
      } = await renderPage(IconResult, { result: true, alt: 'verifica estilos' });
      const img = getByAltText('verifica estilos');

      expect(img).toHaveClass("w-auto h-4");
      expect(img).toHaveAttribute('width', '100');
      expect(img).toHaveAttribute('height', '100');
   } )
});
