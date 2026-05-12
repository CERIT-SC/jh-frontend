import axios, { AxiosInstance } from "axios";

export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

/**
 * Progress event data from SSE stream
 */
export interface ProgressEvent {
  progress?: number;
  ready?: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Callback for progress updates
 */
export type ProgressCallback = (progress: number, data: ProgressEvent) => void;

/**
 * Options for quickStartWithProgress
 */
export interface QuickStartOptions {
  onProgress?: ProgressCallback;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  spawnOptions?: Record<string, unknown>;
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
    const response = await fetch(
      `/hub/api/users/${username}/servers/${serverName}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-XSRFToken": this.xsrf,
        },
        body: spawnOptions
          ? JSON.stringify({ spawn_options: spawnOptions })
          : undefined,
        credentials: "include",
      },
    );
    // Handle empty response (202/204 No Content)
    if (!response.ok) {
      throw new Error(
        `Failed to start server: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return {};
  }

  getSpawnProgress(username: string, serverName?: string): EventSource {
    const path = serverName
      ? `/hub/api/users/${username}/servers/${serverName}/progress?_xsrf=${this.xsrf}`
      : `/hub/api/users/${username}/server/progress?_xsrf=${this.xsrf}`;
    return new EventSource(path, { withCredentials: true });
  }

  /**
   * Start a named server and track progress via SSE
   * @param username - The username
   * @param serverName - The server name to start
   * @param options - Progress tracking options
   * @returns A cleanup function to abort the progress tracking
   */
  quickStartWithProgress(
    username: string,
    serverName: string,
    options?: QuickStartOptions,
  ): () => void {
    const { onProgress, onComplete, onError, spawnOptions } = options || {};
    let eventSource: EventSource | null = null;
    let aborted = false;

    const cleanup = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    const abort = () => {
      aborted = true;
      cleanup();
    };

    // Start the server first
    this.startNamedServer(username, serverName, spawnOptions)
      .then(() => {
        if (aborted) return;

        // Connect to SSE progress endpoint
        eventSource = this.getSpawnProgress(username, serverName);

        eventSource.onmessage = (event) => {
          if (aborted) return;

          const data: ProgressEvent = JSON.parse(event.data);

          if (data.progress !== undefined) {
            // Progress might already be 0-100, or 0-1
            const progressValue =
              data.progress > 1 ? data.progress : data.progress * 100;
            onProgress?.(Math.round(progressValue), data);
          }

          if (data.ready === true) {
            cleanup();
            onComplete?.();
          }
        };

        eventSource.onerror = () => {
          if (aborted) return;

          cleanup();
          onError?.(
            new Error(`SSE connection error for server: ${serverName}`),
          );
        };
      })
      .catch((error) => {
        if (aborted) return;

        onError?.(error);
      });

    return abort;
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
