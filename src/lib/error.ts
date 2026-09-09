export class ApiExceptionError extends Error {
  constructor(status: number = 400, message: string) {
    super(message);
  }
  
}