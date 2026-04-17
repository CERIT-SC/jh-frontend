import axios from "axios";

const GRAFANA_BASE_URL = import.meta.env.VITE_GRAFANA_URL || "";

// Types
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

interface GrafanaFrame {
  schema: {
    refId: string;
    meta?: Record<string, unknown>;
    fields: Array<{
      name: string;
      type: string;
      config?: Record<string, unknown>;
    }>;
  };
  data: {
    values: Array<number[]>;
  };
}

interface GrafanaResult {
  frames: GrafanaFrame[];
}

interface GrafanaResponse {
  results: Record<string, GrafanaResult>;
}

interface QueryResult {
  value: number | null;
  timestamp?: number;
  raw?: unknown;
}

interface GrafanaQueryContext {
  userName?: string;
  podName?: string;
  namespace?: string;
}

type MetricName = string;

// GPU model types - supported GPU models in the cluster
// Add new models here as they become available
type GPUModel =
  | "NVIDIA-A10"
  | "NVIDIA-A40"
  | "NVIDIA-A100-80GB-PCIe"
  | "NVIDIA-H100-NVL"
  | "NVIDIA-H100-PCIe"
  | string;

// Predefined metric expressions factory
const MetricExpressions = {
  cpuUsage: (ctx: GrafanaQueryContext) =>
    `round(sum(container_cpu_usage_seconds_total{namespace="${ctx.namespace || `jupyterhub-${ctx.userName}-dev-ns`}", pod="${ctx.podName ? `jupyter-${ctx.userName}--${ctx.podName}` : ""}", container!="", image!=""}) by (container) * 100)`,

  memoryUsage: (ctx: GrafanaQueryContext) =>
    `round(sum(container_memory_working_set_bytes{namespace="${ctx.namespace || `jupyterhub-${ctx.userName}-dev-ns`}", pod="${ctx.podName ? `jupyter-${ctx.userName}--${ctx.podName}` : ""}", container!="", image!=""}) by (container) / 1048576)`,

  // Free GPUs - allocatable minus requested
  freeGPUs: (model?: GPUModel) =>
    model
      ? `(sum(kube_node_status_allocatable{resource="nvidia_com_gpu"} * on(node) kube_node_labels{label_nvidia_com_gpu_product="${model}"}) or vector(0)) - (sum(kube_pod_container_resource_requests:running{resource="nvidia_com_gpu"} * on(node) group_left kube_node_labels{label_nvidia_com_gpu_product="${model}"}) or vector(0))`
      : `(sum(kube_node_status_allocatable{resource="nvidia_com_gpu"}) or vector(0)) - (sum(kube_pod_container_resource_requests:running{resource="nvidia_com_gpu"}) or vector(0))`,

  // Total GPUs - allocatable (available capacity)
  totalGPUs: (model?: GPUModel) =>
    model
      ? `sum(kube_node_status_allocatable{resource="nvidia_com_gpu"} * on(node) kube_node_labels{label_nvidia_com_gpu_product="${model}"}) or vector(0)`
      : `sum(kube_node_status_allocatable{resource="nvidia_com_gpu"}) or vector(0)`,
};

/**
 * Grafana Query Builder
 *
 * @example
 * // Single query
 * const result = await new GrafanaQuery({ userName: 'john', podName: 'pod-123' })
 *   .cpuUsage()
 *   .execute();
 *
 * @example
 * // Multiple queries
 * const result = await new GrafanaQuery({ userName: 'john' })
 *   .cpuUsage()
 *   .freeGPUs()
 *   .execute();
 *
 * @example
 * // Custom query
 * const result = await new GrafanaQuery()
 *   .query('sum(kube_node_status_allocatable{resource="nvidia_com_gpu"})', 'customMetric')
 *   .execute();
 */
export class GrafanaQuery {
  private queries: Array<{
    expr: string;
    refId: string;
    name: string;
  }> = [];
  private context: GrafanaQueryContext;
  private timeRange: { from: string; to: string };
  private refIdCounter = 0;

  constructor(
    context?: GrafanaQueryContext,
    timeRange?: { from: string; to: string },
  ) {
    this.context = context || {};
    this.timeRange = timeRange || { from: "now-5m", to: "now" };
  }

  /**
   * Generate unique refId for each query
   */
  private generateRefId(): string {
    return String.fromCharCode(65 + (this.refIdCounter++ % 26)); // A, B, C, ...
  }

  /**
   * Add CPU usage metric
   */
  cpuUsage(): this {
    const refId = this.generateRefId();
    this.queries.push({
      expr: MetricExpressions.cpuUsage(this.context),
      refId,
      name: "cpuUsage",
    });
    return this;
  }

  /**
   * Add memory usage metric (in MB)
   */
  memoryUsage(): this {
    const refId = this.generateRefId();
    this.queries.push({
      expr: MetricExpressions.memoryUsage(this.context),
      refId,
      name: "memoryUsage",
    });
    return this;
  }

