/* ============================================================
   APIRENTAL — Static pages: How it works + Concierge
   ============================================================ */
const { useState: useStateP } = React;

function PageHero({ eyebrow, title, sub }) {
  const mobile = useIsMobile(760);
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -180, right: -60, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, var(--gold-glow), transparent 65%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "44px 18px 16px" : "70px 32px 20px", position: "relative" }}>
        <div className="fade-in" style={{ maxWidth: 720 }}>
          <div className="eyebrow" style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 1, background: "var(--gold)" }} /> {eyebrow}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(38px, 5vw, 62px)", lineHeight: 1.0, marginBottom: 18 }}>{title}</h1>
          <p style={{ fontSize: 18, color: "var(--text-2)", maxWidth: 540, lineHeight: 1.5 }}>{sub}</p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
function HowItWorksPage({ go }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const steps = [
    { icon: "search", t: "hp.s1t", d: "hp.s1d" },
    { icon: "calendar", t: "hp.s2t", d: "hp.s2d" },
    { icon: "car", t: "hp.s3t", d: "hp.s3d" },
  ];
  const requirements = [
    { icon: "users", t: "hp.r1t", d: "hp.r1d" },
    { icon: "shield", t: "hp.r2t", d: "hp.r2d" },
    { icon: "card", t: "hp.r3t", d: "hp.r3d" },
    { icon: "clock", t: "hp.r4t", d: "hp.r4d" },
  ];
  const faqs = [
    { q: "hp.q1", a: "hp.a1" }, { q: "hp.q2", a: "hp.a2" }, { q: "hp.q3", a: "hp.a3" },
    { q: "hp.q4", a: "hp.a4" }, { q: "hp.q5", a: "hp.a5" }, { q: "hp.q6", a: "hp.a6" },
  ];

  return (
    <div className="fade-in">
      <PageHero eyebrow={t("hp.eyebrow")}
        title={<>{t("hp.title1")}<br /><span className="gold-text">{t("hp.title2")}</span></>}
        sub={t("hp.sub")} />

      {/* steps */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "30px 18px" : "40px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 22 }}>
          {steps.map((s, i) => (
            <div key={s.t} style={{ padding: "30px 28px", background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", position: "relative" }}>
              <div style={{ position: "absolute", top: 26, right: 28, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold-dim)" }}>0{i + 1}</div>
              <div style={{ width: 54, height: 54, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)", marginBottom: 22 }}>
                <Icon name={s.icon} size={25} />
              </div>
              <h3 className="display" style={{ fontSize: 21, marginBottom: 10 }}>{t(s.t)}</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.6 }}>{t(s.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* requirements */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 32px" }}>
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-xl)", padding: mobile ? "28px 22px" : "42px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "300px 1fr", gap: mobile ? 24 : 40, alignItems: "start" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{t("hp.req.eyebrow")}</div>
              <h2 className="display" style={{ fontSize: 30, lineHeight: 1.1 }}>{t("hp.req.title")}</h2>
              <p style={{ color: "var(--text-3)", fontSize: 14.5, marginTop: 14, lineHeight: 1.6 }}>{t("hp.req.sub")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: "26px 32px" }}>
              {requirements.map(r => (
                <div key={r.t} style={{ display: "flex", gap: 15 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--surface)", border: "1px solid var(--hairline-soft)", color: "var(--gold)", flexShrink: 0 }}>
                    <Icon name={r.icon} size={21} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 4 }}>{t(r.t)}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 13.5, lineHeight: 1.5 }}>{t(r.d)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "44px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t("hp.faq.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 32 }}>{t("hp.faq.title")}</h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {faqs.map((f, i) => <FaqItem key={i} q={t(f.q)} a={t(f.a)} defaultOpen={i === 0} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 32px 60px" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", border: "1px solid var(--hairline)", background: "linear-gradient(120deg, var(--surface), var(--bg-2))", padding: "48px 44px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 480, height: 320, background: "radial-gradient(circle, var(--gold-glow), transparent 65%)", pointerEvents: "none" }} />
          <h2 className="display" style={{ fontSize: 36, marginBottom: 12, position: "relative" }}>{t("hp.cta.title")}</h2>
          <p style={{ color: "var(--text-2)", fontSize: 16, marginBottom: 26, position: "relative" }}>{t("hp.cta.sub")}</p>
          <div style={{ position: "relative", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" iconRight="arrowR" onClick={() => go("browse")}>{t("hp.cta.browse")}</Button>
            <Button variant="ghost" size="lg" onClick={() => go("contact")}>{t("hp.cta.talk")}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useStateP(!!defaultOpen);
  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${open ? "var(--hairline)" : "var(--hairline-soft)"}`, borderRadius: "var(--r)", overflow: "hidden", transition: "border-color .2s" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", textAlign: "left" }}>
        <span style={{ fontWeight: 600, fontSize: 15.5 }}>{q}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)", flexShrink: 0, transition: "transform .25s", transform: open ? "rotate(45deg)" : "none" }}>
          <Icon name="plus" size={17} />
        </span>
      </button>
      <div style={{ maxHeight: open ? 240 : 0, transition: "max-height .3s ease", overflow: "hidden" }}>
        <p style={{ padding: "0 22px 20px", color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.6 }}>{a}</p>
      </div>
    </div>
  );
}

/* ============================================================
   CONCIERGE
   ============================================================ */
function ConciergePage({ go }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const [form, setForm] = useStateP({ name: "", email: "", topic: "", message: "" });
  const [sent, setSent] = useStateP(false);
  const valid = form.name && form.email.includes("@") && form.message.length > 4;

  const channels = [
    { icon: "phone", t: "cc.ch1t", v: "+30 210 555 0100", d: "cc.ch1d" },
    { icon: "mail", t: "cc.ch2t", v: "concierge@apirental.com", d: "cc.ch2d" },
    { icon: "pin", t: "cc.ch3t", v: "Downtown Flagship", d: "cc.ch3d" },
  ];
  const topics = ["cc.topic1", "cc.topic2", "cc.topic3", "cc.topic4", "cc.topic5"];

  return (
    <div className="fade-in">
      <PageHero eyebrow={t("cc.eyebrow")}
        title={<>{t("cc.title1")}<br /><span className="gold-text">{t("cc.title2")}</span></>}
        sub={t("cc.sub")} />

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "30px 18px 50px" : "40px 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.1fr", gap: 28, alignItems: "start" }}>
          {/* channels */}
          <div style={{ display: "grid", gap: 14 }}>
            {channels.map(c => (
              <div key={c.t} style={{ display: "flex", gap: 16, alignItems: "center", padding: "22px 24px", background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)", flexShrink: 0 }}>
                  <Icon name={c.icon} size={23} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{t(c.t)}</div>
                  <div style={{ fontWeight: 700, fontSize: 16.5, fontFamily: "var(--font-display)", lineHeight: 1.2 }}>{c.v}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 3 }}>{t(c.d)}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 20px", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r)", color: "var(--text-2)", fontSize: 13.5 }}>
              <Icon name="trophy" size={18} style={{ color: "var(--gold)", flexShrink: 0 }} />
              {t("cc.platinum")}
            </div>
          </div>

          {/* form / success */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-xl)", padding: "32px 34px", boxShadow: "var(--shadow)" }}>
            {sent ? (
              <div className="pop-in" style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ width: 70, height: 70, borderRadius: 999, margin: "0 auto 20px", display: "grid", placeItems: "center", background: "var(--gold-glow)", color: "var(--gold)", border: "1px solid var(--gold-glow)" }}>
                  <Icon name="checkCircle" size={38} stroke={1.5} />
                </div>
                <h3 className="display" style={{ fontSize: 26, marginBottom: 10 }}>{t("cc.success.title", { name: form.name.split(" ")[0] })}</h3>
                <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.5 }}>
                  {t("cc.success.sub", { email: form.email })}
                </p>
                <Button variant="ghost" onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "", message: "" }); }}>{t("cc.success.again")}</Button>
              </div>
            ) : (
              <>
                <h3 className="display" style={{ fontSize: 23, marginBottom: 6 }}>{t("cc.form.title")}</h3>
                <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 22 }}>{t("cc.form.sub")}</p>
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    <Field label={t("cc.f.name")}><TextInput value={form.name} placeholder="Sophia Laurent" onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
                    <Field label={t("cc.f.email")}><TextInput type="email" value={form.email} placeholder="you@email.com" onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
                  </div>
                  <Field label={t("cc.f.topic")}>
                    <Select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                      {topics.map(tk => <option key={tk} value={tk}>{t(tk)}</option>)}
                    </Select>
                  </Field>
                  <Field label={t("cc.f.msg")}>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder={t("cc.f.msgph")}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                      onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px var(--gold-glow)"; }}
                      onBlur={e => { e.target.style.borderColor = "var(--hairline-soft)"; e.target.style.boxShadow = "none"; }} />
                  </Field>
                  <Button variant="primary" size="lg" full iconRight="arrowR" disabled={!valid}
                    style={{ opacity: valid ? 1 : 0.45, pointerEvents: valid ? "auto" : "none" }}
                    onClick={() => setSent(true)}>{t("cc.f.send")}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   LOCATIONS — stylized network map + location cards
   ============================================================ */
function StyledMap({ city, active, setActive }) {
  const { t } = useT();
  const pins = LOCATION_INFO.filter(i => i.city === city);
  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden",
      border: "1px solid var(--hairline)", minHeight: 480, height: "100%",
      background: "linear-gradient(160deg, var(--surface-2), var(--bg-2) 70%)",
    }}>
      {/* street grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--hairline-soft) 1px, transparent 1px), linear-gradient(90deg, var(--hairline-soft) 1px, transparent 1px)", backgroundSize: "44px 44px", opacity: 0.6 }} />
      {/* diagonal avenues */}
      <div style={{ position: "absolute", left: "-10%", top: "30%", width: "130%", height: 2, background: "var(--hairline)", transform: "rotate(-18deg)", opacity: 0.5 }} />
      <div style={{ position: "absolute", left: "-10%", top: "62%", width: "130%", height: 2, background: "var(--hairline)", transform: "rotate(8deg)", opacity: 0.4 }} />
      {/* sea / gulf at bottom-left */}
      <div style={{ position: "absolute", left: -120, bottom: -140, width: 460, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(70,110,150,0.22), transparent 68%)", pointerEvents: "none" }} />
      {/* overlay title */}
      <div style={{ position: "absolute", top: 22, left: 24, zIndex: 3, pointerEvents: "none" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{t("lp.maptitle")}</div>
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>{t("lp.mapsub")}</div>
      </div>

      {/* pins */}
      {pins.map(info => {
        const on = active === info.id;
        return (
          <button key={info.id} onClick={() => setActive(info.id)}
            style={{ position: "absolute", left: `${info.x}%`, top: `${info.y}%`, transform: "translate(-50%, -50%)", zIndex: on ? 6 : 4, display: "grid", placeItems: "center" }}>
            {on && <span className="loc-pin-ring" style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: "var(--gold)" }} />}
            <span style={{
              width: on ? 18 : 13, height: on ? 18 : 13, borderRadius: "50%",
              background: on ? "var(--gold)" : "var(--surface)", border: `2px solid var(--gold)`,
              boxShadow: on ? "0 0 0 4px var(--gold-glow)" : "none", transition: "all .2s", position: "relative", zIndex: 2,
            }} />
            <span style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-display)",
              padding: "4px 9px", borderRadius: 8, background: "var(--elevated)", border: "1px solid var(--hairline)",
              color: on ? "var(--gold)" : "var(--text-2)", opacity: on ? 1 : 0, transition: "opacity .2s", boxShadow: "var(--shadow)",
            }}>{txLoc(t, info.name)}</span>
          </button>
        );
      })}
    </div>
  );
}

function LocationCard({ info, cars, active, setActive, go }) {
  const { t } = useT();
  const here = cars.filter(c => c.location === info.name);
  const avail = here.filter(c => c.status === "Available");
  const name = t(`loc.${info.id}.name`);
  const addr = t(`loc.${info.id}.addr`);
  const directions = () => {
    const q = encodeURIComponent(`${name}, ${addr}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener");
  };
  const on = active === info.id;
  return (
    <div onMouseEnter={() => setActive(info.id)} onClick={() => setActive(info.id)}
      style={{
        background: "var(--surface)", border: `1px solid ${on ? "var(--gold)" : "var(--hairline-soft)"}`,
        borderRadius: "var(--r-lg)", padding: "24px 26px", transition: "border-color .25s, box-shadow .25s",
        boxShadow: on ? "var(--shadow)" : "none", cursor: "default",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", color: "var(--gold)", flexShrink: 0 }}>
          <Icon name="building" size={23} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="display" style={{ fontSize: 21 }}>{name}</h3>
          <div style={{ color: "var(--text-3)", fontSize: 13.5, marginTop: 2 }}>{t(`loc.${info.id}.city`)}</div>
        </div>
        <Badge tone={avail.length ? "gold" : "neutral"}>{t("lp.vehicleshere", { n: avail.length })}</Badge>
      </div>

      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>{t(`loc.${info.id}.blurb`)}</p>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <InfoRow icon="pin" text={addr} />
        <InfoRow icon="clock" text={t("lp.openday")} />
        <InfoRow icon="phone" text={info.phone} />
      </div>

      {/* car thumbnails available here */}
      {avail.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          {avail.slice(0, 3).map(c => (
            <div key={c.id} style={{ width: 92 }}>
              <CarImage car={c} height={56} rounded={8} showLabel={false} />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.brand}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button size="sm" variant="primary" iconRight="arrowR" onClick={() => go("browse")}>{t("lp.reservehere")}</Button>
        <Button size="sm" variant="dark" icon="navigation" onClick={directions}>{t("lp.directions")}</Button>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--text-2)" }}>
      <Icon name={icon} size={16} style={{ color: "var(--gold)", flexShrink: 0 }} /> {text}
    </div>
  );
}

function LocationsPage({ go }) {
  const { t } = useT();
  const mobile = useIsMobile(820);
  const [city, setCity] = useStateP(CITIES[0]);
  const cityLocs = LOCATION_INFO.filter(i => i.city === city);
  const [active, setActive] = useStateP(cityLocs[0].id);
  const pickCity = (c) => {
    setCity(c);
    const first = LOCATION_INFO.find(i => i.city === c);
    if (first) setActive(first.id);
  };
  return (
    <div className="fade-in">
      <PageHero eyebrow={t("lp.eyebrow")}
        title={<>{t("lp.title1")}<br /><span className="gold-text">{t("lp.title2")}</span></>}
        sub={t("lp.sub")} />

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "30px 18px 50px" : "40px 32px 60px" }}>
        {/* city switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 26, background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", borderRadius: 999, padding: 5, width: "fit-content" }}>
          {CITIES.map(c => (
            <button key={c} onClick={() => pickCity(c)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600,
              background: city === c ? "linear-gradient(135deg, var(--gold), var(--gold-dim))" : "transparent",
              color: city === c ? "var(--gold-ink)" : "var(--text-2)", transition: "all .2s",
            }}>
              <Icon name="pin" size={15} /> {txCity(t, c)}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.05fr", gap: mobile ? 20 : 28, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18, order: mobile ? 1 : 0 }}>
            {cityLocs.map(info => (
              <LocationCard key={info.id} info={info} cars={CARS} active={active} setActive={setActive} go={go} />
            ))}
          </div>
          <div style={{ position: mobile ? "static" : "sticky", top: 96, height: mobile ? 300 : "calc(100vh - 130px)", minHeight: mobile ? 300 : 480, order: mobile ? 0 : 1 }}>
            <StyledMap city={city} active={active} setActive={setActive} />
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HowItWorksPage, ConciergePage, LocationsPage });
