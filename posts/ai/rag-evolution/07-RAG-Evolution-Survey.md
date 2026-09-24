# RAG 演进全景：从 DPR 到 GraphRAG，一篇讲透检索增强生成的四年革命

> **RAG 演进系列 · 07（终章）** | 2026-09-24
>
> 本篇是系列综述，串联以下六篇论文：
> 1. DPR — *Dense Passage Retrieval* (Karpukhin et al. 2020, EMNLP 2020)
> 2. RAG — *Retrieval-Augmented Generation* (Lewis et al. 2020, NeurIPS 2020)
> 3. FiD — *Fusion-in-Decoder* (Izacard & Grave 2021, EACL 2021)
> 4. Self-RAG — *Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection* (Asai et al. 2023, ICLR 2024)
> 5. CRAG — *Corrective Retrieval Augmented Generation* (Yan et al. 2024, arXiv 2401.15884)
> 6. GraphRAG — *From Local to Global: A Graph RAG Approach to Query-Focused Summarization* (Edge et al. 2024, arXiv 2404.16130)

---

<div style="background: linear-gradient(135deg, #1e293b 0%, #334155 40%, #475569 100%); border-radius: 20px; padding: 48px 40px 40px; color: white; margin: 24px 0; position: relative; overflow: hidden;">
  <style>
    .survey-cover::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 240px; height: 240px;
      background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);
      border-radius: 50%;
    }
    .survey-cover::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -60px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    .survey-cover * { position: relative; z-index: 1; }
  </style>
  <div class="survey-cover">
    <div style="font-size: 12px; opacity: 0.6; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">RAG Evolution Series · 07 · Finale</div>
    <h1 style="margin: 0 0 12px 0; font-size: 30px; font-weight: 800; line-height: 1.3;">RAG 演进全景</h1>
    <p style="margin: 0 0 24px 0; font-size: 17px; opacity: 0.85; line-height: 1.6;">从 DPR 到 GraphRAG — 一篇讲透检索增强生成的四年革命</p>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
      <span style="background: #0d9488; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">DPR</span>
      <span style="background: #6366f1; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">RAG</span>
      <span style="background: #d97706; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">FiD</span>
      <span style="background: #ec4899; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Self-RAG</span>
      <span style="background: #10b981; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">CRAG</span>
      <span style="background: #8b5cf6; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">GraphRAG</span>
    </div>
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 20px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700;">6</div>
        <div style="font-size: 12px; opacity: 0.7;">经典论文</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 20px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700;">4 年</div>
        <div style="font-size: 12px; opacity: 0.7;">技术演进</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 20px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700;">4 个时代</div>
        <div style="font-size: 12px; opacity: 0.7;">范式跃迁</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 20px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700;">1 条主线</div>
        <div style="font-size: 12px; opacity: 0.7;">让 LLM 更可靠</div>
      </div>
    </div>
  </div>
</div>

---

# 四年，六篇论文，一场检索增强的革命

2020 年，Facebook AI 发了两篇论文。一篇说 BERT 双塔能打败 BM25，另一篇说检索和生成可以端到端训练。当时没几个人当回事——GPT-3 如日中天，所有人都觉得"大力出奇迹"才是正道，何必费劲去外面找资料？

四年后回头看，这两篇论文开创了一个时代。从 DPR 到 RAG 到 FiD，"检索 + 生成"从学术实验变成了工业标配。再到 2023 年的 Self-RAG 和 2024 年的 CRAG、GraphRAG，RAG 已经从一个简单的 pipeline 进化成一个有自我反思、自我纠错、全局理解能力的智能系统。

这六篇论文，就是这条进化路上的六个里程碑。

**本文是系列终章。** 我们把六篇论文串成一条完整的技术演进脉络，回答三个问题：
- RAG 技术到底经历了怎样的演变？
- 每一代解决了什么核心问题，又留下了什么未解之题？
- 下一步会走向哪里？

---

## 一、全景时间线：四年四代，从检索基石到全局智能

