//TODO, handle multiple values???
function findAttributeByFriendlyName(attributeArray, attrName) {
  let result = attributeArray.find(cd => {
    return cd.friendlyName === attrName;
  });
  return result ? result.values[0] : null;
}

function makeUserDetails(dataStore) {
  const response = {};

  console.log(`DataStoreHelper --- makeUserDetails::`)
  console.log(dataStore)

  let eIDASDataSet = dataStore.clearData.find(cd => {
    return cd.type === "eIDAS";
  });

  let eduGAINSet = dataStore.clearData.find(cd => {
    return cd.type === "eduGAIN";
  });

  if (eIDASDataSet) {
    const eIDASData = eIDASDataSet.attributes;
    console.log(`Datastore helpter -- makeuserdetails-- eidasData`)
    console.log(eIDASData);
    const eIDASUserDetails = {
      given_name: findAttributeByFriendlyName(eIDASData, "GivenName"),
      family_name: findAttributeByFriendlyName(eIDASData, "FamilyName"),
      person_identifier: findAttributeByFriendlyName(
        eIDASData,
        "PersonIdentifier"
      ),
      date_of_birth: findAttributeByFriendlyName(eIDASData, "DateOfBirth"),
      source: "eidas",
      loa: eIDASData.find(attr => {
        return attr.friendlyName === "loa";
      })
        ? eIDASData.find(attr => {
            return attr.friendlyName === "loa";
          }).values
        : "low"
    };
    response.eidas = eIDASUserDetails;
  }

  if (eduGAINSet) {
    const eduGAIN = eduGAINSet.attributes;
    const eduGAINDetails = {
      schacHomeOrganization: findAttributeByFriendlyName(
        eduGAIN,
        "schacHomeOrganization"
      ),
      eduPersonTargetedID: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonTargetedID"
      ),
      schGrAcPersonID: findAttributeByFriendlyName(eduGAIN, "schGrAcPersonID"),
      uid: findAttributeByFriendlyName(eduGAIN, "uid"),
      schacGender: findAttributeByFriendlyName(eduGAIN, "schacGender"),
      schacYearOfBirth: findAttributeByFriendlyName(
        eduGAIN,
        "schacYearOfBirth"
      ),
      schacDateOfBirth: findAttributeByFriendlyName(
        eduGAIN,
        "schacDateOfBirth"
      ),
      schacCountryOfCitizenship: findAttributeByFriendlyName(
        eduGAIN,
        "schacCountryOfCitizenship"
      ),
      schGrAcPersonSSN: findAttributeByFriendlyName(
        eduGAIN,
        "schGrAcPersonSSN"
      ),
      schacPersonalUniqueID: findAttributeByFriendlyName(
        eduGAIN,
        "schacPersonalUniqueID"
      ),
      eduPersonOrgDN: findAttributeByFriendlyName(eduGAIN, "eduPersonOrgDN"),
      mail: findAttributeByFriendlyName(eduGAIN, "mail"),
      eduPersonAffiliation: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonAffiliation"
      ),
      eduPersonScopedAffiliation: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonScopedAffiliation"
      ),
      eduPersonPrimaryAffiliation: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonPrimaryAffiliation"
      ),
      givenName: findAttributeByFriendlyName(eduGAIN, "givenName"),
      sn: findAttributeByFriendlyName(eduGAIN, "sn"),
      displayName: findAttributeByFriendlyName(eduGAIN, "displayName"),
      schacPersonalPosition: findAttributeByFriendlyName(
        eduGAIN,
        "schacPersonalPosition"
      ),
      schacPersonalUniqueCode: findAttributeByFriendlyName(
        eduGAIN,
        "schacPersonalUniqueCode"
      ),
      schGrAcEnrollment: findAttributeByFriendlyName(
        eduGAIN,
        "schGrAcEnrollment"
      ),
      schGrAcPersonalLinkageID: findAttributeByFriendlyName(
        eduGAIN,
        "schGrAcPersonalLinkageID"
      ),
      eduPersonEntitlement: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonEntitlement"
      ),
      schGrAcPersonID: findAttributeByFriendlyName(eduGAIN, "schGrAcPersonID"),
      ou: findAttributeByFriendlyName(eduGAIN, "ou"),
      dc: findAttributeByFriendlyName(eduGAIN, "dc"),
      schGrAcEnrollment: findAttributeByFriendlyName(
        eduGAIN,
        "schGrAcEnrollment"
      ),
      eduPersonPrimaryAffiliation: findAttributeByFriendlyName(
        eduGAIN,
        "eduPersonPrimaryAffiliation"
      ),
      mailLocalAddress: findAttributeByFriendlyName(
        eduGAIN,
        "mailLocalAddress"
      ),
      eduPersonOrgDN: findAttributeByFriendlyName(eduGAIN, "eduPersonOrgDN"),
      schacPersonalUniqueCode: findAttributeByFriendlyName(
        eduGAIN,
        "schacPersonalUniqueCode"
      ),
      departmentNumber: findAttributeByFriendlyName(
        eduGAIN,
        "departmentNumber"
      ),
      departmentNumber: findAttributeByFriendlyName(eduGAIN, "departmentNumber")
    };
    response.eduGAIN = eduGAINDetails;
  }

  return response;
}

export { makeUserDetails };
