export interface FamilySearchConfig {
  clientId: string;
  redirectUri: string;
}

export const familySearchConfig: FamilySearchConfig = {
  clientId: process.env.REACT_APP_FAMILYSEARCH_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_FAMILYSEARCH_REDIRECT_URI!,
};
