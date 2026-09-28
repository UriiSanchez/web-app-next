import _ from 'lodash';
import { constProfiles as Profile, constTypePerson as TypePerson } from '../config';

export const colorStatus = {
   Completado: 'emerald-600',
   Finalizado: 'emerald-600',
   Ausente: 'red-500',
   Incompleto: 'red-500',
   Pendiente: 'red-500',
};

const allDocuments = [
   {
      _id: 'PCD',
      order: 1,
      documentType: 'perfil cliente de derivados',
      title: 'Perfil Cliente de Derivados',
      layout: '',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Empezar',
            type: 'link',
         },
      ],
   },
   {
      _id: 'FVI',
      order: 2,
      documentType: 'formato de validacion de inmuebles',
      title: 'Relación de Propiedades',
      subtitle: 'Solicitud y verificación de sociedad',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Empezar',
            type: 'link',
         },
      ],
   },
   {
      _id: 'BG',
      order: 3,
      documentType: 'balance general',
      title: 'Balance General',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Empezar',
            type: 'link',
         },
      ],
   },
   {
      _id: 'ER',
      order: 4,
      documentType: 'estado de resultados',
      title: 'Estado de Resultados',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Empezar',
            type: 'link',
         },
      ],
   },
   {
      _id: 'MCBC',
      order: 5,
      documentType: 'método de consulta de buró de crédito',
      title: 'Método de Consulta de Buró de Crédito',
      subtitle: 'Validación de datos para la consulta',
      layout: '',
      status: 'Pendiente',
      isVisible: true,
      folio: null,
      selectedType: '',
      screenBureau: null,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'EFCA',
      order: 6,
      documentType: 'estados financieros al cierre anual',
      title: 'Estados Financieros al Cierre Anual',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            data: [],
            enable: false,
            label: 'Ver',
            type: 'list',
         },
      ],
   },
   {
      _id: 'EFP',
      order: 7,
      documentType: 'estados financieros parciales',
      title: 'Estados Financieros Parciales',
      layout: '',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'RBC',
      order: 8,
      documentType: 'reporte buro de credito',
      title: 'Reporte de Buró de Crédito',
      layout: 'Último reporte al: ',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Consultar',
            type: 'func',
         },
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'ISRBC',
      order: 9,
      documentType: 'interpretacion siscore del reporte de buró crédito',
      title: 'Interpretación del reporte de Buró de Crédito',
      layout: '',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'DJ',
      order: 10,
      documentType: 'dictamen juridico',
      title: 'Dictamen Jurídico',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'RP',
      order: 11,
      documentType: 'relacion patrimonial',
      title: 'Relación Patrimonial',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'ARC',
      order: 12,
      documentType: 'acta registro civil',
      title: 'Acta de Matrimonio',
      status: 'Pendiente',
      folio: null,
      isVisible: true,
      toAction: [
         {
            enable: false,
            label: 'Visualizar',
            type: 'btn',
         },
      ],
   },
   {
      _id: 'IDRL',
      order: 13,
      documentType: 'identificacion personal',
      title: 'ID Representante Legal',
      status: 'Pendiente',
      folio: null,
      enable: false,
      isVisible: true,
      label: 'Visualizar',
      type: 'btn',
   },
   {
      _id: 'CEFI',
      order: 14,
      documentType: 'cedula de identificacion fiscal',
      title: 'Cédula Fiscal',
      status: 'Pendiente',
      folio: null,
      enable: false,
      isVisible: true,
      label: 'Visualizar',
      type: 'btn',
   },
   {
      _id: 'IDV',
      order: 15,
      documentType: 'identificacion personal',
      title: 'ID Vigente',
      status: 'Pendiente',
      folio: null,
      enable: false,
      isVisible: true,
      label: 'Visualizar',
      type: 'btn',
   },
   {
      _id: 'CDD',
      order: 16,
      documentType: 'comprobante de domicilio',
      title: 'Comprobante de Domicilio',
      layout: 'Documento opcional',
      folio: null,
      enable: false,
      isVisible: true,
      label: 'Visualizar',
      type: 'btn',
   },
];

