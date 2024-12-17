import axios, { AxiosInstance } from "axios";

interface ApiResponse {
  message?: string;
  [key: string]: any;
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
    return response;
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
    console.log(response);
    return response;
  }
}
