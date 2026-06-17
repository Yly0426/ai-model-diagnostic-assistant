export function analyzeRows(rows) {
  if (!rows.length) {
    return {
      columns: [],
      rowCount: 0,
      numericColumns: [],
      stats: [],
      chartData: [],
      anomalies: [],
      anomalyDetails: [],
      fieldInsights: [],
      qualityIssues: [],
      chartRecommendations: [],
      datasetSummary: null,
      enhancedInsights: null,
      insight: null,
      rows: [],
    };
  }

  const columns = Object.keys(rows[0]);
  const fieldInsights = detectFieldTypes(rows);
  const numericColumns = fieldInsights
    .filter((field) => field.detectedType === "Numeric Metric")
    .map((field) => field.name);

  const stats = numericColumns.map((column) => {
    const values = rows.map((row) => parseNumber(row[column])).filter(Number.isFinite);
    const missing = rows.length - values.length;
    const mean = average(values);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const std = standardDeviation(values, mean);

    return {
      column,
      mean,
      min,
      max,
      missing,
      std,
    };
  });

  const primaryColumn = numericColumns[0];
  const dateColumn = fieldInsights.find((field) => field.detectedType === "Date Field")?.name;

  const chartData = primaryColumn
    ? rows.slice(0, 28).map((row, index) => ({
        label: dateColumn ? formatDateLabel(row[dateColumn], index) : `Row ${index + 1}`,
        value: parseNumber(row[primaryColumn]) || 0,
      }))
    : [];

  const anomalyDetails = getAnomalyDetails(rows, stats);
  const anomalies = anomalyDetails.map(({ row, column, value, direction }) => ({
    row,
    column,
    value,
    direction,
  }));
  const qualityIssues = checkDataQuality(rows, fieldInsights, stats);
  const chartRecommendations = recommendCharts(rows, fieldInsights);
  const datasetSummary = buildDatasetSummary(rows, stats, fieldInsights, qualityIssues, anomalies);
  const enhancedInsights = generateEnhancedInsights(datasetSummary, "en");
  const insight = buildInsight(rows.length, columns.length, stats, anomalies, datasetSummary);

  return {
    columns,
    rowCount: rows.length,
    numericColumns,
    stats,
    chartData,
    anomalies,
    anomalyDetails,
    fieldInsights,
    qualityIssues,
    chartRecommendations,
    datasetSummary,
    enhancedInsights,
    insight,
    rows,
  };
}

export function cleanDataset(rows, action, options = {}) {
  if (!rows?.length) return [];

  if (action === "removeDuplicates") {
    const seen = new Set();
    return rows.filter((row) => {
      const signature = JSON.stringify(row);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }

  if (action === "fillMissingMedian") {
    const numericColumns = options.numericColumns || [];
    const medians = {};
    numericColumns.forEach((column) => {
      const values = rows.map((row) => parseNumber(row[column])).filter(Number.isFinite).sort((a, b) => a - b);
      medians[column] = median(values);
    });

    return rows.map((row) => {
      const next = { ...row };
      numericColumns.forEach((column) => {
        if (isMissing(next[column]) && Number.isFinite(medians[column])) {
          next[column] = String(medians[column]);
        }
      });
      return next;
    });
  }

  if (action === "fillMissingUnknown") {
    return rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, isMissing(value) ? "Unknown" : value]))
    );
  }

  if (action === "standardizeDates") {
    const dateColumns = options.dateColumns || [];
    return rows.map((row) => {
      const next = { ...row };
      dateColumns.forEach((column) => {
        if (!isMissing(next[column]) && isParseableDate(next[column])) {
          next[column] = new Date(next[column]).toISOString().slice(0, 10);
        }
      });
      return next;
    });
  }

  return rows;
}

