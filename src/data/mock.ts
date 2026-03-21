// 커밋 히트맵 데이터 생성 (최근 365일)
function generateHeatmapData() {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    // 주말은 적게, 평일은 많게
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const max = isWeekend ? 5 : 12;
    const rand = Math.random();
    let count = 0;
    if (rand > 0.3) count = Math.floor(Math.random() * max);
    data.push({ date: dateStr, count });
  }
  return data;
}

export const heatmapData = generateHeatmapData();

export type PRStatus = "open" | "merged" | "closed";

export interface PullRequest {
  id: number;
  title: string;
  repo: string;
  author: string;
  status: PRStatus;
  createdAt: string;
  reviewers: string[];
  additions: number;
  deletions: number;
  comments: number;
}

export const pullRequests: PullRequest[] = [
  {
    id: 1,
    title: "feat: 사용자 인증 모듈 추가",
    repo: "frontend-app",
    author: "kim-dev",
    status: "open",
    createdAt: "2026-03-20",
    reviewers: ["lee-dev", "park-dev"],
    additions: 342,
    deletions: 18,
    comments: 5,
  },
  {
    id: 2,
    title: "fix: 검색 결과 페이지네이션 버그 수정",
    repo: "api-server",
    author: "kim-dev",
    status: "merged",
    createdAt: "2026-03-18",
    reviewers: ["choi-dev"],
    additions: 45,
    deletions: 12,
    comments: 3,
  },
  {
    id: 3,
    title: "refactor: 데이터베이스 쿼리 최적화",
    repo: "api-server",
    author: "kim-dev",
    status: "merged",
    createdAt: "2026-03-15",
    reviewers: ["lee-dev", "jung-dev"],
    additions: 128,
    deletions: 95,
    comments: 8,
  },
  {
    id: 4,
    title: "docs: API 문서 업데이트",
    repo: "docs",
    author: "kim-dev",
    status: "closed",
    createdAt: "2026-03-14",
    reviewers: [],
    additions: 200,
    deletions: 50,
    comments: 1,
  },
  {
    id: 5,
    title: "feat: 다크모드 지원",
    repo: "frontend-app",
    author: "kim-dev",
    status: "open",
    createdAt: "2026-03-19",
    reviewers: ["park-dev"],
    additions: 89,
    deletions: 23,
    comments: 2,
  },
  {
    id: 6,
    title: "test: 결제 모듈 단위 테스트 추가",
    repo: "payment-service",
    author: "kim-dev",
    status: "merged",
    createdAt: "2026-03-12",
    reviewers: ["lee-dev"],
    additions: 567,
    deletions: 0,
    comments: 4,
  },
  {
    id: 7,
    title: "fix: 메모리 누수 해결",
    repo: "worker-service",
    author: "kim-dev",
    status: "merged",
    createdAt: "2026-03-10",
    reviewers: ["choi-dev", "jung-dev"],
    additions: 34,
    deletions: 78,
    comments: 12,
  },
  {
    id: 8,
    title: "feat: 실시간 알림 시스템 구현",
    repo: "notification-service",
    author: "kim-dev",
    status: "open",
    createdAt: "2026-03-21",
    reviewers: [],
    additions: 456,
    deletions: 12,
    comments: 0,
  },
];

export interface ReviewItem {
  id: number;
  prTitle: string;
  repo: string;
  author: string;
  requestedAt: string;
  urgency: "high" | "medium" | "low";
}

export const pendingReviews: ReviewItem[] = [
  {
    id: 1,
    prTitle: "feat: OAuth2 소셜 로그인",
    repo: "auth-service",
    author: "lee-dev",
    requestedAt: "2026-03-21",
    urgency: "high",
  },
  {
    id: 2,
    prTitle: "fix: 캐시 무효화 로직 수정",
    repo: "api-server",
    author: "park-dev",
    requestedAt: "2026-03-20",
    urgency: "medium",
  },
  {
    id: 3,
    prTitle: "refactor: 로깅 미들웨어 개선",
    repo: "api-server",
    author: "jung-dev",
    requestedAt: "2026-03-19",
    urgency: "low",
  },
  {
    id: 4,
    prTitle: "feat: CSV 내보내기 기능",
    repo: "frontend-app",
    author: "choi-dev",
    requestedAt: "2026-03-21",
    urgency: "high",
  },
];

export const weeklyCodeTime = [
  { day: "월", hours: 7.5 },
  { day: "화", hours: 8.2 },
  { day: "수", hours: 6.0 },
  { day: "목", hours: 9.1 },
  { day: "금", hours: 7.8 },
  { day: "토", hours: 3.2 },
  { day: "일", hours: 1.5 },
];

export const stats = {
  totalCommits: 1247,
  prMergeRate: 87.5,
  avgReviewTime: 4.2,
  activePRs: 3,
  linesAdded: 15420,
  linesDeleted: 8930,
  currentStreak: 14,
  longestStreak: 42,
};
