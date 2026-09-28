import { screen } from '@testing-library/react';

import { SolidaryView } from '../../../../components/Solidary/Form/SolidaryView';
import { renderComponent } from '../../../utils/render';

const request = {
   idRequest: 7,
   kindProcedure: 'Incremento',
   requestAmount: 2500000,
   relatedPersonResponseList: [
      { idCatTypePerson: 1, idClient: 1, fullName: 'Empresa Alfa' },
      { idCatTypePerson: 2, idClient: 2, fullName: 'Carlos Vega', maritalStatus: 'Casado', mail: 'carlos@correo.com' },
      { idCatTypePerson: 2, idClient: 3, fullName: 'Diana Solís' },
      { idCatTypePerson: 3, idClient: 4, fullName: 'Representante Legal' },
   ],
};

describe('SolidaryView', () => {
   test('shows the applicant, the procedure and the formatted requested amount', async () => {
      renderComponent(<SolidaryView request={request} isNotEditable />);

      expect(screen.getByRole('heading', { name: 'Empresa Alfa' })).toHaveAttribute('title', 'Empresa Alfa');
      expect(screen.getByText('Tipo de trámite')).toBeInTheDocument();
      expect(screen.getByText('Incremento')).toBeInTheDocument();
      expect(screen.getByText('Monto de línea solicitado')).toBeInTheDocument();
      expect(screen.getByText('$2,500,000')).toBeInTheDocument();
      await screen.findByText('Obligado Solidario 01');
   });

   test('lists only the solidary obligors, numbered', async () => {
      renderComponent(<SolidaryView request={request} isNotEditable />);

      // Los detalles del obligado se cargan de forma dinámica.
      expect(await screen.findByText('Obligado Solidario 01')).toBeInTheDocument();
      expect(screen.getByText('Obligado Solidario 02')).toBeInTheDocument();
      expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
      expect(screen.getByText('carlos@correo.com')).toBeInTheDocument();
      expect(screen.getByText('Diana Solís')).toBeInTheDocument();
      expect(screen.queryByText('Representante Legal')).not.toBeInTheDocument();
   });

   test('shows no obligors section when the request has none', () => {
      const withoutObligors = { ...request, relatedPersonResponseList: [request.relatedPersonResponseList[0]] };
      renderComponent(<SolidaryView request={withoutObligors} isNotEditable />);

      expect(screen.queryByText(/Obligado Solidario/)).not.toBeInTheDocument();
   });

   test('shows zero and an empty procedure when the request has no amount', async () => {
      const incomplete = { ...request, kindProcedure: undefined, requestAmount: undefined };
      renderComponent(<SolidaryView request={incomplete} isNotEditable />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText('Incremento')).not.toBeInTheDocument();
      await screen.findByText('Obligado Solidario 01');
   });
});
