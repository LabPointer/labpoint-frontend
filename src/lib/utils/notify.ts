import { toast } from "sonner";
import { ApiError } from "#/lib/types/error-types";

const base = { duration: 3000, position: "bottom-center" } as const;

export function notifySuccess(message: string) {
  toast.success(message, {
    ...base,
    style: { color: "white", backgroundColor: "green", borderColor: "green" },
  });
}

export function notifyError(error: unknown) {
  const message =
    error instanceof ApiError
      ? `Erro ${error.status}: ${error.message}`
      : error instanceof Error
        ? error.message
        : "Erro desconhecido.";

  toast.error(message, {
    ...base,
    style: { color: "white", backgroundColor: "red", borderColor: "red" },
  });
}
