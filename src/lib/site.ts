import { apiRequest } from "./api";

type ActivePeriodResponse = {
  data?: {
    id: number;
    name: string;
  } | null;
};

export const ADMISSION_PROCESS_LABEL = "Concurso de admision";
export const HEADER_PROCESS_LABEL = "Inscripciones";

export type SiteLabels = {
  admissionProcessLabel: string;
  headerProcessLabel: string;
  periodName: string | null;
};

export function buildSiteLabels(periodName?: string | null): SiteLabels {
  const suffix = periodName?.trim() ? ` ${periodName.trim()}` : "";

  return {
    admissionProcessLabel: `${ADMISSION_PROCESS_LABEL}${suffix}`,
    headerProcessLabel: `${HEADER_PROCESS_LABEL}${suffix}`,
    periodName: periodName?.trim() || null,
  };
}

export async function getActivePeriodName(): Promise<string | null> {
  try {
    const response = await apiRequest<ActivePeriodResponse>("/period-active", { cache: "no-store" });
    const periodName = response.data?.name?.trim();

    return periodName || null;
  } catch {
    return null;
  }
}

export async function getSiteLabels(): Promise<SiteLabels> {
  return buildSiteLabels(await getActivePeriodName());
}
