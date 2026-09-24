# FiD：当 100 篇文档同时涌入 Decoder，奇迹发生了

> **RAG 演进系列 · 03** | 2026-09-24
>
> 论文：*Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering*
> 作者：Gautier Izacard, Édouard Grave
> 机构：Facebook AI Research / ENS / Inria
> 时间：2020 年 7 月 | EACL 2021

---

<div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%); border-radius: 16px; padding: 32px; margin: 24px 0; color: white; box-shadow: 0 8px 32px rgba(217,119,6,0.3);">
  <div style="font-size: 12px; opacity: 0.8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">RAG Evolution Series · 03</div>
  <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800;">Fusion-in-Decoder</h1>
  <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">多文档融合的正确姿势 — 独立编码，联合解码</p>
  <div style="font-size: 13px; opacity: 0.7; margin-bottom: 16px;">Gautier Izacard, Édouard Grave · Facebook AI Research / ENS / Inria</div>
  <div style="font-size: 13px; opacity: 0.7; margin-bottom: 20px;">EACL 2021 · arXiv: 2007.01282</div>
  <div style="display: flex; gap: 24px; flex-wrap: wrap;">
    <div style="background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px 20px; text-align: center;">
      <div style="font-size: 24px; font-weight: 700;">51.4%</div>
      <div style="font-size: 12px; opacity: 0.8;">NQ 准确率</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px 20px; text-align: center;">
      <div style="font-size: 24px; font-weight: 700;">100</div>
      <div style="font-size: 12px; opacity: 0.8;">检索文档数</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px 20px; text-align: center;">
      <div style="font-size: 24px; font-weight: 700;">T5</div>
      <div style="font-size: 12px; opacity: 0.8;">backbone 模型</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px 20px; text-align: center;">
      <div style="font-size: 24px; font-weight: 700;">O(n)</div>
      <div style="font-size: 12px; opacity: 0.8;">线性计算复杂度</div>
    </div>
  </div>
</div>

