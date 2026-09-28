import { fireEvent } from '@testing-library/react';

import { ApplicantItem } from '../../../../components/Requests/ValidateRequest/ApplicantItem';

jest.mock('../../../../helpers', () => ({ formatId: jest.fn((id) => `ID-${id}`) }));

describe('ApplicantItem', () => {
   const defaultProps = {
      idRequest: 123,
      fullName: 'John Doe',
      listObligated: [
         { idClient: 1, fullName: 'Obligated user 1' },
         { idClient: 2, fullName: 'Obligated user 2' },
      ],
      onVirtual: jest.fn(),
   };

   afterEach(() => {
      jest.clearAllMocks();
   });

   test('it should must render the applicant and request information', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ApplicantItem, defaultProps);

      expect(getByText(`Solicitud ID-${defaultProps.idRequest}`)).toBeInTheDocument();
      expect(getByText(defaultProps.fullName)).toBeInTheDocument();
      expect(getByText('Obligados solidarios')).toBeInTheDocument();
   });

   test('it should must render the list of jointly liable parties', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ApplicantItem, defaultProps);

      defaultProps.listObligated.forEach((obligated) => {
         expect(getByText(obligated.fullName)).toBeInTheDocument();
      });
   });

   test('it must render correctly when there are no jointly and severally liable parties.', async () => {
      const {
         queries: { getByText, queryByText },
      } = await renderPage(ApplicantItem, { ...defaultProps, listObligated: [] });
      expect(getByText('Obligados solidarios')).toBeInTheDocument();
      expect(queryByText('Obligated user 1')).not.toBeInTheDocument();
   });

   test('it should must call onVirtual with the request ID and the value of the textarea when changing', async () => {
      const {
         queries: { getByPlaceholderText },
      } = await renderPage(ApplicantItem, defaultProps);

      const textarea = getByPlaceholderText('Ingresa aquí los comentarios');
      const testComment = 'Este es un comentario de prueba.';

      fireEvent.change(textarea, { target: { value: testComment } });
      expect(defaultProps.onVirtual).toHaveBeenCalledTimes(1);
      expect(defaultProps.onVirtual).toHaveBeenCalledWith(defaultProps.idRequest, testComment);
   });
});
