import { screen } from '@testing-library/react';

import PeriodView from '../../../../pages/Shared/components/PeriodView';
import { renderComponent } from '../../../utils/render';

const annualProps = {
   id: 'p1',
   month: 'diciembre',
   periodType: 'ANNUAL',
   sourceInformation: 'SAT',
   officeOrAccountant: 'Despacho ABC',
   year: 2024,
};
const partialProps = { id: 'p2', month: 'marzo', monthIncludes: 3, periodType: 'PARTIAL', sourceInformation: 'Interno', year: 2025 };

const renderPeriod = (props) => {
   const onSourceChange = jest.fn();
   const onOfficeChange = jest.fn();
   return {
      onSourceChange,
      onOfficeChange,
      ...renderComponent(<PeriodView onSourceChange={onSourceChange} onOfficeChange={onOfficeChange} {...props} />),
   };
};

describe('PeriodView', () => {
   describe('annual period', () => {
      test('shows the heading, the capitalized month and the year in separate cells', () => {
         renderPeriod(annualProps);

         expect(screen.getByRole('heading', { name: 'Anual' })).toBeInTheDocument();
         expect(screen.getByText('Diciembre')).toBeInTheDocument();
         expect(screen.getByText('2024')).toBeInTheDocument();
      });

      test('shows the source of information in a select with its options', () => {
         renderPeriod(annualProps);
         const select = screen.getByLabelText('Fuente de información');

         expect(select).toHaveValue('SAT');
         expect(select).toBeEnabled();
         expect([...select.options].map((option) => option.textContent)).toEqual([
            'Seleccionar',
            'Dictamen fiscal',
            'Dictamen contable',
            'SAT',
            'Interno',
         ]);
      });

      test('shows the office in an editable input', () => {
         renderPeriod(annualProps);

         expect(screen.getByLabelText('Despacho, contador o interno')).toHaveValue('Despacho ABC');
         expect(screen.getByLabelText('Despacho, contador o interno')).toBeEnabled();
      });

      test('uses the id as prefix of the id and name of the inputs', () => {
         renderPeriod(annualProps);

         expect(screen.getByLabelText('Fuente de información')).toHaveAttribute('id', 'p1-sourceOfInformation');
         expect(screen.getByLabelText('Fuente de información')).toHaveAttribute('name', 'p1-sourceOfInformation');
         expect(screen.getByLabelText('Despacho, contador o interno')).toHaveAttribute('id', 'p1-office');
         expect(screen.getByLabelText('Despacho, contador o interno')).toHaveAttribute('name', 'p1-office');
      });

      test('reports the selected source of information', async () => {
         const { onSourceChange, onOfficeChange, user } = renderPeriod(annualProps);

         await user.selectOptions(screen.getByLabelText('Fuente de información'), 'Dictamen fiscal');

         expect(onSourceChange).toHaveBeenCalledWith('Dictamen fiscal');
         expect(onOfficeChange).not.toHaveBeenCalled();
      });

      test('reports the typed office', async () => {
         const { onSourceChange, onOfficeChange, user } = renderPeriod(annualProps);

         await user.type(screen.getByLabelText('Despacho, contador o interno'), '!');

         expect(onOfficeChange).toHaveBeenCalledWith('Despacho ABC!');
         expect(onSourceChange).not.toHaveBeenCalled();
      });

      test('shows the source as text and disables the office when disabled', () => {
         renderPeriod({ ...annualProps, disabled: true });

         expect(screen.queryByLabelText('Fuente de información')).not.toBeInTheDocument();
         expect(screen.getByText('SAT')).toBeInTheDocument();
         expect(screen.getByLabelText('Despacho, contador o interno')).toBeDisabled();
      });
   });

   describe('partial period', () => {
      test('shows the heading, the month with its year and the included months', () => {
         renderPeriod(partialProps);

         expect(screen.getByRole('heading', { name: 'Parcial' })).toBeInTheDocument();
         expect(screen.getByText('Marzo 2025')).toBeInTheDocument();
         expect(screen.getByText('Meses incluidos')).toBeInTheDocument();
         expect(screen.getByText('3')).toBeInTheDocument();
      });

      test('shows the source as text without editable controls', () => {
         renderPeriod(partialProps);

         expect(screen.getByText('Interno')).toBeInTheDocument();
         expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });

      test('does not show the office field', () => {
         renderPeriod(partialProps);

         expect(screen.queryByText('Despacho, contador o interno')).not.toBeInTheDocument();
      });
   });

   test('renders an empty date when the month is missing', () => {
      renderPeriod({ ...annualProps, month: undefined });

      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.queryByText('Diciembre')).not.toBeInTheDocument();
   });
});