export function buildReportMarkdown(analysis, language = "en") {
  const summary = analysis?.datasetSummary;
  const insights = generateEnhancedInsights(summary, language);
  const title = language === "zh" ? "AI 数据分析报告" : "AI Data Analysis Report";

  if (!summary || !insights) {
    return `# ${title}\n\n${language === "zh" ? "请先上传数据集。" : "Upload a dataset first."}`;
  }

  const qualityItems = (analysis.qualityIssues || [])
    .slice(0, 8)
    .map((issue) => `- [${issue.severity}] ${issue.issueType} - ${issue.affectedColumn}: ${issue.description}`)
    .join("\n");
  const chartItems = (analysis.chartRecommendations || [])
    .map((item) => `- ${item.chartType}: ${item.xAxis} → ${item.yAxis}. ${item.reason}`)
    .join("\n");

  return [
    `# ${title}`,
    "",
    `## Dataset Summary`,
    `- Rows: ${summary.rowCount}`,
    `- Columns: ${summary.columnCount}`,
    `- Numeric Metrics: ${summary.numericMetricCount}`,
    `- Quality Issues: ${summary.qualityIssueCount}`,
    `- Anomalies: ${summary.anomalyCount}`,
    "",
    `## AI Insight`,
    `- ${insights.dataQualitySummary}`,
    `- ${insights.fieldUnderstanding}`,
    `- ${insights.recommendedAnalysisPath}`,
    `- ${insights.keyRisk}`,
    `- ${insights.nextStepRecommendation}`,
    "",
    `## Data Quality Issues`,
    qualityItems || "- No obvious issue detected.",
    "",
    `## Chart Recommendations`,
    chartItems || "- No chart recommendation available.",
  ].join("\n");
}

export function detectFieldTypes(data) {
  if (!data.length) return [];

  const columns = Object.keys(data[0]);

  return columns.map((column) => {
    const values = data.map((row) => row[column]);
    const filledValues = values.filter((value) => !isMissing(value));
    const uniqueValues = new Set(filledValues.map((value) => normalizeValue(value)));
    const missingValues = values.length - filledValues.length;
    const numericRatio = ratio(filledValues, (value) => Number.isFinite(parseNumber(value)));
    const dateRatio = ratio(filledValues, (value) => isParseableDate(value));
    const longTextRatio = ratio(filledValues, (value) => String(value).trim().length > 60);
    const uniqueRatio = filledValues.length ? uniqueValues.size / filledValues.length : 0;
    const lowerName = column.toLowerCase();

    let detectedType = "Unknown Field";
    if (/(date|time|day|month|year)/i.test(lowerName) || dateRatio >= 0.7) {
      detectedType = "Date Field";
    } else if (numericRatio >= 0.75) {
      detectedType = "Numeric Metric";
    } else if (/(^id$|_id$|id_|user|order|session|uuid|key)/i.test(lowerName) || uniqueRatio >= 0.88) {
      detectedType = "ID Field";
    } else if (longTextRatio >= 0.35) {
      detectedType = "Text Field";
    } else if (uniqueValues.size <= Math.max(12, filledValues.length * 0.18)) {
      detectedType = "Categorical Dimension";
    }

    return {
      name: column,
      detectedType,
      uniqueValues: uniqueValues.size,
      missingValues,
      exampleValue: filledValues[0] ?? "",
      uniqueRatio,
      numericRatio,
      dateRatio,
      aiExplanation: buildFieldExplanation(detectedType),
    };
  });
}

