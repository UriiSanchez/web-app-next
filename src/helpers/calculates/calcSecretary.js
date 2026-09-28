import { sumGeneric } from "../helpOperations"

export const calSumAuthorizedAmount = (group) => {
   let fillReject = group.requestResponseList.filter(rl => rl?.recommendationLc === false || rl?.idCatStatus == '11');
   let fillApprobe = group.requestResponseList.filter(rl => rl?.recommendationLc || rl?.idCatStatus == '10');
   let sumReject = sumGeneric(fillReject, 'authorizationAmount');
   let sumAppobre = sumGeneric(fillApprobe, 'authorizationAmount');
   group.authorizationAmount = (sumAppobre - sumReject);
}