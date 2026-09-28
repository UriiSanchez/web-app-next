export const initConstants = {
   steps: [
      {
         step: 1,
         title: 'Solicitante(s)',
      },
      {
         step: 2,
         title: 'Obligado(s) Solidario(s)',
      },
      {
         step: 3,
         title: 'Resumen general',
      },
      {
         step: 4,
         title: 'Verificación de propiedad',
      },
   ],
   title: {
      1: 'Inmuebles de Solicitante',
      2: 'Inmuebles de Obligado Solidario',
      3: 'Resumen general de inmuebles',
      4: 'Verificación de sociedad',
   },
};

export const initGeneralSummary = {
   inmueblesApplicant: {
      verify: {
         valor: 0,
         numero: 0,
      },
      pending: {
         valor: 0,
         numero: 0,
      },
   },
   inmueblesObligated: {
      verify: {
         valor: 0,
         numero: 0,
      },
      pending: {
         valor: 0,
         numero: 0,
      },
   },
   copropiedadWithOS: {
      valor: 0,
      numero: 0,
   },
   copropiedadOthers: {
      valor: 0,
      numero: 0,
   },
   embargados: {
      valor: 0,
      numero: 0,
   },
   escrituracion: {
      valor: 0,
      numero: 0,
   },
   gravados: {
      valor: 0,
      numero: 0,
   },
   libres: {
      valor: 0,
      numero: 0,
   },
   pendientes: {
      verify: {
         valor: 0,
         numero: 0,
      },
      pending: {
         valor: 0,
         numero: 0,
      },
   },
};

export const initSummaryIndiviual = {
   libres: {
      valor: 0,
      numero: 0,
   },
   gravados: {
      valor: 0,
      numero: 0,
   },
   inmuebles: {
      valor: 0,
      numero: 0,
   },
   embargados: {
      valor: 0,
      numero: 0,
   },
   pendientes: {
      valor: 0,
      numero: 0,
   },
   escrituracion: {
      valor: 0,
      numero: 0,
   },
};

export const initContext = {
   catTypePerson: 0,
   check: false,
   checkDate: '',
   checkNumber: 1,
   currency: 'MXN',
   description: '',
   idCheckOwnership: null,
   idRelOwnership: null,
   otherName1: '',
   otherName2: '',
   otherName3: '',
   otherName4: '',
   ownerName: '',
   ownershipStatus: '',
   ownershipValue: '',
   ownerType: '',
   typeValue: '',
};

export const optOwnerType = {
   1: [
      { value: 'APPLICANT', label: 'Solicitante' },
      { value: 'CO_OTHERS', label: 'Co-propietario (Solicitante y otros)' },
      { value: 'CO_OBLIGED', label: 'Co-propietario (Solicitante y Obligado Solidario)' },
      { value: 'OTHERS', label: 'Otros' },
   ],
   2: [
      { value: 'APPLICANT', label: 'Obligado solidario' },
      { value: 'CO_OTHERS', label: 'Co-propietario (Obligado solidario y otros)' },
      { value: 'CO_OBLIGED', label: 'Co-propietario (Firmantes)' },
      { value: 'OTHERS', label: 'Otros' },
   ],
};

export const statusProperty = {
   PENDIENTE: 16,
   INCOMPLETO: 17,
   FINALIZADO: 18,
   FREEZE: 25,
};

export const keysToCheckOthers = ['otherName1', 'otherName2', 'otherName3', 'otherName4', 'otherName5'];

export const optionsBase = {
   propertyType: {
      roomHouse: 'Casa habitación',
      department: 'Departamento',
      building: 'Edificio',
      land: 'Terreno',
      industrialUnit: 'Nave industrial',
      agriculturaLand: 'Terreno agricola',
   },
   landUnit: {
      hectare: 'Hectárea',
      squareMeter: 'Metro cuadrado',
   },
};
