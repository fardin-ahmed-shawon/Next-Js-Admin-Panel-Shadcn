"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  Inbox, 
  Settings, 
  Tag, 
  Star, 
  MoreVertical, 
  Send, 
  Bot, 
  Paperclip, 
  Smile, 
  Bookmark, 
  MessageSquare, 
  MessagesSquare,
  ChevronDown, 
  ChevronRight,
  ChevronsLeft,
  CheckCheck, 
  Clock, 
  User, 
  MessageCircle, 
  FolderDown, 
  MoreHorizontal, 
  LayoutDashboard, 
  BarChart3,
  Users, 
  Menu, 
  Filter, 
  Sparkles, 
  X, 
  Radio, 
  Bell, 
  Moon, 
  Sun, 
  ArrowRight, 
  LogOut, 
  Zap,
  UserPlus,
  Check,
  ArrowRightFromLine,
  RefreshCw,
  Plug, ShieldAlert
} from "lucide-react";
import styles from "./WorkspaceInbox.module.css";

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <img 
      src="/instagram.png" 
      alt="Instagram" 
      width={size} 
      height={size} 
      className={className} 
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "inline-block" }} 
    />
  );
}

function WhatsAppIcon({ size = 16, className = "" }) {
  return (
    <img 
      src="/whatsapp.png" 
      alt="WhatsApp" 
      width={size} 
      height={size} 
      className={className} 
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "inline-block" }} 
    />
  );
}

function MessengerIcon({ size = 16, className = "" }) {
  return (
    <img 
      src="/messenger.png" 
      alt="Messenger" 
      width={size} 
      height={size} 
      className={className} 
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "inline-block" }} 
    />
  );
}

function channelLabel(channel) {
  if (channel === "instagram") return "Instagram DM";
  if (channel === "whatsapp") return "WhatsApp Direct";
  return "Facebook Messenger";
}

function channelShortLabel(channel) {
  if (channel === "instagram") return "Instagram";
  if (channel === "whatsapp") return "WhatsApp";
  return "Messenger";
}

