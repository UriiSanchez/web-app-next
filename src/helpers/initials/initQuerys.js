export const queryStatusRequest = (status, queryUser, page = 0, size = 100) => `{
    getGroupWithFilters(page: ${page}, size: ${size}, status: "${status}", ${queryUser ? queryUser : ''}) {
        approvedAmount
		arrivedAcDate
		arrivedLcDate
		arrivedMrDate
        arrivedSecDate
		branchOffice
		createDate
		groupName
		idAnalyst
        idCatTypeProcedure
		idCatStatus
		idGroup
		modifyDate
		nameEmg
        oldStatus
		requestAmount
		sendOtherProfile
        totalPages
		userCreate
		userModify
        requestResponseList
        {
            alerts
            amountSuggestC
            amountSuggestEm
            approvedAmount
            commentAc
            commentLc
            coverComplete
            createDate
            currency
            deleted
            endDate
            hasVerification
            idCatStatus
            idCatTypeProcedure
            idGroupRequest
            idRequest
            kindProcedure
            lastDateExecEm
            notional
            recommendationAc
            recommendationLc
            requestAmount
            resultExecEm
            userCreate
            userModify
            relatedPersonResponseList
            {
                alternativeMail
                checkListComplete
                confirmInfoBureau
                deleted
                errorBureau
                fullName
                folioBureau
                idCatTypePerson
                idClient
                idClientRelated
                idRelatedPerson
                idRequest
                mail
                maritalStatus
                personType
                rfc
                userCreate
                userModify
                lastDateBureau
                financialDocsChanges
                legalRepresentatives
                {
                    alternativeMail
                    fullName
                    idCatTypePerson
                    idClient
                    idClientRelated
                    idRelatedPerson
                    idRequest
                    mail
                    maritalStatus
                    personType
                    userCreate
                    userModify
                    idClientManual
                }
            }
        }
    }
}`;

export const queryRequestSecretary = ({ status, page = 0, size = 100 }) => `{
    getGroupWithFilters(page: ${page}, size: ${size}, status: "${status}") {
        arrivedSecDate
        authorizationAmount
        branchOffice
        groupName
        idCatStatus
        idGroup
        nameAnalyst
        totalPages
        userModify
        requestResponseList
        {
            authorizationAmount
            authorizationDate
            authorizationNotional
            deleted
            finalizeDate
            idCatStatus
            idRequest
            recommendationLc
            relatedPersonResponseList
            {
                fullName
                idCatTypePerson
                idClient
                personType
            }
        }
    }
}`;

export const queryGetRequest = (idGroup) => `{
    getGroup(idGroup: ${idGroup}){
        approvedAmount
        arrivedAcDate
        arrivedLcDate
        arrivedMrDate
        arrivedSecDate
        branchOffice
        createDate
        groupName
        idAnalyst
        idLeader
        idCatTypeProcedure
        idCatStatus
        idGroup
        modifyDate
        nameAnalyst
        nameLeader
        nameEmg
        oldStatus
        requestAmount
        sendOtherProfile
        userCreate
        userModify
        requestResponseList
        {
            alerts
            amountSuggestC
            amountSuggestEm
            approvedAmount
            authorizationAmount
            authorizationDate
            authorizationNotional
            commentAc
            commentLc
            coverComplete
            createDate
            currency
            deleted
            endDate
            finalizeDate
            hasVerification
            idCatStatus
            idCatTypeProcedure
            idGroupRequest
            idRequest
            kindProcedure
            lastDateExecEm
            notional
            recommendationAc
            recommendationLc
            requestAmount
            resultExecEm
            userCreate
            userModify
            hasVerification
            pendingVerification
            relatedPersonResponseList
            {
                alternativeMail
                checkListComplete
                confirmInfoBureau
                deleted
                errorBureau
                errorModel
                folioBureau
                fullName
                idCatTypePerson
                idClient
                idClientRelated
                idRelatedPerson
                idRequest
                lastDateBureau
                mail
                maritalStatus
                personType
                rfc
                statusModel
                userCreate
                userModify
                financialDocsChanges
                legalRepresentatives
                {
                    alternativeMail
                    fullName
                    idCatTypePerson
                    idClient
                    idClientRelated
                    idRelatedPerson
                    idRequest
                    mail
                    maritalStatus
                    personType
                    userCreate
                    userModify
                    idClientManual
                }
            }
        }
    }
}`;

export const queryClientByName = ({ name, page = 0, size = 70, typeQuery }) => {
   let restFields = `economicGroupPeople {
                customerIdRelationship
                customerName
                linkCustomerId
                uniqueIdRelationship
            }
            requests {
                alternativeMail
                approvedAmount
                createDate
                createUser
                currency
                endDate
                fullName
                group
                idCatTypePerson
                idCatTypeProcedure
                idRequest
                idStatus
                mail
                modifyDate
                modifyUser
                requestAmount
                status
                typeProcedure
            }`;
   return `{
    getClientByNamePaged(name: "${name}", page: ${page}, size: ${size}) {
        totalPages
        totalElements
        responses {
            antiquity
            birthdate
            businessName
            civilStatus
            economicActivity
            email
            fathersName
            firstName
            group
            idClient
            mothersName
            name
            nationality
            office
            personType
            promoter
            relationship
            rfc
            secondName
            status
            ${typeQuery == 'ALL' ? restFields : ''}
        }
    }
}`;
};

