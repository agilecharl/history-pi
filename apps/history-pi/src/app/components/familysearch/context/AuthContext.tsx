import { useFamilySearchAuth } from '@history-pi/data';
import { ReactNode, useEffect } from 'react';

type AuthComponentProps = {
  children?: ReactNode;
};

const config = {
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/auth/callback',
  authBaseUrl: 'https://ident.familysearch.org/cis-web/oauth2/v3/',
  tokenEndpoint: 'https://ident.familysearch.org/cis-web/oauth2/v3/token',
};

export function AuthComponent({ children }: AuthComponentProps) {
  const { handleLogin, handleCallback } = useFamilySearchAuth(config);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleCallback(code).then(({ tokenResponse, userInfo }) => {
        console.log('Access Token:', tokenResponse.access_token);
        console.log('User Info:', userInfo);
      });
    }
  }, []);

  return <button onClick={handleLogin}>Login with FamilySearch</button>;
}
