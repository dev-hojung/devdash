import { makeAutoObservable } from "mobx";
import {
  pullRequests,
  pendingReviews,
  heatmapData,
  weeklyCodeTime,
  stats,
  type PullRequest,
  type PRStatus,
  type ReviewItem,
} from "@/data/mock";

class DashboardStore {
  prFilter: PRStatus | "all" = "all";
  pullRequests: PullRequest[] = pullRequests;
  pendingReviews: ReviewItem[] = pendingReviews;
  heatmapData = heatmapData;
  weeklyCodeTime = weeklyCodeTime;
  stats = stats;

  constructor() {
    makeAutoObservable(this);
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
}

const dashboardStore = new DashboardStore();
export default dashboardStore;
