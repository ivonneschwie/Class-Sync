import React from 'react';
import { cn } from '@/lib/utils';

export const highlightCode = (code: string, lang?: string) => {
  const placeholders: { comment: string; val: string }[] = [];
  const stringPlaceholders: { placeholder: string; val: string }[] = [];
  let tempCode = code;

  // 1. Resolve target language (defaults to python)
  const language = lang ? lang.toLowerCase().trim() : 'python';
  let targetLang = 'python';
  
  if (language === 'js' || language === 'jsx' || language === 'javascript') {
    targetLang = 'javascript';
  } else if (language === 'ts' || language === 'tsx' || language === 'typescript') {
    targetLang = 'typescript';
  } else if (language === 'py' || language === 'python') {
    targetLang = 'python';
  } else if (language === 'cpp' || language === 'c++' || language === 'c') {
    targetLang = 'cpp';
  } else if (language === 'java' || language === 'kotlin' || language === 'kt') {
    targetLang = 'java';
  } else if (language === 'sql') {
    targetLang = 'sql';
  } else if (language === 'go' || language === 'golang') {
    targetLang = 'go';
  } else if (language === 'rust' || language === 'rs') {
    targetLang = 'rust';
  } else if (language === 'html' || language === 'xml') {
    targetLang = 'html';
  }

  // 2. Language-specific keyword dictionaries
  const languageKeywords: Record<string, string[]> = {
    python: [
      'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 
      'try', 'except', 'finally', 'raise', 'with', 'lambda', 'pass', 'break', 'continue', 'and', 
      'or', 'not', 'is', 'None', 'True', 'False', 'global', 'nonlocal', 'yield', 'assert', 'del'
    ],
    javascript: [
      'const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while', 'do', 
      'in', 'of', 'import', 'export', 'from', 'as', 'try', 'catch', 'finally', 'throw', 'new', 
      'this', 'super', 'interface', 'type', 'implements', 'extends', 'package', 'async', 'await', 
      'yield', 'null', 'true', 'false', 'undefined', 'switch', 'case', 'default', 'break', 'continue', 
      'typeof', 'instanceof', 'void', 'delete'
    ],
    typescript: [
      'const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while', 'do', 
      'in', 'of', 'import', 'export', 'from', 'as', 'try', 'catch', 'finally', 'throw', 'new', 
      'this', 'super', 'interface', 'type', 'implements', 'extends', 'package', 'async', 'await', 
      'yield', 'null', 'true', 'false', 'undefined', 'switch', 'case', 'default', 'break', 'continue', 
      'typeof', 'instanceof', 'void', 'delete', 'any', 'number', 'string', 'boolean', 'unknown', 
      'never', 'void', 'keyof', 'readonly', 'as', 'namespace', 'declare'
    ],
    cpp: [
      'int', 'float', 'double', 'char', 'bool', 'void', 'class', 'struct', 'union', 'enum', 
      'public', 'private', 'protected', 'virtual', 'override', 'const', 'static', 'constexpr', 
      'inline', 'template', 'typename', 'namespace', 'using', 'include', 'define', 'if', 'else', 
      'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'new', 
      'delete', 'this', 'throw', 'try', 'catch', 'friend', 'operator', 'sizeof'
    ],
    java: [
      'public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'enum', 'extends', 
      'implements', 'package', 'import', 'void', 'int', 'double', 'float', 'long', 'short', 'byte', 
      'char', 'boolean', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 
      'continue', 'return', 'new', 'this', 'super', 'throw', 'throws', 'try', 'catch', 'finally', 
      'instanceof', 'synchronized', 'volatile', 'transient', 'fun', 'val', 'var', 'null', 'true', 'false'
    ],
    sql: [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 
      'INDEX', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 
      'BETWEEN', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'VALUES', 'INTO', 
      'SET', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CONSTRAINT', 'select', 'from', 
      'where', 'insert', 'update', 'delete', 'create', 'drop', 'alter', 'table', 'index', 'join', 
      'inner', 'left', 'right', 'outer', 'on', 'and', 'or', 'not', 'in', 'like', 'between', 'is', 
      'null', 'as', 'order', 'by', 'group', 'having', 'limit', 'values', 'into', 'set', 'primary', 
      'key', 'foreign', 'references', 'unique', 'constraint'
    ],
    go: [
      'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 
      'go', 'select', 'defer', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 
      'fallthrough', 'break', 'continue', 'goto', 'nil', 'true', 'false'
    ],
    rust: [
      'fn', 'let', 'mut', 'const', 'static', 'impl', 'trait', 'struct', 'enum', 'use', 'mod', 
      'pub', 'return', 'if', 'else', 'loop', 'while', 'for', 'in', 'match', 'break', 'continue', 
      'unsafe', 'where', 'type', 'as', 'self', 'Self', 'true', 'false'
    ],
    html: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'input', 'form', 
      'script', 'style', 'html', 'body', 'head', 'meta', 'link', 'img', 'ul', 'ol', 'li', 'table', 
      'tr', 'td', 'th', 'thead', 'tbody', 'section', 'header', 'footer', 'nav', 'main', 'aside', 
      'canvas', 'svg', 'class', 'id', 'src', 'href', 'alt', 'type', 'value', 'placeholder', 'rel', 
      'name', 'target', 'style', 'onclick'
    ]
  };

  // 3. Language-specific built-in references
  const languageBuiltins: Record<string, string[]> = {
    python: ['print', 'len', 'range', 'str', 'int', 'dict', 'list', 'set', 'tuple', 'open', 'sum', 'max', 'min', 'type', 'enumerate', 'zip'],
    javascript: ['console', 'window', 'document', 'self', 'Math', 'JSON', 'Object', 'Array', 'Promise', 'fetch', 'setTimeout'],
    typescript: ['console', 'window', 'document', 'self', 'Math', 'JSON', 'Object', 'Array', 'Promise', 'fetch', 'setTimeout'],
    cpp: ['std', 'cout', 'cin', 'endl', 'printf', 'scanf', 'vector', 'string', 'map', 'set'],
    java: ['System', 'out', 'println', 'print', 'String', 'Integer', 'Double', 'List', 'ArrayList', 'Map', 'HashMap'],
    sql: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'count', 'sum', 'avg', 'min', 'max'],
    go: ['fmt', 'Println', 'Printf', 'Print', 'make', 'new', 'append', 'panic', 'recover'],
    rust: ['println', 'print', 'format', 'panic', 'vec', 'String', 'Option', 'Result'],
    html: ['console', 'window', 'document']
  };

  // 4. Stash Comments (//, #, /* */) using lowercase IDs to completely avoid Capitalized Class regex matches
  tempCode = tempCode.replace(/(\/\/.*)/g, (match) => {
    const id = `___comment_${placeholders.length}___`;
    placeholders.push({ comment: id, val: `<span class="text-muted-foreground/60 italic">${match}</span>` });
    return id;
  });

  tempCode = tempCode.replace(/(#.*)/g, (match) => {
    const id = `___comment_${placeholders.length}___`;
    placeholders.push({ comment: id, val: `<span class="text-muted-foreground/60 italic">${match}</span>` });
    return id;
  });

  tempCode = tempCode.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
    const id = `___comment_${placeholders.length}___`;
    placeholders.push({ comment: id, val: `<span class="text-muted-foreground/60 italic">${match}</span>` });
    return id;
  });

  // 5. Stash Strings ("...", '...', `...`) using lowercase IDs
  tempCode = tempCode.replace(/(&quot;[\s\S]*?&quot;|"[\s\S]*?")/g, (match) => {
    const id = `___string_${stringPlaceholders.length}___`;
    stringPlaceholders.push({ placeholder: id, val: `<span class="text-emerald-500 font-medium">${match}</span>` });
    return id;
  });

  tempCode = tempCode.replace(/(&#39;[\s\S]*?&#39;|'[\s\S]*?')/g, (match) => {
    const id = `___string_${stringPlaceholders.length}___`;
    stringPlaceholders.push({ placeholder: id, val: `<span class="text-emerald-500 font-medium">${match}</span>` });
    return id;
  });

  tempCode = tempCode.replace(/(`[\s\S]*?`)/g, (match) => {
    const id = `___string_${stringPlaceholders.length}___`;
    stringPlaceholders.push({ placeholder: id, val: `<span class="text-emerald-500 font-medium">${match}</span>` });
    return id;
  });

  // 6. Match keywords, built-ins, numbers, and types in a single pass!
  // This guarantees we never search-and-replace recursively on already injected HTML tags (like matching 'class' inside '<span class="...">')!
  const keywords = languageKeywords[targetLang] || languageKeywords.python;
  const builtins = languageBuiltins[targetLang] || languageBuiltins.python;

  const escapedKeywords = keywords.map(kw => kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const escapedBuiltins = builtins.map(b => b.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

  const pattern = new RegExp(
    `\\b(${escapedKeywords.join('|')})\\b` +
    `|\\b(${escapedBuiltins.join('|')})\\b` +
    `|\\b(\\d+(?:\\.\\d+)?)\\b` +
    `|\\b([A-Z][a-zA-Z0-9_]*)\\b`,
    'g'
  );

  tempCode = tempCode.replace(pattern, (match, kw, builtin, num, typeName) => {
    if (kw) {
      return `<span class="text-pink-500 font-semibold">${kw}</span>`;
    }
    if (builtin) {
      return `<span class="text-cyan-400 font-medium">${builtin}</span>`;
    }
    if (num) {
      return `<span class="text-amber-500 font-medium">${num}</span>`;
    }
    if (typeName) {
      return `<span class="text-sky-500 font-medium">${typeName}</span>`;
    }
    return match;
  });

  // 7. Restore stashed segments in reverse order using callbacks to avoid regex $ character substitution bugs
  for (let i = stringPlaceholders.length - 1; i >= 0; i--) {
    tempCode = tempCode.replace(new RegExp(stringPlaceholders[i].placeholder, 'g'), () => stringPlaceholders[i].val);
  }
  for (let i = placeholders.length - 1; i >= 0; i--) {
    tempCode = tempCode.replace(new RegExp(placeholders[i].comment, 'g'), () => placeholders[i].val);
  }

  return tempCode;
};

export const renderMarkdown = (text: string, onTodoClick?: (index: number) => void) => {
  if (!text) return <p className="text-muted-foreground/50 italic" style={{ margin: 0, paddingBottom: '2.2rem', lineHeight: '2.2rem' }}>No content in this note yet. Click "Edit Note" to start writing.</p>;
  
  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks with specified language syntax: ```js code ```
  html = html.replace(/```(\w*)\s*\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? lang.toLowerCase() : '';
    const highlighted = highlightCode(code, language);
    
    const displayLang = language === 'js' ? 'JavaScript' :
                        language === 'ts' ? 'TypeScript' :
                        language === 'py' ? 'Python' :
                        language === 'cpp' ? 'C++' :
                        language === 'cs' ? 'C#' :
                        language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code';

    return `<div class="relative group rounded-xl overflow-hidden border border-muted-foreground/10 shadow-inner max-w-full my-4" style="margin: 0; margin-bottom: 2.2rem;"><div class="flex items-center justify-between px-4 py-2 bg-muted/80 text-[10px] text-muted-foreground/80 font-mono font-bold select-none border-b border-muted-foreground/5"><span>${displayLang}</span><span class="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans uppercase">Syntax</span></div><pre class="bg-muted/40 font-mono text-xs overflow-x-auto max-w-full" style="margin: 0; padding: 1.1rem; line-height: 1.1rem;"><code class="block whitespace-pre">${highlighted}</code></pre></div>`;
  });

  // Fallback for simple triple backticks on one line or unspecified syntax blocks
  html = html.replace(/```([\s\S]+?)```/g, (match, code) => {
    const highlighted = highlightCode(code);
    return `<pre class="bg-muted/75 rounded-xl font-mono text-xs overflow-x-auto border border-muted-foreground/10 text-foreground shadow-inner max-w-full" style="margin: 0; margin-bottom: 2.2rem; padding: 1.1rem; line-height: 1.1rem;"><code class="block whitespace-pre">${highlighted}</code></pre>`;
  });

  // Inline code: `code` -> <code class="...">code</code>
  html = html.replace(/`([^`\n]+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-primary">$1</code>');

  // Headers: # Heading -> <h1>
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold font-headline text-foreground border-b pb-1 border-muted/30" style="margin: 0; margin-top: 2.2rem; margin-bottom: 2.2rem; line-height: 2.2rem;">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold font-headline text-foreground" style="margin: 0; margin-top: 2.2rem; margin-bottom: 2.2rem; line-height: 2.2rem;">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold font-headline text-foreground" style="margin: 0; margin-top: 2.2rem; margin-bottom: 2.2rem; line-height: 2.2rem;">$1</h3>');

  // Checkboxes: - [ ] / - [x] -> custom visual checkbox button
  let todoCount = 0;
  html = html.replace(/^- \[( |x)\] (.*?)$/gm, (match, checked, content) => {
    const isChecked = checked === 'x';
    const index = todoCount++;
    if (isChecked) {
      return `<button data-todo-index="${index}" class="flex items-center gap-2 text-left select-none group focus:outline-none" style="margin: 0; line-height: 2.2rem; min-height: 2.2rem;"><div class="h-4 w-4 rounded bg-primary flex items-center justify-center text-primary-foreground text-[10px] shrink-0 font-bold group-hover:scale-105 active:scale-95 transition-all">✓</div> <span class="text-sm text-muted-foreground/60 line-through decoration-muted-foreground/40">${content}</span></button>`;
    } else {
      return `<button data-todo-index="${index}" class="flex items-center gap-2 text-left select-none group focus:outline-none" style="margin: 0; line-height: 2.2rem; min-height: 2.2rem;"><div class="h-4 w-4 rounded border border-primary/30 flex items-center justify-center text-transparent group-hover:text-primary/30 group-hover:border-primary/50 text-[10px] shrink-0 font-bold bg-background group-hover:scale-105 active:scale-95 transition-all">✓</div> <span class="text-sm text-foreground/90">${content}</span></button>`;
    }
  });

  // Bullet points: - item -> <li>
  html = html.replace(/^- (.*?)$/gm, '<li class="text-sm text-foreground/95 ml-4 list-disc pl-1" style="margin: 0; line-height: 2.2rem;">$1</li>');

  // Bold: **text** -> <strong>
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');

  // Italic: *text* -> <em>
  html = html.replace(/\*([\s\S]+?)\*/g, '<em class="italic text-foreground/90">$1</em>');

  // Blockquotes: > text -> blockquote
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-primary bg-primary/5 pl-4 my-3 rounded-r-lg italic text-muted-foreground" style="margin: 0; margin-bottom: 2.2rem; line-height: 2.2rem; padding: 0 1.25rem;">$1</blockquote>');

  // Paragraphs
  const paragraphs = html.split(/\n\n/);
  html = paragraphs
    .map(p => {
      // If the block is completely empty (consecutive breaks), render a perfect empty notepad row
      if (p.trim() === '') {
        return `<p class="text-md text-foreground/90 font-sans" style="margin: 0; margin-bottom: 2.2rem; line-height: 2.2rem;">&nbsp;</p>`;
      }
      // If it already starts with a tag (h1, pre, div, li, blockquote, button), return it directly
      if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<div') || p.trim().startsWith('<li') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<button')) {
        return p;
      }
      return `<p class="text-md text-foreground/90 font-sans" style="margin: 0; margin-bottom: 2.2rem; line-height: 2.2rem;">${p.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTodoClick) return;
    const button = (e.target as HTMLElement).closest('[data-todo-index]');
    if (!button) return;
    const indexAttr = button.getAttribute('data-todo-index');
    if (indexAttr !== null) {
      onTodoClick(parseInt(indexAttr, 10));
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={cn("max-w-none break-words min-h-[350px] pb-8", onTodoClick && "[&_button]:cursor-pointer")} 
      style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
        backgroundSize: '100% 2.2rem',
        lineHeight: '2.2rem',
        borderLeft: '2px solid rgba(239, 68, 68, 0.25)',
        paddingLeft: '1.25rem',
      }}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
