import axios, { AxiosInstance } from "axios";

export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}
export interface UserModel {
  kind: "user" | "service";
  name: string;
  admin: boolean;
  roles: string[];
  groups: string[];
  server?: string;
  servers?: {
    [name: string]: ServerModel;
  };
  pending?: "spawn" | "stop" | null;
  created: number;
  last_activity: string;
  auth_state?: unknown;
}

export interface ServerModel {
  name: string;
  full_name: string;
  url: string;
  user_options: Record<string, unknown>;
  pending?: "spawn" | "stop" | null;
  ready: boolean;
  stopped: boolean;
  state?: Record<string, unknown>;
  started?: number;
  last_activity?: string;
  progress_url: string;
}

export interface TokenModel {
  id: string;
  user?: string;
  service?: string;
  kind: "api_token" | "oauth";
  scopes: string[];
  note: string;
  roles: string[];
  created: number;
  last_activity?: string;
  expires_at?: string;
  oauth_client?: string;
  session_id?: string;
}

export interface HubInfoModel {
  version: string;
  python_version: string;
  executable: string;
  authenticator: {
    class: string;
    module: string;
  };
  spawner: {
    class: string;
    module: string;
  };
}

export class JupyterHubApiClient {
  private client: AxiosInstance;
  private xsrf: string;

  constructor(baseURL: string, xsrf: string) {
    this.xsrf = xsrf;
    this.client = axios.create({
      baseURL,
    });
  }

  async stopDefaultServer(username: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(
      `/users/${username}/server?_xsrf=${this.xsrf}`,
    );
    return response.data;
  }

  async getUser(username: string): Promise<UserModel> {
    const response = await this.client.get<UserModel>(
      `/users/${username}?_xsrf=${this.xsrf}`,
    );
    return response.data;
  }

  async startDefaultServer(
    username: string,
    spawnOptions?: Record<string, unknown>,
  ): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(
      `/users/${username}/server?_xsrf=${this.xsrf}`,
      spawnOptions ? { spawn_options: spawnOptions } : {},
    );
    return response.data;
  }

  async startNamedServer(
    username: string,
    serverName: string,
    spawnOptions?: Record<string, unknown>,
  ): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(
      `/users/${username}/servers/${serverName}?_xsrf=${this.xsrf}`,
      spawnOptions ? { spawn_options: spawnOptions } : {},
    );
    return response.data;
  }

  getSpawnProgress(username: string, serverName?: string): EventSource {
    const path = serverName
      ? `/users/${username}/servers/${serverName}/progress?_xsrf=${this.xsrf}`
      : `/users/${username}/server/progress?_xsrf=${this.xsrf}`;
    return new EventSource(path);
  }

  async listTokens(username: string): Promise<TokenModel[]> {
    const response = await this.client.get<TokenModel[]>(
      `/users/${username}/tokens?_xsrf=${this.xsrf}`,
    );
    return response.data;
  }

  async createToken(
    username: string,
    options?: {
      note?: string;
      expires_in?: number;
      scopes?: string[];
    },
  ): Promise<TokenModel> {
    const response = await this.client.post<TokenModel>(
      `/users/${username}/tokens?_xsrf=${this.xsrf}`,
      options,
    );
    return response.data;
  }

  async revokeToken(username: string, tokenId: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(
      `/users/${username}/tokens/${tokenId}?_xsrf=${this.xsrf}`,
    );
    return response.data;
  }

  async getHubInfo(): Promise<HubInfoModel> {
    const response = await this.client.get<HubInfoModel>(
      `/info?_xsrf=${this.xsrf}`,
    );
    return response.data;
  }

  async reportActivity(
    username: string,
    servers: {
      [serverName: string]: { last_activity: string };
    },
  ): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(
      `/users/${username}/activity?_xsrf=${this.xsrf}`,
      { servers },
    );
    return response.data;
  }

  async stopNamedServer(
    username: string,
    serverName: string,
    remove: boolean,
  ): Promise<ApiResponse> {
    const config = remove ? { data: { remove: true } } : undefined;

    const response = await this.client.delete<ApiResponse>(
      `/users/${username}/servers/${serverName}?_xsrf=${this.xsrf}`,
      config,
    );
    return response.data;
  }
  async getNamedServers(username: string): Promise<any | undefined> {
    const response = await this.client.get(`/users/${username}`, {
      headers: {
        "X-XSRFToken": this.xsrf,
      },
    });

    const userServers = response.data.servers;

    return userServers;
  }
}
