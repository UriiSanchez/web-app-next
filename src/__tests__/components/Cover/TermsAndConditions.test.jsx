import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { TermsAndConditions } from '../../../components/Cover/TermsAndConditions';
import { renderComponent } from '../../utils/render';

const initialData = {
   resolutionLinesResponse: { modelAuthorization: { amountEm: 1250000 } },
   termsAndConditionsResponse: {
      presentationDate: '15-03-2025',
      company: 'Empresa Alfa',
      lineNumber: 'L-90',
      creditType: 'Simple',
      destination: 'Capital de trabajo',
      municipality: 'Miguel Hidalgo',
      state: 'CDMX',
      lineTerm: '12 meses',
      contractTerm: '24 meses',
      resources: 'Propios',
      provision: 'Única',
      principalPayment: 'Al vencimiento',
      interestPayment: 'Mensual',
      solidaryObliged: 'Luis Gómez',
      warranty: 'Hipotecaria',
      precedentCondition: '',
      followingCondition: '',
      contractCondition: '',
      operatingCondition: '',
      cumulativeAmount: 0,
      coverageIndex: 50,
      notional: '',
   },
};

// El componente es controlado: notifica el objeto completo y el padre lo devuelve como data.
function Harness({ onSet, isLoading = false }) {
   const [data, setData] = useState(initialData);
   const fnSet = (next) => {
      onSet(next);
      setData(next);
   };
   return <TermsAndConditions data={data} fnSet={fnSet} isLoading={isLoading} />;
}

const setup = (props) => {
   const onSet = jest.fn();
   return { onSet, ...renderComponent(<Harness onSet={onSet} {...props} />) };
};

const lastTerms = (onSet) => onSet.mock.calls.at(-1)[0].termsAndConditionsResponse;

describe('TermsAndConditions', () => {
   test('shows the title and the read only terms of the credit', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Sumario de términos y condiciones' })).toBeInTheDocument();
      expect(screen.getByLabelText('Empresa')).toHaveValue('Empresa Alfa');
      expect(screen.getByTestId('presentationDate')).toHaveValue('15-03-2025');
      expect(screen.getByLabelText('Número de línea')).toHaveValue('L-90');
      expect(screen.getByLabelText('Tipo de Crédito')).toHaveValue('Simple');
      expect(screen.getByLabelText('Destino')).toHaveValue('Capital de trabajo');
      expect(screen.getByLabelText(/Municipio/)).toHaveValue('Miguel Hidalgo');
      expect(screen.getByLabelText('Estado')).toHaveValue('CDMX');
      expect(screen.getByLabelText('Plazo de Línea')).toHaveValue('12 meses');
      expect(screen.getByLabelText('Pago de Intereses')).toHaveValue('Mensual');
   });

   test('keeps the informative fields disabled and the captured fields enabled', () => {
      setup();

      ['company', 'lineNumber', 'creditType', 'amountAuth', 'destination', 'resources'].forEach((id) =>
         expect(screen.getByTestId(id)).toBeDisabled()
      );
      ['solidaryObliged', 'warranty', 'precedentCondition', 'operatingCondition', 'notional'].forEach((id) =>
         expect(screen.getByTestId(id)).toBeEnabled()
      );
   });

   test('shows the authorized amount from the resolution lines in MXN', () => {
      setup();

      expect(screen.getByTestId('amountAuth')).toHaveValue('1,250,000 MXN');
   });

   test('shows zero as authorized amount when there is no resolution', () => {
      renderComponent(<TermsAndConditions data={{}} fnSet={jest.fn()} />);

      expect(screen.getByTestId('amountAuth')).toHaveValue('0 MXN');
   });

   test('shows the loading skeleton instead of the form while loading', () => {
      setup({ isLoading: true });

      expect(screen.queryByTestId('company')).not.toBeInTheDocument();
      expect(screen.queryByTestId('warranty')).not.toBeInTheDocument();
   });

   test.each([
      ['solidaryObliged', 'Ana Pérez'],
      ['warranty', 'Prendaria'],
      ['followingCondition', 'Informe trimestral'],
      ['contractCondition', 'Sin cláusulas'],
   ])('reports the typed %s', async (field, text) => {
      const { onSet, user } = setup();
      const input = screen.getByTestId(field);
      await user.clear(input);

      await user.type(input, text);

      expect(lastTerms(onSet)[field]).toBe(text);
      expect(input).toHaveValue(text);
   });

   test('reports the multiline conditions from the textareas', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('precedentCondition'), 'Firma del contrato');
      await user.type(screen.getByTestId('operatingCondition'), 'Operar en cuenta');

      expect(lastTerms(onSet)).toMatchObject({
         precedentCondition: 'Firma del contrato',
         operatingCondition: 'Operar en cuenta',
      });
   });

   test('keeps the rest of the data when a field changes', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('warranty'), '!');

      const sent = onSet.mock.calls.at(-1)[0];
      expect(sent.resolutionLinesResponse).toEqual(initialData.resolutionLinesResponse);
      expect(sent.termsAndConditionsResponse.company).toBe('Empresa Alfa');
   });

   test('stores numeric amounts as numbers without separators', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('cumulativeAmount'), '1500');
      await user.type(screen.getByTestId('notional'), '20');

      expect(lastTerms(onSet).cumulativeAmount).toBe(1500);
      expect(lastTerms(onSet).notional).toBe(20);
      expect(screen.getByTestId('cumulativeAmount')).toHaveValue('1,500');
   });

   test('stores a cleared numeric amount as zero', async () => {
      const { onSet, user } = setup();

      await user.clear(screen.getByTestId('coverageIndex'));

      expect(lastTerms(onSet).coverageIndex).toBe(0);
   });

   test('accepts coverage indexes up to 100 and rejects greater ones', () => {
      const { onSet } = setup();
      const input = screen.getByTestId('coverageIndex');

      fireEvent.change(input, { target: { value: '80' } });
      expect(lastTerms(onSet).coverageIndex).toBe(80);

      fireEvent.change(input, { target: { value: '150' } });
      expect(lastTerms(onSet).coverageIndex).toBe(80);
      expect(input).toHaveValue('80');
   });
});
