"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      expand
      visibleToasts={4}
      gap={12}
      toastOptions={{
        className: "valley-toast",
        classNames: {
          toast: "valley-toast",
          title: "valley-toast-title",
          description: "valley-toast-description",
          success: "valley-toast-success",
          error: "valley-toast-error",
          closeButton: "valley-toast-close",
        },
      }}
    />
  );
}
