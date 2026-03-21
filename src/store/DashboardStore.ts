import { makeAutoObservable, runInAction } from "mobx";
import {
  pullRequests as mockPullRequests,
  pendingReviews as mockPendingReviews,
  heatmapData as mockHeatmapData,
  weeklyCodeTime as mockWeeklyCodeTime,
  stats as mockStats,
  type PullRequest,
  type PRStatus,
  type ReviewItem,
} from "@/data/mock";

type LoadingState = "idle" | "loading" | "done" | "error";

class DashboardStore {
  prFilter: PRStatus | "all" = "all";
  pullRequests: PullRequest[] = mockPullRequests;
  pendingReviews: ReviewItem[] = mockPendingReviews;
  heatmapData = mockHeatmapData;
  weeklyCodeTime = mockWeeklyCodeTime;
  stats = mockStats;

  username = "";
  loadingState: LoadingState = "idle";
  errorMessage = "";
  isLive = false; // true이면 API 데이터, false이면 mock

  constructor() {
    makeAutoObservable(this);
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPRFilter(filter: PRStatus | "all") {
    this.prFilter = filter;
  }

  get filteredPRs(): PullRequest[] {
    if (this.prFilter === "all") return this.pullRequests;
    return this.pullRequests.filter((pr) => pr.status === this.prFilter);
  }

  get prCountByStatus() {
    return {
      all: this.pullRequests.length,
      open: this.pullRequests.filter((pr) => pr.status === "open").length,
      merged: this.pullRequests.filter((pr) => pr.status === "merged").length,
      closed: this.pullRequests.filter((pr) => pr.status === "closed").length,
    };
  }

  get totalCommitsThisYear() {
    return this.heatmapData.reduce((sum, d) => sum + d.count, 0);
  }

  resetToMock() {
    this.pullRequests = mockPullRequests;
    this.heatmapData = mockHeatmapData;
    this.stats = mockStats;
    this.isLive = false;
    this.loadingState = "idle";
    this.errorMessage = "";
  }

  async fetchFromGitHub(username?: string) {
    const target = username || this.username;
    if (!target.trim()) return;

    this.loadingState = "loading";
    this.errorMessage = "";

    try {
      const [commitsRes, prsRes, statsRes] = await Promise.all([
        fetch(`/api/github?type=commits&username=${encodeURIComponent(target)}`),
        fetch(`/api/github?type=prs&username=${encodeURIComponent(target)}`),
        fetch(`/api/github?type=stats&username=${encodeURIComponent(target)}`),
      ]);

      // 503이면 토큰 미설정 → mock 폴백
      if (commitsRes.status === 503 || prsRes.status === 503 || statsRes.status === 503) {
        runInAction(() => {
          this.resetToMock();
          this.errorMessage = "GitHub 토큰이 설정되지 않았습니다. Mock 데이터를 표시합니다.";
          this.loadingState = "done";
        });
        return;
      }

      if (!commitsRes.ok || !prsRes.ok || !statsRes.ok) {
        const errData = await (commitsRes.ok ? prsRes.ok ? statsRes : prsRes : commitsRes).json();
        throw new Error(errData.error || "API 호출 실패");
      }

      const [commits, prs, statsData] = await Promise.all([
        commitsRes.json(),
        prsRes.json(),
        statsRes.json(),
      ]);

      runInAction(() => {
        this.heatmapData = commits;
        this.pullRequests = prs;
        this.stats = statsData;
        this.isLive = true;
        this.loadingState = "done";
        this.username = target;
      });
    } catch (err) {
      runInAction(() => {
        this.loadingState = "error";
        this.errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
        // 에러 시 mock 데이터 유지
      });
    }
  }
}

const dashboardStore = new DashboardStore();
export default dashboardStore;
