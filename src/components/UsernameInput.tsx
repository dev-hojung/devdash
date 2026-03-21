"use client";

import { useState } from "react";
import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";

const UsernameInput = observer(function UsernameInput() {
  const [input, setInput] = useState(dashboardStore.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      dashboardStore.fetchFromGitHub(input.trim());
    }
  };

  const handleReset = () => {
    setInput("");
    dashboardStore.setUsername("");
    dashboardStore.resetToMock();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="GitHub 유저네임"
          className="h-9 w-48 rounded-lg border border-surface-border bg-surface px-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={dashboardStore.loadingState === "loading" || !input.trim()}
        className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {dashboardStore.loadingState === "loading" ? (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            로딩중
          </span>
        ) : (
          "조회"
        )}
      </button>
      {dashboardStore.isLive && (
        <button
          type="button"
          onClick={handleReset}
          className="h-9 rounded-lg border border-surface-border bg-surface px-3 text-sm text-gray-400 transition-colors hover:text-white"
        >
          Mock
        </button>
      )}
    </form>
  );
});

export default UsernameInput;
