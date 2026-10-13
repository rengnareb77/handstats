/**
 * Format RFC 7807 / RFC 9457 Problem Details renvoyé par Spring Boot et FastAPI.
 */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  errors?: Record<string, string>;
  invalidFields?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Erreur typée pour les appels API HTTP.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly problemDetail?: ProblemDetail;
  readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    statusText: string,
    message: string,
    problemDetail?: ProblemDetail
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.problemDetail = problemDetail;
    this.fieldErrors =
      problemDetail?.errors || problemDetail?.invalidFields || {};
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const status = response.status;
    const statusText = response.statusText;
    let problemDetail: ProblemDetail | undefined;
    let rawText = "";

    try {
      rawText = await response.text();
      if (rawText) {
        problemDetail = JSON.parse(rawText) as ProblemDetail;
      }
    } catch {
      // Contenu non-JSON (ex: erreur 502/504 passerelle, page HTML)
    }

    const message =
      problemDetail?.detail ||
      problemDetail?.title ||
      (rawText && rawText.length < 300 ? rawText : `Erreur HTTP ${status}: ${statusText}`);

    return new ApiError(status, statusText, message, problemDetail);
  }
}