  /**
   * Add free GPUs metric
   * @param model - GPU model type (e.g., "NVIDIA-A10", "NVIDIA-A40"). If not provided, returns total free GPUs across all models.
   */
  freeGPUs(model?: GPUModel): this {
    const refId = this.generateRefId();
    const metricName = model
      ? `freeGPUs_${model.replace(/-/g, "_")}`
      : "freeGPUs";
    this.queries.push({
      expr: MetricExpressions.freeGPUs(model),
      refId,
      name: metricName,
    });
    return this;
  }

  /**
   * Add total GPUs metric
   * @param model - GPU model type (e.g., "NVIDIA-A10", "NVIDIA-A40"). If not provided, returns total GPUs across all models.
   */
  totalGPUs(model?: GPUModel): this {
    const refId = this.generateRefId();
    const metricName = model
      ? `totalGPUs_${model.replace(/-/g, "_")}`
      : "totalGPUs";
    this.queries.push({
      expr: MetricExpressions.totalGPUs(model),
      refId,
      name: metricName,
    });
    return this;
  }

  /**
   * Add custom query with expression
   * @param expr - Prometheus query expression
   * @param name - Optional name for the result (defaults to refId)
   */
  query(expr: string, name?: string): this {
    const refId = this.generateRefId();
    this.queries.push({
      expr,
      refId,
      name: name || refId,
    });
    return this;
  }

  /**
   * Set time range for queries
   */
  setTimeRange(from: string, to: string): this {
    this.timeRange = { from, to };
    return this;
  }

  /**
   * Set/update context
   */
  setContext(context: Partial<GrafanaQueryContext>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Execute all queued queries and return named results
   */
  async execute(): Promise<Record<MetricName, QueryResult>> {
    if (this.queries.length === 0) {
      throw new Error(
        "No queries added. Use .cpuUsage(), .freeGPUs(), or .query() before execute()",
      );
    }

    const payload: GrafanaQueryPayload = {
      queries: this.queries.map((q) => ({
        datasource: {
          type: "prometheus",
          uid: "prometheus",
        },
        expr: q.expr,
        format: "table",
        instant: true,
        refId: q.refId,
      })),
      from: this.timeRange.from,
      to: this.timeRange.to,
    };

    try {
      const response = await axios.post(
        `${GRAFANA_BASE_URL}/api/ds/query`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const results: Record<MetricName, QueryResult> = {};

      // Map results by name instead of refId
      for (const query of this.queries) {
        const queryResult = response.data.results?.[query.refId];

        if (!queryResult) {
          results[query.name] = { value: null };
          continue;
        }

        const frames = queryResult.frames || [];
        const firstFrame = frames[0];

        if (!firstFrame?.data?.values) {
          results[query.name] = { value: null, raw: queryResult };
          continue;
        }

        const values = firstFrame.data.values;
        const timestamps = values[0] || [];
        const dataValues = values[1] || [];

        results[query.name] = {
          value: dataValues[0] ?? null,
          timestamp: timestamps[0] ?? undefined,
          raw: queryResult,
        };
      }

      return results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Grafana query error:",
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error("Unknown error:", error);
      }
      throw error;
    }
  }

  /**
   * Get the raw payload that would be sent (useful for debugging)
   */
  getPayload(): GrafanaQueryPayload {
    return {
      queries: this.queries.map((q) => ({
        datasource: {
          type: "prometheus",
          uid: "prometheus",
        },
        expr: q.expr,
        format: "table",
        instant: true,
        refId: q.refId,
      })),
      from: this.timeRange.from,
      to: this.timeRange.to,
    };
  }
}

// Legacy functions for backward compatibility

/**
 * @deprecated Use GrafanaQuery builder instead
 */
export async function fetchGrafanaData(userName?: string, podName?: string) {
  const expr = `round(sum(container_memory_working_set_bytes{namespace="jupyterhub-${userName}-dev-ns", pod="jupyter-${userName}--${podName}", container!="", image!=""}) by (container) / 1048576)`;
  return await fetchGrafana(expr);
}

/**
 * @deprecated Use GrafanaQuery builder instead
 */
export async function fetchGrafana(
  expr: string,
  timeRange?: { from: string; to: string },
) {
  const payload: GrafanaQueryPayload = {
    queries: [
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus",
        },
        expr: expr,
        format: "table",
        instant: true,
        refId: "A",
      },
    ],
    from: timeRange?.from || "now-5m",
    to: timeRange?.to || "now",
  };

  try {
    const response = await axios.post(
      `services/grafana/api/ds/query`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const res = Object.values(response.data.results)[0] as
      | GrafanaResult
      | undefined;
    const firstValue = res?.frames?.[0]?.data?.values?.[1]?.[0];
    console.log("First value:", firstValue);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios chyba pri dopytovaní Grafany:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}
