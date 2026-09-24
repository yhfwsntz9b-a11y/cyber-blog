# CRAG：当检索结果不靠谱，RAG 如何"自我纠错"？

<style>
  :root {
    --series-color: #10b981;
    --series-light: #ecfdf5;
    --series-mid: #a7f3d0;
    --series-dark: #065f46;
    --series-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
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

  .action-card {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 24px 0;
  }
  .action-item {
    border-radius: 14px;
    padding: 20px;
    text-align: center;
  }
  .action-item.correct {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 2px solid #10b981;
  }
  .action-item.incorrect {
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    border: 2px solid #ef4444;
  }
  .action-item.ambiguous {
    background: linear-gradient(135deg, #fffbeb, #fde68a);
    border: 2px solid #f59e0b;
  }
  .action-item .action-icon { font-size: 32px; margin-bottom: 8px; }
  .action-item .action-label {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .action-item.correct .action-label { color: #065f46; }
  .action-item.incorrect .action-label { color: #991b1b; }
  .action-item.ambiguous .action-label { color: #92400e; }
  .action-item .action-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.6;
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
    min-width: 130px;
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

  .plug-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--series-light);
    border: 2px solid var(--series-mid);
    border-radius: 12px;
    padding: 12px 20px;
    margin: 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--series-dark);
  }
  .plug-badge .plug-icon { font-size: 20px; }

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
  <div class="series-tag">RAG 演进系列 · 05</div>
  <h1>CRAG：当检索结果不靠谱<br>RAG 如何"自我纠错"？</h1>
  <div class="subtitle">轻量级检索评估器 × 三级置信度 × Web 搜索兜底 —— 即插即用的纠错模块</div>
  <div class="meta">
    <span>📄 arXiv: 2401.15884</span>
    <span>📅 2024 年 1 月</span>
    <span>👥 Shi-Qi Yan, Jia-Chen Gu, Yun Zhu, Zhen-Hua Ling</span>
    <span>🏛 USTC + UCLA + Google DeepMind</span>
  </div>
</div>

<div class="paper-screenshot">
  <img src="https://cdn.jsdelivr.net/gh/yhfwsntz9b-a11y/daily-news-images@main/paper-rag-evolution/2401.15884_title_framed.png" alt="CRAG 论文标题页">
  <div class="caption">CRAG 论文标题页 —— "Corrective Retrieval Augmented Generation"</div>
</div>

<div class="hook-section">
上一篇 Self-RAG 告诉我们：LLM 可以学会"自我反思"，判断什么时候该检索、检索结果有没有用。但 Self-RAG 的反思是<strong>内嵌在生成过程中的</strong>——它需要训练专门的反思令牌，推理时还要做树状解码，计算开销不小。CRAG 换了一个思路：<strong>与其让 LLM 自己反思，不如在检索和生成之间加一个独立的"质量关卡"</strong>。一个轻量的 T5-large 评估器，就能判断检索结果靠不靠谱，然后触发不同的纠错策略。更妙的是，CRAG 是一个<strong>即插即用的模块</strong>——它可以无缝嫁接到任何 RAG 方法上。
</div>

## 一、背景：检索出错是常态，不是意外

在理想的 RAG 流程中，检索器总能返回与问题高度相关的文档。但现实世界远没有这么美好。

<strong>检索出错的三种典型场景：</strong>

1. **检索器能力有限</strong>：当前的密集检索器（如 Contriever）在语义匹配上仍有缺陷，尤其是当问题和答案之间的表述差异较大时，检索器可能完全找不到相关文档。

2. **知识库覆盖不全**：静态知识库（如某一时点的 Wikipedia 快照）天然存在知识盲区。对于新兴事件、冷门实体或长尾知识，知识库里可能根本就没有相关内容。

3. **噪声文档干扰**：即使检索到了"看起来相关"的文档，其中可能夹杂大量无关信息。传统 RAG 把这些噪声和有用信息一起喂给 LLM，反而可能导致"越检索越差"的效果。

Self-RAG 通过反思令牌部分解决了这些问题，但它有两个局限：

- <strong>反思令牌需要专门训练</strong>，不是所有 RAG 系统都能轻松集成
- <strong>树状解码的推理成本高</strong>，在实时场景中不太实用

CRAG 的设计目标很明确：<strong>用一个轻量级的独立模块，实现检索结果的自动评估和纠错，并且可以即插即用地嫁接到任何 RAG 系统上</strong>。

## 二、核心架构：评估 → 分流 → 纠错 → 精炼

CRAG 的架构可以用四个步骤概括：

<div class="arch-flow">
  <div class="arch-step">
    <div class="step-label">Step 1</div>
    <div class="step-title">检索评估</div>
    <div class="step-desc">T5-large 评估器<br>为每个文档打分</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 2</div>
    <div class="step-title">置信分流</div>
    <div class="step-desc">Correct / Incorrect<br>/ Ambiguous 三级</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 3</div>
    <div class="step-title">知识纠错</div>
    <div class="step-desc">内部精炼 / Web搜索<br>/ 两者结合</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 4</div>
    <div class="step-title">知识精炼</div>
    <div class="step-desc">分解 → 过滤 → 重组<br>只保留关键信息</div>
  </div>
</div>

### 2.1 检索评估器：T5-large 当"质检员"

CRAG 的核心组件是一个<strong>轻量级检索评估器</strong>，基于 T5-large（约 7.7 亿参数）微调而来。它的工作是：给定一个查询和一个检索文档，输出一个相关性分数。

为什么选 T5-large 而不是更大的模型？

- <strong>足够小</strong>：7.7 亿参数，远小于 LLM（7B-70B），推理速度快
- <strong>足够准</strong>：在 PopQA 上，T5 评估器的准确率达到 84.3%，<strong>远超 ChatGPT 的 58.0%</strong>（即使加上 CoT 也只有 62.4%）
- <strong>足够专</strong>：专门针对检索相关性任务微调，比通用 LLM 的判断更精准

<div class="result-grid">
  <div class="result-item">
    <div class="metric">84.3%</div>
    <div class="metric-label">T5 评估器准确率</div>
    <div class="metric-detail">PopQA 检索相关性判断</div>
  </div>
  <div class="result-item">
    <div class="metric">64.7%</div>
    <div class="metric-label">ChatGPT Few-shot</div>
    <div class="metric-detail">最优 ChatGPT 基线</div>
  </div>
  <div class="result-item">
    <div class="metric">~770M</div>
    <div class="metric-label">评估器参数量</div>
    <div class="metric-detail">T5-large，远小于 LLM</div>
  </div>
</div>

### 2.2 三级置信度分流

基于评估器的打分，CRAG 将检索结果分为三个置信度等级，并触发不同的处理策略：

<div class="action-card">
  <div class="action-item correct">
    <div class="action-icon">✅</div>
    <div class="action-label">Correct</div>
    <div class="action-desc">至少一个文档得分超过上阈值。检索结果可信，直接进入<strong>知识精炼</strong>环节。</div>
  </div>
  <div class="action-item incorrect">
    <div class="action-icon">❌</div>
    <div class="action-label">Incorrect</div>
    <div class="action-desc">所有文档得分低于下阈值。检索结果不可信，触发 <strong>Web 搜索</strong>获取外部知识。</div>
  </div>
  <div class="action-item ambiguous">
    <div class="action-icon">🤔</div>
    <div class="action-label">Ambiguous</div>
    <div class="action-desc">得分介于上下阈值之间。同时使用<strong>内部精炼 + Web 搜索</strong>，双管齐下。</div>
  </div>
</div>

这种三级分流的设计非常务实：

- <strong>Correct</strong>：既然检索结果靠谱，就别浪费算力去 Web 搜索了，直接精炼后用
- <strong>Incorrect</strong>：检索结果全不靠谱，内部知识不要了，直接去 Web 找
- <strong>Ambiguous</strong>：不确定，那就两手准备——内部精炼一份，Web 搜索一份，合并使用

### 2.3 Web 搜索：知识库不够，互联网来凑

当检索评估结果为 Incorrect 或 Ambiguous 时，CRAG 会启动 Web 搜索作为补充。

具体流程：

1. <strong>查询重写</strong>：用一个查询重写模块，将原始问题改写为更适合搜索引擎的查询。例如，将"Who was the screenwriter for Death of a Batman?"改写为"Death of a Batman; screenwriter; Wikipedia"。

2. <strong>Web 搜索</strong>：用改写后的查询在 Web 上搜索，获取相关网页。

3. <strong>知识选择</strong>：从搜索到的网页中，用评估器筛选出最相关的段落，作为外部知识。

这个设计的关键洞察是：<strong>静态知识库有天花板，但 Web 是动态且无限的</strong>。当本地知识库找不到答案时，Web 搜索可以提供最新的、更广泛的信息。

### 2.4 知识精炼：分解-过滤-重组

即使检索结果是 Correct 的，文档中也可能包含大量无关信息。CRAG 设计了一个"分解-过滤-重组"的知识精炼算法：

1. <strong>分解（Decompose）</strong>：将检索文档切分为若干知识条（knowledge strips），每个条包含一个独立的信息单元（通常几句话）

2. <strong>过滤（Filter）</strong>：用检索评估器对每个知识条打分，过滤掉不相关的条

3. <strong>重组（Recompose）</strong>：将保留下来的知识条按原序拼接，形成精炼后的知识

<div class="formula-card">
  <div class="formula">k_internal = Concat(Filter(Decompose(d₁, d₂, ..., dₙ)))</div>
  <div class="formula-note">知识精炼：分解 → 过滤 → 重组，只保留与查询相关的信息片段</div>
</div>

这个过程的直觉很简单：一篇文档可能有一千字，但跟问题相关的也许只有两三句话。与其把整篇文档塞给 LLM，不如先"提纯"，只留下精华。

## 三、即插即用：CRAG 是模块，不是系统

CRAG 最重要的设计哲学是<strong>"即插即用"（plug-and-play）</strong>。它不是一个完整的 RAG 系统，而是一个可以嫁接到任何 RAG 系统上的纠错模块。

<div class="plug-badge">
  <span class="plug-icon">🔌</span>
  CRAG + 标准 RAG = CRAG-RAG
</div>
<div class="plug-badge">
  <span class="plug-icon">🔌</span>
  CRAG + Self-RAG = Self-CRAG
</div>
<div class="plug-badge">
  <span class="plug-icon">🔌</span>
  CRAG + 任何未来 RAG 方法 = 自动获得纠错能力
</div>

这意味着：

- 如果你已经有一个 RAG 系统，不需要推倒重来，只需要在前面加上 CRAG 模块
- CRAG 的评估器和知识精炼是独立的，不依赖底层 LLM 的架构
- 更换底层 LLM（比如从 Llama2 换到 Mistral）不影响 CRAG 的工作

## 四、实验结果：纠错带来的提升

CRAG 在 4 个数据集上评测，覆盖短文本生成（PopQA）、长文本生成（Bio）和闭集任务（PubHealth, ARC）。

### 4.1 主要结果

<table class="compare-table">
  <tr>
    <th>方法</th>
    <th>PopQA (acc)</th>
    <th>Bio (FactScore)</th>
    <th>PubHealth (acc)</th>
    <th>ARC (acc)</th>
  </tr>
  <tr>
    <td class="model-name" colspan="5" style="background:#f3f4f6; text-align:center; font-size:12px; color:#6b7280;">基于 LLaMA2-hf-7b</td>
  </tr>
  <tr>
    <td class="model-name">RAG (标准)</td>
    <td>50.5</td>
    <td>44.9</td>
    <td>48.9</td>
    <td>43.4</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">CRAG (+ 纠错)</td>
    <td>54.9</td>
    <td>47.7</td>
    <td class="best">59.5</td>
    <td class="best">53.7</td>
  </tr>
  <tr>
    <td class="model-name">Self-RAG</td>
    <td>29.0</td>
    <td>32.2</td>
    <td>0.7</td>
    <td>23.9</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">Self-CRAG (+ 纠错)</td>
    <td class="best">61.8</td>
    <td class="best">86.2</td>
    <td>74.8</td>
    <td>67.2</td>
  </tr>
  <tr>
    <td class="model-name" colspan="5" style="background:#f3f4f6; text-align:center; font-size:12px; color:#6b7280;">基于 SelfRAG-LLaMA2-7b</td>
  </tr>
  <tr>
    <td class="model-name">RAG (标准)</td>
    <td>52.8</td>
    <td>59.2</td>
    <td>39.0</td>
    <td>53.2</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">CRAG (+ 纠错)</td>
    <td>59.8</td>
    <td>74.1</td>
    <td class="best">75.6</td>
    <td class="best">68.6</td>
  </tr>
  <tr>
    <td class="model-name">Self-RAG</td>
    <td>54.9</td>
    <td>81.2</td>
    <td>72.4</td>
    <td>67.3</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">Self-CRAG (+ 纠错)</td>
    <td class="best">61.8</td>
    <td class="best">86.2</td>
    <td>74.8</td>
    <td>67.2</td>
  </tr>
</table>

核心发现：

- <strong>CRAG 对标准 RAG 的提升</strong>：PopQA +4.4%，Bio +2.8，ARC +10.3%——仅加一个纠错模块就有显著提升
- <strong>Self-CRAG 的全面领先</strong>：在 LLaMA2-hf-7b 上，Self-CRAG 的 PopQA 达到 61.8%，比 Self-RAG 的 54.9% 高出近 7 个百分点
- <strong>Bio FactScore 惊人提升</strong>：Self-CRAG 在 Bio 上达到 86.2，比 Self-RAG 的 81.2 高出 5 个点，比 ChatGPT 的 71.8 高出 14 个点
- <strong>即插即用效果显著</strong>：CRAG 嫁接到 Self-RAG 上变成 Self-CRAG，在大多数指标上进一步超越原始 Self-RAG

### 4.2 消融实验

<table class="compare-table">
  <tr>
    <th>消融变体</th>
    <th>PopQA (acc)</th>
    <th>变化</th>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">CRAG 完整系统</td>
    <td class="best">54.9</td>
    <td>—</td>
  </tr>
  <tr>
    <td class="model-name">去掉文档精炼</td>
    <td>52.1</td>
    <td>-2.8</td>
  </tr>
  <tr>
    <td class="model-name">去掉查询重写</td>
    <td>53.0</td>
    <td>-1.9</td>
  </tr>
  <tr>
    <td class="model-name">去掉外部知识选择</td>
    <td>53.5</td>
    <td>-1.4</td>
  </tr>
</table>

每个组件都有贡献：

- <strong>文档精炼</strong>贡献最大（-2.8），说明"分解-过滤-重组"是纠错的核心
- <strong>查询重写</strong>次之（-1.9），说明 Web 搜索的效果取决于查询质量
- <strong>外部知识选择</strong>也有贡献（-1.4），说明不能把搜索到的所有网页都用上

### 4.3 计算开销

<table class="compare-table">
  <tr>
    <th>方法</th>
    <th>TFLOPs/token</th>
    <th>推理时间 (s/instance)</th>
  </tr>
  <tr>
    <td class="model-name">RAG</td>
    <td>26.5</td>
    <td>0.363</td>
  </tr>
  <tr>
    <td class="model-name">CRAG</td>
    <td>27.2</td>
    <td>0.512</td>
  </tr>
  <tr>
    <td class="model-name">Self-RAG</td>
    <td>26.5 ~ 132.4</td>
    <td>0.741</td>
  </tr>
  <tr>
    <td class="model-name">Self-CRAG</td>
    <td>27.2 ~ 80.2</td>
    <td>0.908</td>
  </tr>
</table>

CRAG 的计算开销非常可控：

- <strong>FLOPs 几乎不变</strong>：CRAG 只增加了 0.7 TFLOPs/token（26.5 → 27.2），因为评估器是 T5-large，远小于 LLM
- <strong>推理时间增加有限</strong>：从 0.363s 到 0.512s，只多了约 0.15 秒
- <strong>对比 Self-RAG</strong>：Self-RAG 的 FLOPs 上限高达 132.4（因为树状解码），CRAG 的上限只有 80.2

## 五、历史定位：RAG 的"模块化"时代

CRAG 在 RAG 演进中的意义不仅在于技术本身，更在于它提出了一种<strong>模块化</strong>的设计哲学。

从 DPR 到 Self-RAG，每一篇论文都在构建一个"完整的系统"——DPR 做检索，RAG 做检索+生成，FiD 做多文档融合，Self-RAG 做自适应检索+反思。每个系统都是自包含的，但也是封闭的。

CRAG 说：<strong>不，纠错应该是一个独立的模块，可以嫁接到任何系统上</strong>。

这种思路直接预示了后来"Agentic RAG"和"Modular RAG"的发展方向——不再追求一个端到端的大系统，而是把 RAG 拆分成可组合的模块：检索模块、评估模块、路由模块、生成模块、验证模块……每个模块各司其职，灵活组合。

<div class="result-grid">
  <div class="result-item">
    <div class="metric">+6.9%</div>
    <div class="metric-label">Self-CRAG vs Self-RAG</div>
    <div class="metric-detail">PopQA 准确率提升</div>
  </div>
  <div class="result-item">
    <div class="metric">86.2</div>
    <div class="metric-label">Bio FactScore</div>
    <div class="metric-detail">超越 ChatGPT (71.8)</div>
  </div>
  <div class="result-item">
    <div class="metric">+0.15s</div>
    <div class="metric-label">推理时间增量</div>
    <div class="metric-detail">从 0.36s 到 0.51s</div>
  </div>
  <div class="result-item">
    <div class="metric">即插即用</div>
    <div class="metric-label">模块化设计</div>
    <div class="metric-detail">兼容任何 RAG 方法</div>
  </div>
</div>

### 局限性

CRAG 也有局限：

1. <strong>评估器需要标注数据</strong>：T5 评估器的微调需要检索相关性的标注数据（如 PopQA 的 golden wiki title），这在某些领域可能难以获取
2. <strong>Web 搜索引入延迟</strong>：虽然评估器本身很快，但 Web 搜索的延迟不可控，在网络不佳时可能成为瓶颈
3. <strong>知识精炼的粒度</strong>：分解-过滤-重组的粒度是"几句话"，对于需要跨段落推理的问题可能不够
4. <strong>评估器和生成器独立</strong>：评估器的判断不会反馈到生成器，生成器也无法影响评估标准

这些局限为最后一篇论文 GraphRAG 留下了空间——如果知识不是以"文档"为单位组织，而是以"图"的结构组织，检索和生成的质量能否更上一层楼？

<div class="next-preview">
  <div class="np-icon">📖</div>
  <div>
    <div class="np-label">下一篇预告</div>
    <div class="np-title">GraphRAG：从文档检索到知识图谱的全局理解</div>
    <div class="np-desc">当 RAG 不再逐段检索，而是构建知识图谱进行全局推理——微软的 GraphRAG 如何重新定义"检索"的含义。</div>
  </div>
</div>
