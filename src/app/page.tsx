"use client";

import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";
import StatCard from "@/components/StatCard";
import CommitHeatmap from "@/components/CommitHeatmap";
import PRList from "@/components/PRList";
import ReviewQueue from "@/components/ReviewQueue";
import WeeklyChart from "@/components/WeeklyChart";

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

const Page = observer(function Page() {
  const { stats } = dashboardStore;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <header className="mb-8">
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
            <p className="text-sm text-gray-400">개발자 생산성 대시보드</p>
          </div>
        </div>
      </header>

      {/* 통계 카드 */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="총 커밋 수"
          value={stats.totalCommits.toLocaleString()}
          subtitle="올해 누적"
          icon={<GitCommitIcon />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="PR 머지율"
          value={`${stats.prMergeRate}%`}
          subtitle={`활성 PR ${stats.activePRs}개`}
          icon={<MergeIcon />}
          trend={{ value: 3.2, positive: true }}
        />
        <StatCard
          title="평균 리뷰 시간"
          value={`${stats.avgReviewTime}시간`}
          subtitle="최근 30일 기준"
          icon={<ClockIcon />}
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          title="연속 커밋"
          value={`${stats.currentStreak}일`}
          subtitle={`최장 ${stats.longestStreak}일`}
          icon={<FireIcon />}
          trend={{ value: 5, positive: true }}
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
