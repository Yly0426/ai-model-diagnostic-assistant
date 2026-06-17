# AI Data Analyst Dashboard

一个面向作品集展示的 **AI + CSV 数据分析工作台**。用户上传 CSV 后，系统会在前端完成字段识别、数据质量诊断、趋势图表、异常检测、数据清洗、报告导出和 AI 数据问答。项目当前以本地前端分析为主，并预留了 DeepSeek API 与后端代理结构，方便后续升级为完整的数据分析平台。

## 项目亮点

- **CSV 上传与数据预览**：使用 PapaParse 解析 CSV，展示文件名、行数、列数和前 5 行数据。
- **字段智能识别**：自动判断 Date Field、Numeric Metric、Categorical Dimension、ID Field、Text Field 等字段类型。
- **数据质量诊断**：检测缺失值、重复行、缺失比例过高、极端值、混合类型和日期解析问题。
- **智能图表推荐**：根据字段结构推荐 Line、Bar、Scatter、Pie / Donut、Histogram 等图表。
- **多图表渲染**：支持点击推荐卡片后生成对应图表。
- **异常检测与详情表**：基于 `mean ± 2 * std` 规则识别异常点，并展示行号、字段、偏离方向和解释。
- **数据清洗操作**：支持删除重复行、数值缺失填充、文本缺失标记和日期标准化。
- **AI 洞察报告**：自动生成数据质量摘要、字段理解、分析路径、关键风险和下一步建议。
- **AI Dataset Q&A**：支持基于当前数据集摘要进行中英文问答，优先调用 DeepSeek，本地不可用时回退模拟回答。
- **报告导出**：支持导出 Markdown 和 PDF 分析报告。
- **项目历史**：使用 localStorage 保存最近分析过的数据集。
- **示例数据集**：内置示例数据，方便快速演示。
- **视觉展示**：浅色科技风、青白色玻璃拟态、视频 Hero、GSAP 滚动动效、Framer Motion 入场动画。

## 技术栈

- React + Vite
- Tailwind CSS
- Framer Motion
- GSAP + ScrollTrigger
- Recharts
- PapaParse
- Three.js / OGL
- jsPDF
- Express + dotenv
- DeepSeek API proxy placeholder

## 快速开始

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:5173/
```

本地 API 代理默认运行在：

```text
http://127.0.0.1:8787/
```

## DeepSeek API 配置

项目不会把 API Key 放在前端代码中。需要真实调用 DeepSeek 时，请在 `server/.env` 中配置：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat
PORT=8787
```

然后重新运行：

```bash
npm run dev
```

> 注意：真实接入 AI API 时，不建议把完整 CSV 原始数据直接发送给模型。当前项目通过 `server/index.js` 只发送统计摘要、字段信息、质量问题、异常摘要和用户问题，降低隐私风险和 token 成本。

## 构建项目

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 目录结构

```text
src/
  components/
    Hero.jsx
    FileUploadCard.jsx
    InsightCard.jsx
    AnalysisWorkspace.jsx
    FieldIntelligence.jsx
    DataQualityPanel.jsx
    ChartRecommendationPanel.jsx
    ChartBuilderPanel.jsx
    AnomalyDetectionPanel.jsx
    AnomalyDetailTable.jsx
    DataCleaningPanel.jsx
    ReportExportPanel.jsx
    ProjectHistoryPanel.jsx
    DatasetChat.jsx
    ContactSection.jsx
  utils/
    dataAnalysis.js
    aiMock.js
    deepseekClient.js
    sampleData.js
server/
  index.js
  .env.example
public/
  videos/
    hero-robot.mp4
```

## 后续可扩展方向

- 接入 FastAPI 或 Node.js 数据分析后端
- 增加用户登录与项目云端存储
- 支持更多文件格式，例如 Excel / JSON
- 增加真实数据清洗确认流程
- 增加更多图表类型和仪表盘布局
- 支持报告模板、PDF 美化和图表截图导出
- 将 DeepSeek 问答升级为多轮数据分析 Agent

## 联系方式

- WeChat：`buleyi170`
- Email：`2895005619@qq.com`
