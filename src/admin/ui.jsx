import { useState } from "react";

export function StatusBadge({ value, label }) {
  const on = value === true;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label ?? (on ? "Yes" : "No")}
    </span>
  );
}

export function Modal({ open, title, onClose, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`flex max-h-[90vh] w-full ${width} flex-col rounded-2xl bg-white p-4 shadow-xl sm:p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <button onClick={onClose} className="text-navy/60 hover:text-navy" aria-label="Close">
            ✕
          </button>
        </div>
        {/* Scrollable body keeps action buttons reachable on short viewports */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function FormField({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-navy">{label}</label>
      {children}
      {hint && <p className="text-xs text-navy/60">{hint}</p>}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-navy/20 px-3 py-2 text-sm outline-none focus:border-royal ${
        props.className ?? ""
      }`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-navy/20 px-3 py-2 text-sm outline-none focus:border-royal ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-navy/20 px-3 py-2 text-sm outline-none focus:border-royal ${
        props.className ?? ""
      }`}
    />
  );
}

export function Button({ variant = "primary", children, ...rest }) {
  const base = "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-navy text-white hover:bg-royal"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : variant === "ghost"
          ? "border border-navy/20 text-navy hover:bg-soft-white"
          : "bg-soft-white text-navy hover:bg-navy/10";
  return (
    <button {...rest} className={`${base} ${styles} ${rest.className ?? ""}`}>
      {children}
    </button>
  );
}

export function Alert({ tone = "error", children, className = "" }) {
  const styles =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${styles} ${className}`}
    >
      {children}
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState(null);

  /**
   * Ask for confirmation before a destructive or public-visibility action.
   * options: { confirmLabel, cancelLabel, variant, title }
   */
  const confirm = (message, options = {}) =>
    new Promise((resolve) => {
      setState({
        message,
        title: options.title ?? "Please confirm",
        confirmLabel: options.confirmLabel ?? "Delete",
        cancelLabel: options.cancelLabel ?? "Cancel",
        variant: options.variant ?? "danger",
        resolve,
      });
    });

  const close = (result) => {
    setState((current) => {
      current?.resolve(result);
      return null;
    });
  };

  const dialog = state ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={state.title}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-base font-semibold text-navy">{state.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-navy/80">{state.message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => close(false)}>
            {state.cancelLabel}
          </Button>
          <Button variant={state.variant} onClick={() => close(true)}>
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}