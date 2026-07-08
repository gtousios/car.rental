/* ============================================================
   APIRENTAL — Booking flow (multi-step)
   ============================================================ */
const { useState: useStateBk, useMemo: useMemoBk } = React;

const BOOK_STEPS = ["bk.trip", "bk.extras", "bk.details", "bk.payment"];

/* ---------- Printable booking voucher ---------- */
function printVoucher(b, ctx) {
  const { car, trip, days, info, total, t } = ctx;
  const esc = s => String(s == null ? "" : s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const row = (k, v) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(b.id)} — Apirental</title>
<style>
  @page { margin: 28mm 22mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #14161f; margin: 0; padding: 40px; }
  .wrap { max-width: 640px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6d5dfc; padding-bottom: 18px; margin-bottom: 26px; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .brand span { color: #6d5dfc; }
  .vlabel { font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .conf { font-family: monospace; font-size: 22px; font-weight: 700; color: #6d5dfc; letter-spacing: 0.06em; }
  h1 { font-size: 20px; margin: 0 0 18px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  td { padding: 11px 0; border-bottom: 1px solid #eceef3; font-size: 14px; vertical-align: top; }
  td.k { color: #888; width: 42%; }
  td.v { font-weight: 600; text-align: right; }
  .total td { border-top: 2px solid #14161f; border-bottom: none; font-size: 17px; font-weight: 800; padding-top: 14px; }
  .total td.v { color: #6d5dfc; }
  .note { font-size: 12px; color: #888; line-height: 1.6; border-top: 1px solid #eceef3; padding-top: 16px; }
  @media print { body { padding: 0; } }
</style></head><body><div class="wrap">
  <div class="head">
    <div class="brand">APIRENTAL<span>.</span></div>
    <div style="text-align:right"><div class="vlabel">${esc(t("confirm.conf"))}</div><div class="conf">${esc(b.id)}</div></div>
  </div>
  <h1>${esc(t("confirm.voucher"))}</h1>
  <table>
    ${row(t("bk.first") + " / " + t("bk.last"), (info && (info.first + " " + info.last)) || b.customer || "")}
    ${row(t("confirm.vehicle"), (car && car.name) || b.car || "")}
    ${row(t("bk.pickuploc"), txLoc(t, (trip && trip.pickup) || b.pickup))}
    ${row(t("bk.returnloc"), txLoc(t, (trip && trip.dropoff) || b.dropoff || b.pickup))}
    ${row(t("confirm.dates"), fmtDate((trip && trip.from) || b.from) + "  –  " + fmtDate((trip && trip.to) || b.to))}
    ${row(t("bk.daysnote", { n: (days || b.days || 1) }).split("·")[0].trim(), (trip && trip.time) || b.time || "—")}
    <tr class="total"><td class="k">${esc(t("confirm.total"))}</td><td class="v">${esc(fmtMoney(total != null ? total : b.total))}</td></tr>
  </table>
  <div class="note">${esc(t("confirm.sub", { email: (info && info.email) || b.email || "" }))}<br>Apirental · ${esc(t("bk.secure"))}</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

// VAT-inclusive invoice (Greece standard rate 24%). The stored total already
// includes VAT, so we back it out for the breakdown.
function printInvoice(b, ctx) {
  const { car, trip, days, info, total, t } = ctx;
  const VAT = 0.24;
  const gross = total != null ? total : b.total;
  const net = Math.round((gross / (1 + VAT)) * 100) / 100;
  const vat = Math.round((gross - net) * 100) / 100;
  const esc = s => String(s == null ? "" : s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const invNo = "INV-" + String(b.id || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const issued = new Date(b.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const row = (k, v, cls) => `<tr class="${cls || ""}"><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(invNo)} — Apirental</title>
<style>
  @page { margin: 26mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #14161f; margin: 0; padding: 40px; }
  .wrap { max-width: 660px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6d5dfc; padding-bottom: 18px; margin-bottom: 24px; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .brand span { color: #6d5dfc; }
  .brand small { display:block; font-size: 11px; font-weight: 500; color: #888; letter-spacing: 0; margin-top: 4px; }
  .vlabel { font-family: monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .conf { font-family: monospace; font-size: 19px; font-weight: 700; color: #6d5dfc; letter-spacing: 0.04em; }
  .meta { display:flex; gap: 40px; margin-bottom: 22px; }
  .meta .vlabel { margin-bottom: 6px; }
  .meta div p { margin: 0; font-size: 13.5px; line-height: 1.5; }
  h1 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color:#888; margin: 0 0 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td { padding: 10px 0; border-bottom: 1px solid #eceef3; font-size: 14px; }
  td.k { color: #555; } td.v { font-weight: 600; text-align: right; }
  tr.sub td { border-bottom: none; padding: 5px 0; color:#888; font-weight: 500; }
  tr.sub td.v { color:#555; }
  tr.total td { border-top: 2px solid #14161f; border-bottom: none; font-size: 18px; font-weight: 800; padding-top: 13px; }
  tr.total td.v { color: #6d5dfc; }
  .note { font-size: 11.5px; color: #888; line-height: 1.6; border-top: 1px solid #eceef3; padding-top: 14px; margin-top: 20px; }
  @media print { body { padding: 0; } }
</style></head><body><div class="wrap">
  <div class="head">
    <div class="brand">APIRENTAL<span>.</span><small>Apirental P.C. · Tsimiskí 22, Thessaloniki · VAT EL123456789</small></div>
    <div style="text-align:right"><div class="vlabel">${esc(t("inv.title"))}</div><div class="conf">${esc(invNo)}</div></div>
  </div>
  <div class="meta">
    <div><div class="vlabel">${esc(t("inv.billto"))}</div><p>${esc((info && (info.first + " " + info.last)) || b.customer || "")}<br>${esc((info && info.email) || b.email || "")}</p></div>
    <div><div class="vlabel">${esc(t("inv.issued"))}</div><p>${esc(issued)}</p></div>
    <div><div class="vlabel">${esc(t("confirm.conf"))}</div><p>${esc(b.id || "")}</p></div>
  </div>
  <h1>${esc(t("inv.details"))}</h1>
  <table>
    ${row(t("confirm.vehicle"), (car && car.name) || b.car || "")}
    ${row(t("confirm.dates"), fmtDate((trip && trip.from) || b.from) + "  –  " + fmtDate((trip && trip.to) || b.to) + "  ·  " + t("bk.daysnote", { n: (days || b.days || 1) }).split("·")[0].trim())}
    ${row(t("bk.pickuploc"), txLoc(t, (trip && trip.pickup) || b.pickup))}
    <tr class="sub"><td class="k">${esc(t("inv.net"))}</td><td class="v">${esc(fmtMoney(net))}</td></tr>
    <tr class="sub"><td class="k">${esc(t("inv.vat"))}</td><td class="v">${esc(fmtMoney(vat))}</td></tr>
    <tr class="total"><td class="k">${esc(t("inv.gross"))}</td><td class="v">${esc(fmtMoney(gross))}</td></tr>
  </table>
  <div class="note">${esc(t("inv.foot"))}<br>Apirental · ${esc(t("bk.secure"))}</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

function Stepper({ step }) {
  const { t } = useT();
  const mobile = useIsMobile(720);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {BOOK_STEPS.map((s, i) => {
        const done = i < step, active = i === step;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
                background: active ? "linear-gradient(120deg,var(--gold),var(--gold-dim))" : done ? "var(--gold-glow)" : "var(--surface-2)",
                color: active ? "var(--gold-ink)" : done ? "var(--gold-hi)" : "var(--text-3)",
                border: active ? "none" : done ? "1px solid var(--gold-glow)" : "1px solid var(--hairline-soft)",
                transition: "all .3s",
              }}>{done ? <Icon name="check" size={15} /> : i + 1}</div>
              {(!mobile || active) && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "var(--text)" : done ? "var(--text-2)" : "var(--text-3)" }}>{t(s)}</span>}
            </div>
            {i < BOOK_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, margin: "0 14px", background: done ? "var(--gold)" : "var(--hairline-soft)", transition: "background .3s", minWidth: 18 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---------- shared booking pricing ---------- */
function priceBooking(car, from, to, addonsMap, freeIds) {
  const free = freeIds || [];
  const days = Math.max(1, daysBetween(from, to));
  const base = car.price * days;
  const addonTotal = ADDONS.reduce((sum, a) => {
    const q = (addonsMap && addonsMap[a.id]) || 0;
    if (free.indexOf(a.id) !== -1) return sum;   // tier-free add-on
    return sum + (a.unit === "day" ? a.price * q * days : a.price * q);
  }, 0);
  const fees = Math.round(base * 0.08);
  return { days, base, addonTotal, fees, total: base + addonTotal + fees };
}
function addonsArrToMap(arr) {
  const m = { ins: 0, gps: 0, seat: 0, drv: 0, del: 0, fuel: 0 };
  (arr || []).forEach(a => { if (a && a.id != null) m[a.id] = a.qty; });
  return m;
}
function addonsMapToArr(map) {
  return ADDONS.filter(a => map[a.id]).map(a => ({ id: a.id, name: a.name, qty: map[a.id], unit: a.unit }));
}

function QtyStepper({ value, onChange, max = 4 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--hairline-soft)", borderRadius: 999, overflow: "hidden", background: "var(--bg-2)" }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 34, height: 34, display: "grid", placeItems: "center", color: "var(--text-2)" }}><Icon name="minus" size={15} /></button>
      <span style={{ width: 26, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 34, height: 34, display: "grid", placeItems: "center", color: "var(--gold)" }}><Icon name="plus" size={15} /></button>
    </div>
  );
}

function BookingFlow({ car, bookings = [], promos = [], member = null, user, onClose, onComplete, initialTrip }) {
  const { t } = useT();
  const mobile = useIsMobile(720);
  const [step, setStep] = useStateBk(0);
  const [trip, setTrip] = useStateBk(initialTrip || {
    pickup: car.location, dropoff: car.location,
    from: "2026-06-18", to: "2026-06-21", time: "10:00",
  });
  const [addons, setAddons] = useStateBk({ ins: 0, gps: 0, seat: 0, drv: 0, del: 0, fuel: 0 });
  const [info, setInfo] = useStateBk(() => {
    const parts = (user && user.name || "").trim().split(/\s+/).filter(Boolean);
    return { first: parts[0] || "", last: parts.slice(1).join(" "), email: (user && user.email) || "", phone: "", license: "", age: "30+" };
  });
  const [pay, setPay] = useStateBk({ card: "", name: "", exp: "", cvc: "" });
  const [payMethod, setPayMethod] = useStateBk("card");   // card | paypal | apple | google
  const [promoInput, setPromoInput] = useStateBk("");
  const [promo, setPromo] = useStateBk(null);     // applied { code, discount, type, value }
  const [promoErr, setPromoErr] = useStateBk("");
  const [redeem, setRedeem] = useStateBk(false);   // redeem loyalty points?
  const [keyless, setKeyless] = useStateBk(false); // keyless digital unlock
  const [confirmed, setConfirmed] = useStateBk(null);

  // Loyalty: tier perks (auto % discount + free add-ons) and points redemption.
  const tierInfo = loyaltyTier(member ? member.spend : 0);
  const memberPoints = member ? member.points : 0;
  const freeIds = tierInfo.freeAddons || [];

  const conflicts = carConflicts(bookings, car.id, trip.from, trip.to);
  const available = conflicts.length === 0;
  const priced = priceBooking(car, trip.from, trip.to, addons, freeIds);
  const { days, base, addonTotal, fees } = priced;
  const subtotal = priced.total;
  const tierDiscount = Math.round(subtotal * (tierInfo.discount || 0) / 100);
  const afterTier = Math.max(0, subtotal - tierDiscount);
  const promoDiscount = promo ? Math.min(promo.discount, afterTier) : 0;
  const afterPromo = Math.max(0, afterTier - promoDiscount);
  const maxRedeemEuros = Math.min(pointsToEuros(memberPoints), afterPromo);
  const canRedeem = memberPoints >= (typeof LOYALTY !== "undefined" ? LOYALTY.minRedeem : 500) && maxRedeemEuros > 0;
  const pointsEuros = (redeem && canRedeem) ? maxRedeemEuros : 0;
  const pointsSpent = pointsEuros * (typeof LOYALTY !== "undefined" ? LOYALTY.redeemRate : 100);
  const rentalTotal = Math.max(0, afterPromo - pointsEuros);
  // Keyless entry: free for higher tiers, otherwise a flat fee.
  const keylessFeeAmt = (typeof KEYLESS_FEE !== "undefined" ? KEYLESS_FEE : 9);
  const keylessFree = !!tierInfo.keylessFree;
  const keylessFee = keyless ? (keylessFree ? 0 : keylessFeeAmt) : 0;
  const total = rentalTotal + keylessFee;
  const pointsEarned = rentalTotal * (typeof LOYALTY !== "undefined" ? LOYALTY.perEuro : 10);
  const discount = promoDiscount;   // (kept for the existing promo summary line)

  const applyPromo = () => {
    const res = validatePromo(promoInput, afterTier, promos);
    if (res.ok) { setPromo({ code: res.promo.code, discount: res.discount, type: res.promo.type, value: res.promo.value }); setPromoErr(""); }
    else { setPromo(null); setPromoErr(res.reason); }
  };
  const clearPromo = () => { setPromo(null); setPromoInput(""); setPromoErr(""); };

  const next = () => setStep(s => Math.min(BOOK_STEPS.length, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const canNext = () => {
    if (step === 0) return trip.from && trip.to && days >= 1 && available;
    if (step === 2) return info.first && info.last && info.email.includes("@") && info.phone;
    if (step === 3) return payMethod !== "card" || (pay.card.replace(/\s/g, "").length >= 15 && pay.name && pay.exp && pay.cvc.length >= 3);
    return true;
  };

  const finish = () => {
    const id = "AP-" + Math.floor(4900 + Math.random() * 99);
    const selectedAddons = ADDONS
      .filter(a => addons[a.id])
      .map(a => ({ id: a.id, name: a.name, qty: addons[a.id], unit: a.unit }));
    const booking = {
      id, carId: car.id, car: car.name,
      customer: `${info.first} ${info.last}`,
      email: info.email, phone: info.phone, license: info.license, age: info.age,
      from: trip.from, to: trip.to, time: trip.time,
      pickup: trip.pickup, dropoff: trip.dropoff,
      days, addons: selectedAddons, status: "Upcoming", total,
      promoCode: promo ? promo.code : null, discount: promoDiscount,
      tierDiscount, tier: tierInfo.id,
      keyless, keylessFee,
      pointsEarned, pointsRedeemed: pointsSpent,
      paymentMethod: payMethod,
      createdAt: new Date().toISOString(),
    };
    setConfirmed(booking);
    onComplete?.(booking);
  };

  /* ---------- Confirmation ---------- */
  if (confirmed) {
    return (
      <div style={{ padding: "44px 40px", textAlign: "center" }}>
        <div className="pop-in" style={{ width: 76, height: 76, borderRadius: 999, margin: "0 auto 22px", display: "grid", placeItems: "center",
          background: "var(--gold-glow)", color: "var(--gold)", border: "1px solid var(--gold-glow)" }}>
          <Icon name="checkCircle" size={40} stroke={1.5} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>{t("confirm.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: 30, marginBottom: 10 }}>{t("confirm.title", { name: info.first })}</h2>
        <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 380, margin: "0 auto 26px", lineHeight: 1.5 }}>
          {t("confirm.sub", { email: info.email })}
        </p>
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: "var(--r)", padding: "20px 22px", textAlign: "left", maxWidth: 420, margin: "0 auto 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--hairline-soft)" }}>
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("confirm.conf")}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 700, letterSpacing: "0.06em" }}>{confirmed.id}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px", fontSize: 13.5 }}>
            <div><div style={{ color: "var(--text-3)", marginBottom: 3 }}>{t("confirm.vehicle")}</div><div style={{ fontWeight: 600 }}>{car.name}</div></div>
            <div><div style={{ color: "var(--text-3)", marginBottom: 3 }}>{t("confirm.pickup")}</div><div style={{ fontWeight: 600 }}>{txLoc(t, trip.pickup)}</div></div>
            <div><div style={{ color: "var(--text-3)", marginBottom: 3 }}>{t("confirm.dates")}</div><div style={{ fontWeight: 600 }}>{fmtDate(trip.from)} – {fmtDate(trip.to)}</div></div>
            <div><div style={{ color: "var(--text-3)", marginBottom: 3 }}>{t("confirm.total")}</div><div style={{ fontWeight: 700, color: "var(--gold)" }}>{fmtMoney(total)}</div></div>
          </div>
          {promo && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--hairline-soft)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--green)", fontSize: 13, fontWeight: 600 }}>
                <Icon name="tag" size={14} /> {promo.code}
              </span>
              <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13.5 }}>{t("confirm.saved", { amount: fmtMoney(discount) })}</span>
            </div>
          )}
          {pointsEarned > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--hairline-soft)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                <Icon name="trophy" size={14} /> {t("loy.earnedLabel")}
              </span>
              <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13.5 }}>+{pointsEarned.toLocaleString()} {t("loy.points")}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="dark" size="lg" icon="copy" onClick={() => printVoucher(confirmed, { car, trip, days, info, total, t, lang })}>{t("confirm.voucher")}</Button>
          <Button variant="dark" size="lg" icon="card" onClick={() => printInvoice(confirmed, { car, trip, days, info, total, t })}>{t("inv.download")}</Button>
          <Button variant="primary" size="lg" onClick={onClose} iconRight="arrowR">{t("confirm.back")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.55fr 1fr", minHeight: mobile ? 0 : 480 }}>
      {/* LEFT — steps */}
      <div style={{ padding: mobile ? "22px 18px" : "30px 34px", borderRight: mobile ? "none" : "1px solid var(--hairline-soft)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div className="eyebrow">{t("bk.step", { n: step + 1 })}</div>
          <button onClick={onClose} style={{ color: "var(--text-3)", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ marginBottom: 30 }}><Stepper step={step} /></div>

        {/* STEP 0 — Trip */}
        {step === 0 && (
          <div className="fade-in" style={{ display: "grid", gap: 18 }}>
            <h3 className="display" style={{ fontSize: 21 }}>{t("bk.when")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              <Field label={t("bk.pickuploc")}>
                <Select value={trip.pickup} onChange={e => setTrip({ ...trip, pickup: e.target.value, dropoff: e.target.value })}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}
                </Select>
              </Field>
              <Field label={t("bk.returnloc")}>
                <Select value={trip.dropoff} onChange={e => setTrip({ ...trip, dropoff: e.target.value })}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}
                </Select>
              </Field>
              <Field label={t("bk.pickupdate")}>
                <TextInput type="date" value={trip.from} min="2026-06-07" onChange={e => setTrip({ ...trip, from: e.target.value })} />
              </Field>
              <Field label={t("bk.returndate")}>
                <TextInput type="date" value={trip.to} min={trip.from} onChange={e => setTrip({ ...trip, to: e.target.value })} />
              </Field>
            </div>
            <Field label={t("bk.pickuptime")}>
              <Select value={trip.time} onChange={e => setTrip({ ...trip, time: e.target.value })}>
                {["08:00","10:00","12:00","14:00","16:00","18:00"].map(tm => <option key={tm}>{tm}</option>)}
              </Select>
            </Field>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--hairline-soft)", color: "var(--text-2)", fontSize: 13 }}>
              <Icon name="clock" size={17} style={{ color: "var(--gold)" }} />
              {t("bk.daysnote", { n: days })}
            </div>
            {available ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid rgba(111,207,151,0.4)", color: "var(--green)", fontSize: 13 }}>
                <Icon name="check" size={17} />
                {t("bk.available")}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--red)", color: "var(--red)", fontSize: 13 }}>
                <Icon name="x" size={17} />
                {t("bk.unavail")}
              </div>
            )}
            {(() => {
              const upcoming = (bookings || [])
                .filter(b => b.carId === car.id && b.status !== "Cancelled" && b.to >= "2026-06-07")
                .sort((a, b) => a.from.localeCompare(b.from));
              if (!upcoming.length) return null;
              const shown = upcoming.slice(0, 4);
              return (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "11px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--hairline-soft)", fontSize: 12.5 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--text-3)", fontWeight: 600 }}>
                    <Icon name="calendar" size={15} style={{ color: "var(--text-3)" }} /> {t("bk.bookednote")}
                  </span>
                  {shown.map((b, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", color: "var(--text-2)", fontWeight: 600 }}>
                      {fmtDate(b.from)} – {fmtDate(b.to)}
                    </span>
                  ))}
                  {upcoming.length > shown.length && (
                    <span style={{ color: "var(--text-3)" }}>{t("bk.bookedmore", { n: upcoming.length - shown.length })}</span>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP 1 — Extras */}
        {step === 1 && (
          <div className="fade-in" style={{ display: "grid", gap: 12 }}>
            <h3 className="display" style={{ fontSize: 21, marginBottom: 4 }}>{t("bk.tailor")}</h3>
            {ADDONS.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "13px 16px", background: addons[a.id] ? "var(--surface-2)" : "var(--bg-2)", border: `1px solid ${addons[a.id] ? "rgba(212,175,55,0.25)" : "var(--hairline-soft)"}`, borderRadius: 12, transition: "all .2s" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8 }}>
                    {t("addon." + a.id)}
                    {freeIds.indexOf(a.id) !== -1 && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", background: "rgba(111,207,151,0.15)", border: "1px solid rgba(111,207,151,0.4)", borderRadius: 999, padding: "2px 8px", letterSpacing: "0.02em" }}>{t("loy.freeWith", { tier: tierInfo.id })}</span>}
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>{t("addon." + a.id + ".d")} · {freeIds.indexOf(a.id) !== -1 ? t("loy.free") : `${fmtMoney(a.price)}/${t("unit." + a.unit)}`}</div>
                </div>
                <QtyStepper value={addons[a.id]} onChange={v => setAddons({ ...addons, [a.id]: v })} max={a.id === "drv" || a.id === "seat" ? 3 : 1} />
              </div>
            ))}

            {/* Keyless digital entry */}
            <button type="button" onClick={() => setKeyless(k => !k)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, width: "100%", textAlign: "left", padding: "13px 16px", background: keyless ? "var(--surface-2)" : "var(--bg-2)", border: `1px solid ${keyless ? "rgba(212,175,55,0.35)" : "var(--hairline-soft)"}`, borderRadius: 12, transition: "all .2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, display: "grid", placeItems: "center", background: keyless ? "var(--gold-glow)" : "var(--surface-2)", color: keyless ? "var(--gold)" : "var(--text-3)" }}>
                  <Icon name="phone" size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {t("keyless.title")}
                    {keylessFree && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", background: "rgba(111,207,151,0.15)", border: "1px solid rgba(111,207,151,0.4)", borderRadius: 999, padding: "2px 8px" }}>{t("loy.freeWith", { tier: tierInfo.id })}</span>}
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>{t("keyless.desc")} · {keylessFree ? t("loy.free") : fmtMoney(keylessFeeAmt)}</div>
                </div>
              </div>
              <span style={{ width: 44, height: 26, flexShrink: 0, borderRadius: 999, background: keyless ? "var(--gold)" : "var(--surface-2)", border: "1px solid var(--hairline)", position: "relative", transition: "background .2s" }}>
                <span style={{ position: "absolute", top: 2, left: keyless ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: keyless ? "var(--gold-ink)" : "var(--text-3)", transition: "left .2s" }} />
              </span>
            </button>
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div className="fade-in" style={{ display: "grid", gap: 16 }}>
            <h3 className="display" style={{ fontSize: 21 }}>{t("bk.driver")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              <Field label={t("bk.first")}><TextInput value={info.first} placeholder="Sophia" onChange={e => setInfo({ ...info, first: e.target.value })} /></Field>
              <Field label={t("bk.last")}><TextInput value={info.last} placeholder="Laurent" onChange={e => setInfo({ ...info, last: e.target.value })} /></Field>
              <Field label={t("bk.email")}><TextInput type="email" value={info.email} placeholder="you@email.com" onChange={e => setInfo({ ...info, email: e.target.value })} /></Field>
              <Field label={t("bk.phone")}><TextInput value={info.phone} placeholder="+30 ..." onChange={e => setInfo({ ...info, phone: e.target.value })} /></Field>
              <Field label={t("bk.license")}><TextInput value={info.license} placeholder="DL-00000000" onChange={e => setInfo({ ...info, license: e.target.value })} /></Field>
              <Field label={t("bk.age")}>
                <Select value={info.age} onChange={e => setInfo({ ...info, age: e.target.value })}>
                  {["21–24","25–29","30+"].map(a => <option key={a}>{a}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 3 — Payment */}
        {step === 3 && (
          <div className="fade-in" style={{ display: "grid", gap: 16 }}>
            <h3 className="display" style={{ fontSize: 21 }}>{t("bk.payment")}</h3>

            {/* Payment method selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { id: "card", label: t("bk.pm.card"), icon: "card" },
                { id: "paypal", label: "PayPal", icon: null },
                { id: "apple", label: t("bk.pm.apple"), icon: null },
                { id: "google", label: t("bk.pm.google"), icon: null },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setPayMethod(m.id)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 6px", borderRadius: 12, minHeight: 64,
                  background: payMethod === m.id ? "var(--bg-2)" : "transparent",
                  border: `1.5px solid ${payMethod === m.id ? "var(--gold)" : "var(--hairline-soft)"}`,
                  boxShadow: payMethod === m.id ? "0 0 0 3px var(--gold-glow)" : "none", transition: "all .15s",
                }}>
                  {m.icon ? <Icon name={m.icon} size={19} style={{ color: payMethod === m.id ? "var(--gold)" : "var(--text-2)" }} /> : <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color: payMethod === m.id ? "var(--gold)" : "var(--text-2)" }}>{m.id === "paypal" ? "Pay" : m.id === "apple" ? "" : "G"}</span>}
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: payMethod === m.id ? "var(--text)" : "var(--text-3)" }}>{m.label}</span>
                </button>
              ))}
            </div>

            {payMethod === "card" ? (
              <>
                <Field label={t("bk.cardnum")}>
                  <TextInput value={pay.card} placeholder="4242 4242 4242 4242" maxLength={19}
                    onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); setPay({ ...pay, card: v }); }} />
                </Field>
                <Field label={t("bk.cardname")}><TextInput value={pay.name} placeholder="SOPHIA LAURENT" onChange={e => setPay({ ...pay, name: e.target.value })} /></Field>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                  <Field label={t("bk.expiry")}><TextInput value={pay.exp} placeholder="MM / YY" maxLength={7}
                    onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + " / " + v.slice(2); setPay({ ...pay, exp: v }); }} /></Field>
                  <Field label={t("bk.cvc")}><TextInput value={pay.cvc} placeholder="123" maxLength={4} onChange={e => setPay({ ...pay, cvc: e.target.value.replace(/\D/g, "") })} /></Field>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "30px 22px", background: "var(--bg-2)", borderRadius: 12, border: "1px solid var(--hairline-soft)", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface)", border: "1px solid var(--hairline-soft)", fontWeight: 800, fontSize: 17 }}>
                  {payMethod === "paypal" ? "P" : payMethod === "apple" ? "" : "G"}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{t("bk.pm.redirect", { method: payMethod === "paypal" ? "PayPal" : payMethod === "apple" ? "Apple Pay" : "Google Pay" })}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-3)", maxWidth: 320 }}>{t("bk.pm.redirectsub")}</div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--hairline-soft)", color: "var(--text-2)", fontSize: 12.5 }}>
              <Icon name="shield" size={17} style={{ color: "var(--green)" }} />
              {t("bk.secure")}
            </div>

            {/* Promo code */}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>{t("promo.label")}</div>
              {promo ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: "var(--bg-2)", border: "1px solid rgba(111,207,151,0.45)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <Icon name="check" size={16} style={{ color: "var(--green)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13.5, color: "var(--green)" }}>{promo.code}</span>
                    <span style={{ color: "var(--text-3)", fontSize: 12.5 }}>· {promo.type === "percent" ? `${promo.value}% ${t("promo.off")}` : `${fmtMoney(promo.value)} ${t("promo.off")}`}</span>
                  </div>
                  <button onClick={clearPromo} aria-label="Remove" style={{ color: "var(--text-3)", display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, flexShrink: 0 }}><Icon name="x" size={16} /></button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={promoInput} placeholder={t("promo.placeholder")}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoErr(""); }}
                    onKeyDown={e => { if (e.key === "Enter") applyPromo(); }}
                    style={{ ...inputStyle, flex: 1, textTransform: "uppercase", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }} />
                  <Button variant="dark" onClick={applyPromo} disabled={!promoInput.trim()} style={{ opacity: promoInput.trim() ? 1 : 0.45, pointerEvents: promoInput.trim() ? "auto" : "none" }}>{t("promo.apply")}</Button>
                </div>
              )}
              {promoErr && <div style={{ marginTop: 7, fontSize: 12.5, color: "var(--red)", display: "flex", alignItems: "center", gap: 6 }}><Icon name="x" size={13} /> {t("promo.err." + promoErr)}</div>}
            </div>

            {/* Loyalty points redemption */}
            {member && memberPoints > 0 && (
              <button type="button" onClick={() => canRedeem && setRedeem(r => !r)} disabled={!canRedeem}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", padding: "13px 15px", background: "var(--bg-2)", border: `1px solid ${redeem && canRedeem ? "rgba(111,207,151,0.5)" : "var(--hairline-soft)"}`, borderRadius: 11, textAlign: "left", cursor: canRedeem ? "pointer" : "default", opacity: canRedeem ? 1 : 0.6 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon name="trophy" size={15} style={{ color: "var(--gold)" }} />
                    {t("loy.redeemTitle")}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>
                    {canRedeem ? t("loy.redeemSub", { points: memberPoints.toLocaleString(), amount: fmtMoney(maxRedeemEuros) }) : t("loy.redeemMin", { min: (typeof LOYALTY !== "undefined" ? LOYALTY.minRedeem : 500).toLocaleString() })}
                  </div>
                </div>
                <span style={{ width: 42, height: 24, flexShrink: 0, borderRadius: 999, background: redeem && canRedeem ? "var(--gold)" : "var(--surface-2)", border: "1px solid var(--hairline)", position: "relative", transition: "background .2s" }}>
                  <span style={{ position: "absolute", top: 2, left: redeem && canRedeem ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: redeem && canRedeem ? "var(--gold-ink)" : "var(--text-3)", transition: "left .2s" }} />
                </span>
              </button>
            )}
          </div>
        )}

        {/* NAV */}
        <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
          {step > 0 && <Button variant="ghost" icon="arrowL" onClick={back}>{t("bk.back")}</Button>}
          <div style={{ flex: 1 }} />
          {step < 3 && <Button variant="primary" iconRight="arrowR" onClick={next} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.45, pointerEvents: canNext() ? "auto" : "none" }}>{t("bk.continue")}</Button>}
          {step === 3 && <Button variant="primary" icon="check" onClick={finish} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.45, pointerEvents: canNext() ? "auto" : "none" }}>{t("bk.pay", { amount: fmtMoney(total) })}</Button>}
        </div>
      </div>

      {/* RIGHT — summary */}
      <div style={{ padding: mobile ? "22px 18px" : "30px 28px", background: "var(--bg-2)", display: "flex", flexDirection: "column", borderTop: mobile ? "1px solid var(--hairline-soft)" : "none" }}>
        <CarImage car={car} height={130} rounded={12} showLabel={false} />
        <div style={{ marginTop: 16 }}>
          <Badge tone="gold" style={{ marginBottom: 8 }}>{txCat(t, car.category)}</Badge>
          <h4 className="display" style={{ fontSize: 18 }}>{car.name}</h4>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, color: "var(--text-3)", fontSize: 12.5 }}>
            <Stars value={car.rating} /> · {car.trips} {t("bk.tripsword")}
          </div>
        </div>
        <div style={{ height: 1, background: "var(--hairline-soft)", margin: "20px 0" }} />
        <div style={{ display: "grid", gap: 11, fontSize: 13.5 }}>
          <Row label={`${fmtMoney(car.price)} × ${days} ${t("unit.day")}`} value={fmtMoney(base)} />
          {ADDONS.filter(a => addons[a.id]).map(a => (
            <Row key={a.id} label={`${t("addon." + a.id)}${addons[a.id] > 1 ? ` ×${addons[a.id]}` : ""}`} value={freeIds.indexOf(a.id) !== -1 ? t("loy.free") : fmtMoney(a.unit === "day" ? a.price * addons[a.id] * days : a.price * addons[a.id])} sub />
          ))}
          <Row label={t("bk.taxes")} value={fmtMoney(fees)} sub />
          {tierDiscount > 0 && <Row label={`${tierInfo.id} ${t("loy.perk")} (${tierInfo.discount}%)`} value={`−${fmtMoney(tierDiscount)}`} discount />}
          {promo && <Row label={`${t("promo.discount")} (${promo.code})`} value={`−${fmtMoney(promoDiscount)}`} discount />}
          {pointsEuros > 0 && <Row label={`${t("loy.pointsUsed")} (${pointsSpent.toLocaleString()})`} value={`−${fmtMoney(pointsEuros)}`} discount />}
          {keyless && <Row label={t("keyless.title")} value={keylessFree ? t("loy.free") : fmtMoney(keylessFee)} sub />}
        </div>
        <div style={{ height: 1, background: "var(--hairline-soft)", margin: "18px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600 }}>{t("bk.total")}</span>
          <span className="display gold-text" style={{ fontSize: 28 }}>{fmtMoney(total)}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 12 }}>
          <Icon name="shield" size={15} style={{ color: "var(--gold)" }} /> {t("bk.bestprice")}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sub, discount }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: discount ? "var(--green)" : sub ? "var(--text-2)" : "var(--text)" }}>
      <span>{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ============================================================
   Modify an existing booking — focused modal (dates, locations,
   time, add-ons) with live re-pricing and availability check.
   Used by both the customer (My Trips) and admin (Bookings).
   ============================================================ */
function ModifyBooking({ booking, car, bookings = [], onSave, onClose }) {
  const { t } = useT();
  const mobile = useIsMobile(620);
  const [trip, setTrip] = useStateBk({
    from: booking.from, to: booking.to, time: booking.time || "10:00",
    pickup: booking.pickup, dropoff: booking.dropoff || booking.pickup,
  });
  const [addons, setAddons] = useStateBk(() => addonsArrToMap(booking.addons));

  const priceCar = car || { price: booking.total && booking.days ? Math.round(booking.total / 1.08 / Math.max(1, booking.days)) : 0, name: booking.car };
  const priced = priceBooking(priceCar, trip.from, trip.to, addons);
  // Availability ignores THIS booking so keeping the same dates is always allowed.
  const conflicts = carConflicts(bookings, booking.carId, trip.from, trip.to, booking.id);
  const available = conflicts.length === 0;
  const oldTotal = booking.total;
  const diff = priced.total - oldTotal;

  const dirty = trip.from !== booking.from || trip.to !== booking.to ||
    trip.pickup !== booking.pickup || trip.dropoff !== (booking.dropoff || booking.pickup) ||
    trip.time !== (booking.time || "10:00") || priced.total !== oldTotal;

  const save = () => {
    if (!available || !trip.from || !trip.to || priced.days < 1) return;
    onSave({
      ...booking,
      from: trip.from, to: trip.to, time: trip.time,
      pickup: trip.pickup, dropoff: trip.dropoff,
      days: priced.days, addons: addonsMapToArr(addons), total: priced.total,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", maxHeight: mobile ? "82vh" : "86vh" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: mobile ? "22px 20px 0" : "28px 30px 0" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 9 }}>{t("mod.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{booking.car || (car && car.name)}</h2>
          <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{booking.id}</div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ color: "var(--text-3)", display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 8, flexShrink: 0 }}><Icon name="x" size={18} /></button>
      </div>

      <div style={{ overflowY: "auto", padding: mobile ? "18px 20px" : "22px 30px", display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <Field label={t("bk.pickuploc")}>
            <Select value={trip.pickup} onChange={e => setTrip({ ...trip, pickup: e.target.value, dropoff: e.target.value })}>
              {LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}
            </Select>
          </Field>
          <Field label={t("bk.returnloc")}>
            <Select value={trip.dropoff} onChange={e => setTrip({ ...trip, dropoff: e.target.value })}>
              {LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}
            </Select>
          </Field>
          <Field label={t("bk.pickupdate")}>
            <TextInput type="date" value={trip.from} min="2026-06-07" onChange={e => setTrip({ ...trip, from: e.target.value, to: trip.to < e.target.value ? e.target.value : trip.to })} />
          </Field>
          <Field label={t("bk.returndate")}>
            <TextInput type="date" value={trip.to} min={trip.from} onChange={e => setTrip({ ...trip, to: e.target.value })} />
          </Field>
        </div>
        <Field label={t("bk.pickuptime")}>
          <Select value={trip.time} onChange={e => setTrip({ ...trip, time: e.target.value })}>
            {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(tm => <option key={tm}>{tm}</option>)}
          </Select>
        </Field>

        {available ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid rgba(111,207,151,0.4)", color: "var(--green)", fontSize: 13 }}>
            <Icon name="check" size={16} /> {t("bk.available")} · {t("bk.daysnote", { n: priced.days }).split("·")[0].trim()}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--red)", color: "var(--red)", fontSize: 13 }}>
            <Icon name="x" size={16} /> {t("bk.unavail")}
          </div>
        )}

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", margin: "4px 0 10px" }}>{t("bk.tailor")}</div>
          <div style={{ display: "grid", gap: 9 }}>
            {ADDONS.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "11px 14px", background: addons[a.id] ? "var(--surface-2)" : "var(--bg-2)", border: `1px solid ${addons[a.id] ? "var(--gold-glow)" : "var(--hairline-soft)"}`, borderRadius: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t("addon." + a.id)}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>{fmtMoney(a.price)}/{t("unit." + a.unit)}</div>
                </div>
                <QtyStepper value={addons[a.id]} onChange={v => setAddons({ ...addons, [a.id]: v })} max={a.id === "drv" || a.id === "seat" ? 3 : 1} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* price + actions */}
      <div style={{ borderTop: "1px solid var(--hairline-soft)", padding: mobile ? "16px 20px" : "18px 30px", background: "var(--bg-2)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>{t("mod.oldTotal")}</span>
          <span style={{ color: "var(--text-3)", fontSize: 14, textDecoration: diff !== 0 ? "line-through" : "none" }}>{fmtMoney(oldTotal)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: diff !== 0 ? 6 : 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>{t("mod.newTotal")}</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>{fmtMoney(priced.total)}</span>
        </div>
        {diff !== 0 && (
          <div style={{ textAlign: "right", fontSize: 12.5, fontWeight: 600, color: diff > 0 ? "var(--amber)" : "var(--green)" }}>
            {diff > 0 ? t("mod.more", { amount: fmtMoney(diff) }) : t("mod.less", { amount: fmtMoney(-diff) })}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>{t("trips.keep")}</Button>
          <Button variant="primary" iconRight="check" onClick={save} disabled={!available || !dirty}
            style={{ flex: 2, opacity: (available && dirty) ? 1 : 0.45, pointerEvents: (available && dirty) ? "auto" : "none" }}>{t("mod.save")}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BookingFlow, ModifyBooking, priceBooking, printVoucher, printInvoice });
