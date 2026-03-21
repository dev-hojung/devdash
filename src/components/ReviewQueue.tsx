"use client";

import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";

const urgencyConfig = {
  high: { label: "긴급", color: "text-accent-red", dot: "bg-accent-red" },
  medium: { label: "보통", color: "text-accent-orange", dot: "bg-accent-orange" },
  low: { label: "낮음", color: "text-gray-400", dot: "bg-gray-400" },
};

const ReviewQueue = observer(function ReviewQueue() {
  const { pendingReviews } = dashboardStore;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">코드리뷰 대기</h2>
        <span className="rounded-full bg-accent-red/10 px-2.5 py-0.5 text-xs font-medium text-accent-red">
          {pendingReviews.length}건
        </span>
      </div>
      <div className="space-y-3">
        {pendingReviews.map((review) => {
          const cfg = urgencyConfig[review.urgency];
          return (
            <div
              key={review.id}
              className="rounded-lg border border-surface-border bg-surface p-4 transition-colors hover:border-gray-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-white">{review.prTitle}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {review.repo} &middot; {review.author}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">요청일: {review.requestedAt}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ReviewQueue;
