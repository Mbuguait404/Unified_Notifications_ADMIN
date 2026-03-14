"use client";
import { useState, useEffect } from "react";
import { Send, Smartphone, Monitor, Tablet, MessageSquare, Plus, Mail, X, Image as ImageIcon, FileText, File, Clock, BarChart, Settings, ListPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/services/api";
import { AppLayout } from "@/components/layout/app-layout";

import { templatesService, Template } from "@/services/templates.service";
import { logsService, MessageLog } from "@/services/logs.service";
import { usageService, GlobalStats } from "@/services/usage.service";

type Channel = "sms" | "email" | "whatsapp";
type DeviceType = "mobile" | "tablet" | "desktop";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  organization?: {
    _id: string;
    name: string;
  };
}

interface MessageState {
  selectedChannels: Channel[];
  recipientMode: "single" | "multiple" | "organizations";
  singleRecipient: string;
  multipleRecipients: string[];
  selectedUsers: string[];
  emailSubject: string;
  emailContent: string;
  smsContent: string;
  whatsappContent: string;
  selectedTemplateId?: string;
}

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState("compose");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({ channel: "email", category: "marketing" });

  // History & Stats
  const [history, setHistory] = useState<MessageLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState<GlobalStats | null>(null);

  const [previewDevice, setPreviewDevice] = useState<DeviceType>("mobile");
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);

  const [messageState, setMessageState] = useState<MessageState>({
    selectedChannels: ["email"],
    recipientMode: "organizations",
    singleRecipient: "",
    multipleRecipients: [],
    selectedUsers: [],
    emailSubject: "",
    emailContent: "",
    smsContent: "",
    whatsappContent: "",
  });

  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTemplates();
    fetchStats();
    fetchHistory();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.get<User[]>('/users/admin/all');
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users for messaging");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await templatesService.getAllTemplates();
      setTemplates(data || []);
    } catch (err) {
      setTemplates([]); // fallback
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await usageService.getGlobalStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await logsService.getAllLogs({ limit: 50 });
      setHistory(data || []);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleChannel = (channel: Channel) => {
    setMessageState((prev) => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(channel)
        ? prev.selectedChannels.filter((c) => c !== channel)
        : [...prev.selectedChannels, channel],
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setMessageState((prev) => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter((id) => id !== userId)
        : [...prev.selectedUsers, userId],
    }));
  };

  const handleSelectAllOrganizations = () => {
    if (messageState.selectedUsers.length === users.length) {
      setMessageState((prev) => ({ ...prev, selectedUsers: [] }));
    } else {
      setMessageState((prev) => ({ ...prev, selectedUsers: users.map(u => u._id) }));
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (!template) return;

    if (template.channel === 'email') {
      if (!messageState.selectedChannels.includes('email')) {
        toggleChannel('email');
      }
      setMessageState(prev => ({
        ...prev,
        emailSubject: template.subject || "",
        emailContent: template.content,
        selectedTemplateId: template._id
      }));
    } else if (template.channel === 'sms') {
      if (!messageState.selectedChannels.includes('sms')) {
        toggleChannel('sms');
      }
      setMessageState(prev => ({
        ...prev,
        smsContent: template.content,
        selectedTemplateId: template._id
      }));
    } else if (template.channel === 'whatsapp') {
      if (!messageState.selectedChannels.includes('whatsapp')) {
        toggleChannel('whatsapp');
      }
      setMessageState(prev => ({
        ...prev,
        whatsappContent: template.content,
        selectedTemplateId: template._id
      }));
    }
    toast.success(`Applied template: ${template.name}`);
  };

  const handleSend = async () => {
    if (messageState.selectedChannels.length === 0) {
      toast.error("Please select at least one channel");
      return;
    }

    let recipients: string[] = [];

    if (messageState.recipientMode === "organizations") {
      if (messageState.selectedUsers.length === 0) {
        toast.error("Please select at least one organization user");
        return;
      }

      const selectedUserDetails = users.filter((u) => messageState.selectedUsers.includes(u._id));

      if (messageState.selectedChannels.includes("email")) {
        recipients = selectedUserDetails.map((u) => u.email).filter(Boolean);
      } else {
        recipients = selectedUserDetails.map((u) => u.phoneNumber).filter(Boolean);
      }
    } else if (messageState.recipientMode === "single" && messageState.singleRecipient) {
      recipients = [messageState.singleRecipient];
    }

    if (recipients.length === 0) {
      toast.error(`No valid recipients found`);
      return;
    }

    if (messageState.selectedChannels.includes("email") && (!messageState.emailSubject || !messageState.emailContent)) {
      toast.error("Please provide email subject and content");
      return;
    }

    setSending(true);

    try {
      const promises = [];

      for (const channel of messageState.selectedChannels) {
        const payload: any = {
          type: channel,
          to: recipients,
          attachments: [],
        };

        if (channel === "email") {
          payload.subject = messageState.emailSubject;
          payload.message = messageState.emailContent;
        } else if (channel === "sms") {
          payload.message = messageState.smsContent;
        } else if (channel === "whatsapp") {
          payload.message = messageState.whatsappContent;
        }

        promises.push(api.post("/notifications/send", payload));
      }

      await Promise.all(promises);
      toast.success("Messages sent successfully!");

      setMessageState((prev) => ({
        ...prev,
        emailSubject: "",
        emailContent: "",
        smsContent: "",
        whatsappContent: "",
        selectedUsers: []
      }));
      fetchHistory(); // refresh history
      fetchStats(); // refresh stats
    } catch (error: any) {
      toast.error(error.message || "Failed to send messages");
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.content || !templateForm.channel) {
        toast.error("Please fill all required template fields");
        return;
      }
      await templatesService.createTemplate(templateForm);
      toast.success("Template created successfully");
      setTemplateForm({ channel: "email", category: "marketing", name: "", content: "", subject: "" });
      fetchTemplates();
    } catch (err: any) {
      toast.error("Failed to create template");
    }
  };


  const PreviewContent = () => {
    if (messageState.selectedChannels.includes("email")) {
      return (
        <div className={`mx-auto w-full transition-all duration-300`}>
          <div className="space-y-4">
            <div className="rounded-lg bg-background border p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">Subject</p>
              <p className="font-bold mt-2">{messageState.emailSubject || "Subject here..."}</p>
            </div>
            <div className="rounded-lg bg-background border p-4 min-h-[200px] overflow-auto">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-4">Body Preview</p>
              <div
                className="text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: messageState.emailContent || "<p class='text-muted-foreground'>Html Content here...</p>",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`mx-auto max-w-[280px] relative transition-all duration-300`}>
        <div className="aspect-[9/18.5] rounded-[3rem] border-8 border-gray-800 bg-black p-3 shadow-2xl ring-4 ring-gray-900">
          <div className="h-full w-full rounded-[2rem] bg-zinc-900 overflow-hidden relative">
            <div className="p-4 flex flex-col gap-4 mt-10">
              <div className="self-end max-w-[85%] rounded-2xl rounded-tr-none bg-primary p-3 text-[11px] text-white shadow-lg">
                <p>{messageState.smsContent || "Your message here..."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 p-8 md:p-12 w-full max-w-8xl mx-auto">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Broadcast Messages</h1>
            <p className="text-lg text-muted-foreground">
              Send announcements and notifications to registered organizations.
            </p>
          </div>
          {stats && (
            <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-xl border">
              <div className="text-sm text-center">
                <p className="text-muted-foreground font-semibold">SMS</p>
                <p className="font-bold">{stats.smsCount}</p>
              </div>
              <div className="w-[1px] h-8 bg-border"></div>
              <div className="text-sm text-center">
                <p className="text-muted-foreground font-semibold">Email</p>
                <p className="font-bold">{stats.emailCount}</p>
              </div>
              <div className="w-[1px] h-8 bg-border"></div>
              <div className="text-sm text-center">
                <p className="text-muted-foreground font-semibold">Current Balance</p>
                <p className="font-bold text-primary">Unlimited</p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Overlay */}
        {showPreviewOverlay && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-card rounded-2xl border shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Preview</h2>
                  <p className="text-sm text-muted-foreground">How your message will appear</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPreviewOverlay(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <div className="p-8 overflow-auto flex-1 flex items-center justify-center">
                <PreviewContent />
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 h-12">
            <TabsTrigger value="compose" className="gap-2 h-10 px-4 rounded-md">
              <Send className="size-4" /> Compose
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2 h-10 px-4 rounded-md">
              <ListPlus className="size-4" /> Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 h-10 px-4 rounded-md">
              <Clock className="size-4" /> History
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 h-10 px-4 rounded-md">
              <BarChart className="size-4" /> Usage Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-0 outline-none">
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 flex flex-col gap-6">

                <Card>
                  <CardHeader>
                    <CardTitle>Select Channels</CardTitle>
                    <CardDescription>Choose how you want to reach organizations.</CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0 flex gap-4">
                    {[
                      { id: "email", label: "Email", icon: Mail },
                      { id: "sms", label: "SMS", icon: Smartphone },
                      { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                    ].map((channel) => {
                      const Icon = channel.icon;
                      const isSelected = messageState.selectedChannels.includes(channel.id as Channel);
                      return (
                        <button
                          key={channel.id}
                          onClick={() => toggleChannel(channel.id as Channel)}
                          className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                            }`}
                        >
                          <Icon className="size-6" />
                          <span className="font-semibold">{channel.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recipients</CardTitle>
                    <CardDescription>Who should receive this message?</CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0 space-y-6">
                    <div className="flex gap-4">
                      {[
                        { id: "organizations", label: "Organizations" },
                        { id: "single", label: "Single Recipient" },
                      ].map((mode) => (
                        <Button
                          key={mode.id}
                          variant={messageState.recipientMode === mode.id ? "default" : "outline"}
                          onClick={() => setMessageState((prev) => ({ ...prev, recipientMode: mode.id as any }))}
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>

                    {messageState.recipientMode === "organizations" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Select Organization Admins</span>
                          <Button variant="ghost" size="sm" onClick={handleSelectAllOrganizations}>
                            {messageState.selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                          {users.map(user => (
                            <div key={user._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={messageState.selectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                              />
                              <div className="flex flex-col flex-1">
                                <div className="font-semibold">{user.organization?.name || "No Organization"}</div>
                                <div className="text-sm text-muted-foreground">{user.firstName} {user.lastName} ({user.email})</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {messageState.recipientMode === "single" && (
                      <div className="space-y-2">
                        <Label>Recipient Email/Phone</Label>
                        <Input
                          placeholder="Enter email or phone number"
                          value={messageState.singleRecipient}
                          onChange={(e) => setMessageState({ ...messageState, singleRecipient: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>Message Content</CardTitle>
                      <CardDescription>Compose your message for each selected channel.</CardDescription>
                    </div>
                    {templates.length > 0 && (
                      <Select onValueChange={applyTemplate}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Use a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(t => (
                            <SelectItem key={t._id} value={t._id}>{t.name} ({t.channel})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardHeader>
                  <div className="p-6 pt-0 space-y-6">
                    {messageState.selectedChannels.includes("email") && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                          <Mail className="size-4" /> Email Content
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            placeholder="Enter email subject"
                            value={messageState.emailSubject}
                            onChange={(e) => setMessageState({ ...messageState, emailSubject: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message (HTML supported)</Label>
                          <Textarea
                            placeholder="Compose your email here..."
                            className="min-h-[200px]"
                            value={messageState.emailContent}
                            onChange={(e) => setMessageState({ ...messageState, emailContent: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {(messageState.selectedChannels.includes("sms") || messageState.selectedChannels.includes("whatsapp")) && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                          <Smartphone className="size-4" /> SMS / WhatsApp Content
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            placeholder="Enter your message..."
                            className="min-h-[120px]"
                            value={messageState.smsContent}
                            onChange={(e) => setMessageState({ ...messageState, smsContent: e.target.value, whatsappContent: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column - Actions & Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>Review before sending</CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0 space-y-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Channels</span>
                        <div className="flex gap-2">
                          {messageState.selectedChannels.map(c => (
                            <span key={c} className="capitalize font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Recipients Selected</span>
                        <span className="font-bold">
                          {messageState.recipientMode === "organizations" ? messageState.selectedUsers.length : (messageState.singleRecipient ? 1 : 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => setShowPreviewOverlay(true)}
                      >
                        Live Preview
                      </Button>
                      <Button
                        className="w-full h-12 text-lg"
                        onClick={handleSend}
                        disabled={sending}
                      >
                        {sending ? "Sending..." : "Send Message Now"}
                        <Send className="ml-2 size-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-0 outline-none">
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="lg:col-span-1 border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle>Create Template</CardTitle>
                  <CardDescription>Add a new reusable message template.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input value={templateForm.name || ""} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="e.g. Welcome Message" />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={templateForm.channel} onValueChange={(val: any) => setTemplateForm({ ...templateForm, channel: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {templateForm.channel === 'email' && (
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={templateForm.subject || ""} onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })} placeholder="Email Subject" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <Textarea className="min-h-[120px]" value={templateForm.content || ""} onChange={e => setTemplateForm({ ...templateForm, content: e.target.value })} placeholder="Type template message..." />
                  </div>
                  <Button className="w-full" onClick={handleCreateTemplate}>Save Template</Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
                {templates.map(t => (
                  <Card key={t._id}>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        <CardDescription className="capitalize">{t.channel}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm bg-muted/50 p-3 rounded-md line-clamp-3 mb-4 min-h-[4.5rem]">
                        {t.content}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                        <span>Used: {t.usage || 0} times</span>
                        <Button variant="outline" size="sm" onClick={() => { setActiveTab("compose"); applyTemplate(t._id); }}>
                          Use Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {templates.length === 0 && !loadingTemplates && (
                  <div className="col-span-2 text-center p-12 bg-muted/30 rounded-xl border border-dashed">
                    <ListPlus className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg">No templates yet</h3>
                    <p className="text-muted-foreground">Create your first template to reuse messages across your communications.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Broadcast History</CardTitle>
                <CardDescription>Recent messages sent by platform administrators.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.length > 0 ? history.map((log) => (
                    <div key={log._id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-xl shadow-sm border
                                            ${log.channel === 'email' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10' :
                            log.channel === 'sms' ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10' :
                              'bg-green-50 border-green-100 text-green-600 dark:bg-green-500/10'}`}>
                          {log.channel === 'email' ? <Mail className="size-5" /> : log.channel === 'sms' ? <Smartphone className="size-5" /> : <MessageSquare className="size-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{log.senderOrgId?.name || "System"}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 max-w-md">{log.messagePreview}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm">
                        <span className="font-semibold">{new Date(log.createdAt).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">{log.recipients.length} recipients</span>
                          <span className="bg-primary/10 text-primary px-2 rounded-full text-xs font-semibold capitalize">
                            {log.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center p-12 bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
                      No broadcast history found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0 outline-none">
            {stats && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                      <Mail className="size-4" /> Total Emails
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black">{stats.emailCount}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                      <Smartphone className="size-4" /> Total SMS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black">{stats.smsCount}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                      <MessageSquare className="size-4" /> Total WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black">{stats.whatsappCount}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
