import React, { useMemo, useEffect, useRef } from 'react';

interface BlogContentProps {
  content: string;
  isLoading?: boolean;
  shadowClass?: string;
  forceLight?: boolean;
}

export const BlogContent: React.FC<BlogContentProps> = ({
  content,
  isLoading,
  shadowClass,
  forceLight = false
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // 核心逻辑：精准清洗字符串
  // ===========================================================================
  const renderedContent = useMemo(() => {
    if (isLoading)
      return '<div class="flex items-center gap-3 text-slate-400 animate-pulse font-mono py-12 justify-center"><i class="fas fa-circle-notch fa-spin"></i> Retrieving data stream...</div>';
    if (!content) return '';

    let processed = content;

    // 1. 【精准去黑】：移除 Google/Gemini 复制带来的特定黑色硬编码
    const googleBlackRegex =
      /color:\s*(rgb\(31,\s*31,\s*31\)|rgb\(68,\s*71,\s*70\)|#1f1f1f|#202124|#000000|black);?/gi;
    processed = processed.replace(googleBlackRegex, '');

    // 2. 【去白背景】：移除硬编码的白色背景
    const whiteBgRegex = /background(-color)?:\s*(rgb\(255,\s*255,\s*255\)|#ffffff|white|none);?/gi;
    processed = processed.replace(whiteBgRegex, '');

    // 3. 解析 Markdown
    const hasBlockHtml = /<(div|p|h[1-6]|code-block|response-element|pre)/i.test(processed);
    if (!hasBlockHtml && window.marked) {
      try {
        return window.marked.parse(processed);
      } catch (e) {
        return processed;
      }
    }
    return processed;
  }, [content, isLoading]);

  // ===========================================================================
  // DOM 清洗：处理布局垃圾
  // ===========================================================================
  useEffect(() => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll('*');
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        // 移除 margin-top: 0px !important
        if (el.style.marginTop === '0px') {
          el.style.removeProperty('margin-top');
        }
        // 移除可能撑破布局的宽度限制
        if (el.style.width || el.style.maxWidth) {
          el.style.removeProperty('width');
          el.style.removeProperty('max-width');
        }
      }
    });
  }, [renderedContent]);

  // ===========================================================================
  // 样式定义
  // ===========================================================================
  const darkModeStyles = `
    /* DARK MODE VARIABLES */
    html.dark .blog-content-wrapper {
      --bc-bg: rgb(29, 29, 29);
      --bc-text: #e2e8f0;           /* 默认文字：柔和白 */
      --bc-heading: #ffffff;
      --bc-bold: #ffffff;
      --bc-quote-bg: #3a3a3a;
      --bc-quote-border: #4b5563;
      --bc-link: #60a5fa;
    }
  `;

  const customStyles = `
    .blog-content-wrapper {
      /* LIGHT MODE VARIABLES */
      --bc-bg: #ffffff;
      --bc-text: #374151;
      --bc-heading: #111827;
      --bc-bold: #000000;
      --bc-quote-bg: #f3f4f6;
      --bc-quote-border: #e5e7eb;
      --bc-link: #2563eb;

      /* 【核心修改】代码块变量：无论黑白模式，统一使用深色背景 #222222 */
      --bc-code-bg: #222222;
      --bc-code-text: #f8f8f2; /* 代码文字统一为浅色，保证在 #222 背景上可见 */
    }

    ${forceLight ? '' : darkModeStyles}

    .blog-content-body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--bc-text); 
      overflow-wrap: break-word;
    }

    /* --- 布局修复 --- */
    .blog-content-body p { 
        margin-bottom: 1.5em !important; 
        margin-top: 0 !important; 
    }
    
    .blog-content-body h1, .blog-content-body h2, .blog-content-body h3 {
        color: var(--bc-heading) !important;
        font-weight: 700;
        margin-top: 2em !important;
        margin-bottom: 0.75em !important;
    }

    /* --- 代码块适配 (Gemini + Legacy Quill 兼容) --- */
    /* 包含: code-block, .code-container, pre, .ql-code-block-container */
    .blog-content-body code-block,
    .blog-content-body .code-container,
    .blog-content-body pre,
    .blog-content-body .ql-code-block-container {
        display: block;
        background-color: var(--bc-code-bg) !important; /* 强制 #222 */
        color: var(--bc-code-text) !important;          /* 强制浅色字 */
        border: none !important;                        /* 去掉边框 */
        border-radius: 8px !important;                  /* 稍微给点圆角，不然 #222 色块太生硬，如果完全不要圆角改为 0 */
        padding: 1.25rem;                               /* 增加内边距 */
        margin: 1.5rem 0;
        overflow-x: auto;
        
        /* 字体设置：Fira Code, Menlo, monospace */
        font-family: 'Fira Code', 'Menlo', monospace; 
        font-size: 1.1em;                               /* 字号加大 */
        line-height: 1.6;
    }

    /* 针对 Quill 的单行代码块特殊处理 */
    .blog-content-body .ql-code-block {
        font-family: 'Fira Code', 'Menlo', monospace;
        font-size: 1.1em;
        line-height: 1.6;
        background-color: transparent !important; /* 避免嵌套背景 */
        color: inherit !important;
        border: none !important;
    }

    /* 隐藏代码块头部丑陋的装饰条或按钮 */
    .blog-content-body .buttons, 
    .blog-content-body mat-icon,
    .blog-content-body .mat-mdc-button-touch-target { 
        display: none !important; 
    }
    
    /* 代码块头部装饰文字 */
    .blog-content-body .code-block-decoration {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 浅色分割线 */
        padding-bottom: 0.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        font-size: 0.9em;
        color: var(--bc-code-text); /* 跟随代码颜色 */
        opacity: 0.6;
    }

    /* 链接样式 */
    .blog-content-body a {
        color: var(--bc-link);
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    
    /* 引用样式 */
    .blog-content-body blockquote {
        border-left: 4px solid var(--bc-quote-border);
        padding-left: 1rem;
        font-style: italic;
        background: var(--bc-quote-bg);
        padding: 1rem;
        border-radius: 0 8px 8px 0;
    }
    
    /* 粗体修正 */
    .blog-content-body b, .blog-content-body strong {
        color: var(--bc-bold);
        font-weight: 700;
    }
  `;

  const containerClasses = `rounded-[2rem] p-8 md:p-14 relative overflow-hidden group blog-content-wrapper shadow-xl ${shadowClass || ''}`;

  return (
    <div className={containerClasses} style={{ backgroundColor: 'var(--bc-bg)' }}>
      <style>{customStyles}</style>
      <div
        ref={contentRef}
        className="blog-content-body relative z-10"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
};
