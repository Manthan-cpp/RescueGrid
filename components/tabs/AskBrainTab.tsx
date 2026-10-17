"use client";

import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Terminal,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
} from "lucide-react";
import { ChatMessage } from "@/lib/types";

interface AskBrainTabProps {
  messages: ChatMessage[];
  onSendMessage: (queryText: string) => void;
  isLoading?: boolean;
}

export function AskBrainTab({
  messages,
  onSendMessage,
  isLoading = false,
}: AskBrainTabProps) {
  const [inputText, setInputText] = useState("");
  const [expandedCypherId, setExpandedCypherId] = useState<string | null>(null);

  const suggestedQuestions = [
    "Which wards currently have open critical SOS requests and no boats nearby?",
    "What is the remaining shelter bed capacity in Kalpetta and Vythiri?",
    "List all available ambulances and their current staging locations",
    "Which evacuation routes are currently marked as blocked by mudslides?",
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleSuggestedClick = (q: string) => {
    onSendMessage(q);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Brain Top Status Bar */}
      <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Ask the Brain — Graph Intelligence
            </h3>
            <p className="text-[11px] text-gray-500">
              Company Brain track · Real-time Cypher generation over FalkorDB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="flex items-center text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
            <Cpu className="w-3 h-3 mr-1 text-purple-600" />
            Groq LLaMA / Qwen
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[11px]">
            Zero Hallucination
          </span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isCypherExpanded = expandedCypherId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {isUser ? "Crisis Coordinator" : "RescueGrid Brain"}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {msg.timestamp}
                </span>
              </div>

              <div
                className={`max-w-2xl rounded-lg p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-gray-950 text-white rounded-tr-none font-medium"
                    : "bg-gray-100/90 text-gray-900 border border-gray-200 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Cypher Transparency Box (When returned by brain) */}
                {msg.cypher_query && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200/80">
                    <button
                      onClick={() =>
                        setExpandedCypherId(isCypherExpanded ? null : msg.id)
                      }
                      className="flex items-center justify-between w-full text-[11px] font-mono text-purple-700 hover:text-purple-900 font-semibold transition-colors"
                    >
                      <span className="flex items-center space-x-1">
                        <Terminal className="w-3 h-3" />
                        <span>Inspect Executed Cypher Query</span>
                      </span>
                      <span className="flex items-center space-x-1 text-gray-500 font-normal">
                        <Clock className="w-3 h-3" />
                        <span>{msg.execution_ms || 15}ms</span>
                        {isCypherExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        )}
                      </span>
                    </button>

                    {isCypherExpanded && (
                      <div className="mt-2 p-2.5 rounded bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto shadow-inner border border-gray-800">
                        <code>{msg.cypher_query}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              RescueGrid Brain
            </span>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span>Querying FalkorDB graph schema & synthesizing answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-gray-500 flex items-center mr-1">
          <HelpCircle className="w-3 h-3 mr-1" />
          Quick Cypher Queries:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestedClick(q)}
            className="text-[11px] bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-2 py-0.5 rounded transition-colors truncate max-w-xs"
            title={q}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-200 bg-white flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Ask any natural language question about the crisis, wards, resources, routes..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 text-xs px-3.5 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="inline-flex items-center px-4 py-2.5 text-xs font-semibold rounded-md bg-gray-950 text-white hover:bg-gray-800 disabled:opacity-40 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Ask Brain
        </button>
      </form>
    </div>
  );
}
