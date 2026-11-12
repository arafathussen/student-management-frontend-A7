"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/services/chatService";
import type { IChatMessage, IChatRoom } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Send,
  Lock,
  Unlock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RefreshCw,
  DollarSign,
  ArrowRightLeft,
  Check,
  X,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Copy,
  ExternalLink,
  Headphones,
  CheckCheck,
  Calendar,
  MessageSquare,
  FileText,
} from "lucide-react";

export interface SupportChatRoomProps {
  studentUserId?: string;
  applicationId?: string;
  studentName?: string;
  applicationTitle?: string;
}

export const SupportChatRoom: React.FC<SupportChatRoomProps> = ({
  studentUserId,
  applicationId,
  studentName = "Student",
  applicationTitle,
}) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderPersona, setSenderPersona] = useState(
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "Admissions Desk"
      : ""
  );
  const [targetBudget, setTargetBudget] = useState("15000");
  const [preferredCurrency, setPreferredCurrency] = useState("GBP");
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Search & Filter State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Popovers
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Exclusive Chat Lock & Handover State
  const [handoverRequest, setHandoverRequest] = useState<{
    requesterId: string;
    requesterName: string;
  } | null>(null);
  const [myHandoverPending, setMyHandoverPending] = useState(false);

  // Dedicated chat internal scroll container
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStaff =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "COUNSELOR";

  const effectiveStudentId = studentUserId || user?.id || "";

  // Auto-scroll internally without triggering window scroll
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const fetchChat = async () => {
    if (!effectiveStudentId) return;
    try {
      const res = await chatService.getOrCreateRoom(
        effectiveStudentId,
        applicationId
      );
      if (res.data) {
        setRoom(res.data);
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load chat room", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveStudentId) {
      fetchChat();
      const interval = setInterval(fetchChat, 3500);
      return () => clearInterval(interval);
    }
  }, [effectiveStudentId, applicationId]);

  // Scroll to bottom on messages change internally only
  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom("smooth");
    }
  }, [messages.length, searchQuery]);

  // Listen for local handover broadcast events across admin tabs
  useEffect(() => {
    const handleHandoverEvent = (e: any) => {
      if (e.detail && e.detail.roomId === room?.id) {
        if (room?.lockedByAgentId === user?.id) {
          setHandoverRequest({
            requesterId: e.detail.requesterId,
            requesterName: e.detail.requesterName,
          });
        }
      }
    };
    window.addEventListener("chat-handover-request", handleHandoverEvent);
    return () =>
      window.removeEventListener("chat-handover-request", handleHandoverEvent);
  }, [room?.id, room?.lockedByAgentId, user?.id]);

  // Check lock status
  const isLockedByOther =
    isStaff &&
    !!room?.isLocked &&
    !!room?.lockedByAgentId &&
    room.lockedByAgentId !== user?.id;

  const isLockedByMe =
    isStaff && !!room?.isLocked && room?.lockedByAgentId === user?.id;

  // Send message helper
  const sendMessageDirect = async (text: string) => {
    if (!text.trim() || isSending) return;

    if (isLockedByOther) {
      alert(
        `This student chat is currently locked by ${
          room?.lockedByAgentName || "another counselor"
        }. Please request a handover first.`
      );
      return;
    }

    setIsSending(true);
    try {
      if (isStaff && room && !room.isLocked) {
        try {
          await chatService.toggleRoomLock(room.id, true);
          setRoom((prev) =>
            prev
              ? {
                  ...prev,
                  isLocked: true,
                  lockedByAgentId: user?.id,
                  lockedByAgentName: user?.name,
                }
              : null
          );
        } catch {
          // continue sending message
        }
      }

      const res = await chatService.sendMessage({
        receiverId: effectiveStudentId,
        message: text,
        senderDisplayName:
          senderPersona || user?.name || "Student Support",
        roomId: room?.id,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    } catch (error: any) {
      console.error("Failed to send message", error);
      alert(
        error.response?.data?.message ||
          "Failed to send message. Conversation may be locked by another counselor."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    const tempText = newMessage;
    setNewMessage("");
    await sendMessageDirect(tempText);
  };

  const handleToggleLock = async () => {
    if (!room) return;
    try {
      const newLockState = !room.isLocked;
      const res = await chatService.toggleRoomLock(room.id, newLockState);
      if (res.data) {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                isLocked: newLockState,
                lockedByAgentId: newLockState ? user?.id : null,
                lockedByAgentName: newLockState ? user?.name : null,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle room lock", error);
    }
  };

  const handleRequestHandover = () => {
    if (!room) return;
    setMyHandoverPending(true);
    window.dispatchEvent(
      new CustomEvent("chat-handover-request", {
        detail: {
          roomId: room.id,
          requesterId: user?.id,
          requesterName: user?.name || "Admissions Counselor",
        },
      })
    );
    alert(
      `Handover request sent to ${
        room.lockedByAgentName || "the active counselor"
      }. They will be prompted to transfer conversation access.`
    );
  };

  const handleAcceptHandover = async () => {
    if (!room || !handoverRequest) return;
    try {
      await chatService.toggleRoomLock(room.id, false);
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              isLocked: true,
              lockedByAgentId: handoverRequest.requesterId,
              lockedByAgentName: handoverRequest.requesterName,
            }
          : null
      );
      setHandoverRequest(null);
      alert(
        `Conversation successfully handed over to ${handoverRequest.requesterName}.`
      );
    } catch (error) {
      console.error("Failed to transfer chat lock", error);
    }
  };

  const handleUpdateBudget = async () => {
    setIsUpdatingBudget(true);
    try {
      await chatService.updateStudentBudget(effectiveStudentId, {
        targetBudget: Number(targetBudget),
        preferredCurrency,
      });
      alert("Student Target Budget updated successfully!");
    } catch (error) {
      console.error("Failed to update student budget", error);
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const copyHotline = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const requestVoiceCallback = async () => {
    setIsCallModalOpen(false);
    await sendMessageDirect(
      "📞 [VOICE CALLBACK REQUEST] Student requested a direct phone call regarding higher study admissions & application guidance."
    );
  };

  const requestVideoConsultation = async () => {
    setIsVideoModalOpen(false);
    await sendMessageDirect(
      "📹 [VIDEO CONSULTATION REQUEST] Student requested a 1-on-1 face-to-face video counseling session (Google Meet / Zoom) with an admissions officer."
    );
  };

  const handleAddEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Counselor identity logic:
  // If an actual admin/counselor is assigned and locked in the room, display their name and Active status.
  // Otherwise, display "Rise Abroad Support Desk" with official logo and online customer care status.
  const hasActiveCounselor = Boolean(room?.isLocked && room?.lockedByAgentName);
  const counselorDisplayName = hasActiveCounselor
    ? room?.lockedByAgentName!
    : "Rise Abroad Support Desk";
  const counselorSubtitle = hasActiveCounselor
    ? "Senior Admissions Officer • Active Now"
    : "Customer Care & Admissions Desk • Available Online";

  // Filter messages if search query is active
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <Card className="flex flex-col h-full flex-1 min-h-0 p-0 overflow-hidden border border-slate-800 bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl relative">
      {/* =====================================================================
          1. TELEGRAM / WHATSAPP / MESSENGER STYLE CHAT HEADER
      ===================================================================== */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        {/* Left: Identity & Online Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {!isStaff ? (
              hasActiveCounselor ? (
                // Active Counselor Initials
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-base">
                  {counselorDisplayName[0] || "C"}
                </div>
              ) : (
                // Official Rise Abroad Support Desk Avatar
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <img
                    src="/logo.svg"
                    alt="Rise Abroad Support Desk"
                    className="w-full h-full object-contain"
                  />
                </div>
              )
            ) : (
              // Staff sees student avatar
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 text-base">
                {studentName[0] || "S"}
              </div>
            )}

            {/* Dynamic Status Dot Indicator */}
            {hasActiveCounselor ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight">
                {!isStaff ? counselorDisplayName : studentName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />

              {room?.isLocked && (
                <Badge
                  variant={isLockedByMe ? "success" : "warning"}
                  className="gap-1 py-0.5 px-2 text-[10px] hidden sm:inline-flex"
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>
                    {isLockedByMe
                      ? "1-on-1 Assigned to You"
                      : `Handled by ${room.lockedByAgentName || "Counselor"}`}
                  </span>
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
              {hasActiveCounselor ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                  <span className="text-emerald-400 font-medium">Active Now</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate">
                    {!isStaff
                      ? "Senior Admissions Counselor"
                      : "Study Abroad Applicant Dossier"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-medium">Support Online</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate">
                    {!isStaff
                      ? counselorSubtitle
                      : "Applicant Dossier"}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Telegram / Messenger Style Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Staff Controls */}
          {isStaff && (
            <>
              {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                <select
                  value={senderPersona}
                  onChange={(e) => setSenderPersona(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 hidden md:block cursor-pointer"
                >
                  <option value="Admissions Desk">🎭 Admissions Desk</option>
                  <option value="Senior Visa Officer">🎭 Senior Visa Officer</option>
                  <option value="Scholarship Committee">🎭 Scholarship Committee</option>
                  <option value="">👤 Show My Real Name</option>
                </select>
              )}

              <Button
                variant={room?.isLocked ? "outline" : "secondary"}
                size="sm"
                onClick={handleToggleLock}
                className="gap-1.5 text-xs py-2 px-3 cursor-pointer rounded-xl hidden sm:inline-flex"
              >
                {room?.isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Release Chat</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lock 1-on-1</span>
                  </>
                )}
              </Button>
            </>
          )}

          {/* Voice Call Hotline Button */}
          <button
            type="button"
            onClick={() => setIsCallModalOpen(true)}
            title="Voice Call & Hotline"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Video Consultation Button */}
          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            title="1-on-1 Video Consultation"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Search in Chat Button */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery("");
            }}
            title="Search Messages"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer group shadow-sm ${
              isSearchOpen
                ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
            }`}
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* More Options Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title="More Actions"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-1.5 z-50 text-xs text-slate-300 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Hotline (+880 1700-000000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  <span>Schedule Video Counseling</span>
                </button>
                <button
                  type="button"
                  onClick={fetchChat}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white text-left transition-colors cursor-pointer border-t border-slate-800/80 mt-1 pt-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Refresh Message Feed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. SEARCH BAR (Telegram Style Slide-Down)
      ===================================================================== */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in conversation..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
            {searchQuery && (
              <span className="text-[11px] text-blue-400">
                {filteredMessages.length} found
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Handover request prompt for staff */}
      {handoverRequest && isLockedByMe && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 animate-in slide-in-from-top duration-200 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{handoverRequest.requesterName}</strong> requested to take over this conversation.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="gradient"
              onClick={handleAcceptHandover}
              className="py-1 px-3 text-[11px] font-bold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Accept &amp; Hand Over</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHandoverRequest(null)}
              className="py-1 px-2 text-[11px] border-amber-600/40 text-amber-300 hover:bg-amber-900/50 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Staff In-Chat Student Budget Bar */}
      {isStaff && (
        <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applicant Target Budget:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetBudget}
              onChange={(e) => setTargetBudget(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white"
            />
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white"
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdateBudget}
              isLoading={isUpdatingBudget}
              className="py-0 px-2.5 text-[11px] border-slate-700 cursor-pointer"
            >
              Update
            </Button>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. SCROLLABLE MESSAGES FEED (Telegram / WhatsApp Style Wallpaper)
      ===================================================================== */}
      <div
        ref={chatScrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-950/60 custom-scrollbar selection:bg-blue-600 selection:text-white"
        style={{
          backgroundImage:
            "radial-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/5">
              <Headphones className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white">
              {searchQuery
                ? "No matching messages found"
                : "Rise Abroad Live Admissions Desk"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              {searchQuery
                ? `No messages matched "${searchQuery}". Try searching another keyword.`
                : "Have questions about university options, scholarships, or visa clearance? Type below to chat with our team."}
            </p>
            {!searchQuery && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setNewMessage("Hi, I want to know about scholarship opportunities.")
                  }
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:border-blue-500/50 hover:text-white transition-all cursor-pointer"
                >
                  Scholarships Info
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewMessage("Could you please review my uploaded documents?")
                  }
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:border-blue-500/50 hover:text-white transition-all cursor-pointer"
                >
                  Document Review
                </button>
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:border-emerald-500/50 hover:text-white transition-all cursor-pointer"
                >
                  Direct Hotline
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const displayName =
              msg.senderDisplayName || msg.sender?.name || "Support Officer";
            const isSystemNotification =
              msg.senderDisplayName === "System Notification" ||
              msg.senderRoleBadge === "[SYSTEM]" ||
              msg.senderRoleBadge?.includes("SYSTEM");

            // System Notification Cards
            if (isSystemNotification) {
              const isInvoice =
                msg.message.includes("💳") ||
                msg.message.toLowerCase().includes("invoice");
              const isVerified =
                msg.message.includes("✔️") ||
                msg.message.toLowerCase().includes("approved");
              const isAction =
                msg.message.includes("⚠️") ||
                msg.message.toLowerCase().includes("rejected");

              return (
                <div
                  key={msg.id}
                  className="flex justify-center my-3 px-1 animate-in fade-in duration-300"
                >
                  <div
                    className={`max-w-[95%] sm:max-w-lg w-full rounded-2xl p-3.5 border backdrop-blur-xl transition-all shadow-lg ${
                      isInvoice
                        ? "bg-indigo-950/40 border-indigo-500/40 shadow-indigo-500/10"
                        : isVerified
                        ? "bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10"
                        : isAction
                        ? "bg-rose-950/40 border-rose-500/40 shadow-rose-500/10"
                        : "bg-slate-900/90 border-blue-500/30 shadow-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isInvoice
                              ? "bg-indigo-500/20 text-indigo-400"
                              : isVerified
                              ? "bg-emerald-500/20 text-emerald-400"
                              : isAction
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {isInvoice ? (
                            <CreditCard className="w-3.5 h-3.5" />
                          ) : isVerified ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isAction ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                          {isInvoice
                            ? "Payment & Invoice Clearance"
                            : isVerified
                            ? "Document Approved"
                            : isAction
                            ? "Action Required"
                            : "System Notification"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            }

            // Normal Message Bubbles
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                } animate-in fade-in duration-200`}
              >
                {/* Sender Identity Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-slate-300">
                    {isMe ? "You" : displayName}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {msg.senderRoleBadge || msg.sender?.role || "Member"}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    isMe
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-tr-none shadow-blue-500/10 border border-blue-400/20"
                      : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-black/20"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                  {/* Telegram / WhatsApp Style Time & Double Tick */}
                  <div
                    className={`flex items-center gap-2 mt-1.5 pt-1 border-t ${
                      isMe
                        ? "border-white/10 justify-end"
                        : "border-slate-800/80 justify-between"
                    } text-[10px]`}
                  >
                    {!isMe && (
                      <span className="text-[10px] text-blue-300 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {displayName}
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-slate-400">
                      <span className={isMe ? "text-blue-100/80" : "text-slate-400"}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Telegram style double tick for user messages */}
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================================
          4. BOTTOM INPUT BAR (Telegram / WhatsApp Style with Emojis & Attach)
      ===================================================================== */}
      {isLockedByOther ? (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              This student conversation is currently handled by{" "}
              <strong>{room?.lockedByAgentName || "another counselor"}</strong>.
            </span>
          </div>

          <Button
            size="sm"
            variant="gradient"
            onClick={handleRequestHandover}
            disabled={myHandoverPending}
            className="text-xs font-semibold cursor-pointer shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>
              {myHandoverPending
                ? "Handover Requested..."
                : "Request Chat Handover"}
            </span>
          </Button>
        </div>
      ) : (
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 shrink-0 relative">
          {/* Quick Emoji Picker Popover */}
          {isEmojiPickerOpen && (
            <div className="absolute bottom-full left-4 mb-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex items-center gap-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              {["👍", "🎓", "📄", "✈️", "💬", "🙏", "🎉", "❤️"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddEmoji(emoji)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-800 text-base flex items-center justify-center transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  sendMessageDirect(
                    `📎 [DOCUMENT ATTACHMENT] Applicant uploaded "${file.name}" (${(
                      file.size / 1024
                    ).toFixed(1)} KB) for admissions clearance.`
                  );
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach Document"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
              title="Add Emoji"
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isEmojiPickerOpen
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message (Enter to send)..."
              disabled={isSending}
              className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            />

            {/* Send Button */}
            <Button
              type="submit"
              variant="gradient"
              size="md"
              disabled={isSending || !newMessage.trim()}
              className="rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 cursor-pointer shadow-lg shadow-blue-600/30 font-bold shrink-0 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}

      {/* =====================================================================
          5. VOICE CALL & HOTLINE MODAL (Telegram / WhatsApp Style)
      ===================================================================== */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">
                    Rise Abroad Voice Helpline
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly or request a callback
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCallModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Helpline Numbers */}
            <div className="space-y-3">
              {/* Helpline 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Admissions & Counseling Helpline
                  </div>
                  <div className="text-white font-bold text-sm sm:text-base font-mono mt-0.5">
                    +880 1700-000000
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyHotline("+8801700000000")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Copy Number"
                  >
                    {copiedNumber === "+8801700000000" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href="tel:+8801700000000"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Helpline 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Visa & Document Clearance Desk
                  </div>
                  <div className="text-white font-bold text-sm sm:text-base font-mono mt-0.5">
                    +880 1800-000000
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyHotline("+8801800000000")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Copy Number"
                  >
                    {copiedNumber === "+8801800000000" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href="tel:+8801800000000"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Request Callback Button */}
            <div className="pt-2 border-t border-slate-800">
              <Button
                variant="gradient"
                className="w-full py-3 rounded-2xl cursor-pointer font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                onClick={requestVoiceCallback}
              >
                <Phone className="w-4 h-4" />
                <span>Request Counselor Callback</span>
              </Button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Our counselor will call you on your registered phone number.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. VIDEO CONSULTATION MODAL (Google Meet / Zoom)
      ===================================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">
                    1-on-1 Video Admissions Desk
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live counseling via Google Meet / Zoom
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Face-to-Face Virtual Counseling</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Meet with our authorized education counselors to discuss university shortlist, statement of purpose, and visa interview preparation.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Button
                variant="gradient"
                className="w-full py-3 rounded-2xl cursor-pointer font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                onClick={requestVideoConsultation}
              >
                <Video className="w-4 h-4" />
                <span>Request Video Meeting Link</span>
              </Button>
              <p className="text-[11px] text-slate-400 text-center">
                The counselor will generate and share an instant Google Meet link right in this chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
