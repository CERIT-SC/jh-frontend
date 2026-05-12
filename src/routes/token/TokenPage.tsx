import {
  Content,
  ContentBody,
  ContentHeading,
  Link,
  Small,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Panel,
  PanelContent,
  PanelHeader,
  Input,
  Label,
  P,
  Code,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@e-infra/design-system";
import React, { useState, useRef, useEffect } from "react";
import { JupyterHubHeader, Footer } from "@components/layout";
import type { TokenAppConfig } from "@src-types/appConfig";

/**
 * Global config injected by JupyterHub's Jinja2 template (token.html).
 */
declare const appConfig: TokenAppConfig;

/**
 * Token data structure from JupyterHub API
 */
interface ApiToken {
  id: number | string;
  note?: string;
  scopes?: string[];
  last_activity?: string;
  created?: string;
  expires_at?: string;
  [key: string]: unknown;
}

/**
 * OAuth client data structure
 */
interface OAuthClient {
  token_id: number | string;
  description: string;
  tokens: Array<{ scopes?: string[] }>;
  last_activity?: string;
  created?: string;
}

function TokenPage() {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [_oauthClients, setOauthClients] = useState<OAuthClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch tokens from API
  const fetchTokens = async () => {
    try {
      const response = await fetch(
        `/hub/api/users/${appConfig.userName}/tokens?_xsrf=${appConfig.xsrf}`,
      );
      if (response.ok) {
        const data = (await response.json()) as { api_tokens?: ApiToken[] };
        const tokens = data.api_tokens || (Array.isArray(data) ? data : []);
        setApiTokens(tokens);
      } else {
        console.error("Failed to fetch tokens:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  // Fetch OAuth clients from API
  const fetchOAuthClients = async () => {
    try {
      // Fetch all tokens and filter for OAuth tokens
      const response = await fetch(
        `/hub/api/users/${appConfig.userName}/tokens?_xsrf=${appConfig.xsrf}`,
      );
      if (response.ok) {
        const data = (await response.json()) as { api_tokens?: ApiToken[] };
        const allTokens = data.api_tokens || (Array.isArray(data) ? data : []);
        // Filter for OAuth tokens (kind === "oauth_token" or has oauth_client)
        const oauthTokens = allTokens.filter(
          (token) =>
            (token as { kind?: string }).kind === "oauth_token" ||
            (token as { oauth_client?: string }).oauth_client,
        );
        // Group tokens by oauth_client to show as clients
        const clientsMap = new Map<string, OAuthClient>();
        oauthTokens.forEach((token) => {
          const clientId =
            (token as { oauth_client?: string }).oauth_client ||
            (token as { client_id?: string }).client_id;
          if (clientId) {
            if (!clientsMap.has(clientId)) {
              clientsMap.set(clientId, {
                token_id:
                  (token as { id?: number | string }).id ||
                  (token as { api_id?: number | string }).api_id ||
                  0,
                description:
                  (token as { oauth_client?: string }).oauth_client ||
                  (token as { client_id?: string }).client_id ||
                  "Unknown",
                tokens: [],
                last_activity: (token as { last_activity?: string })
                  .last_activity,
                created: (token as { created?: string }).created,
              });
            }
            const client = clientsMap.get(clientId)!;
            client.tokens.push({
              scopes: (token as { scopes?: string[] }).scopes || [],
            });
            // Update with most recent activity
            if (
              (token as { last_activity?: string }).last_activity &&
              (!client.last_activity ||
                (token as { last_activity?: string }).last_activity! >
                  client.last_activity)
            ) {
              client.last_activity = (
                token as { last_activity?: string }
              ).last_activity;
            }
          }
        });
        setOauthClients(Array.from(clientsMap.values()));
      } else {
        console.error("Failed to fetch OAuth clients:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching OAuth clients:", error);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTokens(), fetchOAuthClients()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Refetch tokens (called after creating new token or revoking)
  const fetchUpdatedTokens = async () => {
    await fetchTokens();
    await fetchOAuthClients();
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(formRef.current!);
    const note = (formData.get("token-note") as string)?.trim();
    const expiration = (
      formData.get("token-expiration-seconds") as string
    )?.trim();
    const scopesValue = (formData.get("token-scopes") as string)?.trim();

    // Build payload object for JSON API
    const payload: Record<string, unknown> = {};
    if (note) {
      payload.note = note;
    }
    if (expiration) {
      payload.expires_in = parseInt(expiration, 10);
    }
    if (scopesValue) {
      payload.scopes = scopesValue.split(/\s+/).filter(Boolean);
    }

    console.log("Submitting token request:", payload);

    fetch(
      `/hub/api/users/${appConfig.userName}/tokens?_xsrf=${appConfig.xsrf}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      })
      .then(async (data: { token?: string }) => {
        console.log("Token created:", data);
        setGeneratedToken(data.token || null);
        setShowTokenDialog(true);
        formRef.current?.reset();

        // Fetch updated list to get complete token data including scopes
        // (POST response doesn't include all fields like scopes)
        await fetchUpdatedTokens();
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  const handleRevokeToken = async (tokenId: number | string) => {
    try {
      console.log("Revoking token:", tokenId);
      const response = await fetch(
        `/hub/api/users/${appConfig.userName}/tokens/${tokenId}?_xsrf=${appConfig.xsrf}`,
        {
          method: "DELETE",
        },
      );
      console.log("Revoke response:", response.status, response.statusText);
      if (response.ok) {
        console.log("Token revoked successfully, refreshing data...");
        await fetchUpdatedTokens();
      } else {
        console.error("Failed to revoke token:", response.statusText);
      }
    } catch (error) {
      console.error("Error revoking token:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JupyterHubHeader userName={appConfig.userName || ""} />
      <main className="flex flex-1 flex-col items-center">
        <Content className="w-full max-w-7xl">
          <ContentHeading>Manage JupyterHub Tokens</ContentHeading>
          <ContentBody>
            {/* Request Token Form */}
            <Panel>
              <PanelHeader>Request New API Token</PanelHeader>
              <PanelContent>
                <form
                  ref={formRef}
                  onSubmit={submitForm}
                  className="space-y-4 mb-8"
                >
                  <div className="form-group space-y-2">
                    <Label htmlFor="token-note">Note</Label>
                    <Input
                      id="token-note"
                      name="token-note"
                      type="text"
                      placeholder="note to identify your new token"
                      className="w-full"
                    />
                    <Small className="text-gray-500">
                      This note will help you keep track of what your tokens are
                      for.
                    </Small>
                  </div>

                  <div className="form-group space-y-2">
                    <Label htmlFor="token-expiration-seconds">
                      Token expires in
                    </Label>
                    <select
                      id="token-expiration-seconds"
                      name="token-expiration-seconds"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-opacity-50"
                      defaultValue=""
                      dangerouslySetInnerHTML={{
                        __html: appConfig.token_expires_in_options_html || "",
                      }}
                    />
                    <Small className="text-gray-500">
                      You can configure when your token will expire.
                    </Small>
                  </div>

                  <div className="form-group space-y-2">
                    <Label htmlFor="token-scopes">Permissions</Label>
                    <Input
                      id="token-scopes"
                      name="token-scopes"
                      type="text"
                      placeholder="list of scopes for the token to have, separated by space"
                      className="w-full"
                    />
                    <Small className="text-gray-500">
                      You can limit the permissions of the token so it can only
                      do what you want it to. If none are specified, the token
                      will have permission to do everything you can do. See the{" "}
                      <Link href="https://jupyterhub.readthedocs.io/en/stable/rbac/scopes.html#available-scopes">
                        JupyterHub documentation for a list of available scopes
                      </Link>
                      .
                    </Small>
                  </div>

                  <div className="text-center">
                    <Button type="submit">Request new API token</Button>
                  </div>
                </form>
              </PanelContent>
            </Panel>
            {/* Generated Token Dialog */}
            <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
              <DialogContent showCloseButton>
                <DialogHeader>
                  <DialogTitle>Your new API Token</DialogTitle>
                  <DialogDescription>
                    Copy this token. You won't be able to see it again, but you
                    can always come back here to get a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4">
                  <Code className="block break-all rounded bg-muted p-3 text-sm font-mono border">
                    {generatedToken}
                  </Code>
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedToken!);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? "Copied!" : "Copy to clipboard"}
                  </Button>
                  <Button onClick={() => setShowTokenDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* API Tokens Table */}
            {isLoading ? (
              <P className="text-center text-gray-500">Loading tokens...</P>
            ) : (
              apiTokens.length > 0 && (
                <Panel className="mb-8">
                  <PanelHeader>Active API Tokens</PanelHeader>
                  <PanelContent>
                    <P className="text-gray-600 mb-4">
                      These are tokens with access to the JupyterHub API.
                      Permissions for each token may be viewed via the
                      JupyterHub tokens API. Revoking the API token for a
                      running server will require restarting that server.
                    </P>
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Note</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Last used</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell>{token.note || "—"}</TableCell>
                            <TableCell>
                              {token.scopes && token.scopes.length > 0 ? (
                                <details>
                                  <summary className="cursor-pointer text-blue-600">
                                    {token.scopes.length} scope
                                    {token.scopes.length !== 1 ? "s" : ""}
                                  </summary>
                                  {token.scopes.map((scope, idx) => (
                                    <Code
                                      key={idx}
                                      className="block text-xs bg-surface-raised p-1 m-1 rounded"
                                    >
                                      {scope}
                                    </Code>
                                  ))}
                                </details>
                              ) : (
                                <span className="text-text">No scopes</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {token.last_activity
                                ? new Date(token.last_activity).toLocaleString()
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              {token.created
                                ? new Date(token.created).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {token.expires_at
                                ? new Date(token.expires_at).toLocaleString()
                                : "Never"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleRevokeToken(token.id)}
                              >
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </PanelContent>
                </Panel>
              )
            )}

            {/* OAuth Clients Table */}
            {/* {isLoading ? (
              <P className="text-center text-gray-500">
                Loading authorized applications...
              </P>
            ) : oauthClients.length > 0 ? (
              <div>
                <H2>Authorized Applications</H2>
                <P className="text-gray-600 mb-4">
                  These are applications that use OAuth with JupyterHub to
                  identify users (mostly notebook servers). OAuth tokens can
                  generally only be used to identify you, not take actions on
                  your behalf.
                </P>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Last used</TableHead>
                      <TableHead>First authorized</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oauthClients.map((client) => {
                      const allScopes =
                        client.tokens
                          ?.flatMap((t) => t.scopes || [])
                          .filter(Boolean) || [];
                      const uniqueScopes = [...new Set(allScopes)];

                      // Decode URL-encoded description (e.g., %3A -> :)
                      const decodedDescription = client.description
                        ? (() => {
                            try {
                              return decodeURIComponent(client.description);
                            } catch (e) {
                              // If decoding fails, return the original description
                              return client.description;
                            }
                          })()
                        : "Unknown";

                      return (
                        <TableRow key={client.token_id}>
                          <TableCell>{decodedDescription}</TableCell>
                          <TableCell>
                            {uniqueScopes.length > 0 ? (
                              <details>
                                <summary className="cursor-pointer text-blue-600">
                                  {uniqueScopes.length} scope
                                  {uniqueScopes.length !== 1 ? "s" : ""}
                                </summary>
                                {uniqueScopes.map((scope, idx) => (
                                  <Code
                                    key={idx}
                                    className="block text-xs bg-gray-100 p-1 m-1 rounded"
                                  >
                                    {scope}
                                  </Code>
                                ))}
                              </details>
                            ) : (
                              <span className="text-gray-400">No scopes</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {client.last_activity
                              ? new Date(client.last_activity).toLocaleString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            {client.created
                              ? new Date(client.created).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeToken(client.token_id)}
                            >
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <P className="text-center text-gray-500">
                No authorized applications.
              </P>
            )} */}
          </ContentBody>
        </Content>
      </main>
      <Footer />
    </div>
  );
}

export default TokenPage;
