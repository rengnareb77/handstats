"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  LineChart, 
  Line
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function PlayerCharts({ 
  matches, 
  isGoalkeeper 
}: { 
  matches: any[];
  isGoalkeeper: boolean;
}) {
  const chartData = useMemo(() => {
    // Les matchs arrivent triés du plus récent au plus ancien, on les inverse pour la chronologie
    const chronological = [...matches].reverse();
    return chronological.map((m, index) => ({
      name: `J${index + 1}`,
      opponent: m.opponent,
      Buts: m.goals,
      Tirs: m.shots,
      Arrêts: m.saves
    }));
  }, [matches]);

  if (chartData.length === 0) return null;

  const chartConfig = isGoalkeeper 
    ? { Arrêts: { label: "Arrêts", color: "var(--color-chart-3)" } }
    : { 
        Buts: { label: "Buts", color: "var(--color-chart-3)" },
        Tirs: { label: "Tirs", color: "var(--color-chart-5)" }
      };

  return (
    <div className="mt-6 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Évolution sur la saison
      </h3>
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {isGoalkeeper ? "Arrêts par match" : "Tirs et Buts par match"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full mt-4">
            {isGoalkeeper ? (
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={10} 
                />
                <YAxis tickLine={false} axisLine={false} fontSize={10} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="Arrêts" 
                  fill="var(--color-chart-3)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={10} 
                />
                <YAxis tickLine={false} axisLine={false} fontSize={10} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line 
                  type="linear" 
                  dataKey="Tirs" 
                  stroke="var(--color-chart-5)" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-chart-5)", strokeWidth: 0 }}
                />
                <Line 
                  type="linear" 
                  dataKey="Buts" 
                  stroke="var(--color-chart-3)" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-chart-3)", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
