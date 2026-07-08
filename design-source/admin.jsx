/* ============================================================
   APIRENTAL — Admin: shell, dashboard, bookings, customers
   ============================================================ */
const { useState: useStateA, useMemo: useMemoA } = React;

/* ---------- shared admin primitives ---------- */
const thStyle = (right) => ({ textAlign: right ? "right" : "left", padding: "14px 16px", fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)", fontWeight: 600 });
const tdStyle = { padding: "14px 16px", fontSize: 14, verticalAlign: "middle" };

/* Export an array of row-objects to a downloaded CSV file. */
function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(h => esc(h.label)).join(",")];
  rows.forEach(r => lines.push(headers.map(h => esc(h.get(r))).join(",")));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
}

function Panel({ children, pad = 22, style = {} }) {
  return <div style={{ background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", padding: pad, ...style }}>{children}</div>;
}
function PageHead({ title, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 className="display" style={{ fontSize: 30 }}>{title}</h1>
        {sub && <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 5 }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{children}</div>
    </div>
  );
}
Object.assign(window, { Panel, PageHead, thStyle, tdStyle });

/* ---------- Dashboard ---------- */
function Dashboard({ cars, bookings, customers, go }) {
  const { t, lang } = useT();
  const activeNow = bookings.filter(b => effectiveStatus(b) === "Active").length;
  const upcoming = bookings.filter(b => effectiveStatus(b) === "Upcoming").length;
  const revenue = bookings.filter(b => effectiveStatus(b) !== "Cancelled").reduce((s, b) => s + b.total, 0);
  const utilisation = Math.round((cars.filter(c => bookings.some(b => b.carId === c.id && (effectiveStatus(b) === "Active"))).length / cars.length) * 100);

  const stats = [
    { label: t("adm.dash.revenue"), value: fmtMoney(revenue), icon: "trend", delta: "+18%", tone: "green" },
    { label: t("adm.dash.active"), value: activeNow, icon: "car", delta: t("adm.dash.upcoming", { n: upcoming }), tone: "gold" },
    { label: t("adm.dash.util"), value: utilisation + "%", icon: "gauge", delta: t("adm.dash.wow"), tone: "green" },
    { label: t("adm.dash.members"), value: customers.length, icon: "users", delta: t("adm.dash.week"), tone: "gold" },
  ];

  const maxV = Math.max(...REVENUE_SERIES.map(r => r.v));
  const recent = bookings.slice(0, 5);
  const carName = id => cars.find(c => c.id === id)?.name || id;
  const monLabel = i => new Date(2026, i, 1).toLocaleDateString(LOCALE[lang] || "en-GB", { month: "short" });
  const dateStr = new Date(2026, 5, 7).toLocaleDateString(LOCALE[lang] || "en-GB", { weekday: "long", day: "numeric", month: "long" });

  // fleet by category
  const byCat = CATEGORIES.map(c => ({ c, n: cars.filter(x => x.category === c).length }));
  const totalCars = cars.length;

  // revenue by location (non-cancelled bookings)
  const live = bookings.filter(b => b.status !== "Cancelled");
  const revByLoc = LOCATIONS.map(loc => ({
    loc, rev: live.filter(b => b.pickup === loc).reduce((s, b) => s + b.total, 0),
    n: live.filter(b => b.pickup === loc).length,
  })).sort((a, b) => b.rev - a.rev);
  const maxLocRev = Math.max(1, ...revByLoc.map(r => r.rev));

  // top-performing cars by revenue
  const topCars = cars.map(c => {
    const cb = live.filter(b => b.carId === c.id);
    return { c, rev: cb.reduce((s, b) => s + b.total, 0), n: cb.length };
  }).filter(x => x.n > 0).sort((a, b) => b.rev - a.rev).slice(0, 5);
  const maxCarRev = Math.max(1, ...topCars.map(r => r.rev));

  // peak demand by month (from pickup dates of non-cancelled bookings)
  const demand = Array.from({ length: 12 }, (_, m) => ({
    m, n: live.filter(b => { const d = b.from ? new Date(b.from) : null; return d && d.getMonth() === m; }).length,
  }));
  const maxDemand = Math.max(1, ...demand.map(d => d.n));
  const peakMonth = demand.reduce((a, b) => b.n > a.n ? b : a, demand[0]);

  return (
    <div>
      <PageHead title={t("adm.nav.dashboard")} sub={`${dateStr} · ${t("adm.dash.greeting")}`} />

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 18, marginBottom: 22 }}>
        {stats.map(s => (
          <Panel key={s.label} pad={22}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)" }}>
                <Icon name={s.icon} size={21} />
              </div>
              <Badge tone={s.tone === "green" ? "green" : "gold"}>{s.delta}</Badge>
            </div>
            <div className="display" style={{ fontSize: 32, marginTop: 16 }}>{s.value}</div>
            <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 3 }}>{s.label}</div>
          </Panel>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18, marginBottom: 22 }}>
        {/* revenue chart */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
            <div>
              <h3 className="display" style={{ fontSize: 20 }}>{t("adm.dash.revtitle")}</h3>
              <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("adm.dash.revsub")}</span>
            </div>
            <Badge tone="green">{t("adm.dash.revyoy")}</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 180, paddingTop: 10 }}>
            {REVENUE_SERIES.map((r, i) => (
              <div key={r.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>€{r.v}k</div>
                <div style={{
                  width: "100%", maxWidth: 46, height: `${(r.v / maxV) * 100}%`, borderRadius: "8px 8px 4px 4px",
                  background: i === 5 ? "linear-gradient(180deg, var(--gold-hi), var(--gold-dim))" : "linear-gradient(180deg, #2c2c33, #1d1d22)",
                  border: i === 5 ? "none" : "1px solid var(--hairline-soft)", transition: "height .6s cubic-bezier(.2,.8,.2,1)",
                }} />
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{monLabel(i)}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* fleet composition */}
        <Panel>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t("adm.dash.mix")}</h3>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("adm.dash.vehicles", { n: totalCars })}</span>
          <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
            {byCat.map(({ c, n }) => (
              <div key={c}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}>
                    <Icon name={CAT_ICON[c]} size={15} style={{ color: "var(--gold)" }} /> {txCat(t, c)}
                  </span>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(n / totalCars) * 100}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-dim))", borderRadius: 99, transition: "width .6s" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* analytics: revenue by location + top cars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18, marginBottom: 22 }}>
        <Panel>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t("adm.dash.byloc")}</h3>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("adm.dash.bylocsub")}</span>
          <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
            {revByLoc.map(({ loc, rev, n }) => (
              <div key={loc}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}>
                    <Icon name="pin" size={14} style={{ color: "var(--gold)" }} /> {txLoc(t, loc)}
                  </span>
                  <span style={{ fontWeight: 600 }}>{fmtMoney(rev)} <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 12 }}>· {n}</span></span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(rev / maxLocRev) * 100}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-dim))", borderRadius: 99, transition: "width .6s" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t("adm.dash.topcars")}</h3>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("adm.dash.topcarssub")}</span>
          <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
            {topCars.length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 13.5 }}>{t("adm.dash.nodata")}</div>
            ) : topCars.map(({ c, rev, n }, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 7, display: "grid", placeItems: "center", background: i === 0 ? "var(--gold-glow)" : "var(--bg-2)", color: i === 0 ? "var(--gold-hi)" : "var(--text-3)", fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{fmtMoney(rev)} <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 12 }}>· {t("adm.dash.ntrips", { n })}</span></span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(rev / maxCarRev) * 100}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-dim))", borderRadius: 99, transition: "width .6s" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* peak demand by month */}
      <Panel style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          <div>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t("adm.dash.peak")}</h3>
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("adm.dash.peaksub")}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)" }}>{t("adm.dash.busiest")}</div>
            <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{monLabel(peakMonth.m)} · {t("adm.dash.ntrips", { n: peakMonth.n })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5%", height: 150 }}>
          {demand.map(d => (
            <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.m === peakMonth.m ? "var(--gold)" : "var(--text-3)" }}>{d.n || ""}</div>
              <div title={monLabel(d.m)} style={{
                width: "100%", height: `${(d.n / maxDemand) * 100}%`, minHeight: d.n ? 4 : 2, borderRadius: "5px 5px 0 0",
                background: d.m === peakMonth.m ? "linear-gradient(180deg, var(--gold), var(--gold-dim))" : "var(--surface-2)",
                border: d.m === peakMonth.m ? "none" : "1px solid var(--hairline-soft)", transition: "height .6s",
              }} />
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{monLabel(d.m).slice(0, 1)}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* recent bookings */}
      <Panel pad={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px 14px" }}>
          <h3 className="display" style={{ fontSize: 20 }}>{t("adm.dash.recent")}</h3>
          <Button variant="link" iconRight="arrowR" onClick={() => go("bookings")}>{t("adm.dash.allbookings")}</Button>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead><tr style={{ borderTop: "1px solid var(--hairline-soft)" }}>
            {["adm.th.ref", "adm.th.customer", "adm.th.vehicle", "adm.th.dates", "adm.th.status", "adm.th.total"].map((h, i) => <th key={h} style={thStyle(i === 5)}>{t(h)}</th>)}
          </tr></thead>
          <tbody>
            {recent.map(b => (
              <tr key={b.id} style={{ borderTop: "1px solid var(--hairline-soft)" }}>
                <td style={tdStyle}><span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold)" }}>{b.id}</span></td>
                <td style={tdStyle}>{b.customer}</td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)" }}>{carName(b.carId)}</span></td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13 }}>{fmtDate(b.from)} – {fmtDate(b.to)}</span></td>
                <td style={tdStyle}><Badge tone={STATUS_TONE[effectiveStatus(b)]}>{txBStatus(t, effectiveStatus(b))}</Badge></td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmtMoney(b.total)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>
    </div>
  );
}

/* ---------- Bookings admin ---------- */
function BookingsAdmin({ cars, bookings, setBookings, onUpdateBooking }) {
  const { t } = useT();
  const [tab, setTab] = useStateA("All");
  const [editing, setEditing] = useStateA(null);
  const carName = id => cars.find(c => c.id === id)?.name || id;
  const carById = id => cars.find(c => c.id === id);
  const tabs = ["All", "Active", "Upcoming", "Completed", "Cancelled"];
  const rows = bookings.filter(b => tab === "All" || effectiveStatus(b) === tab);

  const setStatus = (id, status) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  const deleteBooking = (id) => setBookings(prev => prev.filter(b => b.id !== id));

  return (
    <div>
      <PageHead title={t("adm.bk.title")} sub={t("adm.bk.sub", { n: bookings.length })}>
        <Button variant="ghost" icon="download" onClick={() => downloadCSV(
          "apirental-bookings-" + new Date().toISOString().slice(0, 10) + ".csv",
          [
            { label: "Ref", get: b => b.id },
            { label: "Customer", get: b => b.customer },
            { label: "Email", get: b => b.email || "" },
            { label: "Vehicle", get: b => carName(b.carId) },
            { label: "Pickup", get: b => b.pickup || "" },
            { label: "From", get: b => b.from },
            { label: "To", get: b => b.to },
            { label: "Days", get: b => b.days || "" },
            { label: "Status", get: b => effectiveStatus(b) },
            { label: "Total (EUR)", get: b => b.total },
            { label: "Promo", get: b => b.promoCode || "" },
          ],
          rows
        )}>{t("adm.bk.export")}</Button>
      </PageHead>
      <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
        {tabs.map(tb => {
          const n = tb === "All" ? bookings.length : bookings.filter(b => effectiveStatus(b) === tb).length;
          return <Chip key={tb} active={tab === tb} onClick={() => setTab(tb)}>{txBStatus(t, tb)} · {n}</Chip>;
        })}
      </div>

      <Panel pad={0}>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead><tr style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
            {["adm.th.ref", "adm.th.customer", "adm.th.vehicle", "adm.th.pickup", "adm.th.dates", "adm.th.status", "adm.th.total", ""].map((h, i) => <th key={h+i} style={thStyle(i >= 6)}>{h ? t(h) : ""}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                <td style={tdStyle}><span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold)" }}>{b.id}</span></td>
                <td style={tdStyle}><span style={{ fontWeight: 600 }}>{b.customer}</span></td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)" }}>{carName(b.carId)}</span></td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13 }}>{txLoc(t, b.pickup)}</span></td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13 }}>{fmtDate(b.from)} – {fmtDate(b.to)}</span></td>
                <td style={tdStyle}><Badge tone={STATUS_TONE[effectiveStatus(b)]}>{txBStatus(t, effectiveStatus(b))}</Badge></td>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: "right" }}>
                  {fmtMoney(b.total)}
                  {b.promoCode && b.discount > 0 && (
                    <div style={{ fontWeight: 600, fontSize: 11, color: "var(--green)", marginTop: 2, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                      <Icon name="tag" size={11} /> {b.promoCode} −{fmtMoney(b.discount)}
                    </div>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", paddingRight: 18 }}>
                  <BookingActions b={b} setStatus={setStatus} onEdit={() => setEditing(b)} onDelete={() => deleteBooking(b.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} width={560} label="Edit booking">
        {editing && (
          <ModifyBooking booking={editing} car={carById(editing.carId)} bookings={bookings}
            onSave={(upd) => { onUpdateBooking(upd); setEditing(null); }}
            onClose={() => setEditing(null)} />
        )}
      </Modal>
    </div>
  );
}

function BookingActions({ b, setStatus, onEdit, onDelete }) {
  const { t } = useT();
  const [open, setOpen] = useStateA(false);
  const [confirmDel, setConfirmDel] = useStateA(false);
  const eff = effectiveStatus(b);
  const opts = ["Active", "Upcoming", "Completed", "Cancelled"].filter(s => s !== eff);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)} onBlur={() => setTimeout(() => { setOpen(false); setConfirmDel(false); }, 150)}
        style={{ ...navBtn, width: 34, height: 34 }}><Icon name="list" size={16} /></button>
      {open && (
        <div className="pop-in" style={{ position: "absolute", right: 0, top: 40, zIndex: 30, background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: 12, padding: 6, minWidth: 168, boxShadow: "var(--shadow)" }}>
          {eff === "Upcoming" && onEdit && (
            <>
              <button onMouseDown={() => { setOpen(false); onEdit(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontSize: 13.5, color: "var(--text)", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                <Icon name="edit" size={15} style={{ color: "var(--gold)" }} /> {t("adm.bk.edit")}
              </button>
              <div style={{ height: 1, background: "var(--hairline-soft)", margin: "6px 4px" }} />
            </>
          )}
          <div style={{ fontSize: 10.5, color: "var(--text-3)", padding: "4px 10px 6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{t("adm.bk.setstatus")}</div>
          {opts.map(s => (
            <button key={s} onMouseDown={() => setStatus(b.id, s)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontSize: 13.5, color: "var(--text-2)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = ""}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: `var(--${STATUS_TONE[s] === "green" ? "green" : STATUS_TONE[s] === "red" ? "red" : STATUS_TONE[s] === "amber" ? "amber" : "text-3"})` }} /> {txBStatus(t, s)}
            </button>
          ))}
          {onDelete && (
            <>
              <div style={{ height: 1, background: "var(--hairline-soft)", margin: "6px 4px" }} />
              {!confirmDel ? (
                <button onMouseDown={(e) => { e.preventDefault(); setConfirmDel(true); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontSize: 13.5, color: "var(--red)", fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--red) 12%, transparent)"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <Icon name="trash" size={15} /> {t("adm.bk.delete")}
                </button>
              ) : (
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", padding: "2px 2px 8px", fontWeight: 600 }}>{t("adm.bk.delconfirm")}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onMouseDown={() => { setOpen(false); setConfirmDel(false); onDelete(); }} style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: "#fff", background: "var(--red)" }}>{t("adm.bk.delyes")}</button>
                    <button onMouseDown={(e) => { e.preventDefault(); setConfirmDel(false); }} style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", background: "var(--surface-2)" }}>{t("adm.bk.delno")}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Customers admin ---------- */
function CustomersAdmin({ customers, bookings, reviews }) {
  const { t } = useT();
  const tierTone = { Platinum: "gold", Gold: "amber", Silver: "neutral" };
  const [selected, setSelected] = useStateA(null);
  const bookingsFor = (c) => bookings.filter(b => b.customer === c.name || (c.email && b.email && b.email.toLowerCase() === c.email.toLowerCase()));
  return (
    <div>
      <PageHead title={t("adm.cust.title")} sub={t("adm.cust.sub", { n: customers.length })} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
        {customers.map(c => {
          const cb = bookingsFor(c);
          return (
            <Panel key={c.id}>
              <button onClick={() => setSelected(c)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--surface-2), var(--elevated))", border: "1px solid var(--hairline)", color: "var(--gold)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 18 }}>{c.initials}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15.5 }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
                </div>
                <Badge tone={tierTone[c.tier]}>{txTier(t, c.tier)}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: "14px 0", borderTop: "1px solid var(--hairline-soft)", borderBottom: "1px solid var(--hairline-soft)" }}>
                <Stat label={t("adm.cust.trips")} value={c.trips} />
                <Stat label={t("adm.cust.spend")} value={fmtMoney(c.spend)} />
                <Stat label={t("adm.cust.since")} value={c.since} />
              </div>
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 14, fontSize: 12.5, color: "var(--text-3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="phone" size={14} style={{ color: "var(--gold)" }} />{c.phone}</span>
                <button onClick={() => setSelected(c)} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "var(--gold)" }}>{t("adm.cust.view")} <Icon name="arrowR" size={13} /></button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} width={560} label="Customer detail">
        {selected && <CustomerDetail c={selected} bookings={bookingsFor(selected)} reviews={(reviews || []).filter(r => (selected.email && r.email && r.email.toLowerCase() === selected.email.toLowerCase()) || r.author === selected.name)} />}
      </Modal>
    </div>
  );
}

function CustomerDetail({ c, bookings, reviews }) {
  const { t } = useT();
  const tierTone = { Platinum: "gold", Gold: "amber", Silver: "neutral" };
  const order = { Active: 0, Upcoming: 1, Completed: 2, Cancelled: 3 };
  const sorted = [...bookings].sort((a, b) => (order[effectiveStatus(a)] - order[effectiveStatus(b)]) || (new Date(b.from) - new Date(a.from)));
  return (
    <div style={{ padding: "28px 30px", maxHeight: "82vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 21 }}>{c.initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21 }}>{c.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>{c.email}</div>
        </div>
        <Badge tone={tierTone[c.tier]}>{txTier(t, c.tier)}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, padding: "16px 0", borderTop: "1px solid var(--hairline-soft)", borderBottom: "1px solid var(--hairline-soft)", marginBottom: 22 }}>
        <Stat label={t("adm.cust.trips")} value={c.trips} />
        <Stat label={t("adm.cust.spend")} value={fmtMoney(c.spend)} />
        <Stat label={t("loy.points")} value={(c.points || 0).toLocaleString()} />
        <Stat label={t("adm.cust.since")} value={c.since} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: reviews.length ? 24 : 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 9 }}>
          {t("adm.cust.history")} <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 500, fontFamily: "var(--font-body)" }}>· {sorted.length}</span>
        </div>
        {sorted.length === 0 ? (
          <div style={{ color: "var(--text-3)", fontSize: 13.5 }}>{t("adm.cust.nobookings")}</div>
        ) : sorted.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{b.car || b.carId}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{b.id} · {fmtDate(b.from)} – {fmtDate(b.to)} · {txLoc(t, b.pickup)}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(b.total)}</div>
              <Badge tone={STATUS_TONE[effectiveStatus(b)] || "neutral"}>{txBStatus(t, effectiveStatus(b))}</Badge>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 9 }}>
            {t("detail.reviews")} <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 500, fontFamily: "var(--font-body)" }}>· {reviews.length}</span>
          </div>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ display: "inline-flex", gap: 1 }}>
                  {[1, 2, 3, 4, 5].map(n => <Icon key={n} name="star" size={12} stroke={r.rating >= n ? 0 : 1.5} style={{ fill: r.rating >= n ? "var(--gold)" : "none", color: "var(--gold)" }} />)}
                </span>
                {r.hidden && <Badge tone="red">{t("adm.rev.hiddenBadge")}</Badge>}
                <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-3)" }}>{fmtDate(r.date)}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{r.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Stat({ label, value }) {
  return <div><div className="display" style={{ fontSize: 19 }}>{value}</div><div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>{label}</div></div>;
}

