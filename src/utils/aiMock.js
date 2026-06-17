import { generateEnhancedInsights } from "./dataAnalysis.js";

export function answerDatasetQuestion({ question, datasetSummary, fieldInsights, qualityIssues, anomalies, stats, language }) {
  const normalized = question.trim().toLowerCase();
  const isChinese = language === "zh" || /[\u4e00-\u9fa5]/.test(question);

  if (!datasetSummary) {
    return isChinese
      ? "请先上传 CSV 数据集。我会基于字段识别、质量诊断、异常摘要和统计结果来回答问题。"
      : "Upload a CSV dataset first, then I can answer based on field insights, quality issues, anomalies, and summary statistics.";
  }

  if (matches(normalized, ["missing", "缺失", "质量", "quality"])) {
    const topIssue = qualityIssues?.[0];
    if (!topIssue) {
      return isChinese
        ? "当前没有发现明显的数据质量问题。建议仍然确认字段口径、关键指标定义和日期格式是否一致。"
        : "No major data quality issue was detected. You should still confirm field definitions, key metric logic, and date format consistency.";
    }

    return isChinese
      ? `当前最需要关注的数据质量问题是“${topIssue.issueType}”，影响字段为 ${topIssue.affectedColumn}。建议：${topIssue.suggestedFix}`
      : `The top data quality issue is "${topIssue.issueType}" affecting ${topIssue.affectedColumn}. Suggested fix: ${topIssue.suggestedFix}`;
  }

  if (matches(normalized, ["anomaly", "outlier", "异常", "可疑"])) {
    if (!anomalies?.length) {
      return isChinese
        ? "当前没有检测到明显异常点。建议结合活动日期、渠道维度或业务事件继续做交叉验证。"
        : "No obvious anomaly was detected. You can still review the data by campaign dates, channel dimensions, or business events.";
    }

    const first = anomalies[0];
    return isChinese
      ? `检测到 ${anomalies.length} 个异常信号。第一个异常位于第 ${first.row} 行，字段 ${first.column} 的值为 ${first.value}，方向为 ${first.direction}。`
      : `${anomalies.length} anomaly signal(s) were detected. The first one is row ${first.row}, column ${first.column}, value ${first.value}, direction: ${first.direction}.`;
  }

  if (matches(normalized, ["trend", "overall", "最高", "focus", "关注", "趋势", "metric", "指标"])) {
    const strongestMetric = datasetSummary.strongestMetric || stats?.[0];
    if (!strongestMetric) {
      return isChinese
        ? "当前缺少可分析的数值指标。建议补充销售额、订单数、成本或转化率等字段。"
        : "No numeric metric is available yet. Add fields like revenue, orders, cost, or conversion rate for trend analysis.";
    }

    return isChinese
      ? `建议优先关注 ${strongestMetric.column}。它的取值范围从 ${formatPlain(strongestMetric.min)} 到 ${formatPlain(strongestMetric.max)}，均值约为 ${formatPlain(strongestMetric.mean)}，适合作为下一步深入分析的核心指标。`
      : `Focus on ${strongestMetric.column}. It ranges from ${formatPlain(strongestMetric.min)} to ${formatPlain(strongestMetric.max)}, averaging about ${formatPlain(strongestMetric.mean)}, making it a strong metric for deeper review.`;
  }

  if (matches(normalized, ["field", "字段", "column", "列"])) {
    const metricCount = fieldInsights?.filter((field) => field.detectedType === "Numeric Metric").length || 0;
    const dateCount = fieldInsights?.filter((field) => field.detectedType === "Date Field").length || 0;
    const dimensionCount = fieldInsights?.filter((field) => field.detectedType === "Categorical Dimension").length || 0;

    return isChinese
      ? `字段结构上，当前识别到 ${metricCount} 个数值指标、${dateCount} 个日期字段和 ${dimensionCount} 个分类维度。建议先用日期字段观察趋势，再用分类维度拆分关键指标。`
      : `The dataset includes ${metricCount} numeric metric(s), ${dateCount} date field(s), and ${dimensionCount} categorical dimension(s). Start with trend analysis, then segment key metrics by dimensions.`;
  }

  const enhanced = generateEnhancedInsights(datasetSummary, isChinese ? "zh" : "en");
  return `${enhanced.fieldUnderstanding} ${enhanced.recommendedAnalysisPath} ${enhanced.nextStepRecommendation}`;
}

export function buildSuggestedQuestions(language) {
  if (language === "zh") {
    return [
      "这个数据集有什么数据质量问题？",
      "我应该重点关注哪一个指标？",
      "是否存在可疑异常？",
      "推荐的下一步分析路径是什么？",
    ];
  }

  return [
    "What data quality issues should I fix first?",
    "Which metric should I focus on?",
    "Are there any suspicious anomalies?",
    "What is the recommended analysis path?",
  ];
}

function matches(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function formatPlain(value) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}
