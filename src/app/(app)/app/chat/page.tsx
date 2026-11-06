import { Suspense } from "react";
import AskChat from "@/components/app/AskChat";

export const metadata = { title: "AI Agent — ValleyNote" };

export default function ChatPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center p-8">
              <p className="font-switzer text-muted">Loading assistant…</p>
            </div>
          }
        >
          <AskChat />
        </Suspense>
      </div>
    </div>
  );
}
