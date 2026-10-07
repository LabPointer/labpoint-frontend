export class ApiError extends Error {
  status: number;
  logout: boolean;

  constructor(message: string, status: number, logout?: boolean) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.logout = logout ?? false;
  }
}