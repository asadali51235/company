import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bold,
  Bell,
  ChevronRight,
  Check,
  Edit3,
  FileText,
  Heading2,
  Italic,
  Link2,
  LayoutDashboard,
  List,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toolFormulaDefaults } from "@/lib/site-data";
import { tools } from "@/lib/site-data";

type ContentKind = "article" | "guide" | "report" | "area" | "tool";
type ContentStatus = "draft" | "published" | "unpublished" | "archived";

type EditorState = {
  id?: number;
  kind: ContentKind;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
  featuredImage: string;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
};

const emptyEditor: EditorState = {
  kind: "article",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  featuredImage: "",
  imageAlt: "",
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
};

const sections: { label: string; kind?: ContentKind; icon: typeof FileText }[] =
  [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Articles", kind: "article", icon: FileText },
    { label: "Guides", kind: "guide", icon: FileText },
    { label: "Reports", kind: "report", icon: FileText },
    { label: "Tool settings", icon: SlidersHorizontal },
    { label: "Categories", icon: FileText },
    { label: "Media", icon: FileText },
    { label: "SEO settings", icon: FileText },
  ];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCMS() {
  const [, navigate] = useLocation();
  const { user, logout, loading, isAdmin } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });
  const [section, setSection] = useState("Overview");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const contentQuery = trpc.content.adminList.useQuery(undefined, {
    enabled: Boolean(user && isAdmin),
    retry: false,
  });
  const analyticsQuery = trpc.admin.analytics.useQuery(undefined, {
    enabled: Boolean(user && isAdmin),
    retry: false,
  });
  const utils = trpc.useUtils();
  const createMutation = trpc.content.create.useMutation({
    onSuccess: () => {
      setEditor(null);
      setStatusFilter("all");
      void utils.content.adminList.invalidate();
    },
  });
  const updateMutation = trpc.content.update.useMutation({
    onSuccess: refresh,
  });
  const statusMutation = trpc.content.setStatus.useMutation({
    onSuccess: refresh,
  });
  const deleteMutation = trpc.content.delete.useMutation({
    onSuccess: refresh,
  });

  function refresh() {
    setEditor(null);
    setStatusFilter("all");
    void utils.content.adminList.invalidate();
  }

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, navigate, user]);

  if (loading || !user)
    return <div className="admin-loading">Loading secure workspace…</div>;
  if (!isAdmin)
    return (
      <div className="admin-login">
        <h1 className="font-display text-[34px] font-semibold">
          Access denied
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          Only administrators can access the CMS.
        </p>
        <button className="button button-dark mt-7" onClick={() => logout()}>
          Sign out
        </button>
      </div>
    );

  const content = contentQuery.data ?? [];
  const currentSection =
    sections.find(item => item.label === section) ?? sections[0];
  const filtered = currentSection.kind
    ? content.filter(item => item.kind === currentSection.kind)
    : content;
  const visibleContent = filtered.filter(item => {
    const matchesQuery = `${item.title} ${item.slug} ${item.excerpt ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase().trim());
    return matchesQuery && (statusFilter === "all" || item.status === statusFilter);
  });
  const published = content.filter(item => item.status === "published").length;
  const drafts = content.filter(item => item.status === "draft").length;
  const saving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error?.message ?? updateMutation.error?.message;

  function openNew(kind: ContentKind = currentSection.kind ?? "article") {
    setStatusFilter("all");
    setEditor({ ...emptyEditor, kind });
  }

  function openEdit(item: (typeof content)[number]) {
    setEditor({
      id: item.id,
      kind: item.kind,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      content: item.content ?? "",
      status: item.status,
      featuredImage: item.featuredImage ?? "",
      imageAlt: item.imageAlt ?? "",
      seoTitle: item.seoTitle ?? "",
      metaDescription: item.metaDescription ?? "",
      canonicalUrl: item.canonicalUrl ?? "",
    });
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const payload = {
      kind: editor.kind,
      title: editor.title,
      slug: editor.slug,
      excerpt: editor.excerpt || undefined,
      content: editor.content || undefined,
      status: editor.status,
      featuredImage: editor.featuredImage || undefined,
      imageAlt: editor.imageAlt || undefined,
      seoTitle: editor.seoTitle || undefined,
      metaDescription: editor.metaDescription || undefined,
      canonicalUrl: editor.canonicalUrl || undefined,
    };
    createMutation.reset();
    updateMutation.reset();
    if (editor.id) updateMutation.mutate({ id: editor.id, ...payload });
    else createMutation.mutate(payload);
  }

  function saveDraft(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;
    const payload = {
      kind: editor.kind,
      title: editor.title,
      slug: editor.slug,
      excerpt: editor.excerpt || undefined,
      content: editor.content || undefined,
      status: "draft" as const,
      featuredImage: editor.featuredImage || undefined,
      imageAlt: editor.imageAlt || undefined,
      seoTitle: editor.seoTitle || undefined,
      metaDescription: editor.metaDescription || undefined,
      canonicalUrl: editor.canonicalUrl || undefined,
    };
    createMutation.reset();
    updateMutation.reset();
    if (editor.id) updateMutation.mutate({ id: editor.id, ...payload });
    else createMutation.mutate(payload);
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="brand-mark">ei</span>
            <span className="font-display text-[20px] font-semibold">
              Estate Insights
            </span>
          </Link>
        </div>
        <p className="eyebrow text-ink/40">CMS workspace</p>
        <div className="mt-3 grid gap-1">
          {sections.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setSection(item.label);
                  setEditor(null);
                }}
                className={`admin-nav ${section === item.label ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-auto border-t border-ink/10 pt-5">
          <p className="text-xs font-semibold">{user.name ?? "Admin"}</p>
          <p className="mt-1 truncate text-xs text-ink/45">{user.email}</p>
          <button
            className="mt-4 flex items-center gap-2 text-xs font-semibold text-coral"
            onClick={() => logout()}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-breadcrumb"><span>Estate Insights</span><ChevronRight size={14} /><strong>{section}</strong></div>
          <div className="admin-topbar-actions">
            <label className="admin-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search content" aria-label="Search content" /></label>
            <button className="admin-icon-button" aria-label="Refresh content" title="Refresh content" onClick={() => void contentQuery.refetch()}><RefreshCw size={16} /></button>
            <button className="admin-icon-button" aria-label="Notifications" title="Notifications"><Bell size={16} /></button>
            <span className="admin-health"><Activity size={14} /> Live</span>
          </div>
        </div>
        {editor ? (
          <Editor
            editor={editor}
            allowedKinds={
              currentSection.kind ? [currentSection.kind] : undefined
            }
            setEditor={setEditor}
            onCancel={() => setEditor(null)}
            onSave={save}
            onSaveDraft={saveDraft}
            saving={saving}
            error={mutationError}
          />
        ) : (
          <>
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="eyebrow">Editorial workspace</p>
                <h1 className="font-display mt-3 text-[44px] font-semibold leading-none tracking-[-0.06em]">
                  {section}
                </h1>
                <p className="mt-3 text-sm text-ink/55">
                  Create, edit and publish every piece of content from one
                  place.
                </p>
              </div>
              {section !== "Overview" && !["Categories", "Media", "SEO settings", "Tool settings", "Reports"].includes(section) && (
                <div className="admin-header-actions">
                  <label className="admin-filter"><SlidersHorizontal size={14} /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as ContentStatus | "all")} aria-label="Filter by status"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="unpublished">Unpublished</option><option value="archived">Archived</option></select></label>
                  <button className="button button-dark" onClick={() => openNew()}><Plus size={16} /> Create {currentSection.label.slice(0, -1)}</button>
                </div>
              )}
            </header>
            {section === "Overview" ? (
              <Overview analytics={analyticsQuery.data} loading={analyticsQuery.isLoading} />
            ) : ["Categories", "Media", "SEO settings", "Tool settings", "Reports"].includes(section) ? (
              <UtilityPanel section={section} />
            ) : (
              <>
                {currentSection.kind && <div className="admin-subnav"><button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All {currentSection.label}</button><button className={statusFilter === "draft" ? "active" : ""} onClick={() => setStatusFilter("draft")}>Drafts</button><button className={statusFilter === "published" ? "active" : ""} onClick={() => setStatusFilter("published")}>Published</button><button className={statusFilter === "unpublished" ? "active" : ""} onClick={() => setStatusFilter("unpublished")}>Unpublished</button><button className={statusFilter === "archived" ? "active" : ""} onClick={() => setStatusFilter("archived")}>Archived</button></div>}
                <ContentTable items={visibleContent} onEdit={openEdit} onStatus={(id, status) => statusMutation.mutate({ id, status })} onDelete={id => { if (window.confirm("Delete this content permanently?")) deleteMutation.mutate({ id }); }} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Overview({ analytics, loading }: { analytics?: { subscribers: number; content: Record<string, { total: number; published: number; draft: number }>; recent: { id: number; title: string; kind: string; status: string; updatedAt: Date }[] }; loading: boolean }) {
  const groups = [["Articles", "article"], ["Guides", "guide"]] as const;
  return <><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{groups.map(([label, key]) => <MetricGroup key={key} label={label} values={analytics?.content[key]} loading={loading} />)}<div className="admin-card"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.12em] text-ink/45">Free tools</p><SlidersHorizontal size={16} className="text-coral" /></div><p className="font-display mt-4 text-[38px] font-semibold">{tools.length}</p><div className="mt-4 border-t border-ink/10 pt-3 text-xs text-ink/50">Configured public calculators</div></div></div><div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="admin-card"><div className="flex items-center justify-between"><div><p className="eyebrow">Publishing activity</p><h2 className="font-display mt-2 text-[27px] font-semibold">Recent content changes</h2></div><span className="admin-health"><Activity size={14} /> Live data</span></div><div className="mt-6 grid gap-3">{analytics?.recent.map(item => <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3 last:border-0" key={item.id}><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-ink/45">{item.kind} · {new Date(item.updatedAt).toLocaleDateString()}</p></div><span className="badge badge-green">{item.status}</span></div>)}</div></div><div className="admin-card"><div className="flex items-center justify-between"><div><p className="eyebrow">Audience</p><h2 className="font-display mt-2 text-[27px] font-semibold">Subscribers</h2></div><span className="font-display text-[34px] font-semibold">{analytics?.subscribers ?? 0}</span></div><p className="mt-6 text-sm leading-6 text-ink/55">Active readers subscribed to new articles, guides and reports.</p><div className="mt-6 h-2 overflow-hidden rounded-full bg-sand"><div className="h-full w-[72%] rounded-full bg-coral" /></div><p className="mt-2 text-xs text-ink/45">Audience health</p></div></div></>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-card">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="font-display mt-3 text-[38px] font-semibold">{value}</p>
    </div>
  );
}

function UtilityPanel({ section }: { section: string }) {
  const utils = trpc.useUtils();
  const categories = trpc.admin.categories.useQuery();
  const media = trpc.admin.media.useQuery();
  const settings = trpc.admin.settings.useQuery();
  const createCategory = trpc.admin.createCategory.useMutation({
    onSuccess: () => {
      void utils.admin.categories.invalidate();
      setCategory({ name: "", slug: "", description: "" });
    },
  });
  const deleteCategory = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => void utils.admin.categories.invalidate(),
  });
  const createMedia = trpc.admin.createMedia.useMutation({
    onSuccess: () => {
      void utils.admin.media.invalidate();
      setMediaForm({ url: "", altText: "" });
    },
  });
  const deleteMedia = trpc.admin.deleteMedia.useMutation({
    onSuccess: () => void utils.admin.media.invalidate(),
  });
  const saveSetting = trpc.admin.saveSetting.useMutation({
    onSuccess: () => void utils.admin.settings.invalidate(),
  });
  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [mediaForm, setMediaForm] = useState({ url: "", altText: "" });
  const [seo, setSeo] = useState({ title: "", description: "" });
  useEffect(() => {
    const values = Object.fromEntries(
      (settings.data ?? []).map(item => [item.key, item.value ?? ""])
    );
    setSeo({
      title: values.site_title ?? "",
      description: values.site_description ?? "",
    });
  }, [settings.data]);

  if (section === "Categories")
    return (
      <div className="mt-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form
          className="admin-card grid gap-4 h-fit"
          onSubmit={event => {
            event.preventDefault();
            createCategory.mutate(category);
          }}
        >
          <p className="eyebrow">New category</p>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Name
            <input
              required
              className="form-input"
              value={category.name}
              onChange={event =>
                setCategory({ ...category, name: event.target.value })
              }
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Slug
            <input
              required
              className="form-input"
              value={category.slug}
              onChange={event =>
                setCategory({ ...category, slug: slugify(event.target.value) })
              }
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Description
            <textarea
              className="form-input min-h-24"
              value={category.description}
              onChange={event =>
                setCategory({ ...category, description: event.target.value })
              }
            />
          </label>
          <button className="button button-coral" type="submit">
            <Plus size={15} /> Add category
          </button>
        </form>
        <div className="grid gap-3">
          {(categories.data ?? []).map(item => (
            <div
              className="admin-card flex items-center justify-between gap-4"
              key={item.id}
            >
              <div>
                <h2 className="font-display text-xl font-semibold">
                  {item.name}
                </h2>
                <p className="text-xs text-ink/45">/{item.slug}</p>
              </div>
              <button
                className="icon-button text-red-700"
                aria-label="Delete category"
                onClick={() => deleteCategory.mutate({ id: item.id })}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  if (section === "Media")
    return (
      <div className="mt-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form
          className="admin-card grid gap-4 h-fit"
          onSubmit={event => {
            event.preventDefault();
            createMedia.mutate(mediaForm);
          }}
        >
          <p className="eyebrow">Add media URL</p>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Image URL
            <input
              required
              type="url"
              className="form-input"
              value={mediaForm.url}
              onChange={event =>
                setMediaForm({ ...mediaForm, url: event.target.value })
              }
              placeholder="https://..."
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Alt text
            <input
              className="form-input"
              value={mediaForm.altText}
              onChange={event =>
                setMediaForm({ ...mediaForm, altText: event.target.value })
              }
            />
          </label>
          <button className="button button-coral" type="submit">
            <Plus size={15} /> Add media
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {(media.data ?? []).map(item => (
            <div className="admin-card" key={item.id}>
              <img
                src={item.url}
                alt={item.altText ?? ""}
                className="h-36 w-full rounded-lg object-cover"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-ink/55">
                  {item.altText || item.url}
                </p>
                <button
                  className="icon-button shrink-0 text-red-700"
                  aria-label="Delete media"
                  onClick={() => deleteMedia.mutate({ id: item.id })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (section === "Tool settings")
    return <ToolSettingsPanel />;
  if (section === "Reports")
    return <ReportsPanel />;
  return (
    <form
      className="admin-card mt-10 grid max-w-2xl gap-5"
      onSubmit={event => {
        event.preventDefault();
        saveSetting.mutate({
          key: "site_title",
          value: seo.title,
          isPublic: true,
        });
        saveSetting.mutate({
          key: "site_description",
          value: seo.description,
          isPublic: true,
        });
      }}
    >
      <p className="eyebrow">Global metadata</p>
      <h2 className="font-display text-[30px] font-semibold">
        Search and sharing defaults
      </h2>
      <label className="grid gap-2 text-xs font-semibold text-ink/60">
        Site title
        <input
          className="form-input"
          value={seo.title}
          onChange={event => setSeo({ ...seo, title: event.target.value })}
          placeholder="Estate Insights"
        />
      </label>
      <label className="grid gap-2 text-xs font-semibold text-ink/60">
        Site description
        <textarea
          className="form-input min-h-28"
          value={seo.description}
          onChange={event =>
            setSeo({ ...seo, description: event.target.value })
          }
          placeholder="A concise description for search engines"
        />
      </label>
      <button className="button button-coral w-fit" type="submit">
        <Check size={15} /> Save SEO settings
      </button>
    </form>
  );
}

function ToolSettingsPanel() {
  const utils = trpc.useUtils();
  const settings = trpc.admin.toolSettings.useQuery();
  const save = trpc.admin.saveToolSetting.useMutation({ onSuccess: () => void utils.admin.toolSettings.invalidate() });
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const configured = new Map((settings.data ?? []).map(item => [`${item.toolSlug}:${item.key}`, item]));
  const rows = [...toolFormulaDefaults.map(item => ({ ...item, saved: configured.get(`${item.toolSlug}:${item.key}`) })), ...(settings.data ?? []).filter(item => !toolFormulaDefaults.some(defaultItem => defaultItem.toolSlug === item.toolSlug && defaultItem.key === item.key)).map(item => ({ ...item, saved: item }))];
  return <div className="mt-10 grid gap-5"><div className="admin-card"><p className="eyebrow">Calculator formulas</p><h2 className="font-display mt-2 text-[28px] font-semibold">Change assumptions without a code deploy.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">These values are used by the public calculators. Save a value here when rates, periods or business rules change. Add a new key in the database later for another configurable assumption.</p></div>{rows.map(item => { const id = item.saved?.id ?? `${item.toolSlug}-${item.key}`; const value = drafts[item.saved?.id ?? 0] ?? item.saved?.value ?? item.value; return <div className="admin-card grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end" key={id}><div><p className="eyebrow">{item.toolSlug}</p><h2 className="font-display mt-1 text-xl font-semibold">{item.label}</h2><p className="mt-1 text-xs text-ink/50">{item.description || item.key}</p></div><input className="form-input" inputMode="decimal" value={value} onChange={event => setDrafts({ ...drafts, [item.saved?.id ?? 0]: event.target.value })} /><button className="button button-dark" onClick={() => save.mutate({ toolSlug: item.toolSlug, key: item.key, label: item.label, value, type: item.type, description: item.description ?? undefined })}><Check size={15} /> Save</button></div>; })}</div>;
}

function ReportsPanel() {
  const statistics = [
    ["Median property price", "$428k", "+6.8%"],
    ["Median monthly rent", "$1,850", "+7.4%"],
    ["Average gross yield", "5.2%", "+0.4 pts"],
    ["Active inventory", "12,480", "-3.1%"],
  ];
  return <div className="mt-10 grid gap-5"><div className="admin-card"><p className="eyebrow">Read-only research section</p><h2 className="font-display mt-2 text-[28px] font-semibold">Statistics shown on the public reports page.</h2><p className="mt-3 text-sm leading-6 text-ink/55">Reports are intentionally not managed as blog posts. Keep this section focused on the indicators readers use to understand the market.</p></div><div className="grid gap-4 sm:grid-cols-2">{statistics.map(([label, value, change]) => <div className="admin-card" key={label}><p className="text-xs font-semibold uppercase tracking-[.12em] text-ink/45">{label}</p><p className="font-display mt-4 text-[34px] font-semibold">{value}</p><p className="mt-2 text-sm font-semibold text-coral">{change}</p></div>)}</div></div>;
}

function MetricGroup({ label, values, loading }: { label: string; values?: { total: number; published: number; draft: number }; loading: boolean }) { return <div className="admin-card"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.12em] text-ink/45">{label}</p><FileText size={16} className="text-coral" /></div>{loading ? <div className="mt-5 h-10 w-20 animate-pulse rounded bg-sand" /> : <p className="font-display mt-4 text-[38px] font-semibold">{values?.total ?? 0}</p>}<div className="mt-4 flex gap-4 border-t border-ink/10 pt-3 text-xs"><span className="text-emerald-700">{values?.published ?? 0} published</span><span className="text-ink/50">{values?.draft ?? 0} drafts</span></div></div>; }

function ContentTable({ items, onEdit, onStatus, onDelete }: { items: any[]; onEdit: (item: any) => void; onStatus: (id: number, status: ContentStatus) => void; onDelete: (id: number) => void }) {
  if (!items.length) return <div className="empty-state mt-10"><FileText size={24} className="mx-auto" /><p className="mt-3 font-semibold">Nothing here yet.</p><p className="mt-1 text-sm">Create the first item using the button above.</p></div>;
  return <div className="mt-10 grid gap-3">{items.map(item => <article key={item.id} className="admin-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="badge badge-green">{item.status}</span><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">{item.kind}</span></div><h2 className="font-display mt-2 truncate text-[23px] font-semibold">{item.title}</h2><p className="mt-1 text-xs text-ink/45">/{item.slug} · Updated {new Date(item.updatedAt).toLocaleDateString()}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button className="button button-outline" onClick={() => onEdit(item)}><Edit3 size={14} /> Edit</button>{item.status === "published" ? <button className="button button-outline" onClick={() => onStatus(item.id, "unpublished")}>Unpublish</button> : item.status === "archived" ? <button className="button button-dark" onClick={() => onStatus(item.id, "draft")}><RefreshCw size={14} /> Restore draft</button> : <button className="button button-dark" onClick={() => onStatus(item.id, "published")}><Check size={14} /> Publish</button>}{item.status !== "archived" && <button className="button button-outline" onClick={() => onStatus(item.id, "archived")}>Archive</button>}<button className="icon-button text-red-700" aria-label="Delete content" onClick={() => onDelete(item.id)}><Trash2 size={17} /></button></div></article>)}</div>;
}

function MarkdownButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return <button type="button" className="admin-icon-button" aria-label={label} title={label} onClick={onClick}>{icon}</button>;
}

function Editor({
  editor,
  allowedKinds,
  setEditor,
  onCancel,
  onSave,
  onSaveDraft,
  saving,
  error,
}: {
  editor: EditorState;
  allowedKinds?: ContentKind[];
  setEditor: (value: EditorState) => void;
  onCancel: () => void;
  onSave: (event: React.FormEvent) => void;
  onSaveDraft: (event: React.MouseEvent<HTMLButtonElement>) => void;
  saving: boolean;
  error?: string;
}) {
  const update = <K extends keyof EditorState>(key: K, value: EditorState[K]) =>
    setEditor({ ...editor, [key]: value });
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [bodyMode, setBodyMode] = useState<"write" | "preview">("write");
  const kindLabels: Record<ContentKind, string> = {
    article: "Article",
    guide: "Guide",
    report: "Report",
    area: "Area guide",
    tool: "Tool",
  };
  const kindField = allowedKinds ? (
    <div className="form-input bg-sand">{kindLabels[editor.kind]}</div>
  ) : (
    <select
      value={editor.kind}
      onChange={event => update("kind", event.target.value as ContentKind)}
      className="form-input"
    >
      <option value="article">Article</option>
      <option value="guide">Guide</option>
      <option value="report">Report</option>
      <option value="area">Area guide</option>
      <option value="tool">Tool</option>
    </select>
  );
  function insertMarkdown(prefix: string, suffix: string) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editor.content.slice(start, end) || "text";
    const content = `${editor.content.slice(0, start)}${prefix}${selected}${suffix}${editor.content.slice(end)}`;
    update("content", content);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }
  const mediaQuery = trpc.admin.media.useQuery();
  const [imageError, setImageError] = useState("");
  function handleImageUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageError("");
      update("featuredImage", String(reader.result));
    };
    reader.onerror = () => setImageError("The image could not be read.");
    reader.readAsDataURL(file);
  }
  return (
    <form onSubmit={onSave}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Content editor</p>
          <h1 className="font-display mt-3 text-[42px] font-semibold leading-none">
            {editor.id ? "Edit content" : "Create content"}
          </h1>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Close editor"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
      </header>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-5">
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Title
            <input
              required
              value={editor.title}
              onChange={event => {
                const title = event.target.value;
                setEditor({
                  ...editor,
                  title,
                  slug: !editor.id && !editor.slug ? slugify(title) : editor.slug,
                });
              }}
              className="form-input text-base"
              placeholder="A clear, useful headline"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Content type
              {kindField}
            </label>
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Status
              <select
                value={editor.status}
                onChange={event =>
                  update("status", event.target.value as ContentStatus)
                }
                className="form-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            URL slug
            <input
              required
              value={editor.slug}
              onChange={event => update("slug", slugify(event.target.value))}
              className="form-input"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-ink/60">
            Excerpt
            <textarea
              value={editor.excerpt}
              onChange={event => update("excerpt", event.target.value)}
              className="form-input min-h-24"
              placeholder="Short summary shown on cards and search results"
            />
          </label>
          <div className="grid gap-2 text-xs font-semibold text-ink/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="article-body">Article body</label>
              <span className="text-[11px] font-normal text-ink/45">Markdown supported · headings, links, lists and quotes</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-ink/15 bg-[#fffdf9]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-sand/50 p-2">
                <div className="flex items-center gap-1">
                  <MarkdownButton label="Bold" icon={<Bold size={15} />} onClick={() => insertMarkdown("**", "**")} />
                  <MarkdownButton label="Italic" icon={<Italic size={15} />} onClick={() => insertMarkdown("*", "*")} />
                  <MarkdownButton label="Heading" icon={<Heading2 size={15} />} onClick={() => insertMarkdown("## ", "")} />
                  <MarkdownButton label="Link" icon={<Link2 size={15} />} onClick={() => insertMarkdown("[", "](https://)")} />
                  <MarkdownButton label="List" icon={<List size={15} />} onClick={() => insertMarkdown("- ", "")} />
                </div>
                <div className="flex rounded-lg border border-ink/10 bg-[#fffdf9] p-0.5">
                  <button type="button" className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${bodyMode === "write" ? "bg-ink text-ivory" : "text-ink/55"}`} onClick={() => setBodyMode("write")}>Write</button>
                  <button type="button" className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${bodyMode === "preview" ? "bg-ink text-ivory" : "text-ink/55"}`} onClick={() => setBodyMode("preview")}>Preview</button>
                </div>
              </div>
              {bodyMode === "write" ? (
                <textarea
                  id="article-body"
                  ref={bodyRef}
                  value={editor.content}
                  onChange={event => update("content", event.target.value)}
                  className="min-h-80 w-full resize-y border-0 bg-transparent p-4 font-mono text-[13px] leading-6 text-ink outline-none"
                  placeholder="# A useful headline\n\nWrite your article in Markdown..."
                />
              ) : (
                <div className="prose-custom min-h-80 p-5">
                  {editor.content.trim() ? <Streamdown>{editor.content}</Streamdown> : <p className="text-sm text-ink/45">Your rendered article preview will appear here.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
        <aside className="calculator-panel h-fit">
          <p className="eyebrow">SEO and media</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Featured image URL
              <input
                type="url"
                value={editor.featuredImage}
                onChange={event => update("featuredImage", event.target.value)}
                className="form-input"
                placeholder="https://..."
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Or upload an image
              <input type="file" accept="image/*" className="form-input" onChange={event => handleImageUpload(event.target.files?.[0])} />
              <span className="text-[11px] font-normal text-ink/45">PNG, JPG or WebP up to 2 MB</span>
            </label>
            {imageError && <p className="text-xs text-red-700">{imageError}</p>}
            {mediaQuery.data && mediaQuery.data.length > 0 && (
              <label className="grid gap-2 text-xs font-semibold text-ink/60">
                Or choose from media library
                <select
                  value={editor.featuredImage}
                  onChange={event => update("featuredImage", event.target.value)}
                  className="form-input"
                >
                  <option value="">Select saved media</option>
                  {mediaQuery.data.map(item => (
                    <option key={item.id} value={item.url}>
                      {item.altText || item.url}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {editor.featuredImage && (
              <img
                src={editor.featuredImage}
                alt={editor.imageAlt || "Featured image preview"}
                className="h-40 w-full rounded-lg object-cover"
              />
            )}
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Image alt text
              <input
                value={editor.imageAlt}
                onChange={event => update("imageAlt", event.target.value)}
                className="form-input"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              SEO title
              <input
                value={editor.seoTitle}
                onChange={event => update("seoTitle", event.target.value)}
                className="form-input"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Meta description
              <textarea
                value={editor.metaDescription}
                onChange={event =>
                  update("metaDescription", event.target.value)
                }
                className="form-input min-h-24"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-ink/60">
              Canonical URL
              <input
                type="url"
                value={editor.canonicalUrl}
                onChange={event => update("canonicalUrl", event.target.value)}
                className="form-input"
              />
            </label>
          </div>
        </aside>
      </div>
      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="button button-outline"
          disabled={saving || !editor.title || !editor.slug}
          onClick={onSaveDraft}
        >
          {saving ? "Saving draft…" : editor.id ? "Save as draft" : "Save draft"}
        </button>
        <button type="submit" className="button button-coral" disabled={saving}>
          {saving ? "Saving…" : editor.id ? "Save changes" : "Create content"}{" "}
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
