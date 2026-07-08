/* ============================================================
   APIRENTAL — Admin: Fleet CRUD + Availability calendar
   ============================================================ */
const { useState: useStateAf, useMemo: useMemoAf } = React;

/* ---------- Car editor modal ---------- */
const BLANK_CAR = {
  name: "", brand: "", category: "Luxury & Exotic", year: 2025, price: 200,
  seats: 4, transmission: "Automatic", fuel: "Petrol", power: "", topSpeed: "",
  zeroTo: "", drivetrain: "AWD", color: "", location: "Downtown Flagship",
  status: "Available", blurb: "", rating: 4.8, trips: 0, tag: null, features: [], booked: [],
};

function CarEditor({ open, car, onClose, onSave, onDelete }) {
  const { t } = useT();
  const [f, setF] = useStateAf(BLANK_CAR);
  const isEdit = !!car;
  React.useEffect(() => { setF(car ? { ...car } : { ...BLANK_CAR, id: "c" + Date.now() }); }, [car, open]);
  if (!open) return null;
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name && f.brand && f.price > 0;

  return (
    <Modal open={open} onClose={onClose} width={640} label={t("adm.ed.editvehicle")}>
      <div style={{ padding: "26px 30px", borderBottom: "1px solid var(--hairline-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{isEdit ? t("adm.ed.editvehicle") : t("adm.ed.addvehicle")}</div>
          <h2 className="display" style={{ fontSize: 23 }}>{isEdit ? f.name || t("adm.ed.vehicle") : t("adm.ed.newvehicle")}</h2>
        </div>
        <button onClick={onClose} style={{ color: "var(--text-3)", width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 8 }}><Icon name="x" size={19} /></button>
      </div>

      <div style={{ padding: "24px 30px", display: "grid", gap: 16 }}>
        <CarImage car={{ ...f, color: f.color || "—" }} height={120} rounded={12} showLabel={false} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label={t("adm.ed.brand")}><TextInput value={f.brand} placeholder="Porsche" onChange={e => set("brand", e.target.value)} /></Field>
          <Field label={t("adm.ed.model")}><TextInput value={f.name} placeholder="911 Carrera" onChange={e => set("name", e.target.value)} /></Field>
          <Field label={t("adm.ed.category")}><Select value={f.category} onChange={e => set("category", e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{txCat(t, c)}</option>)}</Select></Field>
          <Field label={t("adm.ed.price")}><TextInput type="number" value={f.price} onChange={e => set("price", +e.target.value)} /></Field>
          <Field label={t("adm.ed.location")}><Select value={f.location} onChange={e => set("location", e.target.value)}>{LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}</Select></Field>
          <Field label={t("adm.ed.status")}><Select value={f.status} onChange={e => set("status", e.target.value)}>{["Available","Maintenance"].map(s => <option key={s} value={s}>{txStatus(t, s)}</option>)}</Select></Field>
          <Field label={t("adm.ed.seats")}><TextInput type="number" value={f.seats} onChange={e => set("seats", +e.target.value)} /></Field>
          <Field label={t("adm.ed.year")}><TextInput type="number" value={f.year} onChange={e => set("year", +e.target.value)} /></Field>
          <Field label={t("adm.ed.trans")}><Select value={f.transmission} onChange={e => set("transmission", e.target.value)}>{["Automatic","Manual"].map(s => <option key={s} value={s}>{s === "Automatic" ? t("trans.automatic") : t("trans.manual")}</option>)}</Select></Field>
          <Field label={t("adm.ed.fuel")}><Select value={f.fuel} onChange={e => set("fuel", e.target.value)}>{["Petrol","Hybrid","Electric","Diesel"].map(s => <option key={s} value={s}>{txFuel(t, s)}</option>)}</Select></Field>
          <Field label={t("adm.ed.zero")}><TextInput value={f.zeroTo} placeholder="4.0s" onChange={e => set("zeroTo", e.target.value)} /></Field>
          <Field label={t("adm.ed.power")}><TextInput value={f.power} placeholder="385 hp" onChange={e => set("power", e.target.value)} /></Field>
        </div>
        <Field label={t("adm.ed.tagline")}><TextInput value={f.blurb} placeholder={t("adm.ed.taglineph")} onChange={e => set("blurb", e.target.value)} /></Field>
      </div>

      <div style={{ padding: "20px 30px", borderTop: "1px solid var(--hairline-soft)", display: "flex", gap: 12, alignItems: "center" }}>
        {isEdit && <Button variant="danger" icon="trash" onClick={() => { onDelete(f.id); onClose(); }}>{t("adm.ed.delete")}</Button>}
        <div style={{ flex: 1 }} />
        <Button variant="ghost" onClick={onClose}>{t("adm.ed.cancel")}</Button>
        <Button variant="primary" icon="check" disabled={!valid} style={{ opacity: valid ? 1 : 0.4, pointerEvents: valid ? "auto" : "none" }}
          onClick={() => { onSave(f); onClose(); }}>{isEdit ? t("adm.ed.save") : t("adm.ed.addfleet")}</Button>
      </div>
    </Modal>
  );
}

/* ---------- Fleet admin ---------- */
function FleetAdmin({ cars, setCars }) {
  const { t } = useT();
  const [editing, setEditing] = useStateAf(null);
  const [open, setOpen] = useStateAf(false);
  const [q, setQ] = useStateAf("");
  const [cat, setCat] = useStateAf("All");

  const rows = cars.filter(c => (cat === "All" || c.category === cat) && `${c.brand} ${c.name}`.toLowerCase().includes(q.toLowerCase()));

  const save = (car) => setCars(prev => prev.some(c => c.id === car.id) ? prev.map(c => c.id === car.id ? car : c) : [car, ...prev]);
  const del = (id) => setCars(prev => prev.filter(c => c.id !== id));

  return (
    <div>
      <PageHead title={t("adm.fleet.title")} sub={t("adm.fleet.sub", { n: cars.length, m: cars.filter(c=>c.status==="Available").length })}>
        <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setOpen(true); }}>{t("adm.fleet.add")}</Button>
      </PageHead>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Icon name="search" size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--text-3)" }} />
          <TextInput value={q} placeholder={t("adm.fleet.search")} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {["All", ...CATEGORIES].map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c === "All" ? t("adm.filter.all") : txCat(t, c)}</Chip>)}
        </div>
      </div>

      <Panel pad={0}>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
              {["adm.th.vehicle", "adm.th.category", "adm.th.price", "adm.th.rating", "adm.th.trips", "adm.th.status", ""].map((h, i) => (
                <th key={h+i} style={thStyle(i === 6)}>{h ? t(h) : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} className="adm-row" style={{ borderBottom: "1px solid var(--hairline-soft)", cursor: "pointer", transition: "background .15s" }}
                onClick={() => { setEditing(c); setOpen(true); }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <CarImage car={c} height={42} rounded={8} placeholder=""
                      style={{ width: 64, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{c.brand} · {c.year}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)", fontSize: 13.5 }}>{txCat(t, c.category)}</span></td>
                <td style={tdStyle}><span style={{ fontWeight: 700, color: "var(--gold)" }}>{fmtMoney(c.price)}</span></td>
                <td style={tdStyle}><Stars value={c.rating} /></td>
                <td style={tdStyle}><span style={{ color: "var(--text-2)" }}>{c.trips}</span></td>
                <td style={tdStyle}><Badge tone={STATUS_TONE[c.status]}>{txStatus(t, c.status)}</Badge></td>
                <td style={{ ...tdStyle, textAlign: "right", paddingRight: 20 }}>
                  <Icon name="edit" size={17} style={{ color: "var(--text-3)" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>

      <CarEditor open={open} car={editing} onClose={() => setOpen(false)} onSave={save} onDelete={del} />
    </div>
  );
}

/* ---------- Availability calendar ---------- */
function CalendarAdmin({ cars, bookings }) {
  const { t, lang } = useT();
  const [month, setMonth] = useStateAf(5); // June (0-idx) 2026
  const year = 2026;
  const [carId, setCarId] = useStateAf("all");

  const loc = LOCALE[lang] || "en-GB";
  const monthName = new Date(year, month, 1).toLocaleDateString(loc, { month: "long", year: "numeric" });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 8, 1 + i).toLocaleDateString(loc, { weekday: "short" }));
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // build per-day booking map
  const dayMap = useMemoAf(() => {
    const map = {};
    bookings.filter(b => b.status !== "Cancelled" && (carId === "all" || b.carId === carId)).forEach(b => {
      let d = new Date(b.from + "T00:00:00");
      const end = new Date(b.to + "T00:00:00");
      while (d <= end) {
        if (d.getFullYear() === year && d.getMonth() === month) {
          const k = d.getDate();
          (map[k] = map[k] || []).push(b);
        }
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [bookings, month, carId]);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const carById = id => cars.find(c => c.id === id);
  const selCar = carId !== "all" ? carById(carId) : null;
  const outOfService = !!(selCar && selCar.status === "Maintenance");

  return (
    <div>
      <PageHead title={t("adm.cal.title")} sub={t("adm.cal.sub")}>
        <Select value={carId} onChange={e => setCarId(e.target.value)} style={{ width: 220 }}>
          <option value="all">{t("adm.cal.allvehicles")}</option>
          {cars.map(c => <option key={c.id} value={c.id}>{c.name}{c.status === "Maintenance" ? " — " + t("adm.maint.inservice") : ""}</option>)}
        </Select>
      </PageHead>

      <Panel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 className="display" style={{ fontSize: 22 }}>{monthName}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMonth(m => Math.max(0, m - 1))} style={navBtn}><Icon name="arrowL" size={18} /></button>
            <button onClick={() => setMonth(m => Math.min(11, m + 1))} style={navBtn}><Icon name="arrowR" size={18} /></button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, minWidth: 540 }}>
          {weekdays.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11.5, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", paddingBottom: 6 }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = d === 7 && month === 5;
            const bks = dayMap[d] || [];
            const busy = bks.length;
            return (
              <div key={i} style={{
                minHeight: 92, borderRadius: 12, padding: "8px 9px",
                background: outOfService ? "color-mix(in srgb, var(--red) 12%, var(--bg-2))" : busy ? "var(--surface-2)" : "var(--bg-2)",
                border: `1px solid ${isToday ? "var(--gold)" : outOfService ? "color-mix(in srgb, var(--red) 30%, var(--hairline-soft))" : "var(--hairline-soft)"}`,
                position: "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? "var(--gold)" : "var(--text-2)" }}>{d}</span>
                  {busy > 0 && !outOfService && <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{busy}</span>}
                </div>
                {outOfService ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--red)" }}>
                    <Icon name="wrench" size={12} /> {t("adm.maint.inservice")}
                  </div>
                ) : (
                <div style={{ display: "grid", gap: 3, marginTop: 6 }}>
                  {bks.slice(0, 3).map((b, j) => {
                    const car = carById(b.carId);
                    return (
                      <div key={j} title={`${car?.name} · ${b.customer}`} style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        background: "var(--gold-glow)", color: "var(--gold-hi)", border: "1px solid var(--gold-glow)",
                      }}>{carId === "all" ? (car?.brand || b.carId) : b.customer.split(" ")[0]}</div>
                    );
                  })}
                  {busy > 3 && <div style={{ fontSize: 10, color: "var(--text-3)", paddingLeft: 4 }}>{t("adm.cal.more", { n: busy - 3 })}</div>}
                </div>
                )}
              </div>
            );
          })}
        </div>
        </div>

        <div style={{ display: "flex", gap: 22, marginTop: 20, fontSize: 12.5, color: "var(--text-3)", flexWrap: "wrap" }}>
          <Legend color="var(--gold)" label={t("adm.cal.today")} ring />
          <Legend color="var(--surface-2)" label={t("adm.cal.hasbookings")} />
          <Legend color="var(--bg-2)" label={t("adm.cal.open")} />
          {outOfService && <Legend color="color-mix(in srgb, var(--red) 30%, var(--bg-2))" label={t("adm.maint.inservice")} />}
        </div>
      </Panel>
    </div>
  );
}
/* ---------- Daily pickup / return run sheet ---------- */
function todayISO() { return new Date().toISOString().slice(0, 10); }

