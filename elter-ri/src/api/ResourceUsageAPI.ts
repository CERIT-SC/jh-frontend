import axios from "axios";

/**
 * Resource usage metrics for a single server
 */
export interface ServerResourceUsage {
  cpu_usage_ratio: number;
  memory_usage_bytes: number;
  memory_limit_bytes: number;
}

/**
 * Resource usage data structure
 * Maps server name to its resource usage metrics
 */
export interface ResourceUsageData {
  [serverName: string]: ServerResourceUsage;
}

const RESOURCE_USAGE_URL = "/services/prometheus/usage";

export async function fetchResourceUsage(
  username: string,
): Promise<ResourceUsageData> {
  const response = await axios.get<ResourceUsageData>(RESOURCE_USAGE_URL, {
    params: { username },
  });
  return response.data;
}
