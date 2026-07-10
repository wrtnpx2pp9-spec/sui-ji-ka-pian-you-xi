import type { DemoScript } from "./types";

export type EndingScore = {
  score: number;
  rank: string;
  note: string;
};

function isRiskStat(key: string, name: string) {
  const text = `${key} ${name}`.toLowerCase();
  return text.includes("risk") || text.includes("风险");
}

export function getEndingScore(
  script: DemoScript,
  stats: Record<string, number>,
): EndingScore {
  const visibleStats = script.stats.filter((stat) => stat.visible);

  if (visibleStats.length === 0) {
    return {
      score: 60,
      rank: "完成",
      note: "你抵达了一个结局。继续尝试其他分支，可以看见不同代价和结果。",
    };
  }

  const total = visibleStats.reduce((sum, stat) => {
    const value = Math.max(0, Math.min(100, stats[stat.key] ?? stat.initialValue));
    return sum + (isRiskStat(stat.key, stat.name) ? 100 - value : value);
  }, 0);
  const score = Math.round(total / visibleStats.length);

  if (score >= 85) {
    return {
      score,
      rank: "清醒结局",
      note: "你的选择保留了较多主动权，也让局面朝更稳的方向收束。",
    };
  }

  if (score >= 65) {
    return {
      score,
      rank: "可控结局",
      note: "你避开了一部分风险，但仍有一些代价留在了故事里。",
    };
  }

  if (score >= 45) {
    return {
      score,
      rank: "摇摆结局",
      note: "你的选择让剧情继续推进，但局面里还有明显的不确定和压力。",
    };
  }

  return {
    score,
    rank: "高风险结局",
    note: "这条路线付出了较高代价。重新开始时，可以尝试更早求证或换一条走向。",
  };
}
