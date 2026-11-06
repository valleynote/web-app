"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Phase = "idle" | "loading" | "finishing";

function isInternalNavClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!(anchor instanceof HTMLAnchorElement)) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false;
  }

  return true;
}

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const routeKeyRef = useRef(routeKey);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };

    const start = () => {
      clearTimers();
      setPhase("loading");
      setProgress(12);
      trickleRef.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 88) return current;
          const remaining = 88 - current;
          return current + Math.max(0.6, remaining * 0.08);
        });
      }, 180);
      safetyTimerRef.current = setTimeout(() => {
        clearTimers();
        setPhase("finishing");
        setProgress(100);
        finishTimerRef.current = setTimeout(() => {
          setPhase("idle");
          setProgress(0);
        }, 220);
      }, 8000);
    };

    const finish = () => {
      clearTimers();
      setPhase((current) => (current === "idle" ? "idle" : "finishing"));
      setProgress((current) => (current === 0 ? 0 : 100));
      finishTimerRef.current = setTimeout(() => {
        setPhase("idle");
        setProgress(0);
      }, 220);
    };

    const onClick = (event: MouseEvent) => {
      if (isInternalNavClick(event)) start();
    };

    const onPopState = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;

    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }

    setPhase((current) => (current === "idle" ? "idle" : "finishing"));
    setProgress((current) => (current === 0 ? 0 : 100));
    finishTimerRef.current = setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 220);
  }, [routeKey]);

  if (phase === "idle") return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2px] overflow-hidden"
      aria-hidden
      role="presentation"
    >
      <div
        className="nav-progress-bar h-full origin-left rounded-r-full bg-blue"
        style={{
          width: `${progress}%`,
          opacity: phase === "finishing" ? 0 : 1,
          transition:
            phase === "finishing"
              ? "width 160ms ease-out, opacity 180ms ease 40ms"
              : "width 200ms ease-out",
        }}
      />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
