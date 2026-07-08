/* ============================================================
   APIRENTAL — Email + SMS notifications (simulated)
   No real backend: messages are derived deterministically from
   each booking's dates vs. "now". Each customer chooses ONE
   channel (email or sms); messages render as realistic previews.
   ============================================================ */
const { useState: useStateN } = React;

const NOTIF_TYPES = ["confirmation", "reminder", "return", "invoice"];

// Resolve a customer's chosen channel ("email" | "sms"); default email.
function notifChannelFor(map, email) {
  const k = (email || "").trim().toLowerCase();
  return (map && map[k]) || "email";
}

// Build the four notification events for one booking.
function buildBookingNotifications(b, channel, t, now) {
  const params = {
    name: (b.customer || "").split(" ")[0] || (b.customer || ""),
    car: b.car || "",
    id: b.id || "",
    from: fmtDate(b.from), to: fmtDate(b.to),
    pickup: txLoc(t, b.pickup), dropoff: txLoc(t, b.dropoff || b.pickup),
    amount: fmtMoney(b.total),
  };
  const to = channel === "sms" ? (b.phone || "+30 ••• ••• ••••") : (b.email || "");
  const at10 = (d) => new Date(d + "T10:00:00");
  const at09 = (d) => new Date(d + "T09:00:00");
  const created = b.createdAt ? new Date(b.createdAt) : at10(b.from);

  const defs = [
    { type: "confirmation", at: created },
    { type: "reminder",     at: new Date(at10(b.from).getTime() - 24 * 3600 * 1000) },
    { type: "return",       at: at09(b.to) },
    { type: "invoice",      at: new Date(at09(b.to).getTime() + 3 * 3600 * 1000) },
  ];
  // Cancelled bookings only ever sent the confirmation.
  const active = b.status === "Cancelled" ? defs.slice(0, 1) : defs;

  return active.map(d => ({
    id: `${b.id}-${d.type}`,
    bookingId: b.id,
    type: d.type,
    channel,
    to,
    at: d.at,
    sent: d.at.getTime() <= now.getTime(),
    subject: t(`notif.${d.type}.subject`, params),
    email: t(`notif.${d.type}.email`, params),
    sms: t(`notif.${d.type}.sms`, params),
    customer: b.customer || "",
  }));
}

function buildAllNotifications(bookings, channelsMap, t, now) {
  const out = [];
  (bookings || []).forEach(b => {
    const ch = notifChannelFor(channelsMap, b.email);
    buildBookingNotifications(b, ch, t, now).forEach(n => out.push(n));
  });
  return out;
}

/* ---------- realistic previews ---------- */
function EmailPreview({ n }) {
  const { t } = useT();
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--hairline-soft)", display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>A</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Apirental <span style={{ color: "var(--text-3)", fontWeight: 400 }}>&lt;hello@apirental.com&gt;</span></div>
          <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t("notif.to")}: {n.to}</div>
        </div>
        <Icon name="mail" size={16} style={{ color: "var(--text-3)" }} />
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{n.subject}</div>
        <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{n.email}</p>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--hairline-soft)", fontSize: 11.5, color: "var(--text-3)" }}>Apirental · Athens & Thessaloniki · apirental.com</div>
      </div>
    </div>
  );
}

function SmsPreview({ n }) {
  return (
    <div style={{ background: "var(--bg-2)", borderRadius: 14, padding: "16px 14px", border: "1px solid var(--hairline-soft)" }}>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginBottom: 12, fontWeight: 600 }}>APIRENTAL</div>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <div style={{ maxWidth: "85%", background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", borderRadius: "16px 16px 16px 4px", padding: "11px 14px", fontSize: 13.5, color: "var(--text)", lineHeight: 1.5 }}>
          {n.sms}
        </div>
      </div>
    </div>
  );
}

function NotifPreview({ n }) {
  return n.channel === "sms" ? <SmsPreview n={n} /> : <EmailPreview n={n} />;
}

const NOTIF_ICON = { confirmation: "checkCircle", reminder: "clock", return: "arrowL", invoice: "card" };

/* ---------- Admin: notifications log ---------- */
function NotificationsAdmin({ bookings, channels }) {
  const { t, lang } = useT();
  const now = new Date();
  const [type, setType] = useStateN("all");
  const [open, setOpen] = useStateN(null);
  const all = buildAllNotifications(bookings, channels, t, now).sort((a, b) => b.at - a.at);
  const list = type === "all" ? all : all.filter(n => n.type === type);
  const sentCount = all.filter(n => n.sent).length;
  const fmtT = d => d.toLocaleDateString(LOCALE[lang] || "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <PageHead title={t("adm.nav.notifications")} sub={t("adm.notif.sub", { sent: sentCount, total: all.length })} />

      <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", ...NOTIF_TYPES].map(f => (
          <button key={f} onClick={() => setType(f)} style={{
            padding: "8px 15px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: type === f ? "var(--gold)" : "var(--surface-2)", color: type === f ? "var(--gold-ink)" : "var(--text-2)",
            border: type === f ? "none" : "1px solid var(--hairline-soft)",
          }}>{f === "all" ? t("adm.notif.all") : t("notif.type." + f)}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: open ? "minmax(0, 1.3fr) minmax(0, 1fr)" : "1fr", gap: 20, alignItems: "start" }}>
        <Panel pad={0} style={{ overflow: "hidden" }}>
          <div style={{ display: "grid" }}>
            {list.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--text-3)" }}>{t("adm.notif.empty")}</div>}
            {list.map(n => (
              <button key={n.id} onClick={() => setOpen(n)} style={{
                display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderBottom: "1px solid var(--hairline-soft)", textAlign: "left",
                background: open && open.id === n.id ? "var(--surface-2)" : "transparent",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)" }}>
                  <Icon name={NOTIF_ICON[n.type]} size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.subject}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.customer} · {n.to}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>
                    <Icon name={n.channel === "sms" ? "phone" : "mail"} size={12} /> {n.channel === "sms" ? "SMS" : t("notif.channel.email")}
                  </span>
                  <Badge tone={n.sent ? "green" : "neutral"}>{n.sent ? t("notif.sent") : t("notif.scheduled")}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {open && (
          <Panel style={{ position: "sticky", top: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-3)" }}>
                <Icon name={n_chanIcon(open)} size={14} /> {open.channel === "sms" ? t("notif.via.sms") : t("notif.via.email")} · {fmtT(open.at)}
              </div>
              <button onClick={() => setOpen(null)} style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: "var(--text-3)", border: "1px solid var(--hairline-soft)" }}><Icon name="x" size={15} /></button>
            </div>
            <NotifPreview n={open} />
          </Panel>
        )}
      </div>
    </div>
  );
}
function n_chanIcon(n) { return n.channel === "sms" ? "phone" : "mail"; }