function printDaySheet(dateLabel, pickups, returns, cars, t) {
  const carName = id => (cars.find(c => c.id === id) || {}).name || "";
  const esc = s => String(s == null ? "" : s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const rows = (arr, locField) => arr.length ? arr.map(b => `<tr>
      <td class="t">${esc(b.time || "—")}</td>
      <td><b>${esc(b.customer || "—")}</b><br><span class="muted">${esc(b.phone || "")}</span></td>
      <td>${esc(b.car || carName(b.carId))}<br><span class="muted">${esc(b.id)}</span></td>
      <td>${esc(txLoc(t, b[locField] || b.pickup))}</td>
      <td class="sign"></td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty">${esc(t("adm.sheet.none"))}</td></tr>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(t("adm.sheet.title"))} · ${esc(dateLabel)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #14161f; margin: 0; padding: 30px; }
  .head { display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 3px solid #6d5dfc; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { font-size: 22px; font-weight: 800; } .brand span { color:#6d5dfc; }
  .date { font-size: 15px; font-weight: 700; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .1em; color:#6d5dfc; margin: 24px 0 8px; }
  table { width:100%; border-collapse: collapse; }
  th { text-align:left; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color:#888; padding: 6px 8px; border-bottom: 1.5px solid #ddd; }
  td { padding: 9px 8px; border-bottom: 1px solid #eee; font-size: 12.5px; vertical-align: top; }
  td.t { font-weight: 700; white-space: nowrap; } .muted { color:#999; font-size: 11px; }
  td.sign { width: 130px; border-bottom: 1px solid #eee; } th.sign { width: 130px; }
  td.empty { text-align:center; color:#aaa; padding: 16px; font-style: italic; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="head"><div class="brand">APIRENTAL<span>.</span></div><div class="date">${esc(t("adm.sheet.title"))} · ${esc(dateLabel)}</div></div>
  <h2>${esc(t("adm.sheet.pickups"))} (${pickups.length})</h2>
  <table><thead><tr><th>${esc(t("adm.sheet.time"))}</th><th>${esc(t("adm.th.customer"))}</th><th>${esc(t("adm.th.vehicle"))}</th><th>${esc(t("bk.pickuploc"))}</th><th class="sign">${esc(t("adm.sheet.signature"))}</th></tr></thead><tbody>${rows(pickups, "pickup")}</tbody></table>
  <h2>${esc(t("adm.sheet.returns"))} (${returns.length})</h2>
  <table><thead><tr><th>${esc(t("adm.sheet.time"))}</th><th>${esc(t("adm.th.customer"))}</th><th>${esc(t("adm.th.vehicle"))}</th><th>${esc(t("bk.returnloc"))}</th><th class="sign">${esc(t("adm.sheet.signature"))}</th></tr></thead><tbody>${rows(returns, "dropoff")}</tbody></table>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

function DaySheetAdmin({ bookings, cars }) {
  const { t, lang } = useT();
  const mobile = useIsMobile(1080);
  const [date, setDate] = useStateAf(todayISO());
  const loc = LOCALE[lang] || "en-GB";
  const carById = React.useMemo(() => Object.fromEntries((cars || []).map(c => [c.id, c])), [cars]);
  const live = (bookings || []).filter(b => b.status !== "Cancelled");
  const byTime = (a, b) => (a.time || "").localeCompare(b.time || "");
  const pickups = live.filter(b => b.from === date).sort(byTime);
  const returns = live.filter(b => b.to === date).sort(byTime);
  const shift = (n) => { const d = new Date(date + "T00:00:00"); d.setDate(d.getDate() + n); setDate(d.toISOString().slice(0, 10)); };
  const label = new Date(date + "T00:00:00").toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isToday = date === todayISO();

  const photo = c => (window.PHOTO_MAP && window.PHOTO_MAP[c.photo]) || (c && c.photo);

  const Column = ({ title, icon, list, locField }) => (
    <Panel pad={0} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderBottom: "1px solid var(--hairline-soft)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)" }}><Icon name={icon} size={18} /></div>
        <h3 className="display" style={{ fontSize: 18, flex: 1 }}>{title}</h3>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{list.length}</span>
      </div>
      {list.length === 0 ? (
        <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-3)", fontSize: 13.5 }}>{t("adm.sheet.none")}</div>
      ) : list.map(b => {
        const c = carById[b.carId];
        return (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--hairline-soft)" }}>
            <div style={{ width: 52, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--gold)", flexShrink: 0 }}>{b.time || "—"}</div>
            {c && <img src={photo(c)} alt="" style={{ width: 54, height: 36, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.customer || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.car || (c && c.name) || ""} · {b.id}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 1, minWidth: 0, maxWidth: 160 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", overflow: "hidden" }}><Icon name="pin" size={12} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{txLoc(t, b[locField])}</span></div>
              {b.phone && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>{b.phone}</div>}
            </div>
          </div>
        );
      })}
    </Panel>
  );

  return (
    <div>
      <PageHead title={t("adm.nav.daysheet")} sub={t("adm.sheet.sub")}>
        <button onClick={() => printDaySheet(label, pickups, returns, cars, t)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 11, fontSize: 14, fontWeight: 700, color: "var(--gold-ink)", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", border: "none" }}>
          <Icon name="copy" size={16} /> {t("adm.sheet.print")}
        </button>
      </PageHead>

      {/* date navigator */}
      <Panel pad={14} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => shift(-1)} style={navBtn}><Icon name="arrowL" size={16} /></button>
          <div style={{ flex: 1, textAlign: "center", minWidth: 180 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{label}</div>
            {isToday && <div style={{ fontSize: 11.5, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.04em" }}>{t("adm.sheet.today")}</div>}
          </div>
          <button onClick={() => shift(1)} style={navBtn}><Icon name="arrowR" size={16} /></button>
          <input type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "9px 12px", fontSize: 13 }} />
          {!isToday && <button onClick={() => setDate(todayISO())} style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", padding: "9px 12px" }}>{t("adm.sheet.gotoday")}</button>}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Column title={t("adm.sheet.pickups")} icon="arrowR" list={pickups} locField="pickup" />
        <Column title={t("adm.sheet.returns")} icon="arrowL" list={returns} locField="dropoff" />
      </div>
    </div>
  );
}

function Legend({ color, label, ring }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 14, height: 14, borderRadius: 4, background: ring ? "transparent" : color, border: ring ? `1.5px solid ${color}` : "1px solid var(--hairline-soft)" }} /> {label}
  </span>;
}
const navBtn = { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", color: "var(--text-2)" };

/* ---------- Fleet maintenance tracker ---------- */
function maintStatus(rec) {
  if (!rec) return { key: "ok", tone: "green" };
  if (rec.inService) return { key: "inservice", tone: "gold" };
  const today = new Date().toISOString().slice(0, 10);
  if (rec.nextService && rec.nextService < today) return { key: "overdue", tone: "red" };
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  if (rec.nextService && rec.nextService <= soon.toISOString().slice(0, 10)) return { key: "duesoon", tone: "gold" };
  return { key: "ok", tone: "green" };
}

function MaintenanceAdmin({ cars, maintenance, onMarkServiced, onSetInService, onUpdateMaintenance }) {
  const { t, lang } = useT();
  const mobile = useIsMobile(820);
  const fmtD = d => d ? new Date(d).toLocaleDateString(LOCALE[lang] || "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const rows = cars.map(c => ({ c, rec: maintenance[c.id] || {}, st: maintStatus(maintenance[c.id]) }));
  const order = { overdue: 0, duesoon: 1, inservice: 2, ok: 3 };
  rows.sort((a, b) => order[a.st.key] - order[b.st.key]);
  const counts = { overdue: 0, duesoon: 0, inservice: 0, ok: 0 };
  rows.forEach(r => { counts[r.st.key]++; });

  const summary = [
    { key: "overdue", tone: "red", icon: "alert" },
    { key: "duesoon", tone: "gold", icon: "clock" },
    { key: "inservice", tone: "gold", icon: "wrench" },
    { key: "ok", tone: "green", icon: "check" },
  ];

  return (
    <div>
      <PageHead title={t("adm.nav.maintenance")} sub={t("adm.maint.sub")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, marginBottom: 22 }}>
        {summary.map(s => (
          <Panel key={s.key} pad={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--surface-2)", color: s.tone === "red" ? "var(--red)" : s.tone === "green" ? "var(--green)" : "var(--gold)" }}>
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26 }}>{counts[s.key]}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{t("adm.maint." + s.key)}</div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel pad={0} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
              <th style={thStyle()}>{t("adm.maint.vehicle")}</th>
              <th style={thStyle()}>{t("adm.maint.status")}</th>
              <th style={thStyle()}>{t("adm.maint.last")}</th>
              <th style={thStyle()}>{t("adm.maint.next")}</th>
              <th style={thStyle()}>{t("adm.maint.odo")}</th>
              <th style={{ ...thStyle(true), paddingRight: 18 }}>{t("adm.maint.actions")}</th>
            </tr></thead>
            <tbody>
              {rows.map(({ c, rec, st }) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <img src={(window.PHOTO_MAP && window.PHOTO_MAP[c.photo]) || c.photo} alt="" style={{ width: 52, height: 34, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap" }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}><Badge tone={st.tone}>{t("adm.maint." + st.key)}</Badge></td>
                  <td style={{ ...tdStyle, color: "var(--text-2)", whiteSpace: "nowrap" }}>{fmtD(rec.lastService)}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: st.key === "overdue" ? "var(--red)" : "var(--text-2)", fontWeight: st.key === "overdue" ? 600 : 400 }}>{fmtD(rec.nextService)}</td>
                  <td style={{ ...tdStyle, color: "var(--text-2)", whiteSpace: "nowrap" }}>{rec.odometer ? rec.odometer.toLocaleString() + " km" : "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "right", paddingRight: 18, whiteSpace: "nowrap" }}>
                    <button onClick={() => onMarkServiced(c.id)} title={t("adm.maint.markserviced")} style={{ ...navBtn, width: "auto", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, marginRight: 6 }}>
                      <Icon name="check" size={14} /> {t("adm.maint.serviced")}
                    </button>
                    <button onClick={() => onSetInService(c.id, !rec.inService)} title={t("adm.maint.toggle")} style={{ ...navBtn, width: 34, height: 34, display: "inline-grid", color: rec.inService ? "var(--gold)" : "var(--text-3)" }}>
                      <Icon name="wrench" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

Object.assign(window, { FleetAdmin, CalendarAdmin, CarEditor, MaintenanceAdmin, maintStatus, DaySheetAdmin, printDaySheet });
