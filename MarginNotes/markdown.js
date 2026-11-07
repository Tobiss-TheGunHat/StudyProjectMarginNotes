// Мини-конвертер Markdown -> HTML с экранированием
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = null; // 'ul' | 'ol' | null
  let inCode = false;
  let codeBuffer = [];
  let paragraph = [];

  const inline = (text) => {
    text = escapeHtml(text);
    // `код`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // жирный
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // курсив
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // зачёркнутый
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    // ссылки [текст](url) — url тоже экранирован escapeHtml выше
    text = text.replace(/
$$
([^
$$
]+)\]$([^)\s]+)$/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return text;
  };

  const closeList = () => {
    if (inList) { html += `</${inList}>`; inList = null; }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      html += `<p>${paragraph.map(inline).join('<br>')}</p>`;
      paragraph = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Блоки кода ```
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`;
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph();
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }

    const trimmed = line.trim();

    // Пустая строка — конец абзаца
    if (!trimmed) { flushParagraph(); closeList(); continue; }

    // Заголовки
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushParagraph();
      closeList();
      const level = h[1].length;
      html += `<h${level + 2}>${inline(h[2])}</h${level + 2}>`; // h3..h6 внутри popup
      continue;
    }

    // Цитата
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      closeList();
      html += `<blockquote>${inline(trimmed.slice(2))}</blockquote>`;
      continue;
    }

    // Списки
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (inList !== 'ul') { closeList(); html += '<ul>'; inList = 'ul'; }
      html += `<li>${inline(ul[1])}</li>`;
      continue;
    }
    if (ol) {
      flushParagraph();
      if (inList !== 'ol') { closeList(); html += '<ol>'; inList = 'ol'; }
      html += `<li>${inline(ol[1])}</li>`;
      continue;
    }

    // Горизонтальная линия
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html += '<hr>';
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  if (inCode) html += `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`;
  return html;
}