<div class="timeline-diagram">
  <style>
    .timeline-diagram {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      padding: 32px 24px;
      margin: 24px 0;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow-x: auto;
    }
    .timeline-header {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 24px;
    }
    .timeline-track {
      display: flex;
      align-items: flex-start;
      position: relative;
      min-width: 800px;
      padding: 0 20px;
    }
    .timeline-track::before {
      content: '';
      position: absolute;
      top: 28px;
      left: 40px;
      right: 40px;
      height: 4px;
      background: linear-gradient(90deg, #0d9488, #6366f1, #d97706, #ec4899, #10b981, #8b5cf6);
      border-radius: 2px;
    }
    .tl-node {
      flex: 1;
      text-align: center;
      position: relative;
    }
    .tl-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin: 18px auto 12px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .tl-year {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .tl-name {
      font-size: 15px;
      font-weight: 700;
      margin: 4px 0;
    }
    .tl-desc {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
      padding: 0 8px;
    }
    .tl-era {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 8px;
      padding: 2px 8px;
      border-radius: 8px;
      display: inline-block;
    }
  </style>
  <div class="timeline-header">RAG 技术演进时间线（2020–2024）</div>
  <div class="timeline-track">
    <div class="tl-node">
      <div class="tl-year">2020.04</div>
      <div class="tl-dot" style="background: #0d9488;"></div>
      <div class="tl-name" style="color: #0d9488;">DPR</div>
      <div class="tl-desc">双塔 BERT 打败 BM25<br>dense retrieval 奠基</div>
      <div class="tl-era" style="background: #f0fdfa; color: #0d9488;">基石时代</div>
    </div>
    <div class="tl-node">
      <div class="tl-year">2020.10</div>
      <div class="tl-dot" style="background: #6366f1;"></div>
      <div class="tl-name" style="color: #6366f1;">RAG</div>
      <div class="tl-desc">检索 + 生成端到端训练<br>开创 RAG 范式</div>
      <div class="tl-era" style="background: #eef2ff; color: #6366f1;">基石时代</div>
    </div>
    <div class="tl-node">
      <div class="tl-year">2020.07</div>
      <div class="tl-dot" style="background: #d97706;"></div>
      <div class="tl-name" style="color: #d97706;">FiD</div>
      <div class="tl-desc">100 篇文档同时灌入<br>多文档融合最优解</div>
      <div class="tl-era" style="background: #fffbeb; color: #d97706;">基石时代</div>
    </div>
    <div class="tl-node">
      <div class="tl-year">2023.10</div>
      <div class="tl-dot" style="background: #ec4899;"></div>
      <div class="tl-name" style="color: #ec4899;">Self-RAG</div>
      <div class="tl-desc">四种反思 token<br>模型学会自主检索</div>
      <div class="tl-era" style="background: #fdf2f8; color: #ec4899;">自觉时代</div>
    </div>
    <div class="tl-node">
      <div class="tl-year">2024.01</div>
      <div class="tl-dot" style="background: #10b981;"></div>
      <div class="tl-name" style="color: #10b981;">CRAG</div>
      <div class="tl-desc">检索评估 + 自我纠错<br>不可靠检索的解药</div>
      <div class="tl-era" style="background: #ecfdf5; color: #10b981;">纠错时代</div>
    </div>
    <div class="tl-node">
      <div class="tl-year">2024.04</div>
      <div class="tl-dot" style="background: #8b5cf6;"></div>
      <div class="tl-name" style="color: #8b5cf6;">GraphRAG</div>
      <div class="tl-desc">知识图谱 + 社区摘要<br>全局理解能力觉醒</div>
      <div class="tl-era" style="background: #f5f3ff; color: #8b5cf6;">全局时代</div>
    </div>
  </div>
</div>

六篇论文横跨四年，可以清晰地划分为**四个时代**：

| 时代 | 时间 | 论文 | 核心命题 |
|------|------|------|----------|
| **基石时代** | 2020 | DPR → RAG → FiD | 证明"检索 + 生成"可行 |
| **自觉时代** | 2023 | Self-RAG | 让模型自己决定何时检索 |
| **纠错时代** | 2024.01 | CRAG | 让模型判断检索质量并纠错 |
| **全局时代** | 2024.04 | GraphRAG | 让系统具备全局理解能力 |

每个时代都不是凭空出现的——它解决的是上一个时代留下的最棘手问题。

---

## 二、六篇论文速览：一张表看懂核心贡献

<div class="master-compare-table">
  <style>
    .master-compare-table {
      overflow-x: auto;
      margin: 24px 0;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      font-family: -apple-system, "PingFang SC", sans-serif;
    }
    .master-compare-table table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 700px;
    }
    .master-compare-table th {
      background: #1e293b;
      color: white;
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .master-compare-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .master-compare-table tr:nth-child(even) { background: #f8fafc; }
    .master-compare-table tr:hover { background: #f1f5f9; }
    .paper-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      color: white;
    }
  </style>
  <table>
    <tr>
      <th>论文</th>
      <th>年份</th>
      <th>一句话贡献</th>
      <th>检索器</th>
      <th>生成器</th>
      <th>文档利用</th>
      <th>代表指标</th>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#0d9488;">DPR</span></td>
      <td>2020.04</td>
      <td>双塔 BERT 击败 BM25，奠定 dense retrieval 基础</td>
      <td>双塔 BERT</td>
      <td>—</td>
      <td>检索器</td>
      <td>NQ top-20: 80.0%（vs BM25 71.4%）</td>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#6366f1;">RAG</span></td>
      <td>2020.10</td>
      <td>检索 + 生成端到端训练，开创 RAG 范式</td>
      <td>DPR</td>
      <td>BART</td>
      <td>K=5~10</td>
      <td>NQ: 44.5%（SOTA）</td>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#d97706;">FiD</span></td>
      <td>2020.07</td>
      <td>独立编码 + 联合解码，有效利用 100 篇文档</td>
      <td>DPR</td>
      <td>T5</td>
      <td>K=100</td>
      <td>NQ: 51.4%（+7 over RAG）</td>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#ec4899;">Self-RAG</span></td>
      <td>2023.10</td>
      <td>四种反思 token，模型自主决定何时检索</td>
      <td>Contriever</td>
      <td>LLaMA2</td>
      <td>按需检索</td>
      <td>PopQA: 55.8%（13B）</td>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#10b981;">CRAG</span></td>
      <td>2024.01</td>
      <td>检索评估器 + 纠错机制，即插即用</td>
      <td>Contriever</td>
      <td>LLaMA3 + T5 评估器</td>
      <td>评估后筛选</td>
      <td>PopQA: 61.8%（+6.3 over Self-RAG）</td>
    </tr>
    <tr>
      <td><span class="paper-badge" style="background:#8b5cf6;">GraphRAG</span></td>
      <td>2024.04</td>
      <td>知识图谱 + 社区摘要，全局查询能力觉醒</td>
      <td>图索引</td>
      <td>GPT-4o</td>
      <td>全图社区摘要</td>
      <td>全面性胜率 ~80%（vs Vector RAG）</td>
    </tr>
  </table>
</div>

这张表有几个值得注意的趋势：

**1. 检索器从"固定"走向"智能"。** DPR 时代检索器就是双塔编码器，到了 Self-RAG 变成了按需触发，CRAG 加上了质量评估，GraphRAG 干脆用知识图谱替代了向量检索。

**2. 文档利用从"少"走向"多"再到"精"。** RAG 用 5 篇，FiD 暴力用到 100 篇，Self-RAG 学会按需检索，CRAG 评估后筛选，GraphRAG 用图结构全局覆盖。

**3. 生成器从"小模型"走向"大模型"。** BART（130M）→ T5（3B）→ LLaMA2（7-70B）→ GPT-4o。生成器越来越大，但真正的进步在于**怎么用**检索结果，而不只是模型多大。

---

## 三、第一代：基石时代 — 证明"检索 + 生成"可行

### 3.1 DPR：一切的起点

2020 年 4 月，Facebook AI 的 Karpukhin 等人做了一件看起来很简单的事：把 BERT 拆成两个独立的编码器，一个编码问题，一个编码段落，用向量内积做检索。

为什么这件事重要？因为在此之前，开放域问答的检索器只有一个选择：**BM25**。这个 1994 年诞生的算法靠词频匹配吃饭，已经统治信息检索 30 年。所有人都知道它有语义理解的缺陷，但没人能找到更好的替代方案。

DPR 的结果很直接：在 5 个 QA 数据集上，top-20 检索准确率比 BM25 高了 **9-19 个百分点**。Natural Questions 上从 71.4% 跳到 80.0%。

<div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 8px;">
  <div style="font-weight: 700; color: #0d9488; margin-bottom: 6px;">DPR 的历史定位</div>
  <div style="color: #134e4a; font-size: 14px; line-height: 1.7;">
    DPR 本身不是 RAG，但它是 RAG 能工作的第一步。没有好的检索器，后面的生成全是空中楼阁。后来 RAG、FiD、Self-RAG、CRAG 的检索器，底层都是 DPR 开创的 dense retrieval 范式。
  </div>
</div>

### 3.2 RAG：把检索和生成焊死在一起

DPR 证明了检索可以做得更好。但检索的终极目标是什么？是给生成器用的。

2020 年 10 月，Lewis 等人提出了 **RAG（Retrieval-Augmented Generation）**——把 DPR 检索器和 BART 生成器拼在一起，端到端训练。核心思想是：检索到的文档不是简单地拼接到输入里，而是作为"非参数化记忆"参与整个生成过程。

RAG 提出了两种融合方式：
- **RAG-Sequence**：每篇文档独立生成答案，然后加权合并
- **RAG-Token**：每生成一个 token，都在多篇文档间加权

在 Natural Questions 上达到 44.5% 的 exact match，是当时的 SOTA。更重要的是，RAG 开创了一个**范式**：从此以后，"检索 + 生成"不再是两个独立模块的简单拼接，而是一个端到端的有机整体。

### 3.3 FiD：多文档融合的最优解

RAG 有个实际限制：为了计算效率，通常只能用 K=5 或 10 篇文档。但实验表明，检索 100 篇文档比检索 5 篇好得多——前提是你能有效利用它们。

Izacard 和 Grave 提出的 **FiD（Fusion-in-Decoder）** 用了一个巧妙的办法：encoder 独立编码每篇文档（可以并行），decoder 把所有文档的表示拼接起来统一处理。

```
文档 1 → [Encoder] → 表示 1 ─┐
文档 2 → [Encoder] → 表示 2 ─┤
文档 3 → [Encoder] → 表示 3 ─┼→ [Decoder] → 答案
  ...                         │
文档100 → [Encoder] → 表示100 ─┘
```

关键优势：encoder 阶段完全独立，可以并行计算，复杂度是 O(n) 而不是 O(n²)。这使得 FiD 可以轻松利用 100 篇文档，在 NQ 上达到 51.4%，比 RAG 高了近 7 个百分点。

### 基石时代的遗产

这三篇论文共同解决了一个根本问题：**证明"检索 + 生成"是一条可行的路线**。

它们留下的未解之题：
1. **检索是盲目的** — 不管问题需不需要检索，每次都检索
2. **检索是不可信的** — 检索到的文档可能包含错误信息
3. **检索是局部的** — 向量相似度只能找到局部相关的片段，无法做全局推理

这三个问题，分别由后面三篇论文来解决。

---

## 四、第二代：自觉时代 — Self-RAG 让模型学会"自主检索"

### 问题：RAG 的"无脑检索"

RAG 和 FiD 有一个共同的假设：**每个问题都需要检索**。但事实并非如此。

问"奥巴马的出生地是？"——需要检索。
问"请写一首关于春天的诗"——不需要检索。
问"量子力学的基本原理是什么？"——可能不需要检索，模型自己就知道。

每次都检索有两个问题：一是浪费时间（检索 + 编码文档有延迟），二是可能引入噪声（检索到的文档可能比模型自己的知识更不靠谱）。

### Self-RAG 的解法：四种反思 token

Asai 等人在 2023 年提出的 **Self-RAG** 给出了一个优雅的答案：训练模型自己决定**何时检索、如何使用检索结果、答案是否可靠**。

具体来说，Self-RAG 引入了四种"反思 token"（reflection tokens）：

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
  <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 10px; padding: 14px;">
    <div style="font-weight: 700; color: #9d174d; font-size: 14px; margin-bottom: 4px;">#Retrieve</div>
    <div style="font-size: 13px; color: #831843;">决定是否需要检索（Yes / No）</div>
  </div>
  <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 10px; padding: 14px;">
    <div style="font-weight: 700; color: #9d174d; font-size: 14px; margin-bottom: 4px;">#ISREL</div>
    <div style="font-size: 13px; color: #831843;">检索结果是否相关（Irrelevant / Relevant）</div>
  </div>
  <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 10px; padding: 14px;">
    <div style="font-weight: 700; color: #9d174d; font-size: 14px; margin-bottom: 4px;">#ISSUP</div>
    <div style="font-size: 13px; color: #831843;">答案是否被检索支持（Not / Partially / Fully）</div>
  </div>
  <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 10px; padding: 14px;">
    <div style="font-weight: 700; color: #9d174d; font-size: 14px; margin-bottom: 4px;">#ISUSE</div>
    <div style="font-size: 13px; color: #831843;">答案是否有用（Not / Partially / Fully）</div>
  </div>
</div>

训练分两阶段：先用 GPT-4 给数据打标签（Critic LM），再用这些标注数据训练 LLaMA2（Generator LM）。推理时通过树搜索（tree-based decoding）在多个候选路径中选择最优解。

**结果：** PopQA 上 13B 模型达到 55.8%，而 ChatGPT 只有 29.3%。FactScore 上 7B 模型达到 81.2，超过 ChatGPT 的 71.8。

### 自觉时代的意义

Self-RAG 的核心贡献不是"又涨了几个点"，而是**改变了 RAG 的范式**：从"无脑检索"变成了"按需检索"。模型第一次有了"我需不需要查资料"的自觉。

但它也留下了一个问题：**如果检索结果本身就是错的呢？** Self-RAG 能判断"相不相关"和"支不支持"，但如果检索到的文档包含事实性错误，它的 #ISREL 评估也无能为力。

这个问题，CRAG 来解决。

---

## 五、第三代：纠错时代 — CRAG 给 RAG 装上"质检员"

### 问题：检索结果不可靠怎么办？

Self-RAG 假设检索结果大体是靠谱的，只需要判断"相不相关"。但现实中，检索器经常返回**看起来相关但实际错误**的文档。

比如问"2024 年法国总统是谁？"，检索器可能返回一篇 2020 年的文章说"马克龙是总统"——碰巧是对的，但如果问的是"2024 年英国首相是谁？"，检索到的可能是已经过时的信息。

### CRAG 的解法：轻量级检索评估器

Yan 等人提出的 **CRAG（Corrective Retrieval Augmented Generation）** 在 Self-RAG 的基础上加了一个关键组件：**检索评估器（Retrieval Evaluator）**。

这个评估器是一个 T5-large 分类模型（1.3B 参数），对检索到的每个文档给出三个置信度等级：

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 16px 0;">
  <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-weight: 800; color: #065f46; font-size: 16px; margin-bottom: 4px;">Correct</div>
    <div style="font-size: 12px; color: #047857;">高置信度正确<br>直接使用</div>
  </div>
  <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-weight: 800; color: #92400e; font-size: 16px; margin-bottom: 4px;">Ambiguous</div>
    <div style="font-size: 12px; color: #78350f;">中等置信度<br>结合使用</div>
  </div>
  <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-weight: 800; color: #991b1b; font-size: 16px; margin-bottom: 4px;">Incorrect</div>
    <div style="font-size: 12px; color: #7f1d1d;">低置信度<br>丢弃 + 网络搜索</div>
  </div>
</div>

评估器的准确率高达 **84.3%**，而 ChatGPT 做同样的评估只有 58%。更关键的是，CRAG 的设计是**即插即用**的——你可以把它加到任何 RAG 系统上，不需要重新训练生成器。额外延迟仅 **+0.15 秒**。

当评估器判定检索结果不可靠时，CRAG 会启动**知识精炼（Knowledge Refinement）** 流程：分解问题 → 网络搜索 → 过滤噪声 → 重组答案。

**结果：** Self-CRAG（CRAG + Self-RAG）在 PopQA 上达到 61.8%，比 Self-RAG 的 54.9% 高了近 7 个百分点。Bio FactScore 上达到 86.2，比 Self-RAG 的 81.2 高了 5 个点。

### 纠错时代的意义

CRAG 的核心贡献是：**RAG 系统不仅能检索，还能评估检索质量并自我纠错**。这是一个质的飞跃——从"被动接受检索结果"到"主动质疑检索结果"。

但 CRAG 和 Self-RAG 都有一个共同的局限：它们都是**局部检索**。给一段文本，检索最相似的 K 个片段。这种方式对事实性问答很有效，但对需要**全局理解**的问题（比如"这批文档的主题是什么？""这些事件之间有什么关联？"）完全无能为力。

这个问题，GraphRAG 来解决。

---

## 六、第四代：全局时代 — GraphRAG 让 RAG 具备"全局视野"

### 问题：向量检索的"管中窥豹"

前面五篇论文的检索方式，本质上都是同一个套路：把文档切成片段 → 编码成向量 → 按相似度检索 top-K。这种方式被叫做 **Vector RAG** 或 **Naive RAG**。

Vector RAG 对事实性问答很有效——"奥巴马出生在哪？"只需要找到一个片段就够了。但对于**查询导向的摘要任务**（query-focused summarization），它有一个根本性缺陷：

> 你只能看到"局部相似"的片段，永远看不到"全局关联"的图景。

比如问"这批关于气候变化的文档中，各国政策有什么共同点？"——你需要先理解每篇文档在说什么，然后找到它们之间的关联，最后综合出答案。Vector RAG 做不到这一点，因为它只能找到"气候变化"这个关键词附近的片段，无法跨越文档做全局推理。

### GraphRAG 的解法：知识图谱 + 社区摘要

Edge 等人提出的 **GraphRAG** 用了一个完全不同的思路：

**索引阶段：**
1. 用 LLM 从文本中抽取实体和关系 → 构建知识图谱
2. 用 Leiden 算法对图做社区检测 → 层次化分区
3. 为每个社区生成摘要 → 形成多层级摘要体系

**查询阶段：**
- **Local Search**：从与查询相关的局部子图出发，结合社区摘要回答
- **Global Search**：Map-Reduce 方式，先对每个社区摘要生成局部回答，再汇总为全局答案

```
原始文档 → LLM 抽取 → 知识图谱 → 社区检测 → 社区摘要
                                              ↓
                              查询 → Map（各社区局部回答）→ Reduce（全局汇总）
```

**结果：** 在全面性（comprehensiveness）评估中，GraphRAG 对 Vector RAG 的胜率约 **80%**。在事实性声明数量上，GraphRAG 平均生成 34 个事实声明，Vector RAG 只有 25 个，多了 **30%**。

代价是索引成本高：100 万 token 的文档集需要约 281 分钟的索引时间和大量 LLM 调用。但查询阶段的优势是压倒性的。

### 全局时代的意义

GraphRAG 的核心贡献是：**RAG 不只是"找到相关片段"，还可以"理解全局图景"**。通过知识图谱和社区结构，系统第一次具备了跨文档、跨主题的推理能力。

---

## 七、技术演进的三条主线

回顾六篇论文，可以提炼出三条清晰的技术演进主线：

### 主线一：检索的进化 — 从"暴力匹配"到"智能调度"

```
BM25（词频匹配）
  ↓
DPR（双塔编码器，语义检索）
  ↓
Self-RAG（按需检索，模型自主决策）
  ↓
CRAG（评估检索质量，不可靠就重搜）
  ↓
GraphRAG（知识图谱索引，全局覆盖）
```

**趋势：** 检索从"被动的工具"变成了"主动的智能体"。早期是"给什么用什么"，后来是"需要才检索"，再后来是"不好就重搜"，最后是"全局理解后再检索"。

### 主线二：生成的进化 — 从"照搬文档"到"批判性思考"

```
RAG（检索 → 直接生成）
  ↓
FiD（多文档 → 联合解码生成）
  ↓
Self-RAG（生成 → 反思 → 再生成）
  ↓
CRAG（评估 → 纠错 → 精炼 → 生成）
  ↓
GraphRAG（全局摘要 → Map-Reduce 生成）
```

**趋势：** 生成器从"被动接受检索结果"变成了"主动评估和筛选信息"。Self-RAG 加上了反思能力，CRAG 加上了纠错能力，GraphRAG 加上了全局综合能力。

### 主线三：知识组织的进化 — 从"扁平片段"到"层次图谱"

```
DPR/RAG/FiD（扁平文档片段，向量索引）
  ↓
Self-RAG/CRAG（带评估的片段检索）
  ↓
GraphRAG（实体-关系图谱，层次化社区结构）
```

**趋势：** 知识的组织方式从"一堆扁平的文本片段"进化到"有结构的层次化知识图谱"。这使得系统不仅能回答"是什么"，还能回答"有什么关联"和"整体怎么样"。

---

## 八、性能演进：数字会说话

把六篇论文的核心指标放在一起看，进步是惊人的：

<div class="perf-chart">
  <style>
    .perf-chart {
      font-family: -apple-system, "PingFang SC", sans-serif;
      padding: 24px;
      margin: 20px 0;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }
    .perf-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 20px;
      text-align: center;
    }
    .perf-bar-group {
      margin-bottom: 16px;
    }
    .perf-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .perf-name {
      font-size: 13px;
      font-weight: 600;
    }
    .perf-value {
      font-size: 13px;
      font-weight: 700;
    }
    .perf-bar {
      height: 24px;
      border-radius: 12px;
      position: relative;
      transition: width 0.5s ease;
    }
    .perf-note {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
  </style>
  <div class="perf-title">Natural Questions 准确率演进</div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #0d9488;">DPR (2020)</span>
      <span class="perf-value" style="color: #0d9488;">41.5%</span>
    </div>
    <div class="perf-bar" style="width: 41.5%; background: linear-gradient(90deg, #0d9488, #2dd4bf);"></div>
    <div class="perf-note">双塔检索 + 提取式阅读器</div>
  </div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #6366f1;">RAG-Sequence (2020)</span>
      <span class="perf-value" style="color: #6366f1;">44.5%</span>
    </div>
    <div class="perf-bar" style="width: 44.5%; background: linear-gradient(90deg, #6366f1, #a5b4fc);"></div>
    <div class="perf-note">+3.0：检索 + 生成端到端</div>
  </div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #d97706;">FiD (2020)</span>
      <span class="perf-value" style="color: #d97706;">51.4%</span>
    </div>
    <div class="perf-bar" style="width: 51.4%; background: linear-gradient(90deg, #d97706, #fbbf24);"></div>
    <div class="perf-note">+6.9：100 篇文档联合解码</div>
  </div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #ec4899;">Self-RAG (2023)</span>
      <span class="perf-value" style="color: #ec4899;">—</span>
    </div>
    <div class="perf-note">PopQA: 55.8%（不同数据集，不可直接比较）</div>
  </div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #10b981;">CRAG / Self-CRAG (2024)</span>
      <span class="perf-value" style="color: #10b981;">—</span>
    </div>
    <div class="perf-note">PopQA: 61.8%（不同数据集，不可直接比较）</div>
  </div>
  <div class="perf-bar-group">
    <div class="perf-label">
      <span class="perf-name" style="color: #8b5cf6;">GraphRAG (2024)</span>
      <span class="perf-value" style="color: #8b5cf6;">~80% 胜率</span>
    </div>
    <div class="perf-note">查询导向摘要任务，对 Vector RAG 的全面性胜率</div>
  </div>
</div>

**注意：** Self-RAG 和 CRAG 使用的是 PopQA 数据集，与 NQ 不可直接比较。但趋势是清晰的：每一代都在前一代的基础上显著提升。

---

## 九、范式总结：RAG 的四个"从…到…"

四年六篇论文，RAG 经历了四次范式跃迁：

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
  <div style="background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border-radius: 12px; padding: 20px; border: 1px solid #99f6e4;">
    <div style="font-size: 12px; font-weight: 700; color: #0d9488; letter-spacing: 1px; margin-bottom: 8px;">范式跃迁 01</div>
    <div style="font-size: 15px; font-weight: 700; color: #134e4a; margin-bottom: 6px;">从"词频匹配"到"语义检索"</div>
    <div style="font-size: 13px; color: #115e59; line-height: 1.6;">DPR 证明 dense retrieval 可以大幅击败 BM25，开启了检索增强的新时代。</div>
  </div>
  <div style="background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-radius: 12px; padding: 20px; border: 1px solid #c7d2fe;">
    <div style="font-size: 12px; font-weight: 700; color: #6366f1; letter-spacing: 1px; margin-bottom: 8px;">范式跃迁 02</div>
    <div style="font-size: 15px; font-weight: 700; color: #312e81; margin-bottom: 6px;">从"被动检索"到"主动决策"</div>
    <div style="font-size: 13px; color: #3730a3; line-height: 1.6;">Self-RAG 让模型学会自己决定何时检索，从"无脑检索"变成"按需检索"。</div>
  </div>
  <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; padding: 20px; border: 1px solid #a7f3d0;">
    <div style="font-size: 12px; font-weight: 700; color: #10b981; letter-spacing: 1px; margin-bottom: 8px;">范式跃迁 03</div>
    <div style="font-size: 15px; font-weight: 700; color: #064e3b; margin-bottom: 6px;">从"盲目信任"到"批判评估"</div>
    <div style="font-size: 13px; color: #065f46; line-height: 1.6;">CRAG 给 RAG 装上了质检员，检索结果不可靠就纠错重搜，大幅提升事实性。</div>
  </div>
  <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 12px; padding: 20px; border: 1px solid #ddd6fe;">
    <div style="font-size: 12px; font-weight: 700; color: #8b5cf6; letter-spacing: 1px; margin-bottom: 8px;">范式跃迁 04</div>
    <div style="font-size: 15px; font-weight: 700; color: #4c1d95; margin-bottom: 6px;">从"局部片段"到"全局图谱"</div>
    <div style="font-size: 13px; color: #5b21b6; line-height: 1.6;">GraphRAG 用知识图谱替代向量检索，让系统具备跨文档的全局理解能力。</div>
  </div>
</div>

---

## 十、未解之题与未来方向

六篇论文画出了一条清晰的演进路线，但 RAG 的故事远没有结束。以下几个方向值得持续关注：

### 10.1 多模态 RAG

目前六篇论文处理的都是纯文本。未来的 RAG 系统需要同时处理图片、表格、视频等多种模态的信息。检索器要能理解图片内容，生成器要能跨模态推理。

### 10.2 长上下文 vs RAG

随着上下文窗口越来越长（GPT-4 Turbo 128K，Claude 200K），一个自然的问题是：直接把所有文档塞进上下文不就行了，还需要 RAG 吗？

答案是：**仍然需要**。原因有三：
1. 成本 — 长上下文的 token 费用远高于检索
2. 延迟 — 处理 100K token 比检索 top-5 慢几个数量级
3. 注意力稀释 — 上下文越长，模型对中间部分的注意力越弱（"lost in the middle"问题）

RAG 和长上下文不是替代关系，而是互补关系。

### 10.3 自适应 RAG

未来的 RAG 系统应该能根据问题类型自动选择最优策略：
- 简单事实 → 直接检索（DPR 式）
- 需要多文档综合 → FiD 式联合解码
- 需要全局理解 → GraphRAG 式图谱推理
- 不需要外部知识 → 直接用参数化记忆

CRAG 的评估器和 Self-RAG 的反思 token 是朝这个方向走的一步，但还远远不够。

### 10.4 RAG 的可解释性

当前的 RAG 系统是一个黑盒：检索了什么、为什么这样生成、哪些文档影响了答案——这些对用户来说都是不透明的。在医疗、法律、金融等高风险场景，可解释性是硬性要求。

### 10.5 实时 RAG

知识在不断更新，但 RAG 系统的索引通常是静态的。如何让索引实时跟随知识更新，是一个工程上很有挑战的问题。GraphRAG 的知识图谱构建成本尤其高（100 万 token 需要 281 分钟），增量更新是一个重要的研究方向。

---

## 十一、写在最后

写这个系列的起因很简单：RAG 是 2024-2026 年 AI 应用层最热的技术方向，但大多数讨论停留在"RAG 就是检索 + 生成"的层面。很少有人认真追溯过这条技术路线是怎么一步步走到今天的。

六篇论文，四个时代，一条主线：**让 LLM 更可靠**。

DPR 解决了"检索不准"的问题，RAG 解决了"检索和生成脱节"的问题，FiD 解决了"多文档利用不充分"的问题，Self-RAG 解决了"无脑检索"的问题，CRAG 解决了"检索不可靠"的问题，GraphRAG 解决了"无法全局理解"的问题。

每一篇都不是凭空出现的——它解决的是上一篇留下的最棘手的问题。这种层层递进的技术演进，是科学研究最美的样子。

> **系列文章索引：**
> 1. [DPR：用双塔编码器打破 BM25 三十年统治](20260924_DPR.md)
> 2. [RAG：当检索遇上生成，大模型终于能"开卷考试"了](20260924_RAG.md)
> 3. [FiD：当 100 篇文档同时涌入 Decoder，奇迹发生了](20260924_FiD.md)
> 4. [Self-RAG：当 LLM 学会"自我审视"，检索增强终于有了反思能力](20260924_Self-RAG.md)
> 5. [CRAG：当检索结果不靠谱，RAG 如何"自我纠错"？](20260924_CRAG.md)
> 6. [GraphRAG：当 RAG 从"逐段检索"进化到"全局理解"](20260924_GraphRAG.md)
> 7. **你正在读的这篇：RAG 演进全景**

---

*本系列所有论文原文均来自 arXiv，文章中的数据和引用均来自论文原文。如有疏漏，欢迎指正。*
