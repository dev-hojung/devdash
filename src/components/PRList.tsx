"use client";

import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";
import type { PRStatus } from "@/data/mock";

const statusConfig: Record<PRStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-accent-green", bg: "bg-accent-green/10" },
  merged: { label: "Merged", color: "text-accent-purple", bg: "bg-accent-purple/10" },
  closed: { label: "Closed", color: "text-accent-red", bg: "bg-accent-red/10" },
};

const filterButtons: { key: PRStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "open", label: "Open" },
  { key: "merged", label: "Merged" },
  { key: "closed", label: "Closed" },
];

const PRList = observer(function PRList() {
  const { filteredPRs, prFilter, prCountByStatus } = dashboardStore;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Pull Requests</h2>
        <span className="text-sm text-gray-400">{prCountByStatus.all}개</span>
      </div>

      {/* 필터 버튼 */}
      <div className="mb-4 flex gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => dashboardStore.setPRFilter(btn.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              prFilter === btn.key
                ? "bg-accent text-white"
                : "bg-surface text-gray-400 hover:text-white"
            }`}
          >
            {btn.label}
            <span className="ml-1 opacity-70">
              {prCountByStatus[btn.key]}
            </span>
          </button>
        ))}
      </div>

      {/* PR 카드 리스트 */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredPRs.map((pr) => {
          const cfg = statusConfig[pr.status];
          return (
            <div
              key={pr.id}
              className="rounded-lg border border-surface-border bg-surface p-4 transition-colors hover:border-gray-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-white">{pr.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {pr.repo} &middot; {pr.createdAt}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="text-accent-green">+{pr.additions}</span>
                <span className="text-accent-red">-{pr.deletions}</span>
                <span>{pr.comments}개 댓글</span>
                {pr.reviewers.length > 0 && (
                  <span>리뷰어: {pr.reviewers.join(", ")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PRList;
