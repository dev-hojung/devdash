"use client";

import { observer } from "mobx-react-lite";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dashboardStore from "@/store/DashboardStore";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm shadow-lg">
        <p className="text-gray-400">{label}요일</p>
        <p className="font-semibold text-white">{payload[0].value}시간</p>
      </div>
    );
  }
  return null;
};

const WeeklyChart = observer(function WeeklyChart() {
  const { weeklyCodeTime } = dashboardStore;
  const totalHours = weeklyCodeTime.reduce((s, d) => s + d.hours, 0).toFixed(1);

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">주간 코딩 시간</h2>
        <span className="text-sm text-gray-400">이번 주 총 {totalHours}시간</span>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyCodeTime} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#8b949e", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}h`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(88, 166, 255, 0.05)" }} />
            <Bar dataKey="hours" fill="#58a6ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default WeeklyChart;