/* ---------- Reviews moderation ---------- */
function ReviewsAdmin({ reviews, cars, onToggle }) {
  const { t } = useT();
  const carById = React.useMemo(() => Object.fromEntries((cars || []).map(c => [c.id, c])), [cars]);
  const [tab, setTab] = useStateA("all");   // all | visible | hidden
  const list = [...(reviews || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(r => tab === "all" ? true : tab === "hidden" ? r.hidden : !r.hidden);
  const tabs = [["all", "adm.rev.all"], ["visible", "adm.rev.visible"], ["hidden", "adm.rev.hidden"]];
  return (
    <div>
      <PageHead title={t("adm.rev.title")} sub={t("adm.rev.sub", { n: (reviews || []).length })} />
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: tab === k ? "var(--gold-glow)" : "var(--surface-2)", color: tab === k ? "var(--gold-hi)" : "var(--text-2)",
            border: `1px solid ${tab === k ? "var(--gold-glow)" : "var(--hairline-soft)"}`,
          }}>{t(label)}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <Panel><div style={{ padding: "24px 8px", textAlign: "center", color: "var(--text-3)", fontSize: 14 }}>{t("adm.rev.empty")}</div></Panel>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 16 }}>
          {list.map(r => {
            const car = carById[r.carId];
            return (
              <Panel key={r.id} style={{ opacity: r.hidden ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.author}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{t("adm.rev.on")} {car ? car.name : r.carId} · {fmtDate(r.date)}</div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 1, flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map(n => <Icon key={n} name="star" size={13} stroke={r.rating >= n ? 0 : 1.5} style={{ fill: r.rating >= n ? "var(--gold)" : "none", color: "var(--gold)" }} />)}
                  </span>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px" }}>{r.body}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 12, borderTop: "1px solid var(--hairline-soft)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {r.verified && <Badge tone="green">{t("detail.verified")}</Badge>}
                    {r.hidden && <Badge tone="red">{t("adm.rev.hiddenBadge")}</Badge>}
                  </div>
                  <button onClick={() => onToggle(r.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: r.hidden ? "var(--green)" : "var(--text-2)", border: "1px solid var(--hairline-soft)", background: "var(--surface-2)" }}>
                    <Icon name={r.hidden ? "eye" : "eyeoff"} size={14} /> {r.hidden ? t("adm.rev.showBtn") : t("adm.rev.hideBtn")}
                  </button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Promo codes admin (CRUD) ---------- */
function emptyPromo() {
  return { code: "", type: "percent", value: 10, active: true, expires: "", limit: 0, used: 0 };
}
function PromosAdmin({ promos, onSave, onDelete }) {
  const { t } = useT();
  const [editing, setEditing] = useStateA(null);   // promo being edited (or new)
  const [orig, setOrig] = useStateA(null);          // original code for rename
  const today = new Date().toISOString().slice(0, 10);

  const startNew = () => { setEditing(emptyPromo()); setOrig(null); };
  const startEdit = (p) => { setEditing({ ...p }); setOrig(p.code); };
  const valid = editing && editing.code.trim() && Number(editing.value) > 0;
  const save = () => {
    if (!valid) return;
    onSave({ ...editing, code: editing.code.trim().toUpperCase(), value: Number(editing.value), limit: Number(editing.limit) || 0 }, orig);
    setEditing(null); setOrig(null);
  };
  const statusOf = (p) => {
    if (!p.active) return { key: "adm.promo.inactive", tone: "neutral" };
    if (p.expires && p.expires < today) return { key: "adm.promo.expired", tone: "red" };
    if (p.limit > 0 && (p.used || 0) >= p.limit) return { key: "adm.promo.used_up", tone: "amber" };
    return { key: "adm.promo.live", tone: "green" };
  };

  return (
    <div>
      <PageHead title={t("adm.promo.title")} sub={t("adm.promo.sub", { n: promos.length })}>
        <Button variant="primary" icon="plus" onClick={startNew}>{t("adm.promo.new")}</Button>
      </PageHead>

      <Panel pad={0}>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead><tr style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
            {["adm.promo.code", "adm.promo.discount", "adm.promo.expires", "adm.promo.usage", "adm.promo.status", ""].map((h, i) => <th key={h + i} style={thStyle(i >= 5)}>{h ? t(h) : ""}</th>)}
          </tr></thead>
          <tbody>
            {promos.map(p => {
              const st = statusOf(p);
              return (
                <tr key={p.code} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                  <td style={tdStyle}><span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.05em" }}>{p.code}</span></td>
                  <td style={tdStyle}><span style={{ fontWeight: 600 }}>{p.type === "percent" ? `${p.value}%` : fmtMoney(p.value)}</span> <span style={{ color: "var(--text-3)", fontSize: 12.5 }}>{t("promo.off")}</span></td>
                  <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13 }}>{p.expires ? fmtDate(p.expires) : t("adm.promo.never")}</span></td>
                  <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13 }}>{p.used || 0}{p.limit > 0 ? ` / ${p.limit}` : ` / ∞`}</span></td>
                  <td style={tdStyle}><Badge tone={st.tone}>{t(st.key)}</Badge></td>
                  <td style={{ ...tdStyle, textAlign: "right", paddingRight: 18, whiteSpace: "nowrap" }}>
                    <button onClick={() => startEdit(p)} title={t("adm.promo.edit")} style={{ ...navBtn, width: 34, height: 34, display: "inline-grid", marginRight: 6 }}><Icon name="edit" size={15} /></button>
                    <button onClick={() => onDelete(p.code)} title={t("adm.promo.delete")} style={{ ...navBtn, width: 34, height: 34, display: "inline-grid", color: "var(--red)" }}><Icon name="trash" size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {promos.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--text-3)", padding: "30px" }}>{t("adm.promo.empty")}</td></tr>
            )}
          </tbody>
        </table></div>
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} width={460} label="Promo code">
        {editing && (
          <div style={{ padding: "28px 30px" }}>
            <div className="eyebrow" style={{ marginBottom: 9 }}>{t(orig ? "adm.promo.editTitle" : "adm.promo.newTitle")}</div>
            <h2 className="display" style={{ fontSize: 22, marginBottom: 22, letterSpacing: "-0.02em" }}>{t("adm.promo.title")}</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <Field label={t("adm.promo.code")}>
                <TextInput value={editing.code} placeholder="WELCOME15" onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={t("adm.promo.type")}>
                  <Select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}>
                    <option value="percent">{t("adm.promo.percent")}</option>
                    <option value="fixed">{t("adm.promo.fixed")}</option>
                  </Select>
                </Field>
                <Field label={editing.type === "percent" ? t("adm.promo.pctval") : t("adm.promo.eurval")}>
                  <TextInput type="number" value={editing.value} min="1" onChange={e => setEditing({ ...editing, value: e.target.value })} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={t("adm.promo.expires")}>
                  <TextInput type="date" value={editing.expires} onChange={e => setEditing({ ...editing, expires: e.target.value })} />
                </Field>
                <Field label={t("adm.promo.limit")}>
                  <TextInput type="number" value={editing.limit} min="0" placeholder="0 = ∞" onChange={e => setEditing({ ...editing, limit: e.target.value })} />
                </Field>
              </div>
              <button onClick={() => setEditing({ ...editing, active: !editing.active })}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: 10, width: "100%" }}>
                <span style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 600 }}>{t("adm.promo.active")}</span>
                <span style={{ width: 42, height: 24, borderRadius: 999, background: editing.active ? "var(--gold)" : "var(--surface-2)", border: "1px solid var(--hairline)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 2, left: editing.active ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: editing.active ? "var(--gold-ink)" : "var(--text-3)", transition: "left .2s" }} />
                </span>
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Button variant="ghost" onClick={() => setEditing(null)} style={{ flex: 1 }}>{t("trips.keep")}</Button>
              <Button variant="primary" icon="check" onClick={save} disabled={!valid} style={{ flex: 2, opacity: valid ? 1 : 0.45, pointerEvents: valid ? "auto" : "none" }}>{t("adm.promo.save")}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------- Admin shell ---------- */
function AdminApp({ cars, setCars, bookings, setBookings, customers, reviews, promos, maintenance, damage, notifChannels, onMarkServiced, onSetInService, onUpdateMaintenance, onResolveDamage, onAddDamage, onToggleReview, onUpdateBooking, onSavePromo, onDeletePromo, toSite, onSignOut }) {
  const { t } = useT();
  const [route, setRoute] = useStateA("dashboard");
  const nav = [
    ["dashboard", "adm.nav.dashboard", "dash"],
    ["daysheet", "adm.nav.daysheet", "calendar"],
    ["fleet", "adm.nav.fleet", "cars"],
    ["maintenance", "adm.nav.maintenance", "wrench"],
    ["calendar", "adm.nav.availability", "calendar"],
    ["bookings", "adm.nav.bookings", "list"],
    ["customers", "adm.nav.customers", "users"],
    ["damage", "adm.nav.damage", "alert"],
    ["notifications", "adm.nav.notifications", "bell"],
    ["reviews", "adm.nav.reviews", "star"],
    ["promos", "adm.nav.promos", "tag"],
  ];

  const mobile = useIsMobile(820);

  const body = (
    <div className="fade-in" key={route}>
      {route === "dashboard" && <Dashboard cars={cars} bookings={bookings} customers={customers} go={setRoute} />}
      {route === "daysheet" && <DaySheetAdmin bookings={bookings} cars={cars} />}
      {route === "fleet" && <FleetAdmin cars={cars} setCars={setCars} />}
      {route === "maintenance" && <MaintenanceAdmin cars={cars} maintenance={maintenance} onMarkServiced={onMarkServiced} onSetInService={onSetInService} onUpdateMaintenance={onUpdateMaintenance} />}
      {route === "calendar" && <CalendarAdmin cars={cars} bookings={bookings} />}
      {route === "bookings" && <BookingsAdmin cars={cars} bookings={bookings} setBookings={setBookings} onUpdateBooking={onUpdateBooking} />}
      {route === "customers" && <CustomersAdmin customers={customers} bookings={bookings} reviews={reviews} />}
      {route === "damage" && <DamageAdmin damage={damage} cars={cars} bookings={bookings} onResolve={onResolveDamage} onAdd={onAddDamage} />}
      {route === "notifications" && <NotificationsAdmin bookings={bookings} channels={notifChannels} />}
      {route === "reviews" && <ReviewsAdmin reviews={reviews} cars={cars} onToggle={onToggleReview} />}
      {route === "promos" && <PromosAdmin promos={promos} onSave={onSavePromo} onDelete={onDeletePromo} />}
    </div>
  );

  if (mobile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--header-bg)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--hairline-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
            <Logo size={18} onClick={toSite} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ThemeToggle />
              {onSignOut && (
                <button onClick={onSignOut} title={t("adm.signout")} aria-label={t("adm.signout")}
                  style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", color: "var(--text-3)", border: "1px solid var(--hairline-soft)" }}>
                  <Icon name="logout" size={17} />
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 16px 12px", WebkitOverflowScrolling: "touch" }}>
            {nav.map(([k, label, icon]) => (
              <button key={k} onClick={() => setRoute(k)} style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap",
                background: route === k ? "var(--gold-glow)" : "var(--surface-2)", color: route === k ? "var(--gold-hi)" : "var(--text-2)",
                border: `1px solid ${route === k ? "var(--gold-glow)" : "var(--hairline-soft)"}`,
              }}>
                <Icon name={icon} size={16} /> {t(label)}
              </button>
            ))}
            <button onClick={toSite} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap", color: "var(--text-3)", border: "1px solid var(--hairline-soft)" }}>
              <Icon name="arrowL" size={16} /> {t("adm.backsite")}
            </button>
          </div>
        </header>
        <main style={{ padding: "20px 16px 50px" }}>{body}</main>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "246px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      {/* sidebar */}
      <aside style={{ borderRight: "1px solid var(--hairline-soft)", padding: "24px 18px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 8px 24px" }}><Logo size={20} onClick={toSite} /></div>
        <nav style={{ display: "grid", gap: 4 }}>
          {nav.map(([k, label, icon]) => (
            <button key={k} onClick={() => setRoute(k)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, fontSize: 14.5, fontWeight: 500, textAlign: "left",
              background: route === k ? "var(--surface-2)" : "transparent", color: route === k ? "var(--text)" : "var(--text-3)",
              border: route === k ? "1px solid var(--hairline-soft)" : "1px solid transparent", transition: "all .18s",
            }}
              onMouseEnter={e => { if (route !== k) e.currentTarget.style.color = "var(--text-2)"; }}
              onMouseLeave={e => { if (route !== k) e.currentTarget.style.color = "var(--text-3)"; }}>
              <Icon name={icon} size={19} style={{ color: route === k ? "var(--gold)" : "currentColor" }} /> {t(label)}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ padding: 14, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--hairline-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>EV</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>George Voss</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t("adm.role")}</div>
            </div>
            {onSignOut && (
              <button onClick={onSignOut} title={t("adm.signout")} aria-label={t("adm.signout")}
                style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--text-3)", border: "1px solid var(--hairline-soft)", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "rgba(224,106,90,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--hairline-soft)"; }}>
                <Icon name="logout" size={16} />
              </button>
            )}
          </div>
        </div>
        <button onClick={toSite} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginTop: 8, color: "var(--text-3)", fontSize: 13.5, borderRadius: 12 }}>
          <Icon name="arrowL" size={18} /> {t("adm.backsite")}
        </button>
        <div style={{ marginTop: 4 }}><ThemeToggle /></div>
      </aside>

      {/* content */}
      <main style={{ padding: "30px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        {body}
      </main>
    </div>
  );
}

/* ---------- Staff login gate ---------- */
const STAFF_CREDS = { email: "george@apirental.com", password: "apirental" };

function StaffLogin({ onAuth, onBack }) {
  const { t } = useT();
  const [view, setView] = useStateA("signin");   // signin | reset
  const [email, setEmail] = useStateA("");
  const [pw, setPw] = useStateA("");
  const [show, setShow] = useStateA(false);
  const [err, setErr] = useStateA(false);
  const [connecting, setConnecting] = useStateA(null);
  const [resetEmail, setResetEmail] = useStateA("");
  const [resetSent, setResetSent] = useStateA(false);

  const submit = (e) => {
    e && e.preventDefault();
    if (email.trim().toLowerCase() === STAFF_CREDS.email && pw === STAFF_CREDS.password) {
      setErr(false); onAuth();
    } else { setErr(true); }
  };
  const startSSO = (id) => { if (connecting) return; setConnecting(id); setTimeout(() => onAuth(), 950); };
  const sendReset = (e) => { e && e.preventDefault(); if (resetEmail.trim()) setResetSent(true); };
  const badge = (icon) => (
    <div style={{ width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(140deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", marginBottom: 20, boxShadow: "0 8px 20px -6px var(--gold-glow)" }}>
      <Icon name={icon} size={21} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Stripe-style animated aurora + grid backdrop */}
      <div className="login-aurora" />
      <div className="login-grid" />

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", position: "relative", zIndex: 2 }}>
        <Logo onClick={onBack} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <LangSwitcher />
        </div>
      </div>

      {/* centered card */}
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "20px 24px 60px", position: "relative", zIndex: 2 }}>
        <div className="fade-in" style={{ width: "100%", maxWidth: 410 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", padding: "36px 36px 28px", boxShadow: "var(--shadow-lg)", backdropFilter: "blur(12px)" }}>
            {view === "reset" ? (
              <>
                {badge("mail")}
                <div className="eyebrow" style={{ marginBottom: 9 }}>{t("login.reset.eyebrow")}</div>
                <h1 className="display" style={{ fontSize: 27, marginBottom: 7, letterSpacing: "-0.025em" }}>{t("login.reset.title")}</h1>
                <p style={{ color: "var(--text-3)", fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>{t("login.reset.sub")}</p>
                {resetSent ? (
                  <div className="pop-in" style={{ display: "flex", gap: 11, padding: "14px 16px", borderRadius: "var(--r-sm)", background: "var(--gold-glow)", border: "1px solid var(--gold-glow)", color: "var(--text)", fontSize: 13.5, lineHeight: 1.5, alignItems: "flex-start" }}>
                    <Icon name="checkCircle" size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }} />
                    <span>{t("login.reset.sent", { email: resetEmail || "your inbox" })}</span>
                  </div>
                ) : (
                  <form onSubmit={sendReset} style={{ display: "grid", gap: 16 }}>
                    <Field label={t("login.email")}>
                      <TextInput type="email" value={resetEmail} placeholder="you@apirental.com" autoComplete="username"
                        onChange={e => setResetEmail(e.target.value)} />
                    </Field>
                    <Button variant="primary" size="lg" full iconRight="arrowR" onClick={sendReset}>{t("login.reset.send")}</Button>
                  </form>
                )}
                <button type="button" onClick={() => { setView("signin"); setResetSent(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-2)", fontSize: 13, marginTop: 20 }}>
                  <Icon name="arrowL" size={16} /> {t("login.backtosignin")}
                </button>
              </>
            ) : (
              <>
                {badge("lock")}
                <div className="eyebrow" style={{ marginBottom: 9 }}>{t("login.eyebrow")}</div>
                <h1 className="display" style={{ fontSize: 27, marginBottom: 7, letterSpacing: "-0.025em" }}>{t("login.title")}</h1>
                <p style={{ color: "var(--text-3)", fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>{t("login.sub")}</p>

                {/* Single sign-on */}
                <div style={{ marginBottom: 18 }}>
                  <SsoButtons connecting={connecting} onPick={startSSO} t={t} />
                </div>

                {/* divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 18px", color: "var(--text-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-mono)" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--hairline-soft)" }} />
                  {t("login.or")}
                  <span style={{ flex: 1, height: 1, background: "var(--hairline-soft)" }} />
                </div>

                <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
                  <Field label={t("login.email")}>
                    <TextInput type="email" value={email} placeholder="george@apirental.com" autoComplete="username"
                      onChange={e => { setEmail(e.target.value); setErr(false); }} />
                  </Field>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)" }}>{t("login.password")}</span>
                      <button type="button" onClick={() => { setView("reset"); setResetEmail(email); }}
                        style={{ fontSize: 12.5, color: "var(--gold)", fontWeight: 600 }}>{t("login.forgot")}</button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <TextInput type={show ? "text" : "password"} value={pw} placeholder="••••••••" autoComplete="current-password"
                        onChange={e => { setPw(e.target.value); setErr(false); }} style={{ paddingRight: 76 }} />
                      <button type="button" onClick={() => setShow(s => !s)}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 5, padding: "6px 9px", borderRadius: 8, fontSize: 12, color: "var(--text-3)" }}>
                        <Icon name={show ? "eyeoff" : "eye"} size={15} /> {show ? t("login.hide") : t("login.show")}
                      </button>
                    </div>
                  </div>

                  {err && (
                    <div className="pop-in" style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: "var(--r-sm)", background: "rgba(224,106,90,0.1)", border: "1px solid rgba(224,106,90,0.3)", color: "var(--red)", fontSize: 13, lineHeight: 1.4 }}>
                      <Icon name="x" size={16} style={{ flexShrink: 0 }} /> {t("login.error")}
                    </div>
                  )}

                  <Button variant="primary" size="lg" full iconRight="arrowR" onClick={submit}>{t("login.signin")}</Button>
                </form>

                {/* demo credentials */}
                <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: "var(--r)", background: "var(--bg-2)", border: "1px dashed var(--hairline)" }}>
                  <div style={{ fontSize: 10.5, color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{t("login.demo")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-2)" }}>
                    <span>george@apirental.com</span>
                    <span>apirental</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, padding: "0 4px" }}>
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-3)", fontSize: 13 }}>
              <Icon name="arrowL" size={16} /> {t("login.back")}
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-3)", fontSize: 11.5 }}>
              <Icon name="shield" size={14} style={{ color: "var(--gold-dim)" }} /> {t("login.secure")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Damage reports (admin) ---------- */
function DamageAdmin({ damage, cars, bookings, onResolve, onAdd }) {
  const { t, lang } = useT();
  const [filter, setFilter] = useStateA("open");   // open | all | resolved
  const [logging, setLogging] = useStateA(false);
  const [lightbox, setLightbox] = useStateA(null);
  const logBookings = (bookings || []).filter(b => b.status !== "Cancelled");
  const fmtDT = d => d ? new Date(d).toLocaleDateString(LOCALE[lang] || "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const list = (damage || []).filter(d => filter === "all" ? true : filter === "open" ? !d.resolved : d.resolved);
  const openCount = (damage || []).filter(d => !d.resolved).length;

  return (
    <div>
      <PageHead title={t("adm.nav.damage")} sub={t("adm.dmg.sub", { n: openCount })}>
        <button onClick={() => setLogging(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 11, fontSize: 14, fontWeight: 700, color: "var(--gold-ink)", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", border: "none" }}>
          <Icon name="plus" size={16} /> {t("adm.dmg.log")}
        </button>
      </PageHead>

      <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
        {["open", "all", "resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: filter === f ? "var(--gold)" : "var(--surface-2)", color: filter === f ? "var(--gold-ink)" : "var(--text-2)",
            border: filter === f ? "none" : "1px solid var(--hairline-soft)",
          }}>{t("adm.dmg.f." + f)}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <Panel><div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-3)" }}>{t("adm.dmg.empty")}</div></Panel>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {list.map(d => (
            <Panel key={d.id}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{d.carName || "—"}</span>
                    <Badge tone={d.severity === "major" ? "red" : "gold"}>{t("dmg.sev." + (d.severity || "minor"))}</Badge>
                    <Badge tone="neutral">{t("dmg.phase." + (d.phase || "pickup"))}</Badge>
                    {d.resolved && <Badge tone="green">{t("adm.dmg.resolved")}</Badge>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                    {d.bookingId} · {d.customer || "—"} · {fmtDT(d.createdAt)} · {t("dmg.by." + (d.by || "staff"))}
                  </div>
                  {d.note && <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 10 }}>{d.note}</p>}
                  <button onClick={() => onResolve(d.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: d.resolved ? "var(--text-2)" : "var(--green)", background: "var(--surface-2)", border: "1px solid var(--hairline-soft)" }}>
                    <Icon name="check" size={14} /> {d.resolved ? t("adm.dmg.reopen") : t("adm.dmg.markresolved")}
                  </button>
                </div>
                {d.photos && d.photos.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start" }}>
                    {d.photos.map((p, i) => (
                      <img key={i} src={p} alt="" onClick={() => setLightbox(p)} style={{ width: 92, height: 70, objectFit: "cover", borderRadius: 9, border: "1px solid var(--hairline)", cursor: "pointer" }} />
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {logging && window.DamageModal && (
        <window.DamageModal bookings={logBookings} cars={cars} by="staff"
          onSave={(r) => onAdd && onAdd(r)}
          onClose={() => setLogging(false)} />
      )}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.85)", display: "grid", placeItems: "center", padding: 24 }}>
          <img src={lightbox} alt="" style={{ maxWidth: "92vw", maxHeight: "90vh", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminApp, Dashboard, BookingsAdmin, CustomersAdmin, DamageAdmin, StaffLogin });
