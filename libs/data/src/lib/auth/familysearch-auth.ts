export interface FamilySearchConfig {
  clientId: string;
  redirectUri: string;
  authBaseUrl: string;
  tokenEndpoint: string;
  scopes?: string[];
}

function stringify(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  id_token?: string;
}

export interface AuthError {
  error: string;
  error_description: string;
}

export class FamilySearchAuthService {
  private readonly config: FamilySearchConfig;

  constructor(config: FamilySearchConfig) {
    this.config = {
      scopes: ['openid', 'profile'],
      ...config,
    };
  }

  /**
   * Initiates the authorization code flow by redirecting to FamilySearch login
   */
  public initiateAuthFlow(): void {
    const authParams = {
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes?.join(' ') ?? 'openid profile',
      state: this.generateState(),
    };

    const authUrl = `${this.config.authBaseUrl}/authorization?${stringify(
      authParams
    )}`;
    window.location.href = authUrl;
  }

  /**
   * Exchanges authorization code for access token
   * @param code The authorization code from the redirect
   */
  public async exchangeCodeForToken(code: string): Promise<AuthTokenResponse> {
    const tokenParams = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    };

    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: stringify(tokenParams),
      });

      if (!response.ok) {
        const error: AuthError = await response.json();
        throw new Error(`Authentication failed: ${error.error_description}`);
      }

      const data: AuthTokenResponse = await response.json();
      return data;
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      throw new Error(`Token exchange failed: ${errorMessage}`);
    }
  }

  /**
   * Decodes JWT ID token to extract user information
   * @param idToken The JWT ID token from the token response
   */
  public decodeIdToken(idToken: string): Record<string, any> | null {
    try {
      const payload = idToken.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Failed to decode ID token:', error);
      return null;
    }
  }

  /**
   * Generates a random state parameter for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Example usage in a React component
export const useFamilySearchAuth = (config: FamilySearchConfig) => {
  const auth = new FamilySearchAuthService(config);

  const handleLogin = () => {
    auth.initiateAuthFlow();
  };

  const handleCallback = async (code: string) => {
    try {
      const tokenResponse = await auth.exchangeCodeForToken(code);
      const userInfo = tokenResponse.id_token
        ? auth.decodeIdToken(tokenResponse.id_token)
        : null;
      return { tokenResponse, userInfo };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  return { handleLogin, handleCallback };
};
