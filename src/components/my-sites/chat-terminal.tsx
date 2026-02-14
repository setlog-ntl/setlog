'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal,
  Send,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  X,
  Maximize2,
  Minimize2,
  Rocket,
  FileText,
  FilePlus2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocaleStore } from '@/stores/locale-store';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CodeBlock {
  filePath: string;
  code: string;
  lang: string;
  isNew: boolean;
}

interface ChatTerminalProps {
  fileContent: string;
  filePath: string | null;
  allFiles: string[];
  onApplyCode: (code: string) => void;
  onApplyFiles: (blocks: CodeBlock[]) => Promise<void>;
}

/**
 * 다중 파일 코드블록 파싱
 * 포맷: 📄 filename.html\n```html\n...code...\n```
 * 하위호환: 📄 없이 코드블록만 있으면 현재 파일에 적용
 */
function extractCodeBlocks(text: string, currentFilePath: string | null, allFiles: string[]): CodeBlock[] {
  const blocks: CodeBlock[] = [];

  // 📄 파일경로 + 코드블록 패턴
  const multiPattern = /📄\s*([^\n]+)\n```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = multiPattern.exec(text)) !== null) {
    const filePath = match[1].trim();
    const lang = match[2] || 'html';
    const code = match[3].trim();
    const isNew = !allFiles.includes(filePath);
    blocks.push({ filePath, code, lang, isNew });
  }

  // 하위호환: 📄 없이 코드블록만 있는 경우
  if (blocks.length === 0) {
    const singlePattern = /```(\w*)\n([\s\S]*?)```/g;
    let singleMatch;
    while ((singleMatch = singlePattern.exec(text)) !== null) {
      const lang = singleMatch[1] || 'html';
      const code = singleMatch[2].trim();
      if (code && currentFilePath) {
        blocks.push({
          filePath: currentFilePath,
          code,
          lang,
          isNew: false,
        });
      }
    }
  }

  return blocks;
}

function hasCodeBlock(content: string): boolean {
  return /```[\w]*\n[\s\S]*?```/.test(content);
}

export function ChatTerminal({
  fileContent,
  filePath,
  allFiles,
  onApplyCode,
  onApplyFiles,
}: ChatTerminalProps) {
  const { locale } = useLocaleStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/oneclick/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          fileContent,
          filePath,
          allFiles,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '요청 실패');
      }

      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ ${err instanceof Error ? err.message : '오류 발생'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, fileContent, filePath, allFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 단일 코드블록 적용 (현재 파일에만)
  const handleApplySingle = (content: string) => {
    const blocks = extractCodeBlocks(content, filePath, allFiles);
    if (blocks.length === 1 && !blocks[0].isNew && blocks[0].filePath === filePath) {
      onApplyCode(blocks[0].code);
    }
  };

  // 전체 적용 & 배포
  const handleApplyAll = useCallback(
    async (content: string) => {
      const blocks = extractCodeBlocks(content, filePath, allFiles);
      if (blocks.length === 0) return;

      setApplyingAll(true);
      try {
        await onApplyFiles(blocks);
      } finally {
        setApplyingAll(false);
      }
    },
    [filePath, allFiles, onApplyFiles]
  );

  // 개별 파일 적용
  const handleApplyOne = useCallback(
    async (content: string, index: number) => {
      const blocks = extractCodeBlocks(content, filePath, allFiles);
      const block = blocks[index];
      if (!block) return;

      setApplyingIndex(index);
      try {
        if (!block.isNew && block.filePath === filePath) {
          onApplyCode(block.code);
        } else {
          await onApplyFiles([block]);
        }
      } finally {
        setApplyingIndex(null);
      }
    },
    [filePath, allFiles, onApplyCode, onApplyFiles]
  );

  const terminalHeight = isExpanded ? 'h-[60vh]' : 'h-72';

  // 메시지 내 코드블록 렌더링
  const renderAssistantMessage = (msg: ChatMessage, msgIndex: number) => {
    const blocks = extractCodeBlocks(msg.content, filePath, allFiles);
    const hasBlocks = blocks.length > 0;
    const isMulti = blocks.length > 1 || (blocks.length === 1 && blocks[0].isNew);

    // 코드블록 없는 텍스트 부분 추출
    const textParts = msg.content
      .replace(/📄\s*[^\n]+\n```\w*\n[\s\S]*?```/g, '')
      .replace(/```\w*\n[\s\S]*?```/g, '')
      .trim();

    return (
      <div className="space-y-2">
        {/* 설명 텍스트 */}
        {textParts && (
          <div className="text-zinc-300 whitespace-pre-wrap break-all text-xs leading-relaxed pl-4 border-l-2 border-zinc-800">
            {textParts}
          </div>
        )}

        {/* 코드블록들 */}
        {blocks.map((block, i) => (
          <div key={i} className="ml-4 border border-zinc-800 rounded overflow-hidden">
            {/* 파일 헤더 */}
            <div className="flex items-center justify-between px-2 py-1 bg-zinc-800/50 text-[11px]">
              <div className="flex items-center gap-1.5">
                {block.isNew ? (
                  <FilePlus2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <FileText className="h-3 w-3 text-zinc-400" />
                )}
                <span className="text-zinc-300 font-mono">{block.filePath}</span>
                {block.isNew && (
                  <Badge variant="default" className="text-[9px] px-1 py-0 h-4 bg-emerald-600">
                    {locale === 'ko' ? '신규' : 'NEW'}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => handleApplyOne(msg.content, i)}
                disabled={applyingIndex === i || applyingAll}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
              >
                {applyingIndex === i ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <Check className="h-2.5 w-2.5" />
                )}
                {locale === 'ko' ? '적용' : 'Apply'}
              </button>
            </div>
            {/* 코드 미리보기 (축약) */}
            <pre className="px-2 py-1.5 text-[11px] text-zinc-400 overflow-x-auto max-h-32 leading-relaxed">
              {block.code.split('\n').slice(0, 8).join('\n')}
              {block.code.split('\n').length > 8 && (
                <span className="text-zinc-600">{`\n... (${block.code.split('\n').length}줄)`}</span>
              )}
            </pre>
          </div>
        ))}

        {/* 전체 적용 & 배포 버튼 */}
        {hasBlocks && (
          <div className="ml-4 flex gap-2">
            {!isMulti && !blocks[0].isNew && (
              <button
                onClick={() => handleApplySingle(msg.content)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
              >
                <Check className="h-3 w-3" />
                {locale === 'ko' ? '코드 적용' : 'Apply Code'}
              </button>
            )}
            <button
              onClick={() => handleApplyAll(msg.content)}
              disabled={applyingAll}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
            >
              {applyingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Rocket className="h-3 w-3" />
              )}
              {locale === 'ko'
                ? applyingAll ? '적용 & 배포 중...' : '전체 적용 & 배포'
                : applyingAll ? 'Applying...' : 'Apply All & Deploy'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t bg-background flex flex-col">
      {/* 토글 바 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 transition-colors text-xs"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-medium">
            {locale === 'ko' ? 'AI 코드 어시스턴트' : 'AI Code Assistant'}
          </span>
          {messages.length > 0 && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {/* 챗 영역 */}
      {isOpen && (
        <div className={`${terminalHeight} flex flex-col border-t transition-all`}>
          {/* 헤더 */}
          <div className="flex items-center justify-between px-3 py-1 bg-zinc-900 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span>
                {filePath ? `~/edit/${filePath.split('/').pop()}` : '~/edit'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-sm space-y-3">
            {messages.length === 0 && (
              <div className="text-zinc-600 text-xs space-y-1 py-4">
                <p>
                  {locale === 'ko'
                    ? '💡 AI에게 코드 수정이나 새 페이지 생성을 요청할 수 있습니다.'
                    : '💡 Ask AI to modify code or create new pages.'}
                </p>
                <p className="text-zinc-700">
                  {locale === 'ko'
                    ? '예: "배경색을 파란색으로 바꿔줘", "about 페이지 추가해줘"'
                    : 'e.g., "Change background to blue", "Add an about page"'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="space-y-1">
                {msg.role === 'user' ? (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0 select-none">$</span>
                    <span className="text-zinc-200 break-all">{msg.content}</span>
                  </div>
                ) : (
                  hasCodeBlock(msg.content)
                    ? renderAssistantMessage(msg, i)
                    : (
                      <div className="text-zinc-300 whitespace-pre-wrap break-all text-xs leading-relaxed pl-4 border-l-2 border-zinc-800">
                        {msg.content}
                      </div>
                    )
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{locale === 'ko' ? '생각하는 중...' : 'Thinking...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-t border-zinc-800">
            <span className="text-green-400 font-mono text-sm select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                locale === 'ko'
                  ? '코드 수정 또는 새 페이지 생성 요청...'
                  : 'Modify code or create new pages...'
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-zinc-200 font-mono text-sm placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
