import React, { useState, useEffect } from "react";
import { Lock, Key, ShieldCheck, ArrowRight, AlertTriangle, Eye, EyeOff, Check, Sparkles } from "lucide-react";

interface AccessGateProps {
  children: React.ReactNode;
}

export const DEFAULT_ACCESS_CODE = "CRANIUM2026";
export const ACCESS_STORAGE_KEY = "cranium_auth_token";
export const CUSTOM_PASSWORD_KEY = "cranium_custom_password";
export const GATE_ENABLED_KEY = "cranium_gate_enabled";

export function AccessGate({ children }: AccessGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If gate is explicitly disabled, auto-authenticate
    const isGateEnabled = localStorage.getItem(GATE_ENABLED_KEY) !== "disabled";
    if (!isGateEnabled) return true;
    return localStorage.getItem(ACCESS_STORAGE_KEY) === "granted";
  });

  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState("");
  const [keySuccessMsg, setKeySuccessMsg] = useState("");

  const getActivePassword = () => {
    return localStorage.getItem(CUSTOM_PASSWORD_KEY) || DEFAULT_ACCESS_CODE;
  };

  const handleUnlock = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const codeToTest = (directCode !== undefined ? directCode : inputCode).trim();
    const validPass = getActivePassword();

    if (codeToTest === validPass || codeToTest === DEFAULT_ACCESS_CODE) {
      localStorage.setItem(ACCESS_STORAGE_KEY, "granted");
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Access Denied: Invalid Authorization Key. Please verify or use the default code.");
    }
  };

  const handleQuickUnlock = () => {
    const activeKey = getActivePassword();
    handleUnlock(undefined, activeKey);
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomKey.trim().length < 4) {
      setErrorMsg("New key must be at least 4 characters long.");
      return;
    }
    localStorage.setItem(CUSTOM_PASSWORD_KEY, newCustomKey.trim());
    setKeySuccessMsg("Access Key successfully updated!");
    setInputCode(newCustomKey.trim());
    setTimeout(() => {
      setKeySuccessMsg("");
      setIsEditingKey(false);
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#050508] text-white flex items-center justify-center p-3 sm:p-4 relative overflow-y-auto custom-scrollbar font-sans select-none">
        {/* Background Ambient Glow & Blueprint Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 bg-[#0a0a0f] border border-amber-500/30 rounded-2xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] my-auto">
          {/* Header Icon Badge */}
          <div className="flex items-center justify-center mb-4 sm:mb-5">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
              <Lock className="w-6 sm:w-7 h-6 sm:h-7" />
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
              Confidential Technical Diligence Portal
            </span>
            <h1 className="text-xl font-black tracking-tight text-white mt-3 mb-1">
              CRANIUM SUBSTRATE™
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Protected cognitive governance environment & telemetry ledger. Enter your authorization key to proceed.
            </p>
          </div>

          {/* Unlock Form */}
          <form onSubmit={(e) => handleUnlock(e)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Authorization Key
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {isEditingKey ? "Cancel Key Edit" : "Configure Custom Key"}
                </button>
              </div>

              {!isEditingKey ? (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Enter access code..."
                    autoFocus
                    className="w-full bg-black/70 border border-white/15 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-2">
                  <span className="text-[11px] font-mono text-amber-300 font-bold block">
                    Set New Authorization Key:
                  </span>
                  <input
                    type="text"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    placeholder="Type new custom key..."
                    className="w-full bg-black/80 border border-white/20 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveCustomKey}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Save Key
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingKey(false)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-300 text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {keySuccessMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                <Check size={14} className="shrink-0 text-emerald-400" />
                <span>{keySuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              <span>Authorize & Enter Portal</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Unlock for Owner */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-xs font-mono text-neutral-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>One-Click Owner Unlock (Default: <strong className="text-amber-400">{getActivePassword()}</strong>)</span>
            </button>
            <span className="text-[10px] text-neutral-500">
              Active Key: <code className="text-neutral-400 font-mono">{getActivePassword()}</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
