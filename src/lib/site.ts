import { apiRequest } from "./api";

const DEFAULT_PERIOD_NAME = "2026-I";

type ActivePeriodResponse = {
  data?: {
    id: number;
    name: string;
  } | null;
};

export const ADMISSION_PROCESS_LABEL = `Concurso de admision ${DEFAULT_PERIOD_NAME}`;
export const HEADER_PROCESS_LABEL = `Inscripciones ${DEFAULT_PERIOD_NAME}`;

export type SiteLabels = {
  admissionProcessLabel: string;
  headerProcessLabel: string;
  periodName: string;
};

export function buildSiteLabels(periodName = DEFAULT_PERIOD_NAME): SiteLabels {
  return {
    admissionProcessLabel: `Concurso de admision ${periodName}`,
    headerProcessLabel: `Inscripciones ${periodName}`,
    periodName,
  };
}

export async function getActivePeriodName(): Promise<string> {
  try {
    const response = await apiRequest<ActivePeriodResponse>("/period-active", { cache: "no-store" });
    const periodName = response.data?.name?.trim();

    return periodName || DEFAULT_PERIOD_NAME;
  } catch {
    return DEFAULT_PERIOD_NAME;
  }
}

export async function getSiteLabels(): Promise<SiteLabels> {
  return buildSiteLabels(await getActivePeriodName());
}
