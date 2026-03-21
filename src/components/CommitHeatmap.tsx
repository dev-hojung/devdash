"use client";

import { observer } from "mobx-react-lite";
import dashboardStore from "@/store/DashboardStore";

const CELL_SIZE = 13;
const GAP = 3;
const DAYS = ["", "월", "", "수", "", "금", ""];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function getColor(count: number): string {
  if (count === 0) return "#161b22";
  if (count <= 2) return "#0e4429";
  if (count <= 5) return "#006d32";
  if (count <= 8) return "#26a641";
  return "#39d353";
}

const CommitHeatmap = observer(function CommitHeatmap() {
  const data = dashboardStore.heatmapData;
  const totalCommits = dashboardStore.totalCommitsThisYear;

  // 주(week) 단위로 그룹핑
  const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
  let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];

  data.forEach((d) => {
    const date = new Date(d.date);
    const dow = date.getDay();
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push({ ...d, dayOfWeek: dow });
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // 월 라벨 위치 계산
  const monthLabels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = new Date(week[0].date);
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], x: wi * (CELL_SIZE + GAP) });
      lastMonth = month;
    }
  });

  const svgWidth = weeks.length * (CELL_SIZE + GAP) + 30;

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">커밋 히트맵</h2>
        <span className="text-sm text-gray-400">올해 총 {totalCommits}회 커밋</span>
      </div>
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={7 * (CELL_SIZE + GAP) + 30} className="block">
          {/* 월 라벨 */}
          {monthLabels.map((m, i) => (
            <text key={i} x={m.x + 30} y={10} fill="#8b949e" fontSize={10}>
              {m.label}
            </text>
          ))}
          {/* 요일 라벨 */}
          {DAYS.map((d, i) => (
            <text key={i} x={0} y={20 + i * (CELL_SIZE + GAP) + CELL_SIZE - 2} fill="#8b949e" fontSize={10}>
              {d}
            </text>
          ))}
          {/* 셀 */}
          {weeks.map((week, wi) =>
            week.map((day) => (
              <rect
                key={day.date}
                x={wi * (CELL_SIZE + GAP) + 30}
                y={day.dayOfWeek * (CELL_SIZE + GAP) + 16}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={getColor(day.count)}
              >
                <title>{`${day.date}: ${day.count}회 커밋`}</title>
              </rect>
            ))
          )}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-gray-500">
        <span>적게</span>
        {[0, 2, 5, 8, 12].map((n) => (
          <span
            key={n}
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: getColor(n) }}
          />
        ))}
        <span>많이</span>
      </div>
    </div>
  );
});

export default CommitHeatmap;