![FiD 论文标题页](https://cdn.jsdelivr.net/gh/yhfwsntz9b-a11y/daily-news-images@main/paper-rag-evolution/2007.01282_title_framed.png)

---

## 一句话钩子

RAG 用边缘化来"融合"多篇文档，优雅但受限——最多用 5-10 篇。FiD 说：**为什么不直接把 100 篇文档全塞进去？** 关键是：encoder 独立处理每篇，decoder 统一融合。简单，暴力，有效。

---

## 背景：RAG 的多文档困境

上一篇我们讲到，RAG 提出了两种融合检索文档的方式：

- **RAG-Sequence**：每篇文档独立生成完整答案，然后加权求和
- **RAG-Token**：每生成一个 token，都在多篇文档间加权

这两种方案都有一个共同限制：**实际使用的文档数量很少**（通常 K=5 或 10）。原因很直接——不管哪种方式，计算量都随文档数急剧增长。

<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 8px;">
  <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">🤔 RAG 的多文档困境</div>
  <div style="color: #78350f; font-size: 15px; line-height: 1.8;">
    <strong>RAG-Sequence：</strong>K 篇文档 → K 次独立 beam search → 加权合并。K=100 时计算量是 K=5 的 20 倍。<br>
    <strong>RAG-Token：</strong>每步生成 token 都要在 K 篇文档间做 softmax。虽然只需一次 beam search，但每步的计算量是 K 倍。<br><br>
    而实验表明，<strong>检索 100 篇文档比检索 5 篇好得多</strong>——前提是你能有效利用它们。
  </div>
</div>

### 提取式模型的天花板

在 FiD 之前，大多数 ODQA 系统是**提取式**的：检索文档 → 在文档中标注答案 span。这类模型有个特点——**检索超过 10-20 篇文档后，性能不升反降**。

原因很简单：提取式模型需要在所有检索文档中"找到"答案，文档越多，搜索空间越大，噪声越多。

**有没有一种模型，能真正从 100 篇文档中"综合"出答案？**

---

## 核心思想：Fusion-in-Decoder

FiD 的设计哲学可以用一句话概括：

<div style="background: #fffbeb; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #fde68a;">
  <div style="font-size: 18px; line-height: 1.8; color: #92400e; text-align: center; font-weight: 600;">
    "每篇文档独立过 Encoder，所有文档一起过 Decoder。"
  </div>
</div>

这个设计的精妙之处在于：

### Encoder 端：独立处理，线性扩展

每篇检索到的文档和原始问题拼接后，**独立**通过 encoder。这意味着：

- 每篇文档的 self-attention 计算量是 O(L²)，L 是序列长度
- N 篇文档的总计算量是 O(N × L²)，**线性增长**
- 如果把 N 篇文档拼在一起过 encoder，self-attention 的计算量是 O((N×L)²)，**平方增长**

### Decoder 端：联合融合，证据聚合

所有文档的 encoder 输出拼接在一起，decoder 通过 cross-attention 统一 attend。这意味着：

- Decoder 的每个 token 都可以"看到"所有文档的信息
- 不同文档中的证据可以被**交叉引用**和**综合**
- 模型学会了从多篇文档中"拼凑"出完整答案

<div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
  <div style="font-weight: 700; color: #92400e; font-size: 16px; margin-bottom: 16px; text-align: center;">FiD 架构：独立编码，联合解码</div>
  
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
    <!-- Input -->
    <div style="background: white; border: 2px solid #d97706; border-radius: 10px; padding: 12px 24px; font-weight: 600; color: #92400e; text-align: center; min-width: 280px;">
      问题：Where was Alan Turing born?
    </div>
    
    <div style="font-size: 20px; color: #d97706;">↓ 检索 100 篇文档</div>
    
    <!-- Encoder: parallel independent -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-width: 600px;">
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; color: #92400e; font-weight: 600;">Encoder</div>
        <div style="font-size: 10px; color: #78350f; margin-top: 4px;">Q + Passage 1<br>"Alan Turing was a British..."</div>
      </div>
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; color: #92400e; font-weight: 600;">Encoder</div>
        <div style="font-size: 10px; color: #78350f; margin-top: 4px;">Q + Passage 2<br>"Turing was born in Maida Vale..."</div>
      </div>
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; color: #92400e; font-weight: 600;">Encoder</div>
        <div style="font-size: 10px; color: #78350f; margin-top: 4px;">Q + Passage N<br>"Born in London, Turing..."</div>
      </div>
    </div>
    
    <div style="font-size: 12px; color: #b45309; text-align: center;">⬆ 各自独立编码 · 互不干扰 · O(N) 线性扩展 ⬆</div>
    
    <div style="font-size: 20px; color: #d97706;">↓ 拼接所有 encoder 输出</div>
    
    <!-- Decoder -->
    <div style="background: #fff7ed; border: 2px solid #ea580c; border-radius: 10px; padding: 16px 24px; text-align: center; min-width: 320px;">
      <div style="font-weight: 700; color: #9a3412; margin-bottom: 6px;">🔥 Decoder（Cross-Attention 融合所有文档）</div>
      <div style="font-size: 13px; color: #7c2d12;">每个生成步骤 attend 到所有 100 篇文档的 encoder 表示</div>
      <div style="font-size: 12px; color: #ea580c; margin-top: 4px;">证据聚合 · 交叉引用 · 综合推理</div>
    </div>
    
    <div style="font-size: 20px; color: #d97706;">↓</div>
    
    <!-- Output -->
    <div style="background: white; border: 2px solid #d97706; border-radius: 10px; padding: 12px 24px; font-weight: 600; color: #92400e; text-align: center; min-width: 280px;">
      答案：Maida Vale, London
    </div>
  </div>
</div>

---

## 与 RAG 的关键区别

<div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 20px 0;">
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background: #f1f5f9;">
        <th style="padding: 12px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569;">维度</th>
        <th style="padding: 12px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #6366f1;">RAG</th>
        <th style="padding: 12px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #d97706;">FiD</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">文档数量</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">K = 5~10</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 600; color: #d97706;">N = 100</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">Encoder 处理</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">每文档独立编码（与 DPR 共享）</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">每文档 + 问题独立编码</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">融合方式</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">概率边缘化（加权求和）</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 600; color: #d97706;">Decoder cross-attention 直接融合</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">检索器训练</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">端到端联合训练</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">检索器独立，只训练生成器</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">计算扩展性</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">K 增大 → 计算量爆炸</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #16a34a;">N 增大 → 线性增长</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; color: #334155;">Backbone</td>
        <td style="padding: 10px 16px; text-align: center;">DPR + BART</td>
        <td style="padding: 10px 16px; text-align: center;">DPR/BM25 + T5</td>
      </tr>
    </tbody>
  </table>
</div>

---

## 实验结果：碾压一切

<div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 20px 0;">
  <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; font-size: 14px;">
    Table 1: 开放域问答 SOTA 对比（Exact Match %）
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background: #f1f5f9;">
        <th style="padding: 10px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569;">模型</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">NQ</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">TriviaQA</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">SQuAD</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">T5-11B（闭卷，110亿参数）</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">36.6</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">—</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">60.5</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">DPR（提取式）</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">41.5</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">57.9</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">RAG-Sequence（生成式）</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">44.5</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">56.1</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">68.0</td>
      </tr>
      <tr style="background: #fffbeb;">
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #92400e; font-weight: 700;">FiD-base（220M 参数）</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700; color: #92400e;">48.2</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700; color: #92400e;">65.0</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700; color: #92400e;">77.1</td>
      </tr>
      <tr style="background: #fef3c7;">
        <td style="padding: 8px 16px; color: #78350f; font-weight: 800;">FiD-large（770M 参数）</td>
        <td style="padding: 8px 16px; text-align: center; font-weight: 800; color: #78350f;">51.4</td>
        <td style="padding: 8px 16px; text-align: center; font-weight: 800; color: #78350f;">67.6</td>
        <td style="padding: 8px 16px; text-align: center; font-weight: 800; color: #78350f;">80.1</td>
      </tr>
    </tbody>
  </table>
</div>

### 关键发现

**1. 小模型 + 检索 > 大模型无检索**

FiD-large（770M）在 NQ 上达到 51.4%，而 T5-11B（110 亿参数，无检索）只有 36.6%。参数量差了 14 倍，但 FiD 碾压式领先。

这证明了一个重要观点：**对于知识密集型任务，"在哪里存知识"比"模型有多大"更重要**。

**2. 生成式 > 提取式（再次确认）**

FiD-large 在 NQ 上比 DPR（提取式）高了近 10 个点。生成式模型能利用那些"不包含精确答案但有线索"的文档。

**3. FiD > RAG**

FiD 在 NQ 上比 RAG-Sequence 高了 7 个点。差距来自：
- 更多文档（100 vs 5-10）
- 更直接的融合方式（cross-attention vs 概率边缘化）

---

## 最重要的实验：文档数量 vs 性能

这是 FiD 论文中最有说服力的实验。

<div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
  <div style="font-weight: 700; color: #92400e; font-size: 16px; margin-bottom: 16px; text-align: center;">检索文档数量 vs 准确率（FiD-base）</div>
  
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <!-- 5 passages -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 60px; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">5 篇</div>
      <div style="flex: 1; background: #fef3c7; border-radius: 6px; height: 28px; position: relative;">
        <div style="background: #d97706; border-radius: 6px; height: 100%; width: 56%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
          <span style="color: white; font-size: 12px; font-weight: 600;">45.0%</span>
        </div>
      </div>
    </div>
    <!-- 10 passages -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 60px; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">10 篇</div>
      <div style="flex: 1; background: #fef3c7; border-radius: 6px; height: 28px; position: relative;">
        <div style="background: #d97706; border-radius: 6px; height: 100%; width: 60%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
          <span style="color: white; font-size: 12px; font-weight: 600;">45.3%</span>
        </div>
      </div>
    </div>
    <!-- 25 passages -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 60px; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">25 篇</div>
      <div style="flex: 1; background: #fef3c7; border-radius: 6px; height: 28px; position: relative;">
        <div style="background: #d97706; border-radius: 6px; height: 100%; width: 64%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
          <span style="color: white; font-size: 12px; font-weight: 600;">46.0%</span>
        </div>
      </div>
    </div>
    <!-- 50 passages -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 60px; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">50 篇</div>
      <div style="flex: 1; background: #fef3c7; border-radius: 6px; height: 28px; position: relative;">
        <div style="background: #d97706; border-radius: 6px; height: 100%; width: 65%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
          <span style="color: white; font-size: 12px; font-weight: 600;">46.0%</span>
        </div>
      </div>
    </div>
    <!-- 100 passages -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 60px; text-align: right; font-weight: 600; color: #92400e; font-size: 14px;">100 篇</div>
      <div style="flex: 1; background: #fef3c7; border-radius: 6px; height: 28px; position: relative;">
        <div style="background: linear-gradient(90deg, #d97706, #f59e0b); border-radius: 6px; height: 100%; width: 68%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
          <span style="color: white; font-size: 12px; font-weight: 700;">46.5%</span>
        </div>
      </div>
    </div>
  </div>
  
  <div style="margin-top: 16px; padding: 12px; background: rgba(217,119,6,0.08); border-radius: 8px; font-size: 14px; color: #92400e; line-height: 1.7;">
    <strong>关键洞察：</strong>从 5 篇到 100 篇，准确率持续上升。而提取式模型在 10-20 篇后就开始下降。<br>
    这证明 <strong>seq2seq 模型确实能有效聚合多篇文档的证据</strong>——这是 FiD 最核心的贡献。
  </div>
</div>

---

## 训练效率：聪明的省钱策略

用 100 篇文档训练很贵。论文提出了一个实用的训练策略：

<div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 20px 0;">
  <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; font-size: 14px;">
    Table 2: 训练文档数 vs 性能（NQ 开发集 EM%）
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background: #f1f5f9;">
        <th style="padding: 10px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569;">训练文档数</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">直接训练</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">先少后多（finetune）</th>
        <th style="padding: 10px 16px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569;">GPU 时间</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">5 篇</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">45.0</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">45.0</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">~30h</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">10 篇</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">45.3</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">45.3</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">~50h</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">25 篇</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">46.0</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">46.0</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f1f5f9; text-align: center;">~100h</td>
      </tr>
      <tr style="background: #fffbeb;">
        <td style="padding: 8px 16px; color: #92400e; font-weight: 700;">100 篇</td>
        <td style="padding: 8px 16px; text-align: center; font-weight: 700; color: #92400e;">46.5</td>
        <td style="padding: 8px 16px; text-align: center; font-weight: 700; color: #92400e;">46.0</td>
        <td style="padding: 8px 16px; text-align: center; color: #92400e;">425h vs 147h</td>
      </tr>
    </tbody>
  </table>
</div>

**"先少后多"策略**：先用少量文档（如 5 篇）训练较长时间，再用 100 篇文档微调 1000 步。这样只需 147 GPU 小时就能达到 46.0 EM，比直接用 100 篇训练（425 GPU 小时，46.5 EM）省了 65% 的计算量，性能只差 0.5 个点。

---

## 历史定位：FiD 在 RAG 演进中的角色

<div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 20px 0;">
  <div style="font-weight: 700; color: #92400e; font-size: 16px; margin-bottom: 20px; text-align: center;">FiD 解决了什么核心问题？</div>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div style="background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; color: #dc2626; font-size: 14px; margin-bottom: 8px;">❌ 之前的问题</div>
      <div style="font-size: 14px; color: #334155; line-height: 1.7;">
        RAG 的边缘化策略只能处理少量文档（K≤10），无法充分利用检索到的大量信息。提取式模型在文档超过 20 篇后性能下降。
      </div>
    </div>
    <div style="background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-weight: 600; color: #16a34a; font-size: 14px; margin-bottom: 8px;">✅ FiD 的解决方案</div>
      <div style="font-size: 14px; color: #334155; line-height: 1.7;">
        独立编码 + 联合解码。Encoder 端线性扩展，Decoder 端交叉注意力融合。100 篇文档轻松处理，性能持续提升。
      </div>
    </div>
  </div>
</div>

FiD 的意义不仅在于刷了 SOTA，更在于它证明了一个重要假设：

<div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center;">
  <div style="font-size: 18px; color: #92400e; font-weight: 700; line-height: 1.6;">
    "生成模型天然擅长多证据聚合。<br>你给它越多文档，它表现越好。<br>这在提取式模型上是不可能的。"
  </div>
</div>

---

## FiD 的局限性

FiD 虽然强大，但也有明显的短板：

1. **检索器不参与训练**：FiD 的检索器（DPR/BM25）是固定的，不会针对下游任务优化检索质量。如果检索到的文档不好，生成器也无能为力。

2. **计算成本仍然很高**：100 篇文档独立过 encoder 意味着 100 次 encoder forward pass。推理速度远慢于 RAG。

3. **没有检索质量评估**：不管检索到的文档是否相关，都会全部用上。噪声文档可能引入干扰。

4. **只做了 QA 任务**：不像 RAG 那样在生成、分类等多种任务上验证。

这些问题，为后续的自我反思式检索（Self-RAG）和纠错式检索（CRAG）埋下了伏笔。

---

## 下一篇预告

FiD 证明了"给模型越多文档越好"，但有一个前提——**这些文档得是好的**。如果检索器返回了一堆无关文档呢？Self-RAG 的答案是：**让模型自己决定什么时候需要检索、检索到的文档有没有用、生成的答案是否有依据**。

**下一篇：Self-RAG — 让模型学会"自我反思"** 🔜

---

*本系列追踪 RAG 技术从诞生到演进的全过程。上一篇：[DPR — Dense Retrieval 的开山之作](20260924_DPR.md) | 上上篇：[RAG — 检索 + 生成的范式确立](20260924_RAG.md)*