//* 1 = Analista, 2 = Mesa, 3 = Especialista, 4 = Líder
const filtersByProfile = {
   1: ['PCD', 'FVI', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ', 'RP'],
   2: ['PCD', 'MCBC', 'RBC', 'ISRBC', 'FVI', 'EFCA', 'EFP', 'DJ', 'RP'],
   3: ['PCD', 'FVI', 'EFCA', 'EFP', 'MCBC', 'DJ', 'RP'],
   4: ['PCD', 'FVI', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ', 'RP'],
};

const filtersByPerson = {
   APPLICANT: {
      PM: ['PCD', 'FVI', 'MCBC', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ'],
      PFAE: ['PCD', 'FVI', 'MCBC', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC'],
   },
   SOLIDARY_OBLIGED: {
      PM: ['MCBC', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC', 'DJ'],
      PFAE: ['MCBC', 'BG', 'ER', 'EFCA', 'EFP', 'RBC', 'ISRBC'],
      PF: ['MCBC', 'RBC', 'ISRBC', 'RP', 'ARC', 'RBC', 'ISRBC'],
   },
};

const filterBuroValidations = {
   PM: ['DJ', 'CEFI', 'CDD'],
   PFAE: ['CEFI', 'IDV', 'CDD'],
   PF: ['IDV', 'CDD'],
};

const enumChecklist = {
   APPLICANT: {
      1: 'THREE',
      2: 'TWO',
      3: 'ONE',
      4: 'THREE',
   },
   SOLIDARY_OBLIGED: {
      1: 'SIX',
      2: 'FIVE',
      3: 'FOUR',
      4: 'SIX',
   },
};

export const TIPO_CARTA_NO_VALIDADA = 'Carta nueva no validada';
const IDENTIFICACION_PERSONAL = 'identificacion personal';

export class DocumentsClass {
   constructor(data, user) {
      this.data = data;
      this.legals = null;
      this.screenBureau = { title: '', signatureName: '', signatureDate: '', showSignature: false, docs: '' };
      this.typePerson = data.personType || 'PM';
      this.idProfile = user.idProfile;
      this.initialization(data);
   }

   initialization(info) {
      //* Se identifica si es Aplicante u Obligado.
      this.enumPerson = TypePerson[info.idCatTypePerson] || 'APPLICANT';
      this.checklistByProfile = enumChecklist[this.enumPerson][this.idProfile];

      let profileFilter = filtersByProfile[this.idProfile] || [];
      let docsProfile = profileFilter.map((value) => allDocuments.find((ad) => ad._id === value));

      let personFilter = filtersByPerson[this.enumPerson][this.typePerson] || [];
      this.docs = docsProfile.filter((dp) => personFilter.includes(dp._id)) || [];

      //* Las personas físicas casadas deben traer acta de matrimonio.
      if (
         this.typePerson === 'PF' &&
         this.enumPerson === 'SOLIDARY_OBLIGED' &&
         info.maritalStatus?.toLowerCase() === 'casado'
      ) {
         this.docs = [...this.docs, allDocuments.find((dc) => dc._id === 'ARC')];
      }

      //* Si es Perfil MRC se añaden los documentos que debería de tener según el TP para la Validación de Datos de Buró de Crédito.
      if (this.idProfile === Profile.MRC || this.idProfile === Profile.EMG) {
         //* Si existen representantes legales se obtiene la lista.
         if (info.legalRepresentatives.length > 0) {
            this.legals = info.legalRepresentatives.map((u) => ({ id: u.idClientManual || u.idClient }));
         }
      }
   }

   getDocsBureau(dataRL, docsChecklist, type) {
      const docsMRC = this._getFilteredBuroDocuments();

      // 1. Procesar documentos base (Mapeo)
      let processedDocs = [];
      if (type == TIPO_CARTA_NO_VALIDADA) {
         processedDocs = this._mapBureauChecklist(docsMRC, docsChecklist);
      }

      // 2. Procesar Representantes Legales
      const { rlDocs, signatureName } = this._processRepresentantesLegales(dataRL);

      // 3. Obtener configuración de firma y título
      const signatureAndTitle = this._getSignatureAndTitleConfig();

      this.screenBureau = {
         ...this.screenBureau,
         docs:[...processedDocs, ...rlDocs],
         signatureName,
         ...signatureAndTitle,
      };
   }

   /**
    * Filtra los documentos globales basados en el tipo de persona actual.
    * */
   _getFilteredBuroDocuments() {
      const buroFilter = filterBuroValidations[this.typePerson] || [];
      return allDocuments.filter((al) => buroFilter.includes(al._id));
   }

   /**
    * Mapea los documentos de referencia con los datos del checklist actual.
    * Extraída para reducir anidación de loops/finds.
    */
   _mapBureauChecklist(docsMRC, docsChecklist) {
      return docsMRC.map((mrc) => {
         const findDoc = docsChecklist.find((al) => al.documentType.toLowerCase() === mrc.documentType);
         if (_.isEmpty(findDoc)) return structuredClone(mrc);

         return {
            ...structuredClone(mrc),
            folio: findDoc.folio || mrc.folio,
            status: findDoc.status || mrc.status,
            enable: findDoc.folio > 0,
         };
      });
   }

   /**
    * Procesa la lógica de Representantes Legales.
    * Reduce la complejidad del bucle 'for...of' principal.
    * */
   _processRepresentantesLegales(dataRL) {
      if (_.isEmpty(dataRL)) {
         return {
            rlDocs: [],
            signatureName: this.data?.fullName,
         };
      }

      const names = [];
      const rlDocs = dataRL.map((item) => {
         const getID = item.documents.find((dc) => dc.documentType.toLowerCase() === IDENTIFICACION_PERSONAL);
         names.push(item.name);

         return {
            _id: 'IDRL',
            number: item.number,
            title: 'ID Representante Legal',
            status: getID?.folio > 0 && '',
            layout: _.isEmpty(item?.statusNautilus) ? item.name : `${item.number} - ${item?.statusNautilus}`,
            folio: getID?.folio || 0,
            enable: getID?.folio > 0,
            label: 'Visualizar',
            type: 'RL',
         };
      });

      return { rlDocs, signatureName: names.join(', ') };
   }

   /**
    * Encapsula la lógia de validación de esquema.
    * */
   _getSignatureAndTitleConfig() {
      const idType = this.data?.idCatTypePerson;
      if (idType in schemaDataValidation) {
         return schemaDataValidation[idType](this.data?.fullName, this.typePerson);
      }

      return { showSignature: false, title: '' };
   }
}

const schemaDataValidation = {
   1: (name) => {
      return {
         showSignature: true,
         title: 'Solicitante: ' + name,
      };
   },
   2: (name, type) => {
      return {
         showSignature: type === 'PM',
         title: 'Obligado Solidario: ' + name,
      };
   },
};
