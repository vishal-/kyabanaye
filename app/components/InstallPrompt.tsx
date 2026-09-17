"use client";

import { useEffect, useState } from "react";
import { FiDownload, FiX, FiShare } from "react-icons/fi";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;

    if (isStandalone) return;

    // Check dismiss memory
    const dismissedTime = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't show again for 7 days
    }

    // Detect iOS
    const userAgent = nav.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);

    const timer = setTimeout(() => {
      setIsIos(ios);
      if (ios && !isStandalone) {
        setShowIosPrompt(true);
      }
    }, 0);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt && !showIosPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-bounce-in">
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-white p-1">
            <img
              src="/logo.png"
              alt="PlateSlate"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Install PlateSlate</h4>
            <p className="text-xs text-slate-300">
              {isIos
                ? "Add to your home screen"
                : "Fast access right from your home screen"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showPrompt && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 active:scale-95 cursor-pointer shadow-sm"
            >
              <FiDownload size={14} /> Install
            </button>
          )}

          {showIosPrompt && (
            <div className="flex items-center gap-1 rounded-2xl bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
              <FiShare size={13} className="text-emerald-400" /> Install
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Dismiss"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
