"use client";

import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";
import StatCard from "@/components/StatCard";
import CommitHeatmap from "@/components/CommitHeatmap";
import PRList from "@/components/PRList";
import ReviewQueue from "@/components/ReviewQueue";
import WeeklyChart from "@/components/WeeklyChart";
import UsernameInput from "@/components/UsernameInput";

const GitCommitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="1.05" y1="12" x2="7" y2="12" />
    <line x1="17.01" y1="12" x2="22.96" y2="12" />
  </svg>
);

const MergeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-8">
      <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-400">GitHub 데이터를 불러오는 중...</p>
    </div>
  </div>
);

const Page = observer(function Page() {
  const { stats, loadingState, errorMessage, isLive } = dashboardStore;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {loadingState === "loading" && <LoadingOverlay />}

      {/* 헤더 */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DevDash</h1>
              <p className="text-sm text-gray-400">
                개발자 생산성 대시보드
                {isLive && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-0.5 text-xs text-accent-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    Live
                  </span>
                )}
              </p>
            </div>
          </div>
          <UsernameInput />
        </div>
      </header>

      {/* 에러/경고 메시지 */}
      {errorMessage && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            loadingState === "error"
              ? "border-accent-red/30 bg-accent-red/5 text-accent-red"
              : "border-accent-orange/30 bg-accent-orange/5 text-accent-orange"
          }`}
        >
          {errorMessage}
        </div>
      )}

      {/* 통계 카드 */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="총 커밋 수"
          value={stats.totalCommits.toLocaleString()}
          subtitle="올해 누적"
          icon={<GitCommitIcon />}
          trend={isLive ? undefined : { value: 12, positive: true }}
        />
        <StatCard
          title="PR 머지율"
          value={`${stats.prMergeRate}%`}
          subtitle={`활성 PR ${stats.activePRs}개`}
          icon={<MergeIcon />}
          trend={isLive ? undefined : { value: 3.2, positive: true }}
        />
        <StatCard
          title="평균 리뷰 시간"
          value={stats.avgReviewTime > 0 ? `${stats.avgReviewTime}시간` : "-"}
          subtitle="최근 30일 기준"
          icon={<ClockIcon />}
          trend={isLive ? undefined : { value: 8, positive: false }}
        />
        <StatCard
          title="연속 커밋"
          value={`${stats.currentStreak}일`}
          subtitle={`최장 ${stats.longestStreak}일`}
          icon={<FireIcon />}
          trend={isLive ? undefined : { value: 5, positive: true }}
        />
      </section>

      {/* 커밋 히트맵 */}
      <section className="mb-6">
        <CommitHeatmap />
      </section>

      {/* 하단 그리드: PR 목록 + 사이드바 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PRList />
          <WeeklyChart />
        </div>
        <div>
          <ReviewQueue />
        </div>
      </section>
    </div>
  );
});

export default Page;
