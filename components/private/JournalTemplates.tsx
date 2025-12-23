import React, { useState } from 'react';

export interface JournalTemplate {
  id: string;
  name: string;
  icon: string;
  title: string;
  tags: string[];
  content: string; // HTML content for the editor
}

const TEMPLATES: JournalTemplate[] = [
  // 1. 日常 (Tags Updated)
  {
    id: 'daily',
    name: '日常碎碎念',
    icon: 'fa-coffee',
    title: '📅 今日观察日记',
    tags: ['Daily', 'Life', 'Log'],
    content: `
      <h3>🌞 早安时刻</h3>
      <p>今天醒来的第一感觉是...</p>
      <p><br/></p>
      <h3>⚡ 今日高光 (Highlight)</h3>
      <ul>
        <li>这件小事让我很开心：</li>
      </ul>
      <p><br/></p>
      <h3>🍱 饮食记录</h3>
      <p>今日份的美味：</p>
      <p><br/></p>
      <h3>🌙 晚间反思</h3>
      <p>如果给今天打分（1-10），我打 ___ 分，因为...</p>
      <blockquote>"生活原本沉闷，但跑起来就有风。"</blockquote>
    `
  },
  // 2. 旅行 (Tags Updated)
  {
    id: 'travel',
    name: '旅行游记',
    icon: 'fa-plane',
    title: '✈️ 旅途：[目的地]',
    tags: ['Travel', 'Photography', 'Journey'],
    content: `
      <h3>📍 坐标 & 天气</h3>
      <p>地点：</p>
      <p>天气：</p>
      <p><br/></p>
      <h3>🎒 今日行程</h3>
      <p>我们去了这些地方：</p>
      <ul>
        <li>打卡点 1：</li>
        <li>打卡点 2：</li>
      </ul>
      <p><br/></p>
      <h3>📸 最佳镜头</h3>
      <p><i>(在此处插入最喜欢的一张照片)</i></p>
      <p>这张照片背后的故事是...</p>
      <p><br/></p>
      <h3>🍜 舌尖上的旅行</h3>
      <p>最惊艳的一道菜是...</p>
    `
  },
  // 3. 观影 (Tags Updated)
  {
    id: 'movie',
    name: '观影记录',
    icon: 'fa-film',
    title: '🎬 观影：《片名》',
    tags: ['Movie', 'Review', 'Thoughts'],
    content: `
      <h3>🎟️ 影片档案</h3>
      <ul>
        <li>片名：</li>
        <li>导演/主演：</li>
        <li>我的评分：⭐⭐⭐⭐⭐</li>
      </ul>
      <p><br/></p>
      <h3>💬 剧情梗概 (不剧透版)</h3>
      <p>这部电影主要讲了...</p>
      <p><br/></p>
      <h3>✨ 印象最深的台词</h3>
      <blockquote>"在此处引用台词..."</blockquote>
      <p><br/></p>
      <h3>🤔 观后感 & 思考</h3>
      <p>它触动我的点在于...</p>
    `
  },
  // 4. 健身 (Tags Updated)
  {
    id: 'fitness',
    name: '健身打卡',
    icon: 'fa-dumbbell',
    title: '💪 训练日志：[部位/项目]',
    tags: ['Fitness', 'Workout', 'Health'],
    content: `
      <h3>🔥 今日训练重点</h3>
      <p>部位：[胸/背/腿/有氧]</p>
      <p>时长：__ 分钟</p>
      <p><br/></p>
      <h3>🏋️ 动作组数记录</h3>
      <ul>
        <li>动作 1：[重量] x [组数]</li>
        <li>动作 2：[重量] x [组数]</li>
      </ul>
      <p><br/></p>
      <h3>🥗 补给情况</h3>
      <p>练后餐吃了...</p>
      <p><br/></p>
      <h3>📈 身体反馈</h3>
      <p>今天的泵感/状态如何？有没有哪里不舒服？</p>
    `
  },
  // 5. 游戏 (Tags Updated)
  {
    id: 'game',
    name: '游戏战报',
    icon: 'fa-gamepad',
    title: '🎮 游戏日记：[游戏名]',
    tags: ['Gaming', 'Rank', 'Highlight'],
    content: `
      <h3>🏆 战绩速览</h3>
      <p>今日胜率：</p>
      <p>段位变更：</p>
      <p><br/></p>
      <h3>🤝 队友评价</h3>
      <p>今天的队友是神是大坑？</p>
      <p><br/></p>
      <h3>⚡ 高光时刻 (MVP)</h3>
      <p>那波操作简直帅炸了：</p>
      <p><br/></p>
      <h3>💀 下饭时刻</h3>
      <p>虽然不想承认，但这波操作有点...</p>
    `
  },
  // 6. 恋爱 (Tags Updated)
  {
    id: 'love',
    name: '恋爱心事',
    icon: 'fa-heart',
    title: '💌 我们的故事：第 [X] 天',
    tags: ['Love', 'Romance', 'Memory'],
    content: `
      <h3>📅 今日份的我们</h3>
      <p>今天我们一起做了...</p>
      <p><br/></p>
      <h3>💖 心动瞬间</h3>
      <p>那个瞬间，我觉得特别爱你，因为...</p>
      <p><br/></p>
      <h3>🍬 小确幸</h3>
      <p>感谢你为我...</p>
      <p><br/></p>
      <h3>📝 给未来的留言</h3>
      <p>希望我们以后...</p>
    `
  },
  // 7. 哲思 (Tags Updated)
  {
    id: 'philosophy',
    name: '深夜哲思',
    icon: 'fa-brain',
    title: '🧠 关于 [话题] 的思考',
    tags: ['Philosophy', 'Thinking', 'Growth'],
    content: `
      <h3>🌱 触发事件</h3>
      <p>今天发生了一件事/看到一句话，让我陷入了思考...</p>
      <p><br/></p>
      <h3>🌊 深度剖析</h3>
      <p>这件事的本质也许是...</p>
      <p>从人性的角度来看...</p>
      <p><br/></p>
      <h3>💡 顿悟与结论</h3>
      <p>我意识到，与其纠结于...不如...</p>
      <blockquote>"未经营视的生活不值得一过。"</blockquote>
    `
  },
  // ============================================
  // 🔥 新增模板 (New Templates Added Below)
  // ============================================

  // 8. 读书笔记
  {
    id: 'reading',
    name: '读书笔记',
    icon: 'fa-book',
    title: '📖 阅读：《书名》',
    tags: ['Reading', 'Book', 'Knowledge'],
    content: `
      <h3>📚 书籍信息</h3>
      <ul>
        <li>书名/作者：</li>
        <li>阅读进度：第 __ 章 / 共 __ 章</li>
      </ul>
      <p><br/></p>
      <h3>📝 核心观点 (Key Takeaways)</h3>
      <p>作者在这部分主要想表达...</p>
      <ul>
        <li>观点 1：</li>
        <li>观点 2：</li>
      </ul>
      <p><br/></p>
      <h3>🔖 摘抄金句</h3>
      <blockquote>"在此处摘录书中打动你的句子..."</blockquote>
      <p><br/></p>
      <h3>🚀 行动指南</h3>
      <p>读完这部分，我决定在生活中应用的是：</p>
    `
  },
  // 9. 编程学习 (适合开发者)
  {
    id: 'coding',
    name: '编程学习',
    icon: 'fa-code',
    title: '💻 Code Log: [技术/项目]',
    tags: ['Coding', 'Dev', 'Learning'],
    content: `
      <h3>🎯 今日目标</h3>
      <p>今天主要学习/解决了...</p>
      <p><br/></p>
      <h3>🐛 遇到的 Bug & 坑</h3>
      <p>报错信息：</p>
      <p>解决方案：</p>
      <pre><code>// 在此处粘贴关键代码片段
console.log('Hello World');</code></pre>
      <p><br/></p>
      <h3>💡 新学到的知识点</h3>
      <ul>
        <li>知识点 1：</li>
      </ul>
      <p><br/></p>
      <h3>✅ 明日计划</h3>
      <p>下一步要完成...</p>
    `
  },
  // 10. 烹饪食谱
  {
    id: 'cooking',
    name: '烹饪食谱',
    icon: 'fa-utensils',
    title: '🍳 厨房实验：[菜名]',
    tags: ['Cooking', 'Recipe', 'Food'],
    content: `
      <h3>🥦 准备食材</h3>
      <ul>
        <li>主料：</li>
        <li>辅料/调味：</li>
      </ul>
      <p><br/></p>
      <h3>🔥 烹饪步骤</h3>
      <ol>
        <li>第一步：</li>
        <li>第二步：</li>
      </ol>
      <p><br/></p>
      <h3>😋 试吃评价</h3>
      <p>色香味如何？下次哪里可以改进？（咸淡/火候）</p>
      <p><br/></p>
      <h3>📸 成品展示</h3>
      <p><i>(在此处插入美食照片)</i></p>
    `
  },
  // 11. 工作周报/日报
  {
    id: 'work',
    name: '工作复盘',
    icon: 'fa-briefcase',
    title: '📊 工作日志：[日期]',
    tags: ['Work', 'Productivity', 'Meeting'],
    content: `
      <h3>✅ 已完成任务 (Done)</h3>
      <ul>
        <li>任务 1：</li>
        <li>任务 2：</li>
      </ul>
      <p><br/></p>
      <h3>🚧 进行中/卡点 (Blocking)</h3>
      <p>目前遇到的困难是...</p>
      <p><br/></p>
      <h3>📅 待办事项 (To-Do)</h3>
      <p>接下来的优先级是：</p>
      <ol>
        <li></li>
      </ol>
      <p><br/></p>
      <h3>💡 想法与改进</h3>
      <p>关于项目流程的思考...</p>
    `
  },
  // 12. 梦境记录
  {
    id: 'dream',
    name: '梦境记录',
    icon: 'fa-cloud-moon',
    title: '💤 昨晚做了一个梦...',
    tags: ['Dream', 'Subconscious', 'Fantasy'],
    content: `
      <h3>🌌 梦境碎片</h3>
      <p>场景是哪里？有哪些人？发生了什么荒诞的事？</p>
      <p><br/></p>
      <h3>😨 情绪感受</h3>
      <p>醒来时的感觉是（恐惧/怀念/快乐/困惑）...</p>
      <p><br/></p>
      <h3>🔮 梦的解析</h3>
      <p>这可能折射出我最近在担心/渴望...</p>
      <blockquote>"梦是潜意识写给意识的信。"</blockquote>
    `
  }
];

interface JournalTemplatesProps {
  onSelect: (template: JournalTemplate) => void;
}

export const JournalTemplates: React.FC<JournalTemplatesProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-full border ${isOpen ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
      >
        <i className="fas fa-magic"></i>
        <span>{isOpen ? '隐藏日志模板' : '日志模板'}</span>
        <i
          className={`fas fa-chevron-down transition-transform duration-300 text-[10px] ${isOpen ? 'rotate-180' : ''}`}
        ></i>
      </button>

      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-2 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
      >
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => {
              onSelect(tpl);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-500 border border-slate-200 hover:border-rose-200 transition-all group overflow-hidden text-left shadow-sm"
            title={`Use ${tpl.name} template`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-sm text-[10px] border border-slate-100 group-hover:border-rose-100 shrink-0 transition-colors">
              <i className={`fas ${tpl.icon}`}></i>
            </div>
            <span className="text-xs font-bold truncate">{tpl.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
