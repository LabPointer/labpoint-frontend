import type { UsageEntriesBody, UsageSession } from "#/lib/queries/usage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type UsageFormMode, UsageReportForm } from "./UsageReportForm";
import { UsageSessionSummary } from "./UsageSessionSummary";

type UsageFormDialogProps = {
  session: UsageSession;
  mode: UsageFormMode;
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (body: UsageEntriesBody) => Promise<unknown>;
  showAccount?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

/** Dialog com o cabeçalho da sessão e o formulário do relatório. O pai deve remontar (`key`) a cada abertura. */
export function UsageFormDialog({
  session,
  mode,
  title,
  description,
  submitLabel,
  open,
  onClose,
  onSubmit,
  showAccount = false,
  disabled,
  disabledReason,
}: UsageFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-md border bg-white/70 p-4 shadow-md backdrop-blur-xl sm:max-w-xl dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <UsageSessionSummary session={session} showAccount={showAccount} showWindows />
        <UsageReportForm
          session={session}
          mode={mode}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
          onCancel={onClose}
          disabled={disabled}
          disabledReason={disabledReason}
        />
      </DialogContent>
    </Dialog>
  );
}
