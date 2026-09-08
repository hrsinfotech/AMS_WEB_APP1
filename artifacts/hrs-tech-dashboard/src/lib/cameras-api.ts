export type CameraRecord = {
  id: number;
  name: string;
  cameraCode: string;
  department: string;
  zone: string;
  placement: string;
  streamUrl: string;
  health: "Online" | "Degraded" | "Offline";
  faceIdentification: "Enabled" | "Disabled" | "Unavailable";
  alertSeverity: "Green" | "Yellow" | "Red";
  alertsEnabled: boolean;
  photoEvidenceUrl: string;
};

export type CameraInput = Omit<CameraRecord, "id">;

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8086").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`Camera API request failed: ${response.status}`);
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export function listCameras(): Promise<CameraRecord[]> {
  return request<CameraRecord[]>("/api/cameras");
}

export function createCamera(input: CameraInput): Promise<CameraRecord> {
  return request<CameraRecord>("/api/cameras", { method: "POST", body: JSON.stringify(input) });
}

export function updateCamera(id: number, input: CameraInput): Promise<CameraRecord> {
  return request<CameraRecord>(`/api/cameras/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteCamera(id: number): Promise<void> {
  return request<void>(`/api/cameras/${id}`, { method: "DELETE" });
}
