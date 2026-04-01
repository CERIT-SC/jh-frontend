import axios from "axios";

interface GrafanaQueryPayload {
  queries: Array<{
    datasource: { type: string; uid: string };
    expr: string;
    format: string;
    instant: boolean;
    refId: string;
  }>;
  from: string;
  to: string;
}

export async function fetchGrafanaData(userName?: string, podName?: string) {
  const payload: GrafanaQueryPayload = {
    queries: [
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus",
        },
        expr: `round(sum(container_memory_working_set_bytes{namespace=\"jupyterhub-${userName}-dev-ns\", pod=\"jupyter-${userName}--${podName}\", container!=\"\", image!=\"\"}) by (container) / 1048576)`,
        format: "table",
        instant: true,
        refId: "A",
      },
    ],
    from: "now-5m",
    to: "now",
  };

  try {
    const response = await axios.post("/api/ds/query", payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
    });
    console.log(response.data.results.A.frames[0].data.values[1]);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios chyba pri dopytovaní Grafany:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Neznáma chyba:", error);
    }
    throw error;
  }
}

export async function fetchActualCpuUsage(apiToken?: string) {
  const payload: GrafanaQueryPayload = {
    queries: [
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus",
        },
        expr: `round(sum(container_memory_working_set_bytes{namespace=\"jupyterhub-xbencs00-dev-ns\", pod=\"jupyter-xbencs00--test-server\", container!=\"\", image!=\"\"}) by (container) / 1048576)`,
        format: "table",
        instant: true,
        refId: "A",
      },
    ],
    from: "now-5m",
    to: "now",
  };

  try {
    const response = await axios.post("/api/ds/query", payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
    });

    console.log("Dáta úspešne stiahnuté!");
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios chyba pri dopytovaní Grafany:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Neznáma chyba:", error);
    }
    throw error;
  }
}

// === Príklad použitia ===
// fetchActualCpuUsage('http://localhost:3000', 'glsa_tvoj_grafana_token_12345');
