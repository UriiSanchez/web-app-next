import { screen } from '@testing-library/react';

import { DetailsGroup } from '../../../components/History/DetailsGroup';
import { renderComponent } from '../../utils/render';

const EMG = 3;
const ADC = 1;

const info = {
   groupName: 'Grupo Alfa',
   nameEmg: 'Elena Torres',
   arrivedMrDate: '2024-01-15T13:30:00',
   kindProcedure: 'Línea nueva',
   branchOffice: 'Lomas',
   status: 'Aprobada',
   nameAnalyst: 'Raúl Díaz',
   isGroup: false,
};

// Cada campo es un <p> con la etiqueta seguido de otro <p> con el valor.
const valueOf = (label) => screen.getByText(label).nextElementSibling.textContent;

describe('DetailsGroup', () => {
   test('shows every field of the initial template with its value', () => {
      renderComponent(<DetailsGroup info={info} idProfile={EMG} />);

      expect(valueOf('Solicitante o grupo económico')).toBe('Grupo Alfa');
      expect(valueOf('Especialista responsable')).toBe('Elena Torres');
      expect(valueOf('Tipo de trámite')).toBe('Línea nueva');
      expect(valueOf('Sucursal del especialista')).toBe('Lomas');
      expect(valueOf('Estatus')).toBe('Aprobada');
      expect(valueOf('Analista responsable')).toBe('Raúl Díaz');
   });

   test('formats date fields and shows a dash when they are missing', () => {
      renderComponent(<DetailsGroup info={info} idProfile={EMG} />);

      expect(valueOf('Fecha de inicio')).toBe('15/01/2024 13:30:00 PM');
      expect(valueOf('Entrega a secretariado')).toBe('-');
      expect(valueOf('Última fecha en la que se corrió el modelo')).toBe('-');
   });

   test('hides the procedure type for a group request', () => {
      renderComponent(<DetailsGroup info={{ ...info, isGroup: true }} idProfile={EMG} />);

      expect(valueOf('Tipo de trámite')).toBe('-');
   });

   test('renames the last model run label for analyst and leader profiles', () => {
      renderComponent(<DetailsGroup info={info} idProfile={ADC} />);

      expect(screen.getByText('Último análisis de la solicitud')).toBeInTheDocument();
      expect(screen.queryByText('Última fecha en la que se corrió el modelo')).not.toBeInTheDocument();
   });

   test('finds values nested inside the info object', () => {
      const { branchOffice, ...withoutBranch } = info;
      renderComponent(<DetailsGroup info={{ ...withoutBranch, detail: { branchOffice } }} idProfile={EMG} />);

      expect(valueOf('Sucursal del especialista')).toBe('Lomas');
   });
});
