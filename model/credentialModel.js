/*
takes as input a set of requestedData to include in a VC,
together with a VC_TYPE, if it is missing it is a mixed VC type by default, denoting a user selection 
and not a pre-defined  SEAL issuer VC_TYPE
and the data the user has already added to the data source
and generates an appropriate VC model with them
*/
function generateCredentialModel(requestedData, fetchedData, vcType='SEAL_MIXED') {

  console.log(`credentialModel.js:: requested`)
  console.log(requestedData)
/*
[ { source: 'eidas', key: 'given_name' },
  { source: 'eidas', key: 'family_name' },
  { source: 'eidas', key: 'person_identifier' },
  { source: 'eidas', key: 'date_of_birth' },
  { source: 'eidas', key: 'source' },
  { source: 'eidas', key: 'loa' } ]
*/
  console.log(`credentialModel.js:: fetched`)
  console.log(fetchedData)
  /*
  { eduGAIN: { isStudent: 'true', source: 'eduGAIN', loa: 'low' },
  TAXISnet:
   { name: 'Nikos',
     surname: 'Triantafyllou',
     loa: 'low',
     source: 'TAXISnet' },
  eidas:
   { given_name: 'ΑΝΔΡΕΑΣ, ANDREAS',
     family_name: 'ΠΕΤΡΟΥ, PETROU',
     person_identifier: 'GR/GR/ERMIS-11076669',
     date_of_birth: '1980-01-01',
     source: 'eidas',
     loa: 'http://eidas.europa.eu/LoA/low' } }
  */

  let matchingUserAttributes = requestedData.reduce((initVal, attr) => {
    console.log(`trting to add source: ${attr.source}, key: ${attr.key}  for vc type ${vcType}`)
    if (fetchedData[attr.source] && fetchedData[attr.source][attr.key]) {
      console.log(`will add on with ${fetchedData[attr.source][attr.key]}`)
      if (!initVal[vcType]) {
        initVal[vcType] = {};
      }
      if(!initVal[vcType][attr.source]){
        initVal[vcType][attr.source] = {};
      }
      initVal[vcType][attr.source][attr.key] = fetchedData[attr.source][attr.key];
    }
    return initVal;
  }, {});


  // ensure that loa from data sources is always included
  Object.keys(matchingUserAttributes[vcType]).forEach(key => {
    if (!matchingUserAttributes[vcType][key].loa) {
      matchingUserAttributes[vcType][key].loa = fetchedData[key].loa;
    }
  });

  //ensure that linking LOA is added
  if(Object.keys(matchingUserAttributes[vcType]).length > 1){
      if(fetchedData.linkLoa){
        matchingUserAttributes[vcType].linkLoa = fetchedData.linkLoa
      }else{
        matchingUserAttributes[vcType].linkLoa  = 'low'
      }
  }


  console.log(`CrdentialModel.js:: returning matching attributes ${matchingUserAttributes}`)
  console.log(matchingUserAttributes)

  return matchingUserAttributes;
}

export { generateCredentialModel };
