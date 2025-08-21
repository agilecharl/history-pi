import { HttpModule, HttpService } from '@nestjs/axios';
import { Injectable, Module } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';

export interface FamilySearchConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  baseUrl?: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  id_token?: string;
}

export interface AuthUrlOptions {
  scopes?: string[];
  state?: string;
}

@Injectable()
export class FamilySearchAuthService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: FamilySearchConfig
  ) {
    this.baseUrl = config.baseUrl || 'https://ident.familysearch.org';
  }

  /**
   * Generates the authorization URL for OAuth 2.0 Authorization Code flow
   * @param options - Optional parameters including scopes and state
   * @returns Authorization URL
   */
  getAuthorizationUrl(options: AuthUrlOptions = {}): string {
    const { scopes = [], state } = options;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
    });

    if (scopes.length > 0) {
      params.append('scope', scopes.join(' '));
    }
    if (state) {
      params.append('state', state);
    }

    return `${
      this.baseUrl
    }/cis-web/oauth2/v3/authorization?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access token
   * @param code - Authorization code from redirect
   * @returns Access token response
   */
  async exchangeCodeForToken(code: string): Promise<AccessTokenResponse> {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<AccessTokenResponse>(
          `${this.baseUrl}/cis-web/oauth2/v3/token`,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          }
        )
      );
      return response.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to exchange code for token: ${errorMsg}`);
    }
  }

  /**
   * Obtains an unauthenticated session token
   * @returns Access token response
   */
  async getUnauthenticatedSessionToken(): Promise<AccessTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'unauthenticated_session',
      client_id: this.config.clientId,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<AccessTokenResponse>(
          `${this.baseUrl}/cis-web/oauth2/v3/token`,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          }
        )
      );
      return response.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to get unauthenticated session token: ${errorMsg}`
      );
    }
  }

  /**
   * Decodes a JWT token (id_token)
   * @param token - JWT token to decode
   * @returns Decoded JWT payload
   */
  decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode JWT: ${errorMsg}`);
    }
  }
}

@Module({
  imports: [HttpModule],
  providers: [
    FamilySearchAuthService,
    {
      provide: 'FamilySearchConfig',
      useValue: {
        clientId: 'YOUR_CLIENT_ID',
        redirectUri: 'YOUR_REDIRECT_URI',
        // clientSecret: 'YOUR_CLIENT_SECRET', // Optional, only for client_credentials
        // baseUrl: 'https://ident.familysearch.org' // Optional, defaults to production
      },
    },
  ],
  exports: [FamilySearchAuthService],
})
export class FamilySearchAuthModule {}