/* ---------- Customer: bell inbox ---------- */
function NotificationInbox({ bookings, user, channel, setChannel }) {
  const { t, lang } = useT();
  const [open, setOpen] = useStateN(false);
  const ref = React.useRef(null);
  const now = new Date();
  const email = (user && user.email) || "";
  const mine = (bookings || []).filter(b => (b.email || "").trim().toLowerCase() === email.trim().toLowerCase());
  const items = [];
  mine.forEach(b => buildBookingNotifications(b, channel, t, now).forEach(n => items.push(n)));
  items.sort((a, b) => b.at - a.at);
  const sent = items.filter(n => n.sent);
  const upcoming = items.filter(n => !n.sent).sort((a, b) => a.at - b.at);

  // Unread tracking (UI-only, localStorage).
  const readKey = "apirental.notifread";
  const [readIds, setReadIds] = useStateN(() => { try { return JSON.parse(localStorage.getItem(readKey)) || []; } catch (e) { return []; } });
  const unread = sent.filter(n => readIds.indexOf(n.id) === -1).length;
  const markAllRead = () => { const ids = sent.map(n => n.id); setReadIds(ids); try { localStorage.setItem(readKey, JSON.stringify(ids)); } catch (e) {} };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = () => { const willOpen = !open; setOpen(willOpen); if (willOpen) markAllRead(); };
  const fmtT = d => d.toLocaleDateString(LOCALE[lang] || "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={toggle} title={t("notif.inbox")} aria-label={t("notif.inbox")} style={{ position: "relative", width: 38, height: 38, flexShrink: 0, borderRadius: 999, display: "grid", placeItems: "center", color: open ? "var(--gold)" : "var(--text-2)", border: "1px solid var(--hairline-soft)" }}>
        <Icon name="bell" size={16} />
        {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 999, background: "var(--gold)", color: "var(--gold-ink)", fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center", border: "2px solid var(--bg)" }}>{unread}</span>}
      </button>

      {open && (
        <div className="pop-in" style={{ position: "absolute", right: 0, top: 46, zIndex: 120, width: "min(380px, 90vw)", maxHeight: "min(560px, 80vh)", overflowY: "auto", background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: 16, boxShadow: "var(--shadow-lg, 0 20px 50px rgba(0,0,0,0.3))" }}>
          <div style={{ padding: "15px 16px", borderBottom: "1px solid var(--hairline-soft)", position: "sticky", top: 0, background: "var(--elevated)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{t("notif.inbox")}</div>
            {/* channel chooser */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", marginRight: 2 }}>{t("notif.channel")}:</span>
              {["email", "sms"].map(c => (
                <button key={c} onClick={() => setChannel(c)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                  background: channel === c ? "var(--gold)" : "var(--surface-2)", color: channel === c ? "var(--gold-ink)" : "var(--text-2)",
                  border: channel === c ? "none" : "1px solid var(--hairline-soft)",
                }}>
                  <Icon name={c === "sms" ? "phone" : "mail"} size={13} /> {c === "sms" ? "SMS" : t("notif.channel.email")}
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--text-3)", fontSize: 13.5 }}>{t("notif.empty")}</div>
          ) : (
            <div style={{ padding: "8px 8px 12px" }}>
              {sent.map(n => (
                <div key={n.id} style={{ padding: "11px 12px", borderRadius: 11, display: "flex", gap: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)" }}><Icon name={NOTIF_ICON[n.type]} size={16} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.subject}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 2 }}>{channel === "sms" ? n.sms : n.email}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name={channel === "sms" ? "phone" : "mail"} size={11} /> {fmtT(n.at)}
                    </div>
                  </div>
                </div>
              ))}
              {upcoming.length > 0 && (
                <div style={{ padding: "10px 12px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>{t("notif.upcoming")}</div>
              )}
              {upcoming.map(n => (
                <div key={n.id} style={{ padding: "11px 12px", borderRadius: 11, display: "flex", gap: 11, opacity: 0.62 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--text-3)" }}><Icon name={NOTIF_ICON[n.type]} size={16} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="clock" size={11} /> {t("notif.scheduled")} · {fmtT(n.at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  buildBookingNotifications, buildAllNotifications, notifChannelFor,
  NotificationsAdmin, NotificationInbox, NotifPreview, EmailPreview, SmsPreview,
});