function initials(name) {
  const parts = String(name || "").trim().split(" ").filter(Boolean);
  if (!parts.length) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function relativeTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function replyWindowOpen(lastInboundAt) {
  if (!lastInboundAt) return true;
  const elapsed = Date.now() - new Date(lastInboundAt).getTime();
  return elapsed <= 24 * 60 * 60 * 1000;
}

const emptyLead = { intent: "general_inquiry", stage: "new", contactName: "", contactPhone: "", businessName: "", websiteUrl: "", primaryChannel: "", monthlyOrderRange: "", painPoint: "", recommendedPlan: "", callPermission: false, preferredContactType: "phone_call", preferredDate: "", preferredTime: "", timezone: "Asia/Dhaka", notes: "" };

export default function WorkspaceInbox({ canReply = true, onManageChannels }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [comingSoonModal, setComingSoonModal] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [automationBusy, setAutomationBusy] = useState(false);
  const [error, setError] = useState("");
  const [mobileList, setMobileList] = useState(true);
  const [lead, setLead] = useState(emptyLead);
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadNotice, setLeadNotice] = useState("");
  const [contextTab, setContextTab] = useState("overview");

  const parsePayload = async (response, fallbackMsg) => {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await response.json();
      }
      const text = await response.text();
      return { error: text || fallbackMsg };
    } catch (_) {
      return { error: fallbackMsg };
    }
  };

  const loadConversations = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch("/api/unified-inbox/messages/threads");
      const payload = await parsePayload(response, "Conversations could not be loaded.");
      if (!response.ok) throw new Error(payload.error ?? "Conversations could not be loaded.");
      const next = payload.conversations ?? [];
      setConversations((prev) => {
        if (prev.length === next.length && prev.every((item, idx) => item.id === next[idx]?.id && item.lastMessageAt === next[idx]?.lastMessageAt && item.unread === next[idx]?.unread && item.preview === next[idx]?.preview)) {
          return prev;
        }
        return next;
      });
      setSelectedId((current) => {
        if (current && next.some((item) => item.id === current)) return current;
        return next[0]?.id ?? "";
      });
      setError("");
    } catch (err) {
      if (!quiet) setError(err.message || "Failed to load conversations.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (senderId, quiet = false) => {
    if (!senderId) return;
    if (!quiet) setMessagesLoading(true);
    try {
      const response = await fetch(`/api/unified-inbox/messages/${senderId}`);
      const payload = await parsePayload(response, "Failed to load thread messages.");
      if (!response.ok) throw new Error(payload.error ?? "Failed to load thread messages.");
      const nextMessages = payload.messages ?? [];
      setMessages((prev) => {
        if (prev.length === nextMessages.length && prev.every((m, idx) => m.id === nextMessages[idx]?.id && m.text === nextMessages[idx]?.text)) {
          return prev;
        }
        return nextMessages;
      });
      setError("");
    } catch (err) {
      if (!quiet) setError(err.message || "Could not fetch messages.");
    } finally {
      if (!quiet) setMessagesLoading(false);
    }
  }, []);

  const loadLead = useCallback(async (senderId) => {
    if (!senderId) {
      setLead(emptyLead);
      return;
    }
    try {
      const response = await fetch(`/api/unified-inbox/messages/${senderId}/lead`);
      const payload = await parsePayload(response, "Failed to load lead.");
      if (response.ok && payload.lead) {
        setLead({ ...emptyLead, ...payload.lead });
      } else {
        setLead(emptyLead);
      }
    } catch {
      setLead(emptyLead);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchThreads = async (quiet = false) => {
      try {
        const response = await fetch("/api/unified-inbox/messages/threads");
        const payload = await parsePayload(response, "Conversations could not be loaded.");
        if (!response.ok) throw new Error(payload.error ?? "Conversations could not be loaded.");
        const next = payload.conversations ?? [];
        if (!isMounted) return;
        setConversations((prev) => {
          if (prev.length === next.length && prev.every((item, idx) => item.id === next[idx]?.id && item.lastMessageAt === next[idx]?.lastMessageAt && item.unread === next[idx]?.unread && item.preview === next[idx]?.preview)) {
            return prev;
          }
          return next;
        });
        setSelectedId((current) => {
          if (current && next.some((item) => item.id === current)) return current;
          return next[0]?.id ?? "";
        });
        setError("");
      } catch (err) {
        if (!quiet && isMounted) setError(err.message || "Failed to load conversations.");
      } finally {
        if (!quiet && isMounted) setLoading(false);
      }
    };

    fetchThreads(false);
    const interval = setInterval(() => fetchThreads(true), 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let isMounted = true;

    const fetchThreadData = async (quiet = false) => {
      try {
        const response = await fetch(`/api/unified-inbox/messages/${selectedId}`);
        const payload = await parsePayload(response, "Failed to load thread messages.");
        if (!response.ok) throw new Error(payload.error ?? "Failed to load thread messages.");
        const nextMessages = payload.messages ?? [];
        if (!isMounted) return;
        setMessages((prev) => {
          if (prev.length === nextMessages.length && prev.every((m, idx) => m.id === nextMessages[idx]?.id && m.text === nextMessages[idx]?.text)) {
            return prev;
          }
          return nextMessages;
        });
        setError("");
      } catch (err) {
        if (!quiet && isMounted) setError(err.message || "Could not fetch messages.");
      } finally {
        if (!quiet && isMounted) setMessagesLoading(false);
      }
    };

    const fetchLeadData = async () => {
      try {
        const response = await fetch(`/api/unified-inbox/messages/${selectedId}/lead`);
        const payload = await parsePayload(response, "Failed to load lead.");
        if (isMounted) {
          if (response.ok && payload.lead) {
            setLead({ ...emptyLead, ...payload.lead });
          } else {
            setLead(emptyLead);
          }
        }
      } catch {
        if (isMounted) setLead(emptyLead);
      }
    };

    fetchThreadData(false);
    fetchLeadData();
    const interval = setInterval(() => fetchThreadData(true), 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const timer = window.setTimeout(async () => {
      try {
        await fetch(`/api/unified-inbox/messages/${selectedId}/read`, { method: "PUT" });
        setConversations((current) =>
          current.map((item) => (item.id === selectedId ? { ...item, unread: 0 } : item))
        );
      } catch {
        // quiet fail
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [loadLead, selectedId]);

  const selected = conversations.find((item) => item.id === selectedId) ?? null;
  const whatsappReplyOpen = selected?.channel !== "whatsapp" || replyWindowOpen(selected?.lastInboundAt);
  const canSendSelected = canReply && whatsappReplyOpen;

  const selectConversation = (id) => {
    setSelectedId(id);
    setMobileList(false);
  };

  const channelCounts = useMemo(() => {
    const counts = { all: conversations.length, messenger: 0, instagram: 0, whatsapp: 0 };
    for (const c of conversations) {
      if (c.channel === "facebook" || c.channel === "messenger") counts.messenger++;
      else if (c.channel === "instagram") counts.instagram++;
      else if (c.channel === "whatsapp") counts.whatsapp++;
    }
    return counts;
  }, [conversations]);

  const visible = useMemo(() => {
    return conversations.filter((item) => {
      if (filter === "unread" && !(Number(item.unread) > 0)) return false;
      if (filter === "whatsapp" && item.channel !== "whatsapp") return false;
      if (filter === "instagram" && item.channel !== "instagram") return false;
      if (filter === "messenger" && item.channel !== "facebook" && item.channel !== "messenger") return false;

      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.username?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.preview?.toLowerCase().includes(q)
      );
    });
  }, [conversations, filter, query]);

  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !selected || sending) return;
    setSending(true);
    setError("");

    try {
      const connectionIdVal = selected.connectionId && selected.connectionId !== "-" && selected.connectionId !== "legacy"
        ? selected.connectionId
        : null;

      const response = await fetch("/api/unified-inbox/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selected.channel || "messenger",
          recipientId: selected.socialId || selected.id,
          connectionId: connectionIdVal,
          content: draft.trim(),
          senderId: selected.id,
          text: draft.trim(),
          source: "web_reply"
        })
      });
      const payload = await parsePayload(response, "Message failed to deliver.");
      if (!response.ok) {
        const errorDetails = payload.fields
          ? Object.values(payload.fields).flat().join(" ")
          : (payload.error ?? "Message failed to deliver.");
        throw new Error(errorDetails);
      }

      setDraft("");
      await loadMessages(selected.id);
      await loadConversations(true);
    } catch (err) {
      setError(err.message || "Message delivery failed.");
    } finally {
      setSending(false);
    }
  };

  const toggleAutomation = async () => {
    if (!selected || automationBusy) return;
    setAutomationBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/unified-inbox/messages/${selected.id}/automation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: !selected.automationPaused })
      });
      const payload = await parsePayload(response, "Automation state could not be updated.");
      if (!response.ok) throw new Error(payload.error ?? "Automation state could not be updated.");

      setConversations((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...item, automationPaused: payload.paused } : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update automation.");
    } finally {
      setAutomationBusy(false);
    }
  };

  const saveLead = async (event) => {
    event.preventDefault();
    if (!selected || leadBusy) return;
    setLeadBusy(true);
    setLeadNotice("");

    try {
      const response = await fetch(`/api/unified-inbox/messages/${selected.id}/lead`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          contactName: lead.contactName || lead.name || selected.name
        })
      });
      const payload = await parsePayload(response, "Failed to save lead.");
      if (!response.ok) throw new Error(payload.error ?? "Failed to save lead.");

      setLeadNotice("Lead updated successfully.");
      setTimeout(() => setLeadNotice(""), 3000);
    } catch (err) {
      setLeadNotice(err.message || "Could not update lead.");
    } finally {
      setLeadBusy(false);
    }
  };

  return (
    <div className={styles.appLayout}>
      {/* MAIN WORKSPACE CONTENT */}
      <div className={styles.inboxWorkspaceRow}>
        {/* COLUMN 2: Conversation List Card */}
        <aside className={`${styles.leftPaneCard} ${mobileList ? styles.mobilePaneVisible : styles.mobilePaneHidden}`}>
            <div className={styles.paneHeaderTitleRow}>
              <div className={styles.headerTitleWrap}>
                <h2>Conversations</h2>
                <span className={styles.grayCountBadge}>{conversations.length}</span>
              </div>
              <button 
                type="button" 
                className={styles.seeAllLink}
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
                title="See all conversations"
              >
                See All
              </button>
            </div>

            <div className={styles.tabsRow}>
              <button 
                type="button" 
                className={filter === "all" ? styles.activeTab : styles.tab} 
                onClick={() => setFilter("all")}
                title="All conversations"
              >
                <span>All</span>
                <span className={styles.tabCount}>{channelCounts.all}</span>
              </button>

              <button 
                type="button" 
                className={filter === "messenger" ? styles.activeTab : styles.tab} 
                onClick={() => setFilter("messenger")}
                title="Messenger"
              >
                <MessengerIcon size={14} />
                <span className={styles.tabCount}>{channelCounts.messenger}</span>
              </button>

              <button 
                type="button" 
                className={filter === "instagram" ? styles.activeTab : styles.tab} 
                onClick={() => setFilter("instagram")}
                title="Instagram"
              >
                <InstagramIcon size={14} />
                <span className={styles.tabCount}>{channelCounts.instagram}</span>
              </button>

              <button 
                type="button" 
                className={filter === "whatsapp" ? styles.activeTab : styles.tab} 
                onClick={() => setFilter("whatsapp")}
                title="WhatsApp"
              >
                <WhatsAppIcon size={14} />
                <span className={styles.tabCount}>{channelCounts.whatsapp}</span>
              </button>
            </div>

            <div className={styles.conversationSearchRow}>
              <div className={styles.chatSearchBar}>
                <Search size={14} className={styles.chatSearchIcon} />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search conversations..."
                  aria-label="Search conversations"
                  className={styles.chatSearchInput}
                />
                {query && (
                  <button 
                    type="button" 
                    className={styles.chatSearchClearBtn}
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.conversationList}>
              {visible.map((conversation) => {
                const isSelected = conversation.id === selectedId;
                const unreadCount = Number(conversation.unread) || 0;
                return (
                  <div 
                    key={conversation.id} 
                    className={`${styles.conversationItem} ${isSelected ? styles.selectedItem : ""}`} 
                    onClick={() => selectConversation(conversation.id)}
                  >
                    {isSelected && <span className={styles.selectedBar} />}
                    <span className={styles.avatarDark}>{initials(conversation.name)}</span>
                    <div className={styles.itemCopy}>
                      <strong>{conversation.name}</strong>
                      {conversation.username && conversation.channel === "instagram" && (
                        <p className={styles.usernameLine}>@{String(conversation.username).replace(/^@/, "")}</p>
                      )}
                      <p>{conversation.preview || "No text preview"}</p>
                      <small className={styles.itemChannelMeta}>
                        {conversation.channel === "instagram" ? (
                          <InstagramIcon size={11} />
                        ) : conversation.channel === "whatsapp" ? (
                          <WhatsAppIcon size={11} />
                        ) : (
                          <MessengerIcon size={11} />
                        )}
                        <span>{channelShortLabel(conversation.channel)} • {conversation.connectionName}</span>
                      </small>
                    </div>
                    <div className={styles.itemMeta}>
                      <time>{relativeTime(conversation.lastMessageAt)}</time>
                      {unreadCount > 0 && <span className={styles.unreadBlueDot} />}
                    </div>
                  </div>
                );
              })}
              {!visible.length && (
                <div className={styles.listEmptyState}>
                  <div className={styles.listEmptyIconBox}>
                    <Inbox size={22} className={styles.listEmptyIcon} />
                  </div>
                  <strong className={styles.listEmptyTitle}>No conversations found</strong>
                  <p className={styles.listEmptyDesc}>
                    {query || filter !== "all"
                      ? "No conversations match your current filters."
                      : "Customer inquiries from Messenger, Instagram, and WhatsApp will show up here."}
                  </p>
                  {(query || filter !== "all") && (
                    <button
                      type="button"
                      className={styles.listEmptyResetBtn}
                      onClick={() => { setQuery(""); setFilter("all"); }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* COLUMN 3: Chat Thread Card */}
          <section className={`${styles.middlePaneCard} ${mobileList ? styles.mobilePaneHidden : styles.mobilePaneVisible}`}>
            {selected ? (
              <>
                <header className={styles.chatHeader}>
                  <button className={styles.mobileBack} type="button" onClick={() => setMobileList(true)} aria-label="Back">←</button>
                  <span className={styles.avatarDark}>
                    {selected.profilePic ? (
                      <img src={selected.profilePic} alt="" className={styles.avatarImage} />
                    ) : initials(selected.name)}
                  </span>
                  <div className={styles.headerInfo}>
                    <strong>{selected.name}</strong>
                    <div className={styles.headerChannelStatus}>
                      {selected.channel === "instagram" ? (
                        <InstagramIcon size={13} />
                      ) : selected.channel === "whatsapp" ? (
                        <WhatsAppIcon size={13} />
                      ) : (
                        <MessengerIcon size={13} />
                      )}
                      <span>{channelShortLabel(selected.channel)}</span>
                    </div>
                  </div>

                  <div className={styles.headerActions}>
                    <button 
                      type="button" 
                      className={styles.headerActionPillBtn}
                      onClick={() => {
                        setComingSoonModal({
                          title: "Assign Agent",
                          description: "Assign this conversation to specific team members or automated bots."
                        });
                      }}
                    >
                      <UserPlus size={14} />
                      <span>Assign</span>
                    </button>

                    <button 
                      type="button" 
                      className={styles.headerActionPillBtn}
                      onClick={() => {
                        setComingSoonModal({
                          title: "Mark as Resolved",
                          description: "Archiving and resolving conversation threads will be supported in the workflow update."
                        });
                      }}
                    >
                      <Check size={14} />
                      <span>Mark resolved</span>
                    </button>

                    <button type="button" className={styles.iconCircleBtn} aria-label="Tag" title="Tag"><Tag size={14} /></button>
                    <button type="button" className={styles.iconCircleBtn} aria-label="Star" title="Star"><Star size={14} /></button>
                    <button type="button" className={styles.iconCircleBtn} aria-label="Options" title="Options"><MoreVertical size={14} /></button>
                  </div>
                </header>

                {error && <div className={styles.inlineError}>{error}</div>}

                <div className={styles.chatStream}>
                  <div className={styles.dateDivider}>
                    <span>Today</span>
                  </div>

                  {messagesLoading ? (
                    <div className={styles.streamLoadingBox}>
                      <RefreshCw size={18} className={styles.spinIcon} />
                      <span>Loading messages…</span>
                    </div>
                  ) : (
                    messages.filter((m) => m.text && m.text !== "[Message]").map((message) => {
                      const isCustomer = message.author === "customer";
                      if (isCustomer) {
                        return (
                          <div key={message.id} className={styles.customerRow}>
                            <span className={styles.avatarTiny}>
                              {selected.profilePic ? (
                                <img src={selected.profilePic} alt="" className={styles.avatarImage} />
                              ) : initials(selected.name)}
                            </span>
                            <div className={styles.customerBubbleWrap}>
                              <div className={styles.customerBubble}>
                                <p>{message.text}</p>
                              </div>
                              <span className={styles.msgTime}>
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={message.id} className={styles.agentRow}>
                          <div className={styles.agentBubbleWrap}>
                            <div className={styles.agentBubble}>
                              <p>{message.text}</p>
                            </div>
                            <div className={styles.agentMeta}>
                              <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                              <CheckCheck size={14} className={styles.checkCheckIcon} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {!messagesLoading && !messages.filter((m) => m.text && m.text !== "[Message]").length && (
                    <div className={styles.threadMessagesEmpty}>
                      <div className={styles.threadMessagesEmptyIconBox}>
                        <MessageSquare size={22} />
                      </div>
                      <strong>No message history yet</strong>
                      <p>Send a message below to start the conversation with {selected.name}.</p>
                    </div>
                  )}
                </div>

                {/* Composer Box */}
                <div className={styles.composerWrapper}>
                  <form className={styles.composerCard} onSubmit={send}>
                    <textarea 
                      value={draft} 
                      onChange={(event) => {
                        setDraft(event.target.value);
                        event.target.style.height = "auto";
                        event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
                      }} 
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (draft.trim() && !sending && canSendSelected) {
                            send(e);
                          }
                        }
                      }} 
                      placeholder="Type a message..." 
                      disabled={!canSendSelected || sending} 
                      className={styles.composerInput}
                      rows={1} 
                    />
                    <div className={styles.composerRightActions}>
                      <button type="button" className={styles.toolIconBtn} title="Emoji">
                        <Smile size={18} />
                      </button>
                      <button type="button" className={styles.toolIconBtn} title="Attach file">
                        <Paperclip size={18} />
                      </button>
                      <button type="button" className={styles.toolIconBtn} title="Quick reply">
                        <Zap size={18} />
                      </button>
                      <button 
                        type="submit" 
                        className={styles.sendButtonSquare} 
                        disabled={!canSendSelected || sending || !draft.trim()}
                        title="Send message"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className={styles.threadEmptyStateWrap}>
                <div className={styles.threadEmptyCard}>
                  <div className={styles.threadEmptyIconCircle}>
                    <MessagesSquare size={34} />
                  </div>
                  <h2 className={styles.threadEmptyTitle}>Select a Conversation</h2>
                  <p className={styles.threadEmptyDesc}>
                    Choose a conversation from the left to read messages, send replies across connected social channels, update lead pipeline stages, and view customer intelligence.
                  </p>

                  <div className={styles.threadEmptyBadgesRow}>
                    <div className={styles.threadEmptyBadge}>
                      <MessengerIcon size={14} />
                      <span>Messenger</span>
                    </div>
                    <div className={styles.threadEmptyBadge}>
                      <InstagramIcon size={14} />
                      <span>Instagram</span>
                    </div>
                    <div className={styles.threadEmptyBadge}>
                      <WhatsAppIcon size={14} />
                      <span>WhatsApp</span>
                    </div>
                  </div>

                  <div className={styles.threadEmptyActions}>
                    <button type="button" onClick={onManageChannels} className={styles.threadEmptyActionBtn}>
                      <Plug size={14} />
                      <span>Manage Channels</span>
                    </button>
                    <button 
                      type="button" 
                      className={styles.threadEmptySecondaryBtn} 
                      onClick={() => loadConversations()}
                    >
                      <RefreshCw size={13} />
                      <span>Refresh Inbox</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* COLUMN 4: Customer Context & Lead Details Card */}
          <aside className={styles.rightPaneCard}>
            {selected ? (
              <form className={styles.leadFormWrapper} onSubmit={saveLead}>
                <div className={styles.rightPaneScrollableContent}>
                  <div className={styles.profileHeader}>
                    <span className={styles.avatarLargeDark}>
                      {selected.profilePic ? <img src={selected.profilePic} alt="" className={styles.avatarImage} /> : initials(selected.name)}
                    </span>
                    <div className={styles.profileInfoText}>
                      <h3>{selected.name}</h3>
                      <div className={styles.profileHeaderSubtitle}>
                        {selected.channel === "instagram" ? (
                          <InstagramIcon size={12} />
                        ) : selected.channel === "whatsapp" ? (
                          <WhatsAppIcon size={12} />
                        ) : (
                          <MessengerIcon size={12} />
                        )}
                        <span>{channelShortLabel(selected.channel)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context Sub-Tabs: Overview, Notes, Activity */}
                  <div className={styles.contextTabsRow}>
                    <button 
                      type="button" 
                      className={`${styles.contextTab} ${contextTab === "overview" ? styles.contextTabActive : ""}`}
                      onClick={() => setContextTab("overview")}
                    >
                      Overview
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.contextTab} ${contextTab === "notes" ? styles.contextTabActive : ""}`}
                      onClick={() => setContextTab("notes")}
                    >
                      Notes
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.contextTab} ${contextTab === "activity" ? styles.contextTabActive : ""}`}
                      onClick={() => setContextTab("activity")}
                    >
                      Activity
                    </button>
                  </div>

                  {contextTab === "overview" && (
                    <>
                      <div className={styles.metaList}>
                        <div className={styles.metaItem}>
                          {selected.channel === "instagram" ? (
                            <InstagramIcon size={15} />
                          ) : selected.channel === "whatsapp" ? (
                            <WhatsAppIcon size={15} />
                          ) : (
                            <MessengerIcon size={15} />
                          )}
                          <span>Channel</span>
                          <strong>{channelShortLabel(selected.channel)}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <Inbox size={15} className={styles.metaIconMuted} />
                          <span>Inbox</span>
                          <strong>{selected.connectionName}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <User size={15} className={styles.metaIconMuted} />
                          <span>Assigned to</span>
                          <strong>{selected.assignedTo || "Unassigned"}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={15} className={styles.metaIconMuted} />
                          <span>Last customer message</span>
                          <strong>{new Date(selected.lastInboundAt || selected.lastMessageAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} • {relativeTime(selected.lastInboundAt)} ago</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={15} className={styles.metaIconMuted} />
                          <span>Reply window</span>
                          <strong className={styles.replyWindowOpenText}>{replyWindowOpen(selected.lastInboundAt) ? "Open" : "Closed"}</strong>
                        </div>
                      </div>

                      <div className={styles.leadFormCard}>
                        <div className={styles.formHeader}>
                          <h3>Customer context</h3>
                        </div>

                        <label className={styles.fieldLabel}>
                          <span>Customer name</span>
                          <input 
                            value={lead.name || lead.contactName || ""} 
                            onChange={(event) => setLead((current) => ({ ...current, name: event.target.value, contactName: event.target.value }))} 
                            placeholder="Customer name" 
                          />
                        </label>

                        <label className={styles.fieldLabel}>
                          <span>Intent</span>
                          <select value={lead.intent} onChange={(event) => setLead((current) => ({ ...current, intent: event.target.value }))}>
                            <option value="general_inquiry">General Inquiry</option>
                            <option value="sales">Sales</option>
                            <option value="pricing">Pricing</option>
                            <option value="support">Support</option>
                            <option value="demo">Demo</option>
                            <option value="call_request">Call Request</option>
                          </select>
                        </label>

                        <label className={styles.fieldLabel}>
                          <span>Business name</span>
                          <input 
                            value={lead.businessName} 
                            onChange={(event) => setLead((current) => ({ ...current, businessName: event.target.value }))} 
                            placeholder="Business name" 
                          />
                        </label>

                        <label className={styles.fieldLabel}>
                          <span>Phone to call</span>
                          <input 
                            value={lead.contactPhone} 
                            onChange={(event) => setLead((current) => ({ ...current, contactPhone: event.target.value }))} 
                            placeholder="01889177456" 
                          />
                        </label>

                        <label className={styles.fieldLabel}>
                          <span>Main need / pain point</span>
                          <textarea 
                            rows={2} 
                            value={lead.painPoint} 
                            onChange={(event) => setLead((current) => ({ ...current, painPoint: event.target.value }))} 
                            placeholder="Main need / pain point" 
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {contextTab === "notes" && (
                    <div className={styles.tabContentCard}>
                      <label className={styles.fieldLabel}>
                        <span>Internal notes</span>
                        <textarea 
                          rows={6}
                          value={lead.notes || ""}
                          onChange={(e) => setLead((c) => ({ ...c, notes: e.target.value }))}
                          placeholder="Add private notes about this customer..."
                        />
                      </label>
                    </div>
                  )}

                  {contextTab === "activity" && (
                    <div className={styles.tabContentCard}>
                      <div className={styles.activityFeed}>
                        <div className={styles.activityItem}>
                          <span className={styles.activityDot} />
                          <div>
                            <strong>Conversation started</strong>
                            <small>{relativeTime(selected.lastMessageAt)} ago</small>
                          </div>
                        </div>
                        <div className={styles.activityItem}>
                          <span className={styles.activityDot} />
                          <div>
                            <strong>Channel connected</strong>
                            <small>{selected.connectionName}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Bottom Save Context Bar */}
                <div className={styles.rightPaneStickyFooter}>
                  <button 
                    type="submit" 
                    className={styles.saveContextSolidBtn} 
                    disabled={!canReply || leadBusy}
                  >
                    <FolderDown size={16} />
                    <span>{leadBusy ? "Saving…" : "Save customer context"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.rightPaneEmptyWrap}>
                <div className={styles.rightPaneEmptyCard}>
                  <div className={styles.rightPaneEmptyIconBox}>
                    <User size={28} />
                  </div>
                  <h3 className={styles.rightPaneEmptyTitle}>Customer Details</h3>
                  <p className={styles.rightPaneEmptyDesc}>
                    Select a conversation from the list to view contact profile, CRM deal stage, notes, and channel telemetry.
                  </p>

                  <div className={styles.rightPaneEmptyPreviewList}>
                    <div className={styles.rightPaneEmptyPreviewItem}>
                      <div className={styles.rightPaneEmptyPreviewDot} />
                      <div className={styles.rightPaneEmptyPreviewLineShort} />
                    </div>
                    <div className={styles.rightPaneEmptyPreviewItem}>
                      <div className={styles.rightPaneEmptyPreviewDot} />
                      <div className={styles.rightPaneEmptyPreviewLineLong} />
                    </div>
                    <div className={styles.rightPaneEmptyPreviewItem}>
                      <div className={styles.rightPaneEmptyPreviewDot} />
                      <div className={styles.rightPaneEmptyPreviewLineMedium} />
                    </div>
                  </div>

                  <div className={styles.rightPaneEmptyTip}>
                    <Sparkles size={13} className={styles.rightPaneEmptyTipIcon} />
                    <span>Live customer intelligence</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

      {comingSoonModal && (
        <div className={styles.modalOverlay} onClick={() => setComingSoonModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className={styles.modalCloseBtn}
              onClick={() => setComingSoonModal(null)}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className={styles.modalIconContainer}>
              <div className={styles.modalIconBox}>
                {(comingSoonModal.title || "").toLowerCase().includes("dashboard") || (comingSoonModal.title || "").toLowerCase().includes("analytics") ? (
                  <BarChart3 size={28} color="#ffffff" />
                ) : (comingSoonModal.title || "").toLowerCase().includes("lead") ? (
                  <Users size={28} color="#ffffff" />
                ) : (comingSoonModal.title || "").toLowerCase().includes("setting") ? (
                  <Settings size={28} color="#ffffff" />
                ) : (comingSoonModal.title || "").toLowerCase().includes("notification") ? (
                  <Bell size={28} color="#ffffff" />
                ) : (comingSoonModal.title || "").toLowerCase().includes("profile") || (comingSoonModal.title || "").toLowerCase().includes("user") ? (
                  <User size={28} color="#ffffff" />
                ) : (
                  <Sparkles size={28} color="#ffffff" />
                )}
              </div>
            </div>

            <div className={styles.comingSoonBadgeWrap}>
              <span className={styles.comingSoonBadge}>
                <Sparkles size={11} className={styles.badgeSparkle} />
                FEATURE PREVIEW
              </span>
            </div>

            <h3 className={styles.modalTitle}>{comingSoonModal.title}</h3>
            <p className={styles.modalDescription}>{comingSoonModal.description}</p>

            <button 
              type="button" 
              className={styles.modalActionBtn}
              onClick={() => setComingSoonModal(null)}
            >
              <span>Got it, thanks!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
