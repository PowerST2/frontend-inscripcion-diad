import { ApiError, apiRequest } from "./api";

type SystemDocumentResponse = {
  status: "success";
  path: string;
};

export async function getSystemDocumentUrl(code: string) {
  try {
    const response = await apiRequest<SystemDocumentResponse>(
      `/system-documents/${encodeURIComponent(code)}`,
      { cache: "no-store" }
    );

    return response.path || null;
  } catch (caughtError) {
    if (caughtError instanceof ApiError && caughtError.status === 404) {
      return null;
    }

    throw caughtError;
  }
}
