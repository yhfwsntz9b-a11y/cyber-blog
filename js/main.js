/* ==========================================
   主逻辑文件 - Main JavaScript
   ========================================== */

// 文章数据库（模拟）
const articlesDB = [
  {
    id: 'ai-001',
    title: 'Transformer架构通俗解读：AI如何"理解"文本',
    category: 'ai',
    date: '2024-06-20',
    excerpt: '用成都火锅做类比，带你理解Transformer的核心机制——注意力机制。就像吃火锅时，你同时关注锅里的肉、调料碗和朋友的聊天，Transformer就是这样"理解"文本上下文的。',
    file: 'posts/ai/transformer-explained.md'
  },
  {
    id: 'ai-002',
    title: 'RAG技术详解：让AI学会"翻书"',
    category: 'ai',
    date: '2024-06-15',
    excerpt: 'RAG（检索增强生成）是什么？想象考试时允许翻书，AI先"查资料"再回答，答案更准确、更有依据。本文用通俗案例解读RAG原理与应用。',
    file: 'posts/ai/rag-explained.md'
  },
  {
    id: 'tech-001',
    title: '成都AI产业地图：天府软件园到天府新区',
    category: 'tech',
    date: '2024-06-18',
    excerpt: '盘点成都AI产业布局，从天府软件园的游戏AI创业公司，到天府新区的自动驾驶测试基地，成都正在成为西南AI高地。',
    file: 'posts/tech/chengdu-ai-map.md'
  },
  {
    id: 'tech-002',
    title: '大模型推理优化：从显存瓶颈到推理加速',
    category: 'tech',
    date: '2024-06-10',
    excerpt: '大模型部署时遇到的显存瓶颈如何解决？本文详解量化、KV Cache优化、Flash Attention等技术方案，附实际调优经验。',
    file: 'posts/tech/llm-inference-optimize.md'
  },
  {
    id: 'sociology-001',
    title: '成都老旧小区改造的社会学观察',
    category: 'sociology',
    date: '2024-06-12',
    excerpt: '从社区治理视角，观察成都老旧小区改造过程中的居民参与、利益博弈与社区重塑，探讨"共建共治共享"的成都实践。',
    file: 'posts/sociology/old-community-reform.md'
  },
  {
    id: 'sociology-002',
    title: '网红城市背后：成都消费文化的社会学解读',
    category: 'sociology',
    date: '2024-06-05',
    excerpt: '从"吃货之都"到"网红城市"，成都的消费文化有何独特之处？社会学家眼中的成都消费密码与城市性格。',
    file: 'posts/sociology/consumer-culture.md'
  },
  {
    id: 'psychology-001',
    title: '"巴适"的心理学：成都青年的心理韧性',
    category: 'psychology',
    date: '2024-06-08',
    excerpt: '成都人常说的"巴适"背后，是一种怎样的心理状态？从积极心理学视角，解读成都青年的心理韧性与生活智慧。',
    file: 'posts/psychology/bashi-psychology.md'
  },
  {
    id: 'psychology-002',
    title: '拖延症的科学解法：不是意志力问题',
    category: 'psychology',
    date: '2024-06-01',
    excerpt: '拖延症不是懒惰，也不是意志力薄弱。本文从认知心理学角度，解析拖延症的真实原因，提供科学有效的解决方案。',
    file: 'posts/psychology/procrastination-solution.md'
  }
];

// 分类配置
const categoryConfig = {
  all: { name: '全部', color: 'cyan', icon: '📚' },
  ai: { name: 'AI', color: 'purple', icon: '🤖' },
  tech: { name: '科技', color: 'cyan', icon: '💻' },
  sociology: { name: '社会学', color: 'pink', icon: '🏘️' },
  psychology: { name: '心理学', color: 'green', icon: '🧠' }
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化时间线
  initTimeline();

  // 初始化分类筛选
  initCategoryFilter();

  // 初始化导航高亮
  initNavHighlight();
});

/* ==========================================
   时间线初始化
   ========================================== */
function initTimeline() {
  const container = document.getElementById('timelineContainer');
  const loading = document.getElementById('loading');

  if (!container) return;

  // 模拟加载延迟
  setTimeout(() => {
    loading.style.display = 'none';
    renderTimeline(articlesDB, container);
  }, 500);
}

function renderTimeline(articles, container) {
  // 按日期倒序排序
  const sortedArticles = [...articles].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  let html = '';

  sortedArticles.forEach((article, index) => {
    const catConfig = categoryConfig[article.category];
    const cardColor = article.category === 'ai' ? 'purple' :
                      article.category === 'sociology' ? 'pink' :
                      article.category === 'psychology' ? 'green' : '';

    html += `
      <div class="timeline-item" data-category="${article.category}">
        <div class="timeline-date">${formatDate(article.date)}</div>
        <div class="timeline-content">
          <a href="post.html?id=${article.id}" class="article-card ${cardColor}">
            <div class="article-meta">
              <span class="cyber-tag ${article.category}">${catConfig.icon} ${catConfig.name}</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-footer">
              <span class="article-date">📅 ${formatDate(article.date)}</span>
              <span class="cyber-btn" style="padding: 6px 16px; font-size: 11px;">阅读全文 →</span>
            </div>
          </a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* ==========================================
   分类筛选
   ========================================== */
function initCategoryFilter() {
  const buttons = document.querySelectorAll('.category-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.dataset.category;

      // 更新按钮状态
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // 筛选文章
      filterArticles(category);
    });
  });
}

function filterArticles(category) {
  const items = document.querySelectorAll('.timeline-item');

  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.style.display = 'block';
      item.style.animation = 'fadeIn 0.5s ease';
    } else {
      item.style.display = 'none';
    }
  });
}

/* ==========================================
   导航高亮
   ========================================== */
function initNavHighlight() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================
   工具函数
   ========================================== */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// 添加淡入动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

/* ==========================================
   Markdown加载器（用于文章详情页）
   ========================================== */
async function loadMarkdown(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('文件加载失败');
    return await response.text();
  } catch (error) {
    console.error('加载Markdown失败:', error);
    return null;
  }
}

// 获取URL参数
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 导出供其他页面使用
window.CyberNote = {
  articlesDB,
  categoryConfig,
  loadMarkdown,
  getUrlParam,
  formatDate
};
