import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolName } from "../llm/tools";

type ChatPanelProps = {
  onToolCall: (name: ToolName, input: Record<string, unknown>) => Promise<unknown>;
  initialMessages?: Parameters<typeof useChat>[0] extends { messages?: infer M } ? M : never;
  onMessagesChange?: (messages: unknown[]) => void;
};

const TOOL_LABELS: Record<string, string> = {
  getSnapshot: "Reading workspace",
  addCountry: "Adding country",
  addFruit: "Adding fruit",
  updateMarketPricing: "Updating pricing",
  updateFlavorFamiliarity: "Updating flavor familiarity",
  setSelection: "Changing selection",
  runAnalysis: "Running analysis",
};

export function ChatPanel({ onToolCall, initialMessages, onMessagesChange }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, error, addToolResult } = useChat({
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      const last = msgs[msgs.length - 1];
      if (!last || last.role !== "assistant") return false;
      // Auto-continue after every tool result is in
      const parts = (last as { parts?: Array<{ type: string; state?: string }> }).parts ?? [];
      const hasPendingTool = parts.some(
        (p) => p.type?.startsWith("tool-") && p.state !== "output-available" && p.state !== "output-error",
      );
      const hasAnyTool = parts.some((p) => p.type?.startsWith("tool-"));
      return hasAnyTool && !hasPendingTool;
    },
    onToolCall: async ({ toolCall }) => {
      try {
        const output = await onToolCall(
          toolCall.toolName as ToolName,
          (toolCall.input ?? {}) as Record<string, unknown>,
        );
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output,
        });
      } catch (err) {
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
        });
      }
    },
  });

  useEffect(() => {
    onMessagesChange?.(messages as unknown as unknown[]);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || status === "streaming" || status === "submitted") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#1B4332] px-5 py-3 text-sm font-medium text-white shadow-2xl shadow-[#1B4332]/30 transition hover:bg-[#2D6A4F]"
        >
          <SparkleIcon />
          Ask AI
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[440px] flex-col bg-bone shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand bg-white/80 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4332] text-white">
              <SparkleIcon />
            </div>
            <div>
              <h3 className="font-serif text-base text-ink">Bonchi Assistant</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-stone transition hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && <EmptyState onPick={(text) => sendMessage({ text })} />}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-xs text-stone">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1B4332]" />
              Thinking…
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              <strong>Error:</strong> {error.message}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-sand bg-white/80 px-4 py-3 backdrop-blur">
          <div className="flex items-end gap-2 rounded-2xl border border-sand bg-bone px-3 py-2 focus-within:border-[#2D6A4F]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask about your data, add a market, run an analysis…"
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-ink outline-none placeholder:text-stone/60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || status === "streaming" || status === "submitted"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-white transition hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-stone/70">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────── Sub-components ──────────────────────────────

type Part = {
  type: string;
  text?: string;
  state?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  parts?: Part[];
};

function MessageBubble({ message }: { message: Message }) {
  const parts = message.parts ?? [];
  const isUser = message.role === "user";

  if (isUser) {
    const text = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#1B4332] px-4 py-2.5 text-sm text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((p, idx) => {
        if (p.type === "text") {
          return (
            <div
              key={idx}
              className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white/85 px-4 py-2.5 text-sm leading-relaxed text-ink ring-1 ring-sand"
            >
              {p.text}
            </div>
          );
        }
        if (p.type?.startsWith("tool-")) {
          const toolName = p.type.replace(/^tool-/, "");
          const label = TOOL_LABELS[toolName] ?? toolName;
          const isDone = p.state === "output-available";
          const isError = p.state === "output-error";
          return (
            <div
              key={idx}
              className={`inline-flex max-w-[92%] items-center gap-2 rounded-full px-3 py-1.5 text-[11px] ${
                isError
                  ? "bg-red-50 text-red-800 ring-1 ring-red-200"
                  : isDone
                    ? "bg-[#E8F0EB] text-[#1B4332] ring-1 ring-[#2D6A4F]/20"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
              }`}
            >
              {isDone ? <CheckIcon /> : isError ? <XIcon /> : <SpinnerIcon />}
              <span className="font-medium">{label}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const suggestions = [
    "What's the top concept for Singapore?",
    "Add Vietnam as a new market with realistic defaults",
    "Why is mango ranking #1 in UAE?",
    "Compare premium-first vs climate-first strategies",
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone">
        Hi! I can read your data, add markets/fruits, run analyses, and explain results. Try one of these:
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-2xl border border-sand bg-white/85 px-4 py-2.5 text-left text-xs text-ink transition hover:border-[#2D6A4F]/40 hover:bg-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── Icons ──────────────────────────────

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="animate-spin">
    <path strokeLinecap="round" d="M12 4v4M12 16v4M4 12h4M16 12h4" />
  </svg>
);
