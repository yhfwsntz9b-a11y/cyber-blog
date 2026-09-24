# GraphRAG：当 RAG 从"逐段检索"进化到"全局理解"

<style>
  :root {
    --series-color: #8b5cf6;
    --series-light: #f5f3ff;
    --series-mid: #c4b5fd;
    --series-dark: #5b21b6;
    --series-gradient: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }

  .cover-card {
    background: var(--series-gradient);
    border-radius: 20px;
    padding: 48px 40px 40px;
    color: white;
    margin: 24px 0;
    position: relative;
    overflow: hidden;
  }
  .cover-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
  .cover-card::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
  }
  .cover-card .series-tag {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .cover-card h1 {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.4;
    margin: 0 0 12px;
  }
  .cover-card .subtitle {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  .cover-card .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    opacity: 0.8;
  }
  .cover-card .meta span { display: flex; align-items: center; gap: 4px; }

  .paper-screenshot {
    margin: 24px 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid #f3f4f6;
  }
  .paper-screenshot img { width: 100%; display: block; }
  .paper-screenshot .caption {
    background: #fafafa;
    padding: 10px 16px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
  }

  .hook-section {
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
    border-left: 4px solid var(--series-color);
    border-radius: 0 12px 12px 0;
    padding: 24px 28px;
    margin: 28px 0;
    font-size: 16px;
    line-height: 1.8;
    color: #374151;
  }

  .formula-card {
    background: #fefefe;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 24px;
    margin: 16px 0;
    text-align: center;
  }
  .formula-card .formula {
    font-size: 18px;
    color: var(--series-dark);
    font-weight: 600;
    margin: 8px 0;
    font-family: 'Georgia', serif;
    font-style: italic;
  }
  .formula-card .formula-note {
    font-size: 13px;
    color: #9ca3af;
    margin-top: 8px;
  }

  .arch-flow {
    display: flex;
    align-items: stretch;
    gap: 0;
    margin: 24px 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  .arch-step {
    background: white;
    border: 2px solid var(--series-mid);
    border-radius: 14px;
    padding: 16px 18px;
    min-width: 120px;
    text-align: center;
  }
  .arch-step .step-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--series-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .arch-step .step-title {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  .arch-step .step-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }
  .arch-arrow {
    display: flex;
    align-items: center;
    font-size: 24px;
    color: var(--series-color);
    padding: 0 4px;
    font-weight: bold;
  }

  .pipeline-card {
    background: white;
    border: 2px solid var(--series-mid);
    border-radius: 16px;
    padding: 24px;
    margin: 24px 0;
  }
  .pipeline-card .pipeline-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--series-dark);
    margin-bottom: 16px;
    text-align: center;
  }
  .pipeline-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
    flex-wrap: wrap;
  }
  .pipeline-node {
    background: var(--series-light);
    border: 1px solid var(--series-mid);
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--series-dark);
    flex: 1;
    min-width: 120px;
    text-align: center;
  }
  .pipeline-arrow {
    font-size: 20px;
    color: var(--series-color);
    font-weight: bold;
  }
  .pipeline-phase {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: white;
    background: var(--series-gradient);
    padding: 4px 12px;
    border-radius: 6px;
    display: inline-block;
    margin-bottom: 8px;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }
  .result-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .result-item .metric {
    font-size: 28px;
    font-weight: 800;
    color: var(--series-color);
  }
  .result-item .metric-label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
  .result-item .metric-detail {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .compare-table th {
    background: var(--series-gradient);
    color: white;
    padding: 10px 12px;
    text-align: center;
    font-weight: 600;
  }
  .compare-table th:first-child { border-radius: 10px 0 0 0; }
  .compare-table th:last-child { border-radius: 0 10px 0 0; }
  .compare-table td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
  }
  .compare-table .best {
    font-weight: 700;
    color: var(--series-dark);
  }
  .compare-table .model-name {
    text-align: left;
    font-weight: 600;
    color: #1f2937;
  }
  .compare-table .highlight-row {
    background: var(--series-light);
  }

  .vs-card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 16px;
    align-items: center;
    margin: 24px 0;
  }
  .vs-side {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
  }
  .vs-side.local { border-color: #60a5fa; background: #eff6ff; }
  .vs-side.global { border-color: var(--series-color); background: var(--series-light); }
  .vs-side .vs-label {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .vs-side.local .vs-label { color: #1d4ed8; }
  .vs-side.global .vs-label { color: var(--series-dark); }
  .vs-side .vs-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  }
  .vs-divider {
    font-size: 20px;
    font-weight: 800;
    color: #9ca3af;
  }

  .next-preview {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    border-radius: 16px;
    padding: 28px 32px;
    color: white;
    margin: 32px 0;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .next-preview .np-icon { font-size: 36px; flex-shrink: 0; }
  .next-preview .np-label {
    font-size: 12px;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }
  .next-preview .np-title { font-size: 18px; font-weight: 700; }
  .next-preview .np-desc { font-size: 14px; opacity: 0.8; margin-top: 4px; }

  h2 { font-size: 22px; font-weight: 800; color: #1f2937; margin: 36px 0 16px; padding-left: 14px; border-left: 4px solid var(--series-color); }
  h3 { font-size: 17px; font-weight: 700; color: var(--series-dark); margin: 24px 0 12px; }
  p { font-size: 15px; line-height: 1.9; color: #374151; margin: 12px 0; }
</style>

<div class="cover-card">
  <div class="series-tag">RAG 演进系列 · 06</div>
  <h1>GraphRAG：当 RAG 从"逐段检索"<br>进化到"全局理解"</h1>
  <div class="subtitle">知识图谱 × 社区检测 × 层级摘要 —— 微软研究院重新定义"检索"的含义</div>
  <div class="meta">
    <span>📄 arXiv: 2404.16130</span>
    <span>📅 2024 年 4 月</span>
    <span>👥 Darren Edge, Ha Trinh 等 10 人</span>
    <span>🏛 Microsoft Research</span>
  </div>
</div>

<div class="paper-screenshot">
  <img src="https://cdn.jsdelivr.net/gh/yhfwsntz9b-a11y/daily-news-images@main/paper-rag-evolution/2404.16130_title_framed.png" alt="GraphRAG 论文标题页">
  <div class="caption">GraphRAG 论文标题页 —— "From Local to Global: A GraphRAG Approach to Query-Focused Summarization"</div>
</div>

<div class="hook-section">
前面五篇论文解决的都是一个共同的问题：<strong>如何找到正确的文档并用于生成</strong>。DPR 做密集检索，RAG 端到端训练，FiD 多文档融合，Self-RAG 按需检索，CRAG 纠错检索。它们有一个共同的假设——答案藏在某几个文档片段里，只要检索够准就能找到。但有一类问题，这个假设根本不成立：<strong>"这个数据集的主要主题是什么？"</strong>这类问题需要的不是"检索"，而是对整个语料库的<strong>全局理解</strong>。GraphRAG 第一次正面回答了这个问题。
</div>

## 一、背景：Vector RAG 的"天花板"

传统的 Vector RAG（基于向量检索的 RAG）有一个根本性的局限：<strong>它只能回答"局部"问题</strong>。

什么是局部问题？

- "NeoChip 公司做什么产品？" → 答案在某一个文档片段里
- "谁发明了 Transformer？" → 答案在某一段文字里
- "2023 年 AI 领域最大的融资事件是什么？" → 答案可能在一两篇报道里

什么是全局问题？

- "这个数据集的主要主题是什么？"
- "过去十年的科技趋势有哪些交叉影响？"
- "这些新闻中反复出现的商业模式有哪些？"

全局问题无法通过检索某几个文档片段来回答——它们需要对<strong>整个语料库</strong>的理解、归纳和综合。这是一个<strong>查询导向的摘要任务（Query-Focused Summarization, QFS）</strong>，而不是检索任务。

但传统的 QFS 方法又无法扩展到 RAG 系统处理的语料规模（通常在百万 token 级别）。这就形成了一个两难：

<div class="vs-card">
  <div class="vs-side local">
    <div class="vs-label">Vector RAG</div>
    <div class="vs-desc">能处理大规模语料<br>但只能回答局部问题<br>无法全局理解</div>
  </div>
  <div class="vs-divider">VS</div>
  <div class="vs-side global">
    <div class="vs-label">传统 QFS</div>
    <div class="vs-desc">能回答全局问题<br>但无法扩展到百万 token<br>计算成本不可承受</div>
  </div>
</div>

GraphRAG 的目标就是<strong>同时解决这两个问题</strong>：既能处理大规模语料，又能回答全局问题。

## 二、核心架构：从文档到图谱，从社区到答案

GraphRAG 的核心思路可以用一句话概括：<strong>先用 LLM 把文档变成知识图谱，再用图社区检测做层级摘要，最后用 Map-Reduce 方式生成全局答案</strong>。

整个流程分为两个阶段：索引时（Indexing Time）和查询时（Query Time）。

<div class="pipeline-card">
  <div class="pipeline-title">GraphRAG 完整管线</div>

  <div class="pipeline-phase">索引时（Indexing Time）</div>

  <div class="pipeline-row">
    <div class="pipeline-node">源文档</div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">文本分块<br><small>600 token / 块</small></div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">实体 & 关系<br><small>LLM 提取</small></div>
  </div>

  <div class="pipeline-row">
    <div class="pipeline-node">知识图谱<br><small>节点 + 边 + 声明</small></div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">图社区<br><small>Leiden 检测</small></div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">社区摘要<br><small>LLM 生成</small></div>
  </div>

  <div class="pipeline-phase" style="margin-top: 20px;">查询时（Query Time）</div>

  <div class="pipeline-row">
    <div class="pipeline-node">用户问题</div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">社区答案<br><small>每个社区各生成一份</small></div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-node">全局答案<br><small>汇总摘要</small></div>
  </div>
</div>

### 2.1 索引阶段：构建图索引

#### Step 1：文本分块

将源文档切分为固定大小的文本块（默认 600 token，100 token 重叠）。这个粒度足以保留上下文，又不会超出 LLM 的处理窗口。

#### Step 2：实体与关系提取

对每个文本块，用 LLM 提取：

- <strong>实体（Entities）</strong>：人名、地名、组织、概念等，附带描述
- <strong>关系（Relationships）</strong>：实体之间的关联，附带描述
- <strong>声明（Claims）</strong>：关于实体的关键事实陈述

例如，给定文本"NeoChip 在 2016 年被 Quantum Systems 收购，专注于低功耗处理器"：

- 实体：NeoChip（低功耗处理器公司）、Quantum Systems（NeoChip 的前母公司）
- 关系：Quantum Systems → 收购 → NeoChip（2016年）
- 声明：NeoChip 的股价在 NewTech Exchange 上市首周飙升

关键设计：通过<strong>领域定制的 few-shot 示例</strong>，可以引导 LLM 提取特定领域的实体类型（如科学论文中的方法名、医学报告中的药物名等）。

#### Step 3：知识图谱构建

将所有文本块的实体和关系合并为一个统一的知识图谱。相同实体通过描述匹配进行合并（entity resolution），形成节点-边-声明的三层结构。

#### Step 4：社区检测

使用 <strong>Leiden 算法</strong>对知识图谱进行层级社区检测。Leiden 是一种基于模块度优化的图分割算法，能够发现图中紧密连接的实体群组。

关键特性：Leiden 产生<strong>层级结构</strong>——大的社区可以进一步细分为子社区，子社区又可以再细分。这种层级结构是 GraphRAG 实现可扩展全局摘要的基础。

#### Step 5：社区摘要生成

对每个社区，LLM 生成一份摘要。摘要的内容包括：

- 社区中的关键实体及其描述
- 实体间的关系
- 相关的事实声明

对于层级结构：

- <strong>叶节点社区</strong>：直接从元素摘要生成
- <strong>上层社区</strong>：基于子社区的摘要生成更高层次的摘要

摘要生成采用<strong>优先级排序</strong>：按实体度数（连接数）从高到低排列，优先将最重要的实体信息放入上下文窗口。

### 2.2 查询阶段：Map-Reduce 全局摘要

给定一个全局问题，GraphRAG 的查询流程如下：

<div class="arch-flow">
  <div class="arch-step">
    <div class="step-label">Map</div>
    <div class="step-title">社区答案</div>
    <div class="step-desc">每个社区独立<br>生成部分答案</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Filter</div>
    <div class="step-title">相关性过滤</div>
    <div class="step-desc">只保留与问题<br>相关的社区答案</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Reduce</div>
    <div class="step-title">全局汇总</div>
    <div class="step-desc">所有部分答案<br>汇总为最终答案</div>
  </div>
</div>

1. <strong>Map</strong>：将用户问题发送给每个社区摘要，让 LLM 基于社区摘要生成一份"部分答案"。如果社区摘要与问题无关，则返回空。

2. <strong>Filter</strong>：收集所有非空的部分答案。

3. <strong>Reduce</strong>：将所有部分答案汇总，由 LLM 生成最终的全局答案。

这种 Map-Reduce 模式的关键优势是<strong>可扩展性</strong>——社区摘要是并行生成的，不受语料库总大小的限制。

## 三、两种查询模式：Local Search vs Global Search

GraphRAG 实际上支持两种查询模式：

<div class="vs-card">
  <div class="vs-side local">
    <div class="vs-label">Local Search</div>
    <div class="vs-desc">从特定实体出发<br>结合其所在社区的摘要<br>回答具体的知识性问题<br>类似传统 RAG 但更丰富</div>
  </div>
  <div class="vs-divider">VS</div>
  <div class="vs-side global">
    <div class="vs-label">Global Search</div>
    <div class="vs-desc">遍历所有社区摘要<br>Map-Reduce 汇总<br>回答全局性的感测问题<br>传统 RAG 无法做到</div>
  </div>
</div>

- <strong>Local Search</strong>：适合"NeoChip 的 CEO 是谁？"这类问题。先定位到 NeoChip 实体，然后用它所在社区的摘要来回答。相比传统 RAG，GraphRAG 的 Local Search 能利用更丰富的上下文（实体关系、社区主题）。

- <strong>Global Search</strong>：适合"这个数据集中有哪些主要的商业模式？"这类问题。需要所有社区都参与回答，然后汇总。

## 四、实验结果：全局理解能力的量化

GraphRAG 的评测面临一个挑战：<strong>全局问题没有标准答案</strong>。研究者采用了 LLM-as-a-Judge 的方式，用三个维度进行头对头比较：

- <strong>Comprehensiveness（全面性）</strong>：答案覆盖了多少方面和细节？
- <strong>Diversity（多样性）</strong>：答案提供了多少不同的视角和洞察？
- <strong>Empowerment（赋能性）</strong>：答案多大程度帮助读者做出知情判断？

另外还有一个控制维度 <strong>Directness（直接性）</strong>：答案是否简洁明了？

### 4.1 数据集

两个百万 token 级别的语料库：

- <strong>Podcast Transcripts</strong>：Behind the Tech 播客的文字记录，1669 个文本块
- <strong>News Articles</strong>：2013-2023 年的新闻文章集合

### 4.2 头对头比较结果

GraphRAG 的所有配置（C0-C3）在全面性和多样性上都<strong>显著优于</strong> Vector RAG（SS）：

<table class="compare-table">
  <tr>
    <th>比较维度</th>
    <th>数据集</th>
    <th>GraphRAG 胜率</th>
    <th>Vector RAG 胜率</th>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">全面性 (Comprehensiveness)</td>
    <td>Podcast</td>
    <td class="best">~80%</td>
    <td>~18%</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">全面性 (Comprehensiveness)</td>
    <td>News</td>
    <td class="best">~80%</td>
    <td>~20%</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">多样性 (Diversity)</td>
    <td>Podcast</td>
    <td class="best">~75%</td>
    <td>~20%</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">多样性 (Diversity)</td>
    <td>News</td>
    <td class="best">~67%</td>
    <td>~30%</td>
  </tr>
  <tr>
    <td class="model-name">赋能性 (Empowerment)</td>
    <td>Podcast</td>
    <td class="best">~60%</td>
    <td>~40%</td>
  </tr>
  <tr>
    <td class="model-name">直接性 (Directness)</td>
    <td>Podcast</td>
    <td>~45%</td>
    <td class="best">~55%</td>
  </tr>
</table>

关键发现：

- <strong>全面性碾压</strong>：GraphRAG 在两个数据集上的全面性胜率都达到约 80%，说明图索引确实能捕捉到 Vector RAG 遗漏的全局信息
- <strong>多样性显著领先</strong>：GraphRAG 的多样性胜率为 67-75%，说明图社区结构天然支持多角度分析
- <strong>直接性略逊</strong>：这是预期之中的——GraphRAG 的全局答案更详尽，自然不如 Vector RAG 的简短回答"直接"

### 4.3 基于声明的验证

为了验证 LLM 评判的可靠性，研究者还用 Claimify 工具提取了答案中的事实声明数量：

<table class="compare-table">
  <tr>
    <th>方法</th>
    <th>News 平均声明数</th>
    <th>Podcast 平均声明数</th>
  </tr>
  <tr>
    <td class="model-name">Vector RAG (SS)</td>
    <td>25.23</td>
    <td>26.50</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">GraphRAG (C0)</td>
    <td class="best">34.18</td>
    <td class="best">32.21</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">GraphRAG (C1)</td>
    <td>32.50</td>
    <td>32.20</td>
  </tr>
</table>

GraphRAG 生成的答案包含的<strong>可验证事实声明数量多出约 30%</strong>，从客观指标上印证了"更全面"的结论。

### 4.4 索引成本

<div class="result-grid">
  <div class="result-item">
    <div class="metric">281 min</div>
    <div class="metric-label">索引构建时间</div>
    <div class="metric-detail">~100 万 token 播客语料</div>
  </div>
  <div class="result-item">
    <div class="metric">~80%</div>
    <div class="metric-label">全面性胜率</div>
    <div class="metric-detail">vs Vector RAG</div>
  </div>
  <div class="result-item">
    <div class="metric">+30%</div>
    <div class="metric-label">声明数量提升</div>
    <div class="metric-detail">34 vs 25 平均声明</div>
  </div>
  <div class="result-item">
    <div class="metric">GPT-4 Turbo</div>
    <div class="metric-label">底层 LLM</div>
    <div class="metric-detail">2M TPM, 10k RPM</div>
  </div>
</div>

索引构建的成本不低——281 分钟处理 100 万 token，使用 GPT-4 Turbo。这主要是因为需要对每个文本块做实体/关系提取，再对每个社区生成摘要。但这是一次性成本，建好的图索引可以反复查询。

## 五、历史定位：RAG 从"检索"到"理解"

GraphRAG 在 RAG 演进中代表了一次范式转换。

回顾整个系列：

| 论文 | 年份 | 核心突破 | 检索范式 |
|------|------|---------|---------|
| DPR | 2020.04 | 双编码器密集检索 | 向量相似度 |
| RAG | 2020.10 | 检索+生成端到端 | 潜在文档变量 |
| FiD | 2020.07 | 多文档融合解码 | 独立编码+联合解码 |
| Self-RAG | 2023.10 | 按需检索+自我反思 | 反思令牌控制 |
| CRAG | 2024.01 | 检索纠错+Web兜底 | 评估器分流 |
| <strong>GraphRAG</strong> | <strong>2024.04</strong> | <strong>图谱索引+全局摘要</strong> | <strong>图社区 Map-Reduce</strong> |

从 DPR 到 CRAG，RAG 的核心逻辑始终是<strong>"找到相关文档 → 喂给 LLM → 生成答案"</strong>。GraphRAG 第一次打破了这个逻辑——它不再"检索"文档，而是预先构建一个结构化的知识图谱，然后通过图社区的层级摘要来回答全局问题。

这标志着 RAG 从<strong>"检索增强"进化为"理解增强"</strong>。

GraphRAG 也开启了几个重要的后续方向：

1. <strong>混合 RAG</strong>：结合 Vector RAG（局部精确检索）和 GraphRAG（全局理解），在不同场景下选择最优策略
2. <strong>LightGraphRAG</strong>：降低图索引的构建成本，使其更实用
3. <strong>动态图谱更新</strong>：当新文档加入时，增量更新知识图谱而不需要完全重建
4. <strong>多模态 GraphRAG</strong>：将图表、图片等多模态信息也纳入图谱结构

### 局限性

GraphRAG 也有明显的局限：

1. <strong>索引成本高</strong>：281 分钟构建 100 万 token 的索引，对实时性要求高的场景不太友好
2. <strong>依赖 LLM 的提取质量</strong>：实体和关系的提取完全依赖 LLM，如果 LLM 提取不准确，图谱质量就会下降
3. <strong>社区检测的粒度</strong>：Leiden 算法的社区划分可能不完全符合语义主题，需要人工调参
4. <strong>全局答案的连贯性</strong>：Map-Reduce 方式可能导致最终答案缺乏连贯性，因为各社区的答案是独立生成的

## 六、系列总结：RAG 的四次进化

到这里，我们的 RAG 演进系列六篇论文全部完成。让我们回顾 RAG 技术的四次关键进化：

<div class="result-grid">
  <div class="result-item">
    <div class="metric">1.0</div>
    <div class="metric-label">检索时代</div>
    <div class="metric-detail">DPR + RAG + FiD<br>如何找到正确的文档</div>
  </div>
  <div class="result-item">
    <div class="metric">2.0</div>
    <div class="metric-label">自适应时代</div>
    <div class="metric-detail">Self-RAG<br>什么时候该检索</div>
  </div>
  <div class="result-item">
    <div class="metric">3.0</div>
    <div class="metric-label">纠错时代</div>
    <div class="metric-detail">CRAG<br>检索错了怎么办</div>
  </div>
  <div class="result-item">
    <div class="metric">4.0</div>
    <div class="metric-label">理解时代</div>
    <div class="metric-detail">GraphRAG<br>超越检索的全局理解</div>
  </div>
</div>

从"找到文档"到"判断是否需要"，从"纠正错误"到"全局理解"——RAG 的每一次进化都在拓展 LLM 与外部知识交互的边界。而这一切，才刚刚开始。

<div class="next-preview">
  <div class="np-icon">📖</div>
  <div>
    <div class="np-label">系列终章</div>
    <div class="np-title">RAG 演进全景：从 DPR 到 GraphRAG 的技术路线图</div>
    <div class="np-desc">最后一篇综述文章，将六篇论文串联成完整的技术演进脉络，展望未来 RAG 的发展方向。</div>
  </div>
</div>