export const getQueryOneGroup = (queryMethod) => {
   let bodyTemplate = templateQueryOnlyGroup[queryMethod];
   return `query GetGroup($idGroup: Int) { getGroup(idGroup: $idGroup) { ${bodyTemplate} } }`;
};

export const queryNewStatusRequest = `query GetGroupWithFilters(
   $status: String
   $page: Int = 0
   $size: Int = 100
   $name: String = ""
   $idAnalyst: String
   $userCreate: String
   $byZone: String
   $hasChats: Boolean
   $searchGroupsRecLC: Boolean
) {
      getGroupWithFilters(status: $status, page: $page, byGroupName: $name, size: $size, idAnalyst: $idAnalyst, userCreate: $userCreate, byZone: $byZone, searchGroupsWithChats: $hasChats, searchGroupsRecLC: $searchGroupsRecLC  ) {
         idGroup
         idCatStatus
         createDate
         requestAmount
         approvedAmount
         modifyDate
         userCreate
         userModify
         groupName
         branchOffice
         totalPages
         nameEmg
         idAnalyst
         idLeader
         sendOtherProfile
         arrivedMrDate
         arrivedLcDate
         arrivedAcDate
         arrivedSecDate
         idCatTypeProcedure
         nameAnalyst
         nameLeader
         authorizationAmount
         oldStatus
         arrivedFcDate
         hasChats
         requestResponseList {
            idRequest
            idGroupRequest
            idCatStatus
            requestAmount
            approvedAmount
            currency
            endDate
            idCatTypeProcedure
            userCreate
            userModify
            createDate
            modifyDate
            deleted
            kindProcedure
            notional
            lastDateExecEm
            resultExecEm
            recommendationLc
            recommendationAc
            commentLc
            commentAc
            coverComplete
            hasVerification
            alerts
            amountSuggestEm
            amountSuggestC
            authorizationDate
            finalizeDate
            authorizationAmount
            authorizationNotional
            pendingVerification
            resolutionDate
            relatedPersonResponseList {
               idRelatedPerson
               idRequest
               idCatTypePerson
               idClient
               fullName
               mail
               alternativeMail
               maritalStatus
               userCreate
               userModify
               createDate
               modifyDate
               deleted
               personType
               idClientRelated
               confirmInfoBureau
               errorBureau
               checkListComplete
               rfc
               folioBureau
               lastDateBureau
               idClientManual
               errorModel
               statusModel
               financialDocsChanges
               legalRepresentatives {
                  idRelatedPerson
                  idRequest
                  idCatTypePerson
                  idClient
                  fullName
                  mail
                  alternativeMail
                  maritalStatus
                  userCreate
                  userModify
                  createDate
                  modifyDate
                  deleted
                  personType
                  idClientRelated
                  idClientManual  
               }
            }
         }
      }
   }`;

export const queryStatusTracking = `query GetTrackingWithFilters(
   $status: String,
   $page: Int = 1,
   $size: Int = 10,
   $searchByName: String,
   $byApplicationTypes: String,
   $byDateRange: String,
   $byBranches: String,
   $userCreate: String,
   $idAnalyst: String
) {
   getTrackingWithFilters(page: $page, size: $size, status: $status, searchByName: $searchByName, searchByApplicationTypes: $byApplicationTypes, searchByDateRange:$byDateRange, searchByBranches: $byBranches, userCreate: $userCreate, idAnalyst: $idAnalyst) {
      idGroup groupName requestPerGroup branchOffice arrivedMrDate quorumReachedDate requestAmount authorizationAmount substatus statusName totalTime totalPages
      requestResponseList { idRequest idGroupRequest idCatStatus kindProcedure relatedPersonResponseList {
      idClient fullName idRequest idCatTypePerson } }
   }
}`;

export const templateQueryOnlyGroup = {
   SOLIDARY_PAGE: `groupName idCatTypeProcedure idCatStatus idGroup requestAmount requestResponseList
   { idCatStatus idCatTypeProcedure idGroupRequest idRequest kindProcedure requestAmount 
   relatedPersonResponseList { fullName idCatTypePerson idClient deleted idRequest mail maritalStatus userCreate personType rfc } }`,
   REQUEST_VALIDATE_MR: `idGroup idCatStatus sendOtherProfile nameEmg userCreate requestResponseList { idRequest idCatStatus relatedPersonResponseList {idCatTypePerson fullName idClient}}`,
};
