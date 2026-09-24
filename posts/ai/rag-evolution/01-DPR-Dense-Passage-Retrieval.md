<!-- 封面卡片 -->
<div class="cover-card">
  <style>
    .cover-card { width: 100%; max-width: 680px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
    .cover-header { padding: 40px 36px 28px; background: linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #2dd4bf 100%); color: white; position: relative; }
    .cover-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); }
    .cover-tag { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; }
    .cover-title { font-size: 26px; font-weight: 800; line-height: 1.4; margin-bottom: 12px; }
    .cover-subtitle { font-size: 15px; opacity: 0.85; line-height: 1.6; }
    .cover-stats { display: flex; gap: 0; background: #fafafa; }
    .stat-item { flex: 1; padding: 20px; text-align: center; border-right: 1px solid #e5e7eb; }
    .stat-item:last-child { border-right: none; }
    .stat-number { font-size: 28px; font-weight: 800; color: #0d9488; display: block; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .cover-meta { padding: 16px 36px; background: white; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #6b7280; }
    .cover-meta .authors { color: #374151; font-weight: 500; }
  </style>
  <div class="cover-header">
    <div class="cover-tag">RAG 演进系列 · 01</div>
    <div class="cover-title">Dense Passage Retrieval for Open-Domain Question Answering</div>
    <div class="cover-subtitle">用双塔编码器打破 BM25 三十年统治，RAG 时代的检索基石</div>
  </div>
  <div class="cover-stats">
    <div class="stat-item"><span class="stat-number">2.5K+</span><span class="stat-label">引用数</span></div>
    <div class="stat-item"><span class="stat-number">2020</span><span class="stat-label">发表年份</span></div>
    <div class="stat-item"><span class="stat-number">5</span><span class="stat-label">QA 数据集</span></div>
    <div class="stat-item"><span class="stat-number">7</span><span class="stat-label">参考文献</span></div>
  </div>
  <div class="cover-meta">
    <span class="authors">Karpukhin, Oğuz, Min, Lewis et al.</span>
    <span>EMNLP 2020 · Facebook AI</span>
  </div>
</div>

---

<div class="paper-screenshot">
  <style>
    .paper-screenshot { text-align: center; margin: 24px 0; padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb; }
    .paper-screenshot img { max-width: 100%; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .paper-screenshot .caption { font-size: 13px; color: #6b7280; margin-top: 10px; line-height: 1.6; }
  </style>
  <img src="https://cdn.jsdelivr.net/gh/yhfwsntz9b-a11y/daily-news-images@main/paper-rag-evolution/2004.04906_title_framed.png" alt="DPR 论文首页">
  <div class="caption">论文首页：Dense Passage Retrieval for Open-Domain Question Answering（Karpukhin et al. 2020, Facebook AI）</div>
</div>

---

# BM25 统治检索 30 年，Facebook 8 个人用 BERT 双塔把它干翻了

做问答系统的人都知道一个残酷的现实：你在 SQuAD 上训出来的阅读理解模型，exact match 80%+，一放到开放域直接崩到 40% 以下。问题出在哪？不是阅读器不行，是检索器太烂。

2020 年之前，开放域问答的检索器只有一个默认选择：BM25。这个 1994 年诞生的算法，靠词频匹配吃饭，已经统治信息检索领域 30 年。所有人都知道它有问题——同义词匹配不上、语义理解为零——但没人能找到更好的替代方案。

直到 Facebook AI 的 8 个研究员做了一个简单的实验：把 BERT 拆成两个独立的编码器，一个编码问题，一个编码段落，用向量内积做检索。就这么简单。结果在 5 个 QA 数据集上，top-20 检索准确率比 BM25 高了 9-19 个百分点。

这篇论文叫 **DPR（Dense Passage Retrieval）**。它不是 RAG，但它是 RAG 能工作的第一步——没有好的检索器，后面的生成全是空中楼阁。

---

**一句话总结：** DPR 证明了一个反直觉的结论：最简单的双塔编码器 + 适当的训练策略，就能在开放域检索上大幅击败 BM25，成为后来 RAG 系列工作的检索基石。

---

## 一、研究背景：BM25 的困境与开放域问答的瓶颈

要理解 DPR 为什么重要，得先搞清楚开放域问答（Open-Domain QA）在干什么。

简单说，就是给模型一堆问题，让它从几百万甚至几千万篇维基百科文章里找到答案。比如问"指环王里的坏人是谁？"，模型得先从 2100 万个段落里找到包含"Sauron"的那个段落，然后从中提取答案。

这个过程分两步：

```html
<div class="comparison-diagram">
  <style>
    .comparison-diagram { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-family: -apple-system, "PingFang SC", sans-serif; padding: 24px; margin: 20px 0; }
    .cmp-box { padding: 20px; border-radius: 12px; }
    .cmp-before { background: #fef2f2; border: 2px solid #fca5a5; }
    .cmp-after { background: #f0fdf4; border: 2px solid #86efac; }
    .cmp-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
    .cmp-before .cmp-title { color: #dc2626; }
    .cmp-after .cmp-title { color: #16a34a; }
    .cmp-text { color: #374151; font-size: 14px; line-height: 1.7; }
  </style>
  <div class="cmp-box cmp-before">
    <div class="cmp-title">Step 1: 检索器（Retriever）</div>
    <div class="cmp-text">
      从 2100 万个段落中，快速找到最可能包含答案的 top-k 个段落<br><br>
      • 要求：速度快（毫秒级）<br>
      • 要求：准确率高（答案必须在里面）<br>
      • 传统方案：BM25 / TF-IDF
    </div>
  </div>
  <div class="cmp-box cmp-after">
    <div class="cmp-title">Step 2: 阅读器（Reader）</div>
    <div class="cmp-text">
      仔细阅读检索到的 k 个段落，从中提取精确答案<br><br>
      • 要求：理解语义，定位答案片段<br>
      • 要求：跨段落排序，选最佳答案<br>
      • 主流方案：BERT-based Reader
    </div>
  </div>
</div>

问题出在第一步。BM25 的工作原理是词频匹配——问题里有什么词，就找包含这些词的段落。听起来合理，但有个致命缺陷：

**"body of water"（水域）和"sea"（海）/ "channel"（海峡）说的是同一件事，但 BM25 完全匹配不上。** 因为这些词没有重叠的 token。

论文里举了个很生动的例子：问"指环王里的坏人是谁？"，答案段落在说"Sala Baker is best known for portraying the villain Sauron"。BM25 很难把"bad guy"和"villain"匹配起来，但人类一看就知道这是同一个意思。

2019 年，Lee et al. 提出了 ORQA，第一次证明密集检索（dense retrieval）可以超过 BM25。但 ORQA 需要复杂的预训练任务（Inverse Cloze Task）和昂贵的端到端联合训练，工程实现极其复杂。

**关键问题来了：能不能用更简单的方法，让密集检索真正实用化？**

这就是 DPR 要回答的问题。

---

## 二、核心思路：两个 BERT，一个编码问题，一个编码段落

DPR 的核心创新，用一句话讲就是：**用两个独立的 BERT 编码器，分别把问题和段落编码成 768 维向量，用向量内积衡量相关性。**

就这么简单。没有复杂的预训练，没有端到端联合训练，就是两个 BERT + 一个内积。

```html
<div class="formula-card">
  <style>
    .formula-card { font-family: -apple-system, "PingFang SC", sans-serif; padding: 28px; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 2px solid #fde047; border-radius: 12px; margin: 20px 0; }
    .formula-name { font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 12px; letter-spacing: 1px; }
    .formula-expr { font-size: 22px; font-weight: 700; color: #1f2937; text-align: center; padding: 20px; background: white; border-radius: 8px; margin-bottom: 16px; font-family: "Times New Roman", serif; }
    .formula-explain { font-size: 14px; color: #4b5563; line-height: 1.7; }
    .formula-explain strong { color: #0d9488; }
  </style>
  <div class="formula-name">DENSE PASSAGE RETRIEVAL</div>
  <div class="formula-expr">sim(q, p) = E<sub>Q</sub>(q)<sup>T</sup> · E<sub>P</sub>(p)</div>
  <div class="formula-explain">
    <strong>E<sub>Q</sub></strong>：问题编码器（Question Encoder），BERT-base，取 [CLS] 向量 → 768 维<br>
    <strong>E<sub>P</sub></strong>：段落编码器（Passage Encoder），BERT-base，取 [CLS] 向量 → 768 维<br>
    <strong>sim(q, p)</strong>：问题和段落的相似度 = 两个向量的内积<br>
    <strong>检索</strong>：对所有段落计算 sim(q, p)，取 top-k
  </div>
</div>

这个架构叫 **Dual-Encoder（双塔编码器）**。为什么叫"双塔"？因为有两个独立的编码器，像两座塔一样并行工作。

**关键设计：段落编码器是离线运行的。** 2100 万个段落，每个都提前编码好向量，存到 FAISS 索引里。检索时只需要编码一次问题向量，然后在索引里做最近邻搜索，毫秒级返回结果。

<div class="arch-diagram">
  <style>
    .arch-diagram { font-family: -apple-system, "PingFang SC", sans-serif; padding: 24px; display: flex; flex-direction: column; align-items: center; margin: 20px 0; }
    .arch-mod { padding: 14px 24px; border-radius: 10px; border: 2px solid; text-align: center; width: 360px; }
    .arch-name { display: block; font-weight: 700; font-size: 14px; color: #1f2937; }
    .arch-desc { display: block; font-size: 12px; color: #6b7280; margin-top: 4px; }
    .arch-arrow { font-size: 20px; color: #9ca3af; padding: 4px 0; }
  </style>
  <div style="display:flex; gap:40px; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center;">
      <div class="arch-mod" style="background:#dbeafe;border-color:#2563eb;">
        <span class="arch-name">Question Encoder (BERT-base)</span>
        <span class="arch-desc">编码问题 → 768 维向量</span>
      </div>
      <div class="arch-arrow">↓ q⃗</div>
      <div class="arch-mod" style="background:#fef3c7;border-color:#d97706;">
        <span class="arch-name">FAISS Index (HNSW)</span>
        <span class="arch-desc">内积搜索 top-k 段落</span>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center;">
      <div class="arch-mod" style="background:#dcfce7;border-color:#16a34a;">
        <span class="arch-name">Passage Encoder (BERT-base)</span>
        <span class="arch-desc">离线编码 2100 万段落 → 向量库</span>
      </div>
      <div class="arch-arrow">↓ 离线构建</div>
      <div class="arch-mod" style="background:#f3f4f6;border-color:#6b7280;">
        <span class="arch-name">21,015,324 个段落向量</span>
        <span class="arch-desc">每个段落 100 词，标题 + [SEP] + 正文</span>
      </div>
    </div>
  </div>
</div>

---

## 三、技术方法深度拆解

### 3.1 训练目标：让正确答案的向量更近

训练数据长这样：每个问题 q 对应一组正例段落 p<sup>+</sup>（包含答案的段落）和多组负例段落 p<sup>-</sup>（不包含答案的段落）。

训练目标很直观：让问题和正例段落的向量内积尽可能大，和负例段落的内积尽可能小。

```html
<div class="formula-card">
  <style>
    .formula-card { font-family: -apple-system, "PingFang SC", sans-serif; padding: 28px; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 2px solid #fde047; border-radius: 12px; margin: 20px 0; }
    .formula-name { font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 12px; letter-spacing: 1px; }
    .formula-expr { font-size: 20px; font-weight: 700; color: #1f2937; text-align: center; padding: 20px; background: white; border-radius: 8px; margin-bottom: 16px; font-family: "Times New Roman", serif; }
    .formula-explain { font-size: 14px; color: #4b5563; line-height: 1.7; }
    .formula-explain strong { color: #0d9488; }
  </style>
  <div class="formula-name">NEGATIVE LOG-LIKELIHOOD LOSS</div>
  <div class="formula-expr">L(q) = -log [ exp(sim(q, p<sup>+</sup>)) / Σ<sub>i</sub> exp(sim(q, p<sub>i</sub>)) ]</div>
  <div class="formula-explain">
    本质就是 softmax 交叉熵：正例段落的得分越高越好，负例段落的得分越低越好<br>
    <strong>分母</strong>：正例 + 所有负例的 exp(sim) 之和（归一化）<br>
    <strong>关键</strong>：负例怎么选，直接决定模型质量
  </div>
</div>

### 3.2 负例策略：这才是 DPR 真正的秘密

DPR 最大的贡献不是双塔架构（这个早就有了），而是发现了**训练时负例怎么选，比模型架构重要得多**。

论文对比了三种负例策略：

```html
<div class="neg-strategy">
  <style>
    .neg-strategy { font-family: -apple-system, "PingFang SC", sans-serif; padding: 24px; margin: 20px 0; }
    .neg-card { padding: 16px 20px; border-radius: 10px; margin-bottom: 12px; border-left: 4px solid; }
    .neg-title { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    .neg-desc { font-size: 14px; color: #374151; line-height: 1.7; }
  </style>
  <div class="neg-card" style="background:#f0fdf4; border-color:#16a34a;">
    <div class="neg-title" style="color:#16a34a;">In-batch Negatives（批内负例）</div>
    <div class="neg-desc">一个 batch 里有 128 个问题，每个问题的正例段落之外，其他 127 个问题的正例段落都当作这个题目的负例。<br><strong>效果</strong>：零成本获得 127 个高质量负例，比随机负例好得多。</div>
  </div>
  <div class="neg-card" style="background:#fef2f2; border-color:#dc2626;">
    <div class="neg-title" style="color:#dc2626;">Hard Negatives（困难负例）</div>
    <div class="neg-desc">用 BM25 检索问题，找到得分最高但不包含答案的段落。这些段落"看起来很像正例但其实不是"，是最难区分的负例。<br><strong>效果</strong>：加 1 个 BM25 hard negative 就提升显著，加 2 个没更多帮助。</div>
  </div>
  <div class="neg-card" style="background:#eff6ff; border-color:#2563eb;">
    <div class="neg-title" style="color:#2563eb;">最终方案：In-batch + 1 Hard Negative</div>
    <div class="neg-desc">128 个批内负例 + 1 个 BM25 hard negative = 129 个负例。<br><strong>效果</strong>：在 NQ 开发集上 top-20 准确率从 78.1% 提升到 78.4%，看似不大但稳定。</div>
  </div>
</div>

**设计选择：** 为什么 hard negative 加 1 个就够了，加 2 个反而没用？因为 1 个 hard negative 已经教会模型"别被 BM25 高分骗了"，再加更多只是重复同一种错误模式。模型需要的是多样化的负例，而不是同一种负例的重复。

### 3.3 FAISS 索引：2100 万段落的毫秒级检索

编码完 2100 万个段落向量后，怎么快速找到最近的 k 个？暴力搜索要算 2100 万次内积，太慢。

DPR 用的是 Facebook 开源的 FAISS 库，具体配置是 HNSW（Hierarchical Navigable Small World）索引：

- 索引类型：HNSW
- 每节点存储邻居数：512
- 构建时搜索深度：200
- 查询时搜索深度：128
- 检索延迟：毫秒级

**设计选择：** 为什么用 HNSW 而不是 IVF（倒排索引）？因为 HNSW 在召回率和速度之间的平衡更好。对于 768 维的 dense vector，HNSW 能在 top-10 召回率 >95% 的情况下，把检索时间控制在 10ms 以内。

---

## 四、实验分析：全面碾压 BM25

### 4.1 检索准确率：9-19% 的绝对提升

DPR 在 5 个开放域 QA 数据集上测试检索性能：Natural Questions、TriviaQA、WebQuestions、CuratedTREC、SQuAD。

看论文 Table 2 的核心数据：

```html
<div class="paper-table">
  <style>
    .paper-table { font-family: -apple-system, "PingFang SC", sans-serif; margin: 24px 0; overflow-x: auto; }
    .paper-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .paper-table caption { text-align: left; font-size: 13px; color: #6b7280; margin-bottom: 10px; font-weight: 500; }
    .paper-table th { background: #0f766e; color: white; padding: 10px 12px; text-align: center; font-weight: 600; font-size: 12px; letter-spacing: 0.5px; }
    .paper-table td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center; }
    .paper-table tr:nth-child(even) td { background: #f9fafb; }
    .paper-table tr:hover td { background: #f0fdfa; }
    .paper-table .highlight { background: #fef3c7 !important; font-weight: 700; color: #92400e; }
    .paper-table .highlight-best { background: #dcfce7 !important; font-weight: 700; color: #166534; }
    .paper-table .row-label { text-align: left; font-weight: 500; }
  </style>
  <table>
    <caption>Table 2：Top-20 检索准确率（%）——DPR 在 5 个数据集上全面超越 BM25</caption>
    <thead>
      <tr>
        <th style="text-align:left">Model</th>
        <th>NQ</th>
        <th>TriviaQA</th>
        <th>WQ</th>
        <th>TREC</th>
        <th>SQuAD</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="row-label">BM25</td><td>59.1</td><td>66.9</td><td>55.0</td><td>70.9</td><td>68.8</td></tr>
      <tr class="highlight-best"><td class="row-label"><strong>DPR (Single)</strong></td><td><strong>78.4</strong></td><td><strong>79.4</strong></td><td><strong>73.2</strong></td><td><strong>79.8</strong></td><td>63.2</td></tr>
      <tr class="highlight"><td class="row-label">BM25 + DPR</td><td>76.6</td><td>79.8</td><td>71.0</td><td>85.2</td><td><strong>71.5</strong></td></tr>
      <tr><td class="row-label">DPR (Multi)</td><td>79.4</td><td>78.8</td><td>75.0</td><td>89.1</td><td>51.6</td></tr>
    </tbody>
  </table>
</div>

看几个关键数字：

- **NQ 数据集**：BM25 是 59.1%，DPR 直接干到 78.4%——**19.3 个百分点的绝对提升**。这不是小改进，这是质变。
- **TREC 数据集**：BM25 是 70.9%，DPR Multi 达到 89.1%——**18.2 个百分点**。
- **SQuAD 是唯一例外**：DPR (63.2%) 反而不如 BM25 (68.8%)。为什么？因为 SQuAD 的标注方式是 annotator 先看到段落再写问题，导致问题和段落有大量词汇重叠，BM25 天然占优。

**BM25 + DPR 的组合效果**也很有意思：在 SQuAD 上组合后达到 71.5%，说明 dense 和 sparse 检索确实是互补的——一个擅长语义匹配，一个擅长关键词匹配。

### 4.2 端到端 QA：检索好，最终答案也好

检索准确率提升最终传导到了端到端 QA 性能：

```html
<div class="paper-table">
  <style>
    .paper-table { font-family: -apple-system, "PingFang SC", sans-serif; margin: 24px 0; overflow-x: auto; }
    .paper-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .paper-table caption { text-align: left; font-size: 13px; color: #6b7280; margin-bottom: 10px; font-weight: 500; }
    .paper-table th { background: #0f766e; color: white; padding: 10px 12px; text-align: center; font-weight: 600; font-size: 12px; }
    .paper-table td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center; }
    .paper-table tr:nth-child(even) td { background: #f9fafb; }
    .paper-table tr:hover td { background: #f0fdfa; }
    .paper-table .highlight-best { background: #dcfce7 !important; font-weight: 700; color: #166534; }
    .paper-table .row-label { text-align: left; font-weight: 500; }
  </style>
  <table>
    <caption>Table 4：端到端 QA 准确率（Exact Match %）——DPR-based 模型在 4/5 数据集上刷新 SOTA</caption>
    <thead>
      <tr>
        <th style="text-align:left">Model</th>
        <th>NQ</th>
        <th>TriviaQA</th>
        <th>WQ</th>
        <th>TREC</th>
        <th>SQuAD</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="row-label">BM25 + BERT (ORQA baseline)</td><td>26.5</td><td>47.1</td><td>17.7</td><td>21.3</td><td>33.2</td></tr>
      <tr><td class="row-label">ORQA</td><td>33.3</td><td>45.0</td><td>36.4</td><td>30.1</td><td>20.2</td></tr>
      <tr><td class="row-label">REALM</td><td>40.4</td><td>—</td><td>40.7</td><td>42.9</td><td>—</td></tr>
      <tr class="highlight-best"><td class="row-label"><strong>DPR (Multi)</strong></td><td><strong>41.5</strong></td><td><strong>56.8</strong></td><td><strong>42.4</strong></td><td><strong>49.4</strong></td><td>24.1</td></tr>
      <tr><td class="row-label">BM25 + DPR (Multi)</td><td>38.8</td><td>57.9</td><td>41.1</td><td>50.6</td><td>35.8</td></tr>
    </tbody>
  </table>
</div>

关键发现：

- **DPR 在 NQ 上达到 41.5% EM**，超过 REALM 的 40.4%，而且 DPR 的训练简单得多——不需要额外的预训练任务。
- **TriviaQA 上达到 56.8% EM**，比 ORQA 的 45.0% 高了 11.8 个百分点。
- **小数据集优势更明显**：WQ 和 TREC 上，Multi-dataset 训练的 DPR 大幅领先所有 baseline。

**反直觉的发现：DPR 不需要复杂的联合训练。** ORQA 和 REALM 都需要检索器和阅读器的端到端联合训练，工程极其复杂。DPR 证明了：先把检索器训好，再单独训阅读器，两步分开做，效果反而更好。

### 4.3 样本效率：1000 个样本就能超过 BM25

论文还做了一个很有启发性的实验：只用一部分训练数据训 DPR，看检索准确率怎么变化。

结果：**只用 1000 个训练样本，DPR 就已经超过 BM25 了。**

这个发现意义重大：它说明 BERT 的预训练知识已经足够强大，只需要很少的 task-specific 数据就能学会 dense retrieval。不需要百万级的训练对，1000 个就够了。

---

## 五、DPR 的历史定位：RAG 系列的基石

回过头看，DPR 的意义远不止"比 BM25 好"。它真正做的事情是：

```html
<div class="timeline-diagram">
  <style>
    .timeline-diagram { font-family: -apple-system, "PingFang SC", sans-serif; padding: 24px; background: #fafafa; border-radius: 12px; margin: 20px 0; }
    .tl-item { display: flex; align-items: center; padding: 8px 0; border-left: 3px solid #0d9488; margin-left: 40px; padding-left: 16px; position: relative; }
    .tl-year { font-weight: 700; color: #0d9488; min-width: 60px; font-size: 14px; }
    .tl-text { color: #374151; font-size: 14px; }
    .tl-item::before { content: ''; position: absolute; left: -7px; width: 11px; height: 11px; background: #0d9488; border-radius: 50%; }
  </style>
  <div class="tl-item"><span class="tl-year">2020.04</span><span class="tl-text"><strong>DPR</strong>：证明 dense retrieval 可以实用化，双塔编码器成为标配</span></div>
  <div class="tl-item"><span class="tl-year">2020.10</span><span class="tl-text"><strong>RAG</strong>：在 DPR 基础上加上生成器，正式命名 RAG 框架</span></div>
  <div class="tl-item"><span class="tl-year">2021</span><span class="tl-text"><strong>FiD</strong>：改进检索结果的融合方式，多路检索结果在 Decoder 层融合</span></div>
  <div class="tl-item"><span class="tl-year">2022</span><span class="tl-text"><strong>Contriever</strong>：无监督训练 dense retriever，不再需要 QA 标注数据</span></div>
  <div class="tl-item"><span class="tl-year">2023</span><span class="tl-text"><strong>Self-RAG</strong>：让模型自己决定什么时候需要检索</span></div>
  <div class="tl-item"><span class="tl-year">2024</span><span class="tl-text"><strong>GraphRAG</strong>：从段落检索升级到知识图谱检索</span></div>
</div>

DPR 是这条演进链的第一块砖。没有 DPR 证明"dense retrieval 可以工作"，就不会有 RAG 的"dense retrieval + generation"，也不会有后面所有的改进。

**DPR 的三个核心遗产：**

1. **双塔架构成为行业标准**：后来所有的 dense retriever（Contriever、ANCE、ColBERT）都是双塔架构的变体。
2. **训练策略比模型架构重要**：in-batch negatives + hard negatives 的训练范式被后续所有工作沿用。
3. **开源精神**：DPR 开源了代码、模型和预处理数据，让后续研究者可以直接复用，加速了整个领域的发展。

---

**下一篇预告：** RAG (2020.10) —— 在 DPR 的检索器上加上 BART 生成器，正式定义"检索增强生成"这个范式。Facebook 的同一个团队，如何在 6 个月内从"好的检索器"走到"检索+生成"的统一框架？
