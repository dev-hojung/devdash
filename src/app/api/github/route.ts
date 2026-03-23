import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DevDash",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function ghFetch(url: string) {
  const res = await fetch(url, { headers: headers(), next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── 커밋 히트맵 데이터 (GraphQL contributionsCollection 기반) ────────────
async function fetchCommitsViaGraphQL(username: string): Promise<{ date: string; count: number }[]> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username } }),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0]?.message ?? "Unknown error"}`);
  }

  const weeks: Array<{
    contributionDays: Array<{ contributionCount: number; date: string }>;
  }> = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

  const heatmap: { date: string; count: number }[] = [];
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      heatmap.push({ date: day.date, count: day.contributionCount });
    }
  }

  // 최근 365일 기준으로 필터링 및 정렬
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 364);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return heatmap
    .filter((d) => d.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── 커밋 히트맵 데이터 (REST Events API 폴백) ───────────────────────────
async function fetchCommitsViaEvents(username: string): Promise<{ date: string; count: number }[]> {
  const events: Array<{ type: string; created_at: string; payload: { commits?: unknown[] } }> = [];

  // 최대 10페이지 (300건)
  for (let page = 1; page <= 10; page++) {
    const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`;
    try {
      const data = await ghFetch(url);
      if (!Array.isArray(data) || data.length === 0) break;
      events.push(...data);
    } catch {
      break;
    }
  }

  // 날짜별 커밋 수 집계
  const commitMap: Record<string, number> = {};
  for (const ev of events) {
    if (ev.type === "PushEvent" && ev.payload.commits) {
      const date = ev.created_at.split("T")[0];
      commitMap[date] = (commitMap[date] || 0) + (ev.payload.commits as unknown[]).length;
    }
  }

  // 최근 365일 히트맵 데이터 생성
  const heatmap: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    heatmap.push({ date: dateStr, count: commitMap[dateStr] || 0 });
  }

  return heatmap;
}

async function fetchCommits(username: string) {
  try {
    return await fetchCommitsViaGraphQL(username);
  } catch {
    // GraphQL 실패 시 REST Events API로 폴백
    return await fetchCommitsViaEvents(username);
  }
}

// ─── PR 목록 ────────────────────────────────────────────────────────
async function fetchPRs(username: string) {
  const query = encodeURIComponent(`author:${username} type:pr sort:created-desc`);
  const url = `${GITHUB_API}/search/issues?q=${query}&per_page=20`;
  const data = await ghFetch(url);

  return (data.items || []).map(
    (item: {
      id: number;
      title: string;
      pull_request: { merged_at: string | null };
      state: string;
      created_at: string;
      comments: number;
      repository_url: string;
      user: { login: string };
      labels: Array<{ name: string }>;
    }) => {
      let status: "open" | "merged" | "closed" = "open";
      if (item.pull_request?.merged_at) {
        status = "merged";
      } else if (item.state === "closed") {
        status = "closed";
      }

      const repoName = item.repository_url.split("/").slice(-1)[0];

      return {
        id: item.id,
        title: item.title,
        repo: repoName,
        author: item.user.login,
        status,
        createdAt: item.created_at.split("T")[0],
        reviewers: [] as string[],
        additions: 0,
        deletions: 0,
        comments: item.comments,
      };
    }
  );
}

// ─── 통계 데이터 ────────────────────────────────────────────────────
async function fetchStats(username: string) {
  // PR 통계
  const allPRsQuery = encodeURIComponent(`author:${username} type:pr`);
  const mergedPRsQuery = encodeURIComponent(`author:${username} type:pr is:merged`);

  const [allPRsData, mergedPRsData, heatmap] = await Promise.all([
    ghFetch(`${GITHUB_API}/search/issues?q=${allPRsQuery}&per_page=1`),
    ghFetch(`${GITHUB_API}/search/issues?q=${mergedPRsQuery}&per_page=1`),
    fetchCommits(username),
  ]);

  const totalPRs = allPRsData.total_count || 0;
  const mergedPRs = mergedPRsData.total_count || 0;
  const prMergeRate = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 1000) / 10 : 0;

  const totalCommits = heatmap.reduce((sum: number, d: { count: number }) => sum + d.count, 0);

  // 활성 PR 수
  const openPRsQuery = encodeURIComponent(`author:${username} type:pr is:open`);
  const openPRsData = await ghFetch(`${GITHUB_API}/search/issues?q=${openPRsQuery}&per_page=1`);
  const activePRs = openPRsData.total_count || 0;

  // 연속 커밋 계산
  let currentStreak = 0;
  for (let i = heatmap.length - 1; i >= 0; i--) {
    if (heatmap[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let streak = 0;
  for (const d of heatmap) {
    if (d.count > 0) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  return {
    totalCommits,
    prMergeRate,
    avgReviewTime: 0,
    activePRs,
    linesAdded: 0,
    linesDeleted: 0,
    currentStreak,
    longestStreak,
  };
}

// ─── GET Handler ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const username = searchParams.get("username") || process.env.GITHUB_USERNAME;

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 503 });
  }

  try {
    switch (type) {
      case "commits":
        return NextResponse.json(await fetchCommits(username));
      case "prs":
        return NextResponse.json(await fetchPRs(username));
      case "stats":
        return NextResponse.json(await fetchStats(username));
      default:
        return NextResponse.json({ error: "Invalid type. Use: commits, prs, stats" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
