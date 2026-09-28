import { useState } from 'react';
import { screen } from '@testing-library/react';

import { Format } from '../../../components/Cover/Format';
import { renderComponent } from '../../utils/render';

const buildData = (personType = 'PM') => ({
   generalDataCifResponse: {
      personType,
      checkLessor: true,
      relationshipCredit: 'SI',
      typeExchange: '17.25',
      applicant: 'Empresa Alfa',
      idClient: 4455,
      address: 'Reforma 1',
      economicGroup: 'Grupo Alfa',
      antiquity: '10 años',
      city: 'CDMX',
      rfc: 'ALF010101AAA',
      branchOffice: 'Lomas',
      state: 'Ciudad de México',
      presentationDate: '01-03-2025',
      requestDate: '20-02-2025',
      analyst: 'Raúl Díaz',
      commercialAddress: 'Insurgentes 100',
   },
   infoFinancialResponse: {
      totalDirect: 100,
      totalIndirect: 0,
      lastAnnualDate: '31-12-2024',
      partialDate: '',
      bureauReportApplicantDate: '05-01-2025',
      bureauReportObligedDate: '',
      qualificationApplicant: 'A1',
      qualificationObliged: '',
      shareholding: [
         { id: 1, name: 'Socio Uno', rfc: 'SOC010101AAA', directParticipation: 100, indirectParticipation: null },
      ],
   },
   sectorInformationResponse: {
      codeBaseSector: 'S-10',
      targetMarket: 'SI',
      sector: 'Industria',
      subSector: 'Manufactura',
      specificActivity: 'Textil',
      strategicMarket: 'NO',
      specificDescriptionActivity: '',
   },
   resolutionLinesResponse: {
      previousLines: { linesActives: [{ lineNumber: 1, type: '' }] },
      requestLinesResponse: {},
      modelAuthorization: {},
   },
});

// El componente es controlado: notifica el objeto completo y el padre lo devuelve como data.
function Harness({ onSet, start, ...props }) {
   const [data, setData] = useState(start);
   const fnSet = (next) => {
      onSet(next);
      setData(next);
   };
   return <Format data={data} fnSet={fnSet} isLoading={false} {...props} />;
}

const setup = (start = buildData(), props = {}) => {
   const onSet = jest.fn();
   return { onSet, ...renderComponent(<Harness onSet={onSet} start={start} {...props} />) };
};

const last = (onSet) => onSet.mock.calls.at(-1)[0];

describe('Format', () => {
   test('shows the title and the general read only data', () => {
      setup();

      expect(
         screen.getByRole('heading', { name: 'Información para caratula de autorización de crédito' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('applicant')).toHaveValue('Empresa Alfa');
      expect(screen.getByTestId('idClient')).toHaveValue('4455');
      expect(screen.getByTestId('rfc')).toHaveValue('ALF010101AAA');
      expect(screen.getByTestId('state')).toHaveValue('Ciudad de México');
      expect(screen.getByTestId('typeExchange')).toHaveValue('17.25');
      expect(screen.getByTestId('analyst')).toHaveValue('Raúl Díaz');
      expect(screen.getByTestId('commercialAddress')).toHaveValue('Insurgentes 100');
      expect(screen.getByText('01-03-2025')).toBeInTheDocument();
   });

   test('shows the loading skeleton instead of the form while loading', () => {
      setup(buildData(), { isLoading: true });

      expect(screen.queryByTestId('relationshipCredit')).not.toBeInTheDocument();
      expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
   });

   test('checks the lessor flag from the data and always checks the bank flag', () => {
      setup();

      expect(screen.getByLabelText('Arrendadora BASE, SA de CV SOFOM ER')).toBeChecked();
      // checkBase usa `|| true`, por lo que siempre queda marcado.
      expect(screen.getByLabelText('Banco BASE, SA, IBM')).toBeChecked();
   });

   test('reports the related credit selection inside its section', async () => {
      const { onSet, user } = setup();

      await user.selectOptions(screen.getByTestId('relationshipCredit'), 'NO');

      expect(last(onSet).generalDataCifResponse.relationshipCredit).toBe('NO');
      expect(last(onSet).generalDataCifResponse.applicant).toBe('Empresa Alfa');
      expect(screen.getByTestId('relationshipCredit')).toHaveValue('NO');
   });

   test('falls back to N/A for the missing partial and obligor values', () => {
      setup();

      expect(screen.getByTestId('partialDate')).toHaveValue('N/A');
      expect(screen.getAllByText('N/A')).toHaveLength(2);
      expect(screen.getByTestId('lastAnnualDate')).toHaveValue('31-12-2024');
      expect(screen.getByText('A1')).toBeInTheDocument();
   });

   test('shows the editable shareholding for legal entities', () => {
      setup(buildData('PM'));

      expect(screen.getByDisplayValue('Socio Uno')).toBeInTheDocument();
   });

   test('replaces the shareholding with the empty version for a natural person with business activity', () => {
      setup(buildData('PFAE'));

      expect(screen.queryByDisplayValue('Socio Uno')).not.toBeInTheDocument();
      expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(4);
   });

   test('stores the shareholding edits as the whole financial info', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByDisplayValue('Socio Uno'), '!');

      expect(last(onSet).infoFinancialResponse.shareholding[0].name).toBe('Socio Uno!');
      expect(last(onSet).infoFinancialResponse.lastAnnualDate).toBe('31-12-2024');
   });

   test('shows the sector information as read only text', () => {
      setup();

      expect(screen.getByTestId('codeBaseSector')).toHaveValue('S-10');
      expect(screen.getByTestId('sector')).toHaveValue('Industria');
      expect(screen.getByTestId('subSector')).toHaveValue('Manufactura');
      expect(screen.getByTestId('specificActivity')).toHaveValue('Textil');
   });

   test('toggles the target and strategic markets independently', async () => {
      const { onSet, user } = setup();
      const [targetToggle, strategicToggle] = screen.getAllByRole('button', { name: 'arrow_back_ios' });

      await user.click(targetToggle);
      expect(last(onSet).sectorInformationResponse).toMatchObject({ targetMarket: 'NO', strategicMarket: 'NO' });

      await user.click(strategicToggle);
      expect(last(onSet).sectorInformationResponse).toMatchObject({ targetMarket: 'NO', strategicMarket: 'SI' });
   });

   test('reports the activity description', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('specificDescriptionActivity'), 'Confección');

      expect(last(onSet).sectorInformationResponse.specificDescriptionActivity).toBe('Confección');
   });

   test('stores the active lines edits as the whole resolution lines', async () => {
      const { onSet, user } = setup();

      await user.selectOptions(screen.getByTestId('type-0'), 'ACS');

      expect(last(onSet).resolutionLinesResponse.previousLines.linesActives[0].type).toBe('ACS');
      expect(last(onSet).generalDataCifResponse.applicant).toBe('Empresa Alfa');
   });
});
