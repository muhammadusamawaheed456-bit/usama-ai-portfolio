"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ToolLoading from "./ToolLoading";
import ToolInput from "./ToolInput";
import ToolOutput from "./ToolOutput";
import ToolError from "./ToolError";
import KnowledgeSummaryCard from "./KnowledgeSummaryCard";

type Role = "user" | "assistant";

type Source = {
  source: string;
  title: string;
  score: number;
};

type Message = {
  role: Role;
  content: string;
  sources?: Source[];
  error?: boolean;
  tool?: "loading" | "input" | "output" | "error" | "summary";
};

const SUGGESTED = [
  "Tell me about Usama's projects",
  "What technologies does Usama know?",
  "Explain AquaX AI",
  "Why should we hire Usama?",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the Usama AI Assistant. Ask me about Usama's projects, skills, or internship experience — I'll answer using his verified profile data.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading]);


  async function sendMessage(text: string) {
    const question = text.trim();

    if (!question || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: question,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          history: nextMessages
            .filter((m) => !m.error)
            .slice(-6)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });


      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }


      const data = await res.json();


      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
          tool: "output",
        },
      ]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the assistant backend just now. Please try again in a moment, or reach Usama directly via the Contact page.",
          error: true,
          tool: "error",
        },
      ]);

    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
        aria-label="Open Usama AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>


      {open && (
        <div className="glass fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col rounded-2xl shadow-2xl sm:w-96">

          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bot size={16} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Usama AI Assistant
              </p>

              <p className="text-xs text-muted-foreground">
                Grounded in Usama's real profile data
              </p>
            </div>

          </div>



          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >

            {messages.map((m, i) => (

              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user"
                    ? "justify-end"
                    : "justify-start"
                )}
              >

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",

                    m.role === "user"
                      ? "bg-primary text-primary-foreground"

                      : m.error
                        ? "bg-red-500/10 text-red-400"

                        : "bg-muted text-foreground"
                  )}
                >


                  {m.tool === "loading" && (
                    <ToolLoading />
                  )}


                  {m.tool === "input" && (
                    <ToolInput question={m.content} />
                  )}


                  {m.tool === "summary" && (
                    <KnowledgeSummaryCard
                      summary={m.content}
                      sources={m.sources || []}
                    />
                  )}


                  {m.tool === "output" && (
                    <ToolOutput message={m.content} />
                  )}


                  {m.tool === "error" && (
                    <ToolError message={m.content} />
                  )}


                  {!m.tool && (
                    <>
                      {m.content}

                      {m.sources &&
                        m.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1 border-t border-border/60 pt-2">

                            {m.sources.map((s, idx) => (

                              <span
                                key={idx}
                                className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {s.source}
                              </span>

                            ))}

                          </div>
                        )}

                    </>
                  )}

                </div>

              </div>

            ))}



            {loading && <ToolLoading />}



            {messages.length === 1 && (

              <div className="flex flex-wrap gap-2 pt-2">

                {SUGGESTED.map((s) => (

                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s}
                  </button>

                ))}

              </div>

            )}

          </div>



          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border/60 p-3"
          >

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Usama's experience…"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />


            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>


          </form>


        </div>
      )}

    </>
  );
}