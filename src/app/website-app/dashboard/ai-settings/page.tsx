"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AISettings {
  id: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  store_conversations: boolean;
  website_sync_urls: string[];
  active_version_id: string | null;
  last_website_sync: string | null;
  active_version: AIVersion | null;
  updated_at: string;
}

interface AIVersion {
  id: string;
  version_number: number;
  label: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  article_count: number;
  total_token_estimate: number;
  snapshot: { articles?: Article[]; article_ids?: string[] } | null;
  performance_score: number | null;
  created_at: string;
  updated_at: string;
}

interface Article {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  source_url: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Analytics {
  total_conversations: number;
  conversations_this_week: number;
  conversations_today: number;
  avg_message_count: number;
  ticket_conversion_rate: number;
  top_topics: { topic: string; count: number }[];
  sentiment_distribution: Record<string, number>;
  recent_unanswered: { question: string; session_id: string; created_at: string }[];
}

interface SuggestedArticle {
  id: string;
  category: string;
  title: string;
  suggested_content: string;
  priority: number;
  reasoning: string;
  status: string;
  source_conversation_count: number;
  created_at: string;
}

type Tab = "overview" | "knowledge" | "versions" | "analytics" | "sync";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge Base" },
  { key: "versions", label: "Versions" },
  { key: "analytics", label: "Analytics" },
  { key: "sync", label: "Website Sync" },
];

const CATEGORIES = [
  "all",
  "property",
  "pricing",
  "policy",
  "faq",
  "location",
  "amenity",
  "process",
  "custom",
  "website-content",
  "property-info",
  "leasing",
  "maintenance",
  "policies",
  "amenities",
  "general",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return "Never";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-100 text-green-700",
    archived: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Toast Component ─────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AISettingsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- Data states ---
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [versions, setVersions] = useState<AIVersion[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedArticle[]>([]);

  // --- Loading states ---
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // --- Form states ---
  const [modelName, setModelName] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [storeConversations, setStoreConversations] = useState(true);

  // --- Knowledge Base states ---
  const [kbCategory, setKbCategory] = useState("all");
  const [kbSearch, setKbSearch] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleForm, setArticleForm] = useState({ title: "", content: "", category: "faq", tags: "", priority: 0 });
  const [savingArticle, setSavingArticle] = useState(false);

  // --- Versions states ---
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);

  // --- Website Sync states ---
  const [syncUrls, setSyncUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");

  // ─── Fetch Functions ─────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/ai/settings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      setModelName(data.model_name || "");
      setTemperature(data.temperature ?? 0.7);
      setMaxTokens(data.max_tokens ?? 1024);
      setStoreConversations(data.store_conversations ?? true);
      setSyncUrls(data.website_sync_urls ?? []);
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoadingSettings(false);
    }
  }, [showToast]);

  const fetchArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch("/api/ai/knowledge");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load articles", "error");
    } finally {
      setLoadingArticles(false);
    }
  }, [showToast]);

  const fetchVersions = useCallback(async () => {
    setLoadingVersions(true);
    try {
      const res = await fetch("/api/ai/versions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load versions", "error");
    } finally {
      setLoadingVersions(false);
    }
  }, [showToast]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/ai/analytics");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalytics(data);
    } catch {
      showToast("Failed to load analytics", "error");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [showToast]);

  // Load initial data
  useEffect(() => {
    fetchSettings();
    fetchArticles();
  }, [fetchSettings, fetchArticles]);

  // Load tab-specific data on tab switch
  useEffect(() => {
    if (tab === "versions" && versions.length === 0) fetchVersions();
    if (tab === "analytics" && !analytics) fetchAnalytics();
  }, [tab, versions.length, analytics, fetchVersions, fetchAnalytics]);

  // ─── Action Handlers ─────────────────────────────────────────────────────

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_name: modelName,
          temperature,
          max_tokens: maxTokens,
          store_conversations: storeConversations,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings((prev) => prev ? { ...prev, ...data } : prev);
      showToast("Settings saved successfully");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const createNewVersion = async () => {
    if (!newVersionLabel.trim()) {
      showToast("Please enter a version label", "error");
      return;
    }
    setCreatingVersion(true);
    try {
      const res = await fetch("/api/ai/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newVersionLabel }),
      });
      if (!res.ok) throw new Error();
      showToast("New draft version created");
      setNewVersionLabel("");
      setShowNewVersionForm(false);
      fetchVersions();
    } catch {
      showToast("Failed to create version", "error");
    } finally {
      setCreatingVersion(false);
    }
  };

  const activateVersion = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/versions/${id}/activate`, { method: "POST" });
      if (!res.ok) throw new Error();
      showToast("Version activated");
      fetchVersions();
      fetchSettings();
    } catch {
      showToast("Failed to activate version", "error");
    }
  };

  const rollbackVersion = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/versions/${id}/rollback`, { method: "POST" });
      if (!res.ok) throw new Error();
      showToast("Rolled back to version");
      fetchVersions();
      fetchSettings();
    } catch {
      showToast("Failed to rollback version", "error");
    }
  };

  const saveArticle = async () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      showToast("Title and content are required", "error");
      return;
    }
    setSavingArticle(true);
    try {
      const tags = articleForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (editingArticle) {
        const res = await fetch(`/api/ai/knowledge/${editingArticle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...articleForm, tags, priority: Number(articleForm.priority) }),
        });
        if (!res.ok) throw new Error();
        showToast("Article updated");
      } else {
        const res = await fetch("/api/ai/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...articleForm, tags, priority: Number(articleForm.priority) }),
        });
        if (!res.ok) throw new Error();
        showToast("Article created");
      }
      setShowArticleForm(false);
      setEditingArticle(null);
      setArticleForm({ title: "", content: "", category: "faq", tags: "", priority: 0 });
      fetchArticles();
    } catch {
      showToast("Failed to save article", "error");
    } finally {
      setSavingArticle(false);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/knowledge/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Article deactivated");
      fetchArticles();
    } catch {
      showToast("Failed to delete article", "error");
    }
  };

  const toggleArticleActive = async (article: Article) => {
    try {
      const res = await fetch(`/api/ai/knowledge/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !article.is_active }),
      });
      if (!res.ok) throw new Error();
      fetchArticles();
    } catch {
      showToast("Failed to update article", "error");
    }
  };

  const editArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags?.join(", ") || "",
      priority: article.priority,
    });
    setShowArticleForm(true);
  };

  const syncWebsite = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ai/sync-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: syncUrls }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      showToast(`Synced ${data.synced} pages successfully`);
      fetchSettings();
      fetchArticles();
    } catch {
      showToast("Failed to sync website", "error");
    } finally {
      setSyncing(false);
    }
  };

  const saveSyncUrls = async () => {
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website_sync_urls: syncUrls }),
      });
      if (!res.ok) throw new Error();
      showToast("Sync URLs saved");
      fetchSettings();
    } catch {
      showToast("Failed to save URLs", "error");
    }
  };

  const addUrl = () => {
    if (newUrl.trim() && !syncUrls.includes(newUrl.trim())) {
      setSyncUrls([...syncUrls, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const removeUrl = (url: string) => {
    setSyncUrls(syncUrls.filter((u) => u !== url));
  };

  const analyzeConversations = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/suggest", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      showToast(`Generated ${data.suggestions?.length || 0} suggestions from ${data.analyzed_conversations || 0} conversations`);
    } catch {
      showToast("Failed to analyze conversations", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const approveSuggestion = async (suggestion: SuggestedArticle) => {
    try {
      const res = await fetch("/api/ai/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          content: suggestion.suggested_content,
          category: suggestion.category,
          tags: ["ai-suggested"],
          priority: suggestion.priority,
          source: "ai-suggestion",
        }),
      });
      if (!res.ok) throw new Error();
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      showToast("Suggestion approved and article created");
      fetchArticles();
    } catch {
      showToast("Failed to approve suggestion", "error");
    }
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    showToast("Suggestion dismissed");
  };

  const createArticleFromQuestion = (question: string) => {
    setTab("knowledge");
    setEditingArticle(null);
    setArticleForm({
      title: question,
      content: "",
      category: "faq",
      tags: "from-unanswered",
      priority: 5,
    });
    setShowArticleForm(true);
  };

  // ─── Filtered Articles ───────────────────────────────────────────────────

  const filteredArticles = articles.filter((a) => {
    const matchCategory = kbCategory === "all" || a.category === kbCategory;
    const matchSearch =
      !kbSearch ||
      a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
      a.content.toLowerCase().includes(kbSearch.toLowerCase()) ||
      a.tags?.some((t) => t.toLowerCase().includes(kbSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const websiteSyncedArticles = articles.filter((a) => a.source === "website-sync");

  const activeVersion = settings?.active_version || versions.find((v) => v.status === "active") || null;

  const totalArticles = articles.length;
  const activeArticles = articles.filter((a) => a.is_active).length;

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loadingSettings && loadingArticles) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your AI chatbot knowledge base, versions, and configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══════════════ TAB: OVERVIEW ═══════════════ */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Active Version Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Version</h2>
            {activeVersion ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Version</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">v{activeVersion.version_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Label</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{activeVersion.label}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Articles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeVersion.article_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Token Estimate</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{activeVersion.total_token_estimate?.toLocaleString()}</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs text-gray-400">Activated: {formatDate(activeVersion.updated_at)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No active version. Create and activate a version to start.</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalArticles}</p>
              <p className="text-xs text-gray-400 mt-1">{activeArticles} active</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.total_conversations ?? "---"}</p>
              <p className="text-xs text-gray-400 mt-1">{analytics ? `${analytics.conversations_today} today` : "Load analytics tab"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Pending Suggestions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{suggestions.length}</p>
              <p className="text-xs text-gray-400 mt-1">from AI analysis</p>
            </div>
          </div>

          {/* Model Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. llama-3.3-70b-versatile"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temperature ({temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Precise (0)</span>
                  <span>Creative (1)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Tokens</label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <button
                  onClick={() => setStoreConversations(!storeConversations)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${storeConversations ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${storeConversations ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Store Conversations</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingSettings ? <Spinner /> : null}
                Save Settings
              </button>
            </div>
          </div>

          {/* Create New Version */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Version</h2>
            <p className="text-sm text-gray-500 mb-4">Creates a draft snapshot from all currently active articles.</p>
            {showNewVersionForm ? (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Version Label</label>
                  <input
                    type="text"
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                    placeholder="e.g. March 2026 Update"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <button
                  onClick={createNewVersion}
                  disabled={creatingVersion}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creatingVersion ? <Spinner /> : null}
                  Create Draft
                </button>
                <button
                  onClick={() => { setShowNewVersionForm(false); setNewVersionLabel(""); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewVersionForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Version
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: KNOWLEDGE BASE ═══════════════ */}
      {tab === "knowledge" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={kbCategory}
              onChange={(e) => setKbCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search articles..."
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button
              onClick={() => {
                setEditingArticle(null);
                setArticleForm({ title: "", content: "", category: "faq", tags: "", priority: 0 });
                setShowArticleForm(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Article
            </button>
          </div>

          {/* Article Form (Inline) */}
          {showArticleForm && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">{editingArticle ? "Edit Article" : "New Article"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                  <textarea
                    rows={5}
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                    placeholder="rent, pricing, faq"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={articleForm.priority}
                    onChange={(e) => setArticleForm({ ...articleForm, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={saveArticle}
                  disabled={savingArticle}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {savingArticle ? <Spinner /> : null}
                  {editingArticle ? "Update Article" : "Create Article"}
                </button>
                <button
                  onClick={() => { setShowArticleForm(false); setEditingArticle(null); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Articles Table */}
          {loadingArticles ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">No articles found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Title</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Source</th>
                      <th className="text-center px-5 py-3.5 font-semibold text-gray-600">Priority</th>
                      <th className="text-center px-5 py-3.5 font-semibold text-gray-600">Active</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{article.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                            {article.content.slice(0, 80)}...
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{article.category}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{article.source || "manual"}</td>
                        <td className="px-5 py-3.5 text-center text-gray-600">{article.priority}</td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => toggleArticleActive(article)}
                            className={`relative w-9 h-5 rounded-full transition-colors ${article.is_active ? "bg-green-500" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${article.is_active ? "translate-x-4" : ""}`} />
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => editArticle(article)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteArticle(article.id)}
                              title="Deactivate"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                Showing {filteredArticles.length} of {articles.length} articles
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: VERSIONS ═══════════════ */}
      {tab === "versions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{versions.length} version{versions.length !== 1 ? "s" : ""}</p>
            <button
              onClick={() => { setTab("overview"); setShowNewVersionForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Version
            </button>
          </div>

          {loadingVersions ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">No versions yet. Create one from the Overview tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`bg-white rounded-2xl border ${version.status === "active" ? "border-green-200 ring-1 ring-green-100" : "border-gray-100"} overflow-hidden transition-all`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">v{version.version_number}</span>
                        {statusBadge(version.status)}
                        <span className="text-sm text-gray-600">{version.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {version.status === "draft" && (
                          <button
                            onClick={() => activateVersion(version.id)}
                            className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        {version.status === "active" && (
                          <span className="px-4 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg">Current Version</span>
                        )}
                        {version.status === "archived" && (
                          <button
                            onClick={() => rollbackVersion(version.id)}
                            className="px-4 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                          >
                            Rollback
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          <svg className={`w-4 h-4 transition-transform ${expandedVersion === version.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-6 text-xs text-gray-400">
                      <span>{version.article_count} articles</span>
                      <span>{version.total_token_estimate?.toLocaleString()} tokens</span>
                      <span>Created {formatDate(version.created_at)}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedVersion === version.id && version.snapshot?.articles && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Articles in this snapshot</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {version.snapshot.articles.map((article: Article, idx: number) => (
                          <div key={article.id || idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{idx + 1}.</span>
                              <span className="font-medium text-gray-900">{article.title}</span>
                              <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{article.category}</span>
                            </div>
                            <span className="text-gray-400">Priority: {article.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: ANALYTICS ═══════════════ */}
      {tab === "analytics" && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : analytics ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Total Conversations", value: analytics.total_conversations },
                  { label: "This Week", value: analytics.conversations_this_week },
                  { label: "Today", value: analytics.conversations_today },
                  { label: "Avg Messages", value: analytics.avg_message_count },
                  { label: "Ticket Rate", value: `${analytics.ticket_conversion_rate}%` },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Topics */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Top Topics</h3>
                  {analytics.top_topics.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_topics.map((t) => {
                        const maxCount = analytics.top_topics[0]?.count || 1;
                        const width = Math.max(10, (t.count / maxCount) * 100);
                        return (
                          <div key={t.topic} className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 w-32 truncate">{t.topic}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${width}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{t.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No topic data yet.</p>
                  )}
                </div>

                {/* Sentiment */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Sentiment Breakdown</h3>
                  {Object.keys(analytics.sentiment_distribution).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.sentiment_distribution).map(([sentiment, count]) => {
                        const colors: Record<string, string> = {
                          positive: "bg-green-500",
                          neutral: "bg-gray-400",
                          negative: "bg-orange-500",
                          frustrated: "bg-red-500",
                        };
                        return (
                          <div key={sentiment} className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 w-24 capitalize">{sentiment}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${colors[sentiment] || "bg-blue-500"}`}
                                style={{ width: `${Math.max(10, (count / analytics.total_conversations) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No sentiment data yet.</p>
                  )}
                </div>
              </div>

              {/* Unanswered Questions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Unanswered Questions</h3>
                {analytics.recent_unanswered.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analytics.recent_unanswered.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{q.question}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(q.created_at)}</p>
                        </div>
                        <button
                          onClick={() => createArticleFromQuestion(q.question)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                        >
                          Create Article
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No unanswered questions recorded.</p>
                )}
              </div>

              {/* Suggested Articles */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">AI Suggested Articles</h3>
                  <button
                    onClick={analyzeConversations}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {analyzing ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    )}
                    Analyze Recent Conversations
                  </button>
                </div>
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((s) => (
                      <div key={s.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">{s.title}</h4>
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.category}</span>
                              <span className="text-xs text-gray-400">Priority: {s.priority}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{s.suggested_content}</p>
                            <p className="text-xs text-blue-600 mt-1">{s.reasoning}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => approveSuggestion(s)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => dismissSuggestion(s.id)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No suggestions yet. Click &quot;Analyze Recent Conversations&quot; to generate.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">Failed to load analytics data.</p>
              <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: WEBSITE SYNC ═══════════════ */}
      {tab === "sync" && (
        <div className="space-y-6">
          {/* URL List Editor */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Sync URLs</h3>
            <p className="text-sm text-gray-500 mb-4">Add website URLs to sync content as knowledge base articles.</p>

            <div className="flex gap-3 mb-4">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/page"
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <button
                onClick={addUrl}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add URL
              </button>
            </div>

            {syncUrls.length > 0 ? (
              <div className="space-y-2 mb-4">
                {syncUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      {url}
                    </a>
                    <button
                      onClick={() => removeUrl(url)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No URLs configured yet.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={saveSyncUrls}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Save URLs
              </button>
              <button
                onClick={syncWebsite}
                disabled={syncing || syncUrls.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {syncing ? <Spinner /> : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                )}
                Sync Now
              </button>
            </div>

            {settings?.last_website_sync && (
              <p className="text-xs text-gray-400 mt-3">Last sync: {formatDate(settings.last_website_sync)}</p>
            )}
          </div>

          {/* Website-Synced Articles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Synced Articles ({websiteSyncedArticles.length})
            </h3>
            {websiteSyncedArticles.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {websiteSyncedArticles.map((article) => (
                  <div key={article.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
                        {article.source_url && (
                          <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                            {article.source_url}
                          </a>
                        )}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.content.slice(0, 200)}</p>
                        <p className="text-xs text-gray-400 mt-1">Updated: {formatDate(article.updated_at)}</p>
                      </div>
                      <button
                        onClick={() => toggleArticleActive(article)}
                        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${article.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${article.is_active ? "translate-x-4" : ""}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No website-synced articles yet. Add URLs and click Sync Now.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