export function checkDataQuality(data, fieldInsights, stats = []) {
  if (!data.length) return [];

  const issues = [];
  const rowCount = data.length;
  const duplicateRows = countDuplicateRows(data);

  if (duplicateRows > 0) {
    issues.push({
      severity: "High",
      issueType: "Duplicate rows",
      affectedColumn: "All columns",
      description: `${duplicateRows} duplicate row${duplicateRows > 1 ? "s were" : " was"} detected in the dataset.`,
      suggestedFix: "Review duplicated records before analysis. Keep the latest record or deduplicate by a reliable business key.",
    });
  }

  fieldInsights.forEach((field) => {
    const missingRate = rowCount ? field.missingValues / rowCount : 0;
    if (field.missingValues > 0) {
      issues.push({
        severity: missingRate > 0.35 ? "High" : "Medium",
        issueType: missingRate > 0.35 ? "Column with too many missing values" : "Missing values",
        affectedColumn: field.name,
        description: `${field.missingValues} missing value${field.missingValues > 1 ? "s" : ""} found (${formatPercent(missingRate)} of rows).`,
        suggestedFix:
          field.detectedType === "Numeric Metric"
            ? "Consider filling missing values with median if this metric is important for analysis."
            : "Consider labeling missing categories as Unknown or removing rows when the field is required.",
      });
    }

    if (field.detectedType === "Date Field") {
      const invalidDates = data.filter((row) => !isMissing(row[field.name]) && !isParseableDate(row[field.name])).length;
      if (invalidDates > 0) {
        issues.push({
          severity: "Medium",
          issueType: "Date parsing issues",
          affectedColumn: field.name,
          description: `${invalidDates} value${invalidDates > 1 ? "s" : ""} could not be parsed as a valid date.`,
          suggestedFix: "Normalize this column to ISO date format before time-series analysis.",
        });
      }
    }

    if (field.detectedType === "Numeric Metric") {
      const nonNumericFilled = data.filter((row) => !isMissing(row[field.name]) && !Number.isFinite(parseNumber(row[field.name]))).length;
      if (nonNumericFilled > 0) {
        issues.push({
          severity: "Medium",
          issueType: "Mixed type values",
          affectedColumn: field.name,
          description: `${nonNumericFilled} filled value${nonNumericFilled > 1 ? "s are" : " is"} not numeric inside a numeric metric column.`,
          suggestedFix: "Standardize numeric formatting and remove text symbols before modeling or charting.",
        });
      }
    }
  });

  stats.forEach((stat) => {
    const outliers = data.filter((row) => {
      const value = parseNumber(row[stat.column]);
      return Number.isFinite(value) && stat.std > 0 && Math.abs(value - stat.mean) > 3 * stat.std;
    });

    if (outliers.length) {
      issues.push({
        severity: "Low",
        issueType: "Numeric columns with extreme values",
        affectedColumn: stat.column,
        description: `${outliers.length} extreme value${outliers.length > 1 ? "s" : ""} sit outside three standard deviations.`,
        suggestedFix: "Validate whether these are true business spikes, campaign effects, or data entry issues.",
      });
    }
  });

  return issues.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

export function recommendCharts(data, fieldInsights) {
  const dateFields = fieldInsights.filter((field) => field.detectedType === "Date Field");
  const numericFields = fieldInsights.filter((field) => field.detectedType === "Numeric Metric");
  const categoryFields = fieldInsights.filter((field) => field.detectedType === "Categorical Dimension");
  const recommendations = [];

  if (dateFields[0] && numericFields[0]) {
    recommendations.push({
      chartType: "Line Chart / Area Chart",
      xAxis: dateFields[0].name,
      yAxis: numericFields[0].name,
      reason: "A date field paired with a numeric metric is ideal for showing movement over time.",
      businessUseCase: "Track growth, seasonality, campaign lift, or operational performance trends.",
    });
  }

  if (categoryFields[0] && numericFields[0]) {
    recommendations.push({
      chartType: "Bar Chart",
      xAxis: categoryFields[0].name,
      yAxis: numericFields[0].name,
      reason: "A categorical dimension can group numeric values into comparable segments.",
      businessUseCase: "Compare performance by channel, region, product, customer group, or status.",
    });
  }

  if (numericFields.length >= 2) {
    recommendations.push({
      chartType: "Scatter Plot",
      xAxis: numericFields[0].name,
      yAxis: numericFields[1].name,
      reason: "Two numeric metrics can reveal correlation, clustering, and unusual relationships.",
      businessUseCase: "Explore whether one KPI may explain changes in another KPI.",
    });
  }

  if (categoryFields[0]) {
    recommendations.push({
      chartType: "Pie / Donut Chart",
      xAxis: categoryFields[0].name,
      yAxis: "Record count",
      reason: "Category counts can show share of total when there are a limited number of groups.",
      businessUseCase: "Summarize composition such as segment mix, status distribution, or source share.",
    });
  }

  if (numericFields[0]) {
    recommendations.push({
      chartType: "Histogram",
      xAxis: numericFields[0].name,
      yAxis: "Frequency",
      reason: "A single numeric metric can be profiled by distribution and concentration.",
      businessUseCase: "Understand normal ranges, skewness, and values that may require investigation.",
    });
  }

  return recommendations.slice(0, 5);
}

export function buildDatasetSummary(data, stats, fieldInsights, qualityIssues, anomalies) {
  const rowCount = data.length;
  const columnCount = fieldInsights.length;
  const typeCounts = fieldInsights.reduce((acc, field) => {
    acc[field.detectedType] = (acc[field.detectedType] || 0) + 1;
    return acc;
  }, {});
  const missingCells = fieldInsights.reduce((sum, field) => sum + field.missingValues, 0);
  const highSeverityIssues = qualityIssues.filter((issue) => issue.severity === "High").length;
  const topMissingField = [...fieldInsights].sort((a, b) => b.missingValues - a.missingValues)[0];
  const strongestMetric = [...stats].sort((a, b) => b.max - b.min - (a.max - a.min))[0];

  return {
    rowCount,
    columnCount,
    typeCounts,
    missingCells,
    qualityIssueCount: qualityIssues.length,
    highSeverityIssues,
    anomalyCount: anomalies.length,
    topMissingField,
    strongestMetric,
    numericMetricCount: typeCounts["Numeric Metric"] || 0,
    dateFieldCount: typeCounts["Date Field"] || 0,
    categoricalCount: typeCounts["Categorical Dimension"] || 0,
  };
}

export function generateEnhancedInsights(summary, language = "en") {
  if (!summary) return null;

  if (language === "zh") {
    return {
      dataQualitySummary: `数据集包含 ${summary.rowCount} 行、${summary.columnCount} 列，检测到 ${summary.qualityIssueCount} 个数据质量问题，其中 ${summary.highSeverityIssues} 个为高优先级。`,
      fieldUnderstanding: `系统识别出 ${summary.numericMetricCount} 个数值指标、${summary.dateFieldCount} 个日期字段和 ${summary.categoricalCount} 个分类维度，可支持趋势、分组和分布分析。`,
      recommendedAnalysisPath:
        summary.dateFieldCount && summary.numericMetricCount
          ? "建议先做时间趋势分析，再按分类维度拆解关键指标，最后复核异常点。"
          : "建议先完善日期或数值字段，再开展趋势分析；当前更适合做字段质量和分布检查。",
      keyRisk: summary.highSeverityIssues
        ? "当前主要风险来自高优先级数据质量问题，可能影响结论可信度。"
        : summary.anomalyCount
          ? "主要风险来自异常值，需要判断是业务波峰还是数据录入问题。"
          : "暂未发现明显高风险信号，但仍建议在建模前做字段口径确认。",
      nextStepRecommendation: summary.strongestMetric
        ? `下一步建议重点分析 ${summary.strongestMetric.column}，它的波动范围最大，可能解释主要业务变化。`
        : "下一步建议补充关键业务指标，例如销售额、订单数、成本或转化率。",
    };
  }

  return {
    dataQualitySummary: `The dataset has ${summary.rowCount} rows and ${summary.columnCount} columns, with ${summary.qualityIssueCount} quality issues detected and ${summary.highSeverityIssues} high-priority issue(s).`,
    fieldUnderstanding: `The system identified ${summary.numericMetricCount} numeric metric(s), ${summary.dateFieldCount} date field(s), and ${summary.categoricalCount} categorical dimension(s).`,
    recommendedAnalysisPath:
      summary.dateFieldCount && summary.numericMetricCount
        ? "Start with time-series trend analysis, segment the metric by key dimensions, then review anomaly details."
        : "Start with field quality and distribution checks, then add date or numeric fields for deeper trend analysis.",
    keyRisk: summary.highSeverityIssues
      ? "The primary risk is high-priority data quality issues that may reduce confidence in the analysis."
      : summary.anomalyCount
        ? "The primary risk is unusual values that may represent real business spikes or data entry issues."
        : "No major risk signal was detected, but field definitions should still be validated before modeling.",
    nextStepRecommendation: summary.strongestMetric
      ? `Focus next on ${summary.strongestMetric.column}, because it shows the widest movement across the dataset.`
      : "Add core business metrics such as revenue, orders, cost, or conversion rate to improve recommendations.",
  };
}

export function getAnomalyDetails(data, stats) {
  const details = [];

  stats.forEach((stat) => {
    const upper = stat.mean + 2 * stat.std;
    const lower = stat.mean - 2 * stat.std;

    data.forEach((row, index) => {
      const value = parseNumber(row[stat.column]);
      if (!Number.isFinite(value) || stat.std === 0) return;

      if (value > upper || value < lower) {
        details.push({
          row: index + 1,
          column: stat.column,
          value,
          mean: stat.mean,
          standardDeviation: stat.std,
          direction: value > upper ? "Above normal range" : "Below normal range",
          possibleExplanation:
            value > upper
              ? "This value is significantly higher than the normal range and may indicate a special event, campaign spike, or data entry issue."
              : "This value is significantly lower than the normal range and may indicate a drop, missing activity, or data entry issue.",
        });
      }
    });
  });

  return details;
}

function detectAnomalies(rows, stats) {
  return getAnomalyDetails(rows, stats).map(({ row, column, value, direction }) => ({
    row,
    column,
    value,
    direction,
  }));
}

function buildInsight(rowCount, columnCount, stats, anomalies, summary) {
  const leadingMetric = stats[0];
  const largestSpread = [...stats].sort((a, b) => b.max - b.min - (a.max - a.min))[0];

  return {
    summary: `Dataset contains ${rowCount} records across ${columnCount} columns. ${stats.length} numeric fields are ready for automated profiling.`,
    trend: leadingMetric
      ? `${leadingMetric.column} averages ${formatNumber(leadingMetric.mean)}, with values ranging from ${formatNumber(leadingMetric.min)} to ${formatNumber(leadingMetric.max)}.`
      : "No numeric column was detected yet. Upload a dataset with numeric fields to unlock trend analysis.",
    anomaly: anomalies.length
      ? `${anomalies.length} potential anomaly signals were detected using a two-standard-deviation rule.`
      : "No high-confidence anomalies were found in the sampled numeric fields.",
    recommendation: largestSpread
      ? `Prioritize reviewing ${largestSpread.column}, because it shows the widest movement and may explain the strongest business variance.`
      : "Add revenue, cost, conversion, or time-based columns to produce a sharper recommendation.",
    quality: summary
      ? `${summary.qualityIssueCount} data quality issue(s) were found. Resolve high-severity issues before making business decisions.`
      : "",
  };
}

function buildFieldExplanation(type) {
  const explanations = {
    "Date Field": "This column looks like a date or time field and can anchor trend or cohort analysis.",
    "Numeric Metric": "This column looks like a numeric business metric and can be used for trend, distribution, or anomaly analysis.",
    "Categorical Dimension": "This column looks like a grouping dimension and can segment metrics by category.",
    "ID Field": "This column appears to identify records or entities and is useful for joins, deduplication, and tracking.",
    "Text Field": "This column contains longer text and may be useful for qualitative review or future NLP analysis.",
    "Unknown Field": "This column needs manual review because its pattern is not strong enough for confident classification.",
  };

  return explanations[type] || explanations["Unknown Field"];
}

function countDuplicateRows(data) {
  const seen = new Set();
  let duplicates = 0;

  data.forEach((row) => {
    const signature = JSON.stringify(row);
    if (seen.has(signature)) {
      duplicates += 1;
    } else {
      seen.add(signature);
    }
  });

  return duplicates;
}

function ratio(values, predicate) {
  if (!values.length) return 0;
  return values.filter(predicate).length / values.length;
}

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isMissing(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isParseableDate(value) {
  if (isMissing(value)) return false;
  const text = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(text) && text.length < 6) return false;
  return !Number.isNaN(Date.parse(text));
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return Number.NaN;
  return Number(String(value).replace(/,/g, "").replace(/%$/, ""));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return Number.NaN;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function standardDeviation(values, mean) {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function severityRank(severity) {
  return { High: 0, Medium: 1, Low: 2 }[severity] ?? 3;
}

function formatDateLabel(value, index) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `Row ${index + 1}`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value);
}
