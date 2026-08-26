export type ApiUser = {
  id: number;
  initials: string;
  name: string;
  employeeId: string;
  department: string;
  title: string;
  accessGroup: string;
  type: "Employee" | "Contractor";
  status: "Active" | "Suspended";
  lastSeen: string;
};

export type CreateUserInput = {
  name: string;
  department: string;
  title: string;
  type: "Employee" | "Contractor";
};

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function listUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/api/users");
}

export async function createUser(input: CreateUserInput): Promise<ApiUser> {
  return request<ApiUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUserStatus(id: string, status: ApiUser["status"]): Promise<ApiUser> {
  return request<ApiUser>(`/api/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
