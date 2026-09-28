export const mapAttributeStatusFormFaculty = {
   COMERCIAL: 'resolutionByCommercial',
   CREDITO: 'resolutionByCredit',
};

export const mapStatusColorFaculty = {
   APPROVED: {
      title: 'Autorizado',
      color: 'text-[#3BBD9F]',
   },
   PENDING: {
      title: 'Pendiente',
      color: 'text-[#B7B8B7]'
   },
   REJECTED:{
      title: 'Rechazado',
      color: 'text-[#EE5045]'
   },
   STAMPED: {
      title: 'Sellado',
      color: 'text-[#3BBD9F]',
   }
}

export const mapButtonsOptions = [
   {
      text: 'Rechazar',
      value: 'NO',
      sx: 'bg-white',
   },
   {
      text: 'Autorizar',
      value: 'YES',
      sx: 'text-white bg-black-900',
   },
];

export const mapMissingFaculty = {
   COMERCIAL: 'CREDITO',
   CREDITO: 'COMERCIAL',
}

export const EnumTypeFaculty = {
   FACULTY_COMMERCIAL: 'COMERCIAL',
   FACULTY_CREDIT: 'CREDITO'
}

export const EnumOptionsDecisionFaculty = {
   NOT: 'NO',
   YES: 'YES'
}