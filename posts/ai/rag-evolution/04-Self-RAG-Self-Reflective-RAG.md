# Self-RAG：当 LLM 学会"自我审视"，检索增强终于有了反思能力

<style>
  :root {
    --series-color: #ec4899;
    --series-light: #fdf2f8;
    --series-mid: #fbcfe8;
    --series-dark: #9d174d;
    --series-gradient: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
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
  .paper-screenshot img {
    width: 100%;
    display: block;
  }
  .paper-screenshot .caption {
    background: #fafafa;
    padding: 10px 16px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
  }

  .hook-section {
    background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%);
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

  .token-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
  }
  .token-table th {
    background: var(--series-gradient);
    color: white;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
  }
  .token-table th:first-child { border-radius: 10px 0 0 0; }
  .token-table th:last-child { border-radius: 0 10px 0 0; }
  .token-table td {
    padding: 10px 16px;
    border-bottom: 1px solid #f3f4f6;
  }
  .token-table tr:nth-child(even) { background: var(--series-light); }
  .token-table .token-name {
    font-weight: 700;
    color: var(--series-dark);
    font-family: monospace;
    font-size: 13px;
    background: var(--series-mid);
    padding: 2px 8px;
    border-radius: 6px;
    display: inline-block;
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
    min-width: 140px;
    text-align: center;
    position: relative;
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
    background: #f9fafb;
    padding: 10px 12px;
    text-align: center;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
  }
  .compare-table td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
  }
  .compare-table .best {
    font-weight: 700;
    color: var(--series-color);
  }
  .compare-table .model-name {
    text-align: left;
    font-weight: 600;
    color: #1f2937;
  }
  .compare-table .highlight-row {
    background: var(--series-light);
  }

  .timeline-diagram {
    position: relative;
    padding: 20px 0;
    margin: 24px 0;
  }
  .timeline-diagram::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0; bottom: 0;
    width: 3px;
    background: var(--series-mid);
    transform: translateX(-50%);
  }
  .timeline-item {
    display: flex;
    align-items: center;
    margin: 16px 0;
    position: relative;
  }
  .timeline-item:nth-child(odd) { flex-direction: row; }
  .timeline-item:nth-child(even) { flex-direction: row-reverse; }
  .timeline-item .tl-content {
    width: 45%;
    background: white;
    border: 1px solid var(--series-mid);
    border-radius: 12px;
    padding: 14px 18px;
  }
  .timeline-item .tl-dot {
    width: 16px; height: 16px;
    background: var(--series-color);
    border-radius: 50%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border: 3px solid white;
    box-shadow: 0 0 0 2px var(--series-mid);
  }
  .timeline-item .tl-year {
    font-size: 12px;
    font-weight: 700;
    color: var(--series-color);
  }
  .timeline-item .tl-title {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
  }
  .timeline-item .tl-desc {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
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
  .next-preview .np-icon {
    font-size: 36px;
    flex-shrink: 0;
  }
  .next-preview .np-label {
    font-size: 12px;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }
  .next-preview .np-title {
    font-size: 18px;
    font-weight: 700;
  }
  .next-preview .np-desc {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 4px;
  }

  h2 { font-size: 22px; font-weight: 800; color: #1f2937; margin: 36px 0 16px; padding-left: 14px; border-left: 4px solid var(--series-color); }
  h3 { font-size: 17px; font-weight: 700; color: var(--series-dark); margin: 24px 0 12px; }
  p { font-size: 15px; line-height: 1.9; color: #374151; margin: 12px 0; }
  .paper-tag { display: inline-block; background: var(--series-light); color: var(--series-dark); padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 0 2px; }
</style>

<div class="cover-card">
  <div class="series-tag">RAG 演进系列 · 04</div>
  <h1>Self-RAG：当 LLM 学会"自我审视"<br>检索增强终于有了反思能力</h1>
  <div class="subtitle">四种反思令牌 × 按需检索 × 自我批评 —— 让 7B 模型在事实性上超越 ChatGPT</div>
  <div class="meta">
    <span>📄 arXiv: 2310.11511</span>
    <span>📅 2023 年 10 月</span>
    <span>👥 Akari Asai, Zeqiu Wu, Yizhong Wang 等</span>
    <span>🏛 UW + AI2 + IBM Research</span>
  </div>
</div>

<div class="paper-screenshot">
  <img src="https://cdn.jsdelivr.net/gh/yhfwsntz9b-a11y/daily-news-images@main/paper-rag-evolution/2310.11511_title_framed.png" alt="Self-RAG 论文标题页">
  <div class="caption">Self-RAG 论文标题页 —— "Learning to Retrieve, Generate, and Critique through Self-Reflection"</div>
</div>

<div class="hook-section">
想象你正在参加一场考试。普通 RAG 的做法是：不管什么题目，先翻一遍参考书，然后照抄答案。而 Self-RAG 的做法完全不同——它像一个优秀的考生：<strong>先判断这道题需不需要查资料</strong>，查到的资料<strong>跟题目有没有关系</strong>，写下的答案<strong>有没有被资料支持</strong>，最后还要评估<strong>答案整体质量如何</strong>。这种"边写边反思"的能力，就是 Self-RAG 的核心创新。
</div>

## 一、背景：RAG 的三个"不灵活"

到 2023 年，RAG 已经从学术概念变成了工程标配。但实际用起来，大家发现了一个尴尬的问题——<strong>标准 RAG 太"死板"了</strong>。

具体来说，传统 RAG 存在三个核心缺陷：

**缺陷一：不管需不需要，都检索。** 用户问"1+1等于几"，RAG 照样去向量库里翻半天。这不仅浪费时间，引入的无关文本反而可能干扰生成。

**缺陷二：不管相不相关，都用。** 检索回来的 Top-K 文档里，经常混着不相关的段落。传统 RAG 一股脑全塞给 LLM，导致"噪声污染"——LLM 可能被无关信息带偏。

**缺陷三：不管对不对，都输出。** 标准 RAG 从不检查自己的答案是否被检索文档支持，也不评估答案质量。生成完了就直接输出，没有"自查"环节。

这三个问题的根源在于：<strong>传统 RAG 把检索和生成当成一个固定流水线，没有任何"自我判断"的能力</strong>。

<div class="arch-flow">
  <div class="arch-step">
    <div class="step-label">传统 RAG</div>
    <div class="step-title">固定流水线</div>
    <div class="step-desc">必检索 → 全塞入 → 直接输出</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Self-RAG</div>
    <div class="step-title">自适应反思</div>
    <div class="step-desc">按需检索 → 逐段审视 → 择优输出</div>
  </div>
</div>

在 Self-RAG 之前，也有一些工作试图解决这些问题。比如 RETRO 在解码时做检索，但需要额外的交叉编码器打分；SAIL 把检索文档拼进指令微调数据，但不做文档相关性判断。这些方法的共同问题是：<strong>要么依赖外部模型做判断（推理成本高），要么判断粒度太粗（只看检索不看生成）</strong>。

Self-RAG 的突破在于：让 LLM 自己学会"反思"——用一个统一的模型，同时完成检索决策、相关性判断、事实性验证和质量评估。

## 二、核心思想：四种"反思令牌"

Self-RAG 的核心创新极其优雅：<strong>在 LLM 的词表里加入一组特殊 token，叫做"反思令牌"（Reflection Tokens）</strong>。模型在生成过程中，会同时输出这些特殊 token，对自己的行为进行实时评估。

一共有四种反思令牌：

<table class="token-table">
  <tr>
    <th>令牌名称</th>
    <th>功能</th>
    <th>可选值</th>
    <th>判断对象</th>
  </tr>
  <tr>
    <td><span class="token-name">Retrieve</span></td>
    <td>是否需要检索</td>
    <td>Yes / No / Continue</td>
    <td>当前输入 + 已生成内容</td>
  </tr>
  <tr>
    <td><span class="token-name">ISREL</span></td>
    <td>检索文档是否相关</td>
    <td>Relevant / Irrelevant</td>
    <td>输入 + 检索文档</td>
  </tr>
  <tr>
    <td><span class="token-name">ISSUP</span></td>
    <td>生成内容是否被支持</td>
    <td>Fully / Partially / No Support</td>
    <td>输入 + 文档 + 生成内容</td>
  </tr>
  <tr>
    <td><span class="token-name">ISUSE</span></td>
    <td>生成内容整体质量</td>
    <td>1 / 2 / 3 / 4 / 5</td>
    <td>输入 + 生成内容</td>
  </tr>
</table>

这四种令牌的设计逻辑非常清晰，对应了考生答题的四个反思维度：

1. **Retrieve**："这道题我需要查资料吗？"——检索决策
2. **ISREL**："查到的资料跟题目有关吗？"——相关性判断
3. **ISSUP**："我写的答案有资料支撑吗？"——事实验证
4. **ISUSE**："我的答案整体质量如何？"——质量评估

关键洞察在于：<strong>这些反思令牌不是外部模型给的反馈，而是 LLM 自己生成的</strong>。模型在训练过程中学会了"自我批评"的能力，推理时不需要任何额外的评判模型。

## 三、训练流程：两阶段蒸馏

Self-RAG 的训练分为两个阶段，核心思路是<strong>用 GPT-4 当"老师"生成反思标注，再蒸馏到自己的模型里</strong>。

### 阶段一：训练 Critic LM（批评模型）

首先，研究者从训练数据中随机采样一部分实例，用 GPT-4 为每个实例生成对应的反思令牌标注。例如：

- 给定一个问答对 (问题, 答案)，GPT-4 判断：这个问题需不需要检索？检索到的文档相不相关？答案是否被文档支持？

这些 GPT-4 生成的标注构成了 Critic 训练集 $D_{critic}$。然后用标准的 next-token prediction 损失训练 Critic LM $C$：

<div class="formula-card">
  <div class="formula">L_C = -Σ log P_C(r | x, y, d)</div>
  <div class="formula-note">其中 r 是 GPT-4 生成的反思令牌，x 是输入，y 是输出，d 是检索文档</div>
</div>

### 阶段二：训练 Generator LM（生成模型）

有了 Critic 模型后，研究者用它为全部训练数据生成反思标注。对于每条训练数据 (x, y)：

1. 用 Critic 预测 Retrieve 令牌 → 决定是否需要检索
2. 如果需要检索，用检索器找到文档 D
3. 用 Critic 对每个文档预测 ISREL、ISSUP、ISUSE
4. 选择最佳文档（Relevant + Fully Supported 优先）
5. 将 (x, y, d, 反思令牌) 拼成完整训练样本

最终用标准 LM 目标训练 Generator：

<div class="formula-card">
  <div class="formula">L_M = -Σ log P_M(y_t | x, d, r, y_{<t})</div>
  <div class="formula-note">Generator 同时学习生成文本内容和反思令牌</div>
</div>

这个两阶段设计的好处是：<strong>不需要 PPO 等强化学习算法</strong>，完全用监督学习完成，训练成本低得多。同时，Critic 的标注知识被完整蒸馏到了 Generator 中。

训练数据共约 15 万条，来源包括：

| 数据类别 | 数据集 | 数量 |
|---------|--------|------|
| 指令跟随 | GPT-4 Alpaca, Stanford Alpaca, FLAN-V2, ShareGPT, Open Assistant | ~92k |
| 知识密集 | Wizard of Wikipedia, NQ, FEVER, OpenBookQA, ARC-Easy, ASQA | ~54k |

## 四、推理流程：树状解码 + 自适应阈值

Self-RAG 的推理过程比标准 RAG 复杂得多，但正是这种"复杂"带来了质量的飞跃。

<div class="arch-flow">
  <div class="arch-step">
    <div class="step-label">Step 1</div>
    <div class="step-title">判断检索</div>
    <div class="step-desc">生成 Retrieve 令牌<br>决定是否需要检索</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 2</div>
    <div class="step-title">并行生成</div>
    <div class="step-desc">每个文档独立生成<br>输出 K 个候选段落</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 3</div>
    <div class="step-title">自我批评</div>
    <div class="step-desc">对每个候选生成<br>ISREL + ISSUP + ISUSE</div>
  </div>
  <div class="arch-arrow">→</div>
  <div class="arch-step">
    <div class="step-label">Step 4</div>
    <div class="step-title">择优输出</div>
    <div class="step-desc">按反思令牌得分<br>选择最佳段落</div>
  </div>
</div>

### 自适应检索阈值

Self-RAG 不是简单地"Retrieve=Yes 就检索"。它提供了一个阈值参数 $\delta$：

- 当 Retrieve=Yes 的概率 > $\delta$ 时，触发检索
- $\delta$ 越大，检索越保守（适合开放创作任务）
- $\delta$ 越小，检索越积极（适合事实性问答任务）

这给了使用者一个<strong>无需重新训练就能调节模型行为</strong>的旋钮。

### 树状解码（Tree-Decoding）

当需要检索时，Self-RAG 采用段级别的束搜索（segment-level beam search）：

1. 检索器返回 K 个文档
2. 对每个文档，模型并行生成一个候选段落 + 对应的反思令牌
3. 计算每个候选的综合得分：

<div class="formula-card">
  <div class="formula">score = w₁·s(ISREL) + w₂·s(ISSUP) + w₃·s(ISUSE)</div>
  <div class="formula-note">三个权重 w₁, w₂, w₃ 可根据任务需求调节 —— 这是 Self-RAG 可控性的核心</div>
</div>

4. 选择得分最高的段落作为当前步输出
5. 重复上述过程，直到生成完整回答

这种"生成-评估-选择"的循环，让 Self-RAG 在每一步都能做出最优决策。

### 硬约束 vs 软约束

Self-RAG 支持两种推理模式：

- **硬约束**：只保留 ISSUP = Fully Supported 的段落，其他全部丢弃。适合对事实性要求极高的场景。
- **软约束**：用加权分数综合排序。适合需要平衡流畅性和事实性的场景。

## 五、实验结果：7B 模型超越 ChatGPT

Self-RAG 在 6 个任务上进行了全面评测，结果令人印象深刻。

### 短文本生成任务

<table class="compare-table">
  <tr>
    <th>模型</th>
    <th>类型</th>
    <th>PopQA (acc)</th>
    <th>TriviaQA (acc)</th>
    <th>PubHealth (acc)</th>
    <th>ARC (acc)</th>
  </tr>
  <tr>
    <td class="model-name">ChatGPT</td>
    <td>闭源</td>
    <td>29.3</td>
    <td>74.3</td>
    <td>70.1</td>
    <td>75.3</td>
  </tr>
  <tr>
    <td class="model-name">Ret-ChatGPT</td>
    <td>闭源+检索</td>
    <td>50.8</td>
    <td>65.7</td>
    <td>54.7</td>
    <td>75.3</td>
  </tr>
  <tr>
    <td class="model-name">Llama2-chat 13B</td>
    <td>开源</td>
    <td>20.0</td>
    <td>59.3</td>
    <td>49.4</td>
    <td>38.4</td>
  </tr>
  <tr>
    <td class="model-name">Ret-Llama2-chat 13B</td>
    <td>开源+检索</td>
    <td>51.8</td>
    <td>59.8</td>
    <td>52.1</td>
    <td>37.9</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">SELF-RAG 7B</td>
    <td>开源+Self-RAG</td>
    <td>54.9</td>
    <td>66.4</td>
    <td class="best">72.4</td>
    <td>67.3</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">SELF-RAG 13B</td>
    <td>开源+Self-RAG</td>
    <td class="best">55.8</td>
    <td class="best">69.3</td>
    <td class="best">74.5</td>
    <td class="best">73.1</td>
  </tr>
</table>

核心发现：

- **PopQA**：Self-RAG 13B（55.8%）比 Ret-ChatGPT（50.8%）高出 5 个百分点，比 ChatGPT 裸跑（29.3%）高出近一倍
- **PubHealth**：Self-RAG 13B（74.5%）超过 ChatGPT（70.1%），在事实验证任务上优势明显
- **ARC**：Self-RAG 13B（73.1%）接近 ChatGPT（75.3%），远超 Ret-Llama2-chat（37.9%）

### 长文本生成任务（带引用）

<table class="compare-table">
  <tr>
    <th>模型</th>
    <th>Bio (FactScore)</th>
    <th>ASQA (str-em)</th>
    <th>ASQA (引用精确率)</th>
    <th>ASQA (引用召回率)</th>
  </tr>
  <tr>
    <td class="model-name">ChatGPT</td>
    <td>71.8</td>
    <td>35.3</td>
    <td>—</td>
    <td>—</td>
  </tr>
  <tr>
    <td class="model-name">Ret-ChatGPT</td>
    <td>—</td>
    <td>40.7</td>
    <td>65.1</td>
    <td>76.6</td>
  </tr>
  <tr>
    <td class="model-name">Ret-Llama2-chat 13B</td>
    <td>79.9</td>
    <td>32.8</td>
    <td>19.8</td>
    <td>36.1</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">SELF-RAG 7B</td>
    <td class="best">81.2</td>
    <td>30.0</td>
    <td class="best">66.9</td>
    <td class="best">67.8</td>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">SELF-RAG 13B</td>
    <td>80.2</td>
    <td class="best">31.7</td>
    <td>70.3</td>
    <td>71.3</td>
  </tr>
</table>

这里的结果更加惊人：

- **FactScore**：Self-RAG 7B（81.2）超过所有模型，包括 Ret-Llama2-chat 13B（79.9）和 ChatGPT（71.8）。这意味着一个 7B 的开源模型，在传记生成的事实性上超过了 ChatGPT
- **引用精确率**：Self-RAG 13B（70.3%）远超 Ret-Llama2-chat 13B（19.8%），差距超过 50 个百分点。Self-RAG 生成的引用几乎都有据可查，而传统 RAG 的引用大量"编造"

<div class="result-grid">
  <div class="result-item">
    <div class="metric">55.8%</div>
    <div class="metric-label">PopQA 准确率</div>
    <div class="metric-detail">超越 Ret-ChatGPT (50.8%)</div>
  </div>
  <div class="result-item">
    <div class="metric">81.2</div>
    <div class="metric-label">FactScore 事实性</div>
    <div class="metric-detail">7B 模型超越 ChatGPT (71.8)</div>
  </div>
  <div class="result-item">
    <div class="metric">70.3%</div>
    <div class="metric-label">引用精确率</div>
    <div class="metric-detail">vs Ret-Llama2-chat 19.8%</div>
  </div>
  <div class="result-item">
    <div class="metric">4 种</div>
    <div class="metric-label">反思令牌类型</div>
    <div class="metric-detail">检索 / 相关 / 支持 / 质量</div>
  </div>
</div>

### 消融实验

消融实验揭示了每个组件的贡献：

<table class="compare-table">
  <tr>
    <th>变体</th>
    <th>PopQA</th>
    <th>PubHealth</th>
    <th>ASQA (prec)</th>
    <th>变化</th>
  </tr>
  <tr class="highlight-row">
    <td class="model-name">Self-RAG 完整模型</td>
    <td class="best">54.9</td>
    <td class="best">73.5</td>
    <td class="best">32.1</td>
    <td>—</td>
  </tr>
  <tr>
    <td class="model-name">去掉 Retriever（不训练检索）</td>
    <td>43.6</td>
    <td>67.8</td>
    <td>31.0</td>
    <td>-11.3 PopQA</td>
  </tr>
  <tr>
    <td class="model-name">去掉 Critic（不训练反思）</td>
    <td>42.6</td>
    <td>72.0</td>
    <td>18.1</td>
    <td>-12.3 PopQA, -14.0 ASQA</td>
  </tr>
  <tr>
    <td class="model-name">推理时不检索</td>
    <td>24.7</td>
    <td>73.0</td>
    <td>—</td>
    <td>-30.2 PopQA</td>
  </tr>
  <tr>
    <td class="model-name">推理时用硬约束</td>
    <td>28.3</td>
    <td>72.6</td>
    <td>—</td>
    <td>-26.6 PopQA</td>
  </tr>
  <tr>
    <td class="model-name">去掉 ISREL 令牌</td>
    <td>44.1</td>
    <td>73.2</td>
    <td>30.6</td>
    <td>-10.8 PopQA</td>
  </tr>
  <tr>
    <td class="model-name">去掉 ISSUP 令牌</td>
    <td>41.8</td>
    <td>73.1</td>
    <td>28.6</td>
    <td>-13.1 PopQA</td>
  </tr>
</table>

关键发现：

- **去掉 Critic 对 ASQA 引用精确率打击最大**（32.1 → 18.1，降了 14 个点），说明反思令牌是引用质量的核心
- **去掉 Retriever 对 PopQA 打击最大**（54.9 → 43.6），说明按需检索能力本身就有巨大价值
- **推理时完全不检索，PopQA 暴跌到 24.7**，证明检索对知识密集型任务的必要性
- **硬约束反而不如软约束**（28.3 vs 54.9），因为过于严格的过滤会丢掉有用的候选

### 训练数据规模效应

研究者还分析了训练数据量对性能的影响：

- PopQA：从 5k 到 150k 训练数据，性能从 ~42 持续上升到 54.9
- PubHealth：50k 之后基本饱和，说明事实性判断需要的数据量相对较少
- ASQA 引用精确率：持续上升，说明引用质量需要大量数据才能学好

这说明 Self-RAG 的反思能力是"数据驱动"的——更多样的训练数据带来更强的自我审视能力。

## 六、历史定位：RAG 从"流水线"到"智能体"

Self-RAG 在 RAG 演进中占据了一个关键的转折点位置。

<div class="timeline-diagram">
  <div class="timeline-item">
    <div class="tl-content">
      <div class="tl-year">2020.04</div>
      <div class="tl-title">DPR</div>
      <div class="tl-desc">双编码器 + 密集检索，奠定检索基础</div>
    </div>
    <div class="tl-dot"></div>
  </div>
  <div class="timeline-item">
    <div class="tl-content">
      <div class="tl-year">2020.10</div>
      <div class="tl-title">RAG</div>
      <div class="tl-desc">检索 + 生成端到端统一，但固定检索</div>
    </div>
    <div class="tl-dot"></div>
  </div>
  <div class="timeline-item">
    <div class="tl-content">
      <div class="tl-year">2020.07</div>
      <div class="tl-title">FiD</div>
      <div class="tl-desc">多文档独立编码 + 融合解码，解决多文档利用</div>
    </div>
    <div class="tl-dot"></div>
  </div>
  <div class="timeline-item">
    <div class="tl-content" style="border-color: var(--series-color); border-width: 2px;">
      <div class="tl-year">2023.10</div>
      <div class="tl-title">Self-RAG ← 当前</div>
      <div class="tl-desc">按需检索 + 自我反思，RAG 有了"判断力"</div>
    </div>
    <div class="tl-dot" style="width: 20px; height: 20px; background: var(--series-color);"></div>
  </div>
</div>

从 DPR 到 FiD，RAG 的演进方向是<strong>"如何更好地利用检索结果"</strong>。而 Self-RAG 第一次把问题转向了<strong>"如何更聪明地使用检索"</strong>——不是每次都检索，不是都用所有文档，而是让模型自己判断什么时候检索、哪些文档有用、生成的内容是否靠谱。

这种思路直接催生了后续的 CRAG（Corrective RAG）和更广泛的"Agentic RAG"概念。<strong>Self-RAG 是 RAG 从"流水线"进化为"智能体"的第一步</strong>。

### 局限性

Self-RAG 也有明显的局限：

1. **推理成本高**：树状解码需要对每个检索文档并行生成候选，推理时间随文档数线性增长
2. **依赖 GPT-4 标注**：Critic 的训练数据来自 GPT-4 蒸馏，反思质量受限于 GPT-4 的判断能力
3. **反思粒度有限**：只在段落级别做反思，没有句子级或实体级的细粒度验证
4. **检索器不联合训练**：使用的是固定的 Contriever 检索器，检索器本身没有针对 Self-RAG 的任务做优化

这些局限为下一篇论文 CRAG 留下了伏笔——如何在不增加推理成本的前提下，实现更可靠的检索增强？

<div class="next-preview">
  <div class="np-icon">📖</div>
  <div>
    <div class="np-label">下一篇预告</div>
    <div class="np-title">CRAG：Corrective Retrieval Augmented Generation</div>
    <div class="np-desc">当检索结果不可靠时，如何"纠错"？CRAG 引入了检索评估器和知识精炼模块，让 RAG 具备自我纠正能力。</div>
  </div>
</div>
