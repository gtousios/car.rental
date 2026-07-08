/* ============================================================
   APIRENTAL — Customer site
   ============================================================ */
const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC, useRef: useRefC } = React;

/* ---------- Theme toggle ---------- */
function ThemeToggle() {
  const { t } = useT();
  const [theme, setTheme] = useStateC(() => {
    try { return localStorage.getItem("apirental.theme") || "dark"; } catch (e) { return "dark"; }
  });
  useEffectC(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("apirental.theme", theme); } catch (e) {}
  }, [theme]);
  const dark = theme === "dark";
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      style={{
        width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center",
        color: "var(--text-2)", border: "1px solid var(--hairline-soft)", background: "transparent",
        transition: "color .2s, background .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}>
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

/* ---------- Language switcher ---------- */
function LangSwitcher({ compact }) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useStateC(false);
  const ref = useRefC(null);
  const cur = LANGS.find(l => l.code === lang) || LANGS[0];
  useEffectC(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} aria-label={t("nav.language")} style={{
        display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)",
        padding: "8px 12px", borderRadius: 999, border: "1px solid var(--hairline-soft)", background: open ? "var(--surface-2)" : "transparent", transition: "background .2s",
      }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>{cur.flag}</span>
        <span style={{ fontWeight: 600 }}>{cur.code.toUpperCase()}</span>
        <Icon name="arrowR" size={13} style={{ transform: open ? "rotate(90deg)" : "rotate(90deg)", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="pop-in" style={{
          position: "absolute", right: 0, top: 46, zIndex: 120, minWidth: 190, padding: 6,
          background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: 14, boxShadow: "var(--shadow)",
        }}>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", padding: "4px 10px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("nav.language")}</div>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, fontSize: 14,
              background: l.code === lang ? "var(--surface-2)" : "transparent", color: l.code === lang ? "var(--text)" : "var(--text-2)",
            }}
              onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 17, lineHeight: 1 }}>{l.flag}</span>
              <span style={{ flex: 1, fontWeight: l.code === lang ? 700 : 500 }}>{l.label}</span>
              {l.code === lang && <Icon name="check" size={15} style={{ color: "var(--gold)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Header ---------- */
function SiteHeader({ view, go, toAdmin, scrolled, user, member, bookings, notifChannel, onSetNotifChannel, onSignIn, onSignOut }) {
  const { t } = useT();
  const mobile = useIsMobile(1080);
  const [menu, setMenu] = useStateC(false);
  const nav = [["home", "nav.home"], ["browse", "nav.fleet"], ["how", "nav.how"], ["locations", "footer.locations"], ["contact", "nav.concierge"]];
  const goAnd = (k) => { setMenu(false); go(k); };
  const solid = scrolled || (mobile && menu);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 90,
      background: solid ? "var(--header-bg)" : "transparent",
      backdropFilter: solid ? "blur(14px)" : "none",
      borderBottom: solid ? "1px solid var(--hairline-soft)" : "1px solid transparent",
      transition: "all .3s",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "13px 18px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Logo onClick={() => goAnd("home")} />
        {!mobile && (
          <nav style={{ display: "flex", gap: 4 }}>
            {nav.map(([k, key]) => (
              <button key={k} onClick={() => go(k)} style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 500,
                color: view === k ? "var(--gold)" : "var(--text-2)", transition: "color .2s",
              }}>{t(key)}</button>
            ))}
          </nav>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
          <ThemeToggle />
          <LangSwitcher />
          {user && <NotificationInbox bookings={bookings} user={user} channel={notifChannel || "email"} setChannel={onSetNotifChannel} />}
          {!mobile && (user
            ? <AccountMenu user={user} member={member} onSignOut={onSignOut} onMyTrips={() => go("mytrips")} />
            : (
              <button onClick={onSignIn} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "var(--text-2)", padding: "8px 14px", borderRadius: 999, border: "1px solid var(--hairline-soft)" }}>
                <Icon name="user" size={15} /> {t("nav.signin")}
              </button>
            )
          )}
          {!mobile && (
            <button onClick={toAdmin} title={t("nav.admin")} aria-label={t("nav.admin")} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 999, display: "grid", placeItems: "center", color: "var(--text-3)", border: "1px solid var(--hairline-soft)" }}>
              <Icon name="gear" size={16} />
            </button>
          )}
          {!mobile && <Button size="sm" variant="primary" onClick={() => go("browse")}>{t("nav.book")}</Button>}
          {mobile && (
            <button onClick={() => setMenu(m => !m)} aria-label="Menu" style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", color: "var(--text)", border: "1px solid var(--hairline-soft)" }}>
              <Icon name={menu ? "x" : "menu"} size={20} />
            </button>
          )}
        </div>
      </div>
      {mobile && menu && (
        <div className="pop-in" style={{ borderTop: "1px solid var(--hairline-soft)", padding: "12px 18px 18px", display: "grid", gap: 6 }}>
          {nav.map(([k, key]) => (
            <button key={k} onClick={() => goAnd(k)} style={{
              textAlign: "left", padding: "12px 14px", borderRadius: 12, fontSize: 15.5, fontWeight: 600,
              background: view === k ? "var(--surface-2)" : "transparent",
              color: view === k ? "var(--gold)" : "var(--text)",
            }}>{t(key)}</button>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {!user && <Button variant="dark" icon="user" onClick={() => { setMenu(false); onSignIn(); }} style={{ flex: 1 }}>{t("nav.signin")}</Button>}
            <Button variant="primary" onClick={() => goAnd("browse")} style={{ flex: 1 }}>{t("nav.book")}</Button>
          </div>
          <Button variant="ghost" icon="gear" onClick={() => { setMenu(false); toAdmin(); }} style={{ width: "100%" }}>{t("nav.admin")}</Button>
          {user && (
            <button onClick={() => goAnd("mytrips")} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "12px 14px", borderRadius: 12, fontSize: 15.5, fontWeight: 600, background: view === "mytrips" ? "var(--surface-2)" : "transparent", color: view === "mytrips" ? "var(--gold)" : "var(--text)" }}>
              <Icon name="calendar" size={17} /> {t("trips.title")}
            </button>
          )}
          {user && (
            <button onClick={() => { setMenu(false); onSignOut(); }} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "12px 14px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, color: "var(--text-2)", border: "1px solid var(--hairline-soft)", marginTop: 2 }}>
              <Icon name="logout" size={16} /> {t("cauth.signout")} · {user.name || user.email}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

/* ---------- Hero with search ---------- */
function Hero({ go, onSearch }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const [s, setS] = useStateC({ pickup: LOCATIONS[0], from: "2026-06-18", to: "2026-06-21", cat: "All" });
  const stats = [["120+", "stats.vehicles"], ["4.9★", "stats.rating"], ["24/7", "stats.support"], ["60s", "stats.booking"]];
  const heroImg = (window.PHOTO_MAP && window.PHOTO_MAP["images/bmw-m2cs.jpg"]) || "images/bmw-m2cs.jpg";
  return (
    <section style={{ position: "relative", overflow: "hidden", minHeight: mobile ? "auto" : 720 }}>
      {/* Full-bleed photographic backdrop */}
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={heroImg} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%" }} />
        <div style={{ position: "absolute", inset: 0, background: mobile
          ? "linear-gradient(to bottom, rgba(10,10,12,0.60) 0%, rgba(10,10,12,0.55) 28%, rgba(10,10,12,0.94) 100%)"
          : "linear-gradient(95deg, rgba(10,10,12,0.96) 0%, rgba(10,10,12,0.86) 34%, rgba(10,10,12,0.45) 64%, rgba(10,10,12,0.20) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.88), transparent 36%)", pointerEvents: "none" }} />
        {/* cinematic vignette */}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 240px 40px rgba(0,0,0,0.55)", pointerEvents: "none" }} />
      </div>

      {/* Featured-car tag (desktop) — ties the photo to a real bookable car */}
      {!mobile && (
        <button onClick={() => go("browse", "Luxury & Exotic")} className="fade-in" style={{
          position: "absolute", top: 110, right: 40, zIndex: 2, display: "flex", alignItems: "center", gap: 14,
          background: "rgba(16,16,19,0.55)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 16, padding: "11px 14px 11px 16px", cursor: "pointer", transition: "border-color .25s, transform .25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = ""; }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{t("hero.featured")}</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>BMW M2 CS 2021</div>
            <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 1 }}>{t("hero.fromday", { p: "€550" })}</div>
          </div>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--gold)", color: "var(--gold-ink)", flexShrink: 0 }}>
            <Icon name="arrowR" size={17} />
          </span>
        </button>
      )}

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "60px 18px 30px" : "112px 32px 52px", position: "relative" }}>
        <div className="fade-in" style={{ maxWidth: 640 }}>
          <div className="eyebrow" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "var(--gold)" }}>
            <span style={{ width: 28, height: 1, background: "var(--gold)" }} /> {t("hero.eyebrow")}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(46px, 6.4vw, 84px)", lineHeight: 0.96, marginBottom: 22, color: "#fff", letterSpacing: "-0.01em" }}>
            {t("hero.t1")}<br /><span className="gold-text">{t("hero.t2")}</span>
          </h1>
          <p style={{ fontSize: 18.5, color: "rgba(255,255,255,0.84)", maxWidth: 480, lineHeight: 1.5 }}>
            {t("hero.sub")}
          </p>
        </div>

        <div className="fade-in" style={{ marginTop: mobile ? 30 : 52, maxWidth: 980 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", color: "rgba(255,255,255,0.75)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="search" size={15} style={{ color: "var(--gold)" }} /> {t("hero.findcta")}
          </div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)",
            padding: 12, display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr 1fr 1.1fr auto", gap: 8, alignItems: "stretch",
            boxShadow: "0 28px 70px -24px rgba(0,0,0,0.7)",
          }}>
            <SearchCell icon="pin" label={t("search.pickup")}>
              <select value={s.pickup} onChange={e => setS({ ...s, pickup: e.target.value })} style={cellInput}>
                {LOCATIONS.map(l => <option key={l} value={l}>{txLoc(t, l)}</option>)}
              </select>
            </SearchCell>
            <SearchCell icon="calendar" label={t("search.from")}>
              <input type="date" value={s.from} min="2026-06-07" onChange={e => setS({ ...s, from: e.target.value })} style={cellInput} />
            </SearchCell>
            <SearchCell icon="calendar" label={t("search.to")}>
              <input type="date" value={s.to} min={s.from} onChange={e => setS({ ...s, to: e.target.value })} style={cellInput} />
            </SearchCell>
            <SearchCell icon="car" label={t("search.class")}>
              <select value={s.cat} onChange={e => setS({ ...s, cat: e.target.value })} style={cellInput}>
                <option value="All">{t("search.all")}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{txCat(t, c)}</option>)}
              </select>
            </SearchCell>
            <Button variant="primary" size="lg" icon="search" full={mobile} onClick={() => onSearch(s)} style={{ borderRadius: 16 }}>{t("search.btn")}</Button>
          </div>
        </div>

        <div className="fade-in" style={{ display: "flex", gap: mobile ? 28 : 44, marginTop: mobile ? 30 : 40, flexWrap: "wrap" }}>
          {stats.map(([n, key]) => (
            <div key={key}>
              <div className="display" style={{ fontSize: 30, color: "var(--gold)" }}>{n}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{t(key)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const cellInput = {
  width: "100%", background: "transparent", border: "none", outline: "none",
  color: "var(--text)", fontSize: 14.5, fontWeight: 600, cursor: "pointer", padding: 0,
};
function SearchCell({ icon, label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", borderRadius: 14, background: "var(--bg-2)" }}>
      <Icon name={icon} size={19} style={{ color: "var(--gold)", flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Category strip ---------- */
function CategoryStrip({ cars = [], go }) {
  const { t } = useT();
  const countFor = (name) => cars.filter(c => c.category === name).length;
  const cats = [
    { name: "Luxury & Exotic", icon: "bolt" },
    { name: "SUV & Off-road", icon: "mountain" },
    { name: "Electric", icon: "bolt" },
    { name: "Everyday", icon: "car" },
  ].map(c => ({ ...c, count: countFor(c.name) }));
  return (
    <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 16 }}>
        {cats.map(c => (
          <button key={c.name} onClick={() => go("browse", c.name)} className="cat-card" style={{
            textAlign: "left", padding: "22px 22px", borderRadius: "var(--r)", background: "var(--surface)",
            border: "1px solid var(--hairline-soft)", transition: "transform .25s, border-color .25s, background .25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "var(--hairline)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--hairline-soft)"; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)", marginBottom: 16 }}>
              <Icon name={c.icon} size={22} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, fontFamily: "var(--font-display)" }}>{txCat(t, c.name)}</div>
            <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 3 }}>{t("catstrip.count", { n: c.count })}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Car card ---------- */
function CarCard({ car, onClick, onBook }) {
  const { t } = useT();
  const [hover, setHover] = useStateC(false);
  const unavailable = car.status === "Maintenance";
  return (
    <div onClick={() => onClick(car)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)",
        overflow: "hidden", cursor: "pointer", transition: "transform .28s cubic-bezier(.2,.8,.2,1), border-color .28s, box-shadow .28s",
        transform: hover ? "translateY(-6px)" : "none", borderColor: hover ? "var(--hairline)" : "var(--hairline-soft)",
        boxShadow: hover ? "var(--shadow)" : "none", display: "flex", flexDirection: "column",
      }}>
      <div style={{ position: "relative" }}>
        <CarImage car={car} height={184} rounded={0} showLabel={false}
          style={{ transition: "transform .4s", transform: hover ? "scale(1.04)" : "none" }} />
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
          {car.tag && <Badge tone="gold">{txTag(t, car.tag)}</Badge>}
          {unavailable && <Badge tone="amber">{t("card.inservice")}</Badge>}
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, background: "var(--glass)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "5px 10px" }}>
          <Stars value={car.rating} />
        </div>
      </div>
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ color: "var(--text-3)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{car.brand}</div>
            <h3 className="display" style={{ fontSize: 19, marginTop: 2 }}>{car.name.replace(car.brand, "").trim() || car.name}</h3>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, color: "var(--text-2)", fontSize: 12.5 }}>
          <SpecMini icon="seat" v={`${car.seats}`} />
          <SpecMini icon="gear" v={car.transmission === "Automatic" ? t("card.auto") : t("card.manual")} />
          <SpecMini icon="fuel" v={txFuel(t, car.fuel)} />
          <SpecMini icon="gauge" v={car.zeroTo} />
        </div>
        <div style={{ height: 1, background: "var(--hairline-soft)", margin: "16px 0 14px" }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            <span className="display" style={{ fontSize: 24, color: "var(--text)" }}>{fmtMoney(car.price)}</span>
            <span style={{ color: "var(--text-3)", fontSize: 13 }}> {t("card.perday")}</span>
          </div>
          <Button size="sm" variant={hover ? "primary" : "dark"} iconRight="arrowR"
            onClick={e => { e.stopPropagation(); onBook(car); }} disabled={unavailable}
            style={{ opacity: unavailable ? 0.4 : 1, pointerEvents: unavailable ? "none" : "auto" }}>
            {t("card.reserve")}
          </Button>
        </div>
      </div>
    </div>
  );
}
function SpecMini({ icon, v }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name={icon} size={15} style={{ color: "var(--gold)" }} />{v}</span>;
}

/* ---------- Featured on home ---------- */
function Featured({ cars, onClick, onBook, go }) {
  const { t } = useT();
  const feat = cars.filter(c => c.tag);
  const trackRef = React.useRef(null);
  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-slide]");
    const step = card ? card.offsetWidth + 22 : 320;
    const start = el.scrollLeft;
    const target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, start + dir * step));
    const t0 = performance.now();
    const dur = 380;
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.scrollLeft = start + (target - start) * ease(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  return (
    <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t("feat.eyebrow")}</div>
          <h2 className="display" style={{ fontSize: 34 }}>{t("feat.title")}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => scrollBy(-1)} aria-label="Previous"
              style={{ width: 42, height: 42, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--text)" }}>
              <Icon name="arrowL" size={18} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next"
              style={{ width: 42, height: 42, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--text)" }}>
              <Icon name="arrowR" size={18} />
            </button>
          </div>
          <Button variant="link" iconRight="arrowR" onClick={() => go("browse")}>{t("feat.viewall", { n: cars.length })}</Button>
        </div>
      </div>
      <div ref={trackRef} className="feat-track" style={{
        display: "flex", gap: 22, overflowX: "auto", scrollSnapType: "x mandatory",
        paddingBottom: 6, margin: "0 -32px", padding: "0 32px 6px", WebkitOverflowScrolling: "touch",
      }}>
        {feat.map(c => (
          <div key={c.id} data-slide style={{ flex: "0 0 clamp(260px, 30%, 320px)", scrollSnapAlign: "start" }}>
            <CarCard car={c} onClick={onClick} onBook={onBook} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works (home section) ---------- */
function HowItWorks() {
  const { t } = useT();
  const steps = [
    { icon: "search", t: "how.s1t", d: "how.s1d" },
    { icon: "calendar", t: "how.s2t", d: "how.s2d" },
    { icon: "car", t: "how.s3t", d: "how.s3d" },
  ];
  return (
    <section style={{ maxWidth: 1240, margin: "0 auto", padding: "50px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{t("how.eyebrow")}</div>
        <h2 className="display" style={{ fontSize: 34 }}>{t("how.title")}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 22 }}>
        {steps.map((s, i) => (
          <div key={s.t} style={{ padding: "28px 26px", background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", position: "relative" }}>
            <div style={{ position: "absolute", top: 24, right: 26, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold-dim)" }}>0{i + 1}</div>
            <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)", marginBottom: 20 }}>
              <Icon name={s.icon} size={24} />
            </div>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 8 }}>{t(s.t)}</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.55 }}>{t(s.d)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer({ toAdmin, go }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const cols = [
    ["footer.fleet", [["cat.lux", "browse"], ["cat.ev", "browse"], ["cat.suv", "browse"], ["cat.everyday", "browse"]]],
    ["footer.company", [["footer.about"], ["footer.locations", "locations"], ["footer.careers"], ["footer.press"]]],
    ["footer.support", [["footer.concierge", "contact"], ["footer.faq", "how"], ["footer.terms"], ["footer.privacy"]]],
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--hairline-soft)", marginTop: 40 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "34px 18px" : "44px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 30 }}>
        <div style={{ maxWidth: 300 }}>
          <Logo />
          <p style={{ color: "var(--text-3)", fontSize: 13.5, marginTop: 16, lineHeight: 1.6 }}>
            {t("footer.tagline")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
          {cols.map(([h, items]) => (
            <div key={h}>
              <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", marginBottom: 14, fontWeight: 700 }}>{t(h)}</div>
              <div style={{ display: "grid", gap: 9 }}>
                {items.map(([key, dest]) => (
                  <a key={key} onClick={() => dest && go && go(dest)} style={{ color: "var(--text-3)", fontSize: 13.5, cursor: dest ? "pointer" : "default" }}>{t(key)}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--hairline-soft)", padding: mobile ? "16px 18px" : "18px 32px", maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, color: "var(--text-3)", fontSize: 12.5 }}>
        <span>{t("footer.copyright")}</span>
        <button onClick={toAdmin} style={{ color: "var(--text-3)", fontSize: 12.5 }}>{t("footer.staff")}</button>
      </div>
    </footer>
  );
}

/* ---------- Customer account menu (header, when signed in) ---------- */
function AccountMenu({ user, member, onSignOut, onMyTrips }) {
  const { t } = useT();
  const [open, setOpen] = useStateC(false);
  const ref = useRefC(null);
  useEffectC(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initials = (user.name || user.email || "?").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} title={user.email || user.name} aria-label="Account"
        style={{ width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", fontWeight: 700, fontSize: 12.5, border: "none" }}>
        {initials}
      </button>
      {open && (
        <div className="pop-in" style={{ position: "absolute", right: 0, top: 46, zIndex: 120, minWidth: 210, padding: 8, background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: 14, boxShadow: "var(--shadow)" }}>
          <div style={{ padding: "6px 10px 10px", borderBottom: "1px solid var(--hairline-soft)", marginBottom: 6 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{user.name || t("cauth.member")}</div>
            {user.email && <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
            {member && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 9, padding: "7px 9px", background: "var(--gold-glow)", borderRadius: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gold-hi)" }}>
                  <Icon name="trophy" size={13} /> {member.tier}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--gold-hi)", fontWeight: 600 }}>{(member.points || 0).toLocaleString()} {t("loy.points")}</span>
              </div>
            )}
          </div>
          <button onClick={() => { setOpen(false); onMyTrips && onMyTrips(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, fontSize: 13.5, color: "var(--text-2)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <Icon name="calendar" size={15} /> {t("trips.title")}
          </button>
          <button onClick={() => { setOpen(false); onSignOut(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, fontSize: 13.5, color: "var(--text-2)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <Icon name="logout" size={15} /> {t("cauth.signout")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Customer sign-in / create account (gate before reserving) ---------- */
function CustomerAuth({ onAuth }) {
  const { t } = useT();
  const [mode, setMode] = useStateC("signin");   // signin | signup
  const [name, setName] = useStateC("");
  const [email, setEmail] = useStateC("");
  const [pw, setPw] = useStateC("");
  const [show, setShow] = useStateC(false);
  const [connecting, setConnecting] = useStateC(null);

  const nameFromEmail = (e) => (e.split("@")[0] || "").replace(/[._-]+/g, " ").trim()
    .split(" ").filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const valid = mode === "signup"
    ? (name.trim() && email.includes("@") && pw.length >= 1)
    : (email.includes("@") && pw.length >= 1);
  const submit = (ev) => {
    ev && ev.preventDefault();
    if (!valid) return;
    onAuth({ name: mode === "signup" ? name.trim() : (name.trim() || nameFromEmail(email)), email: email.trim() });
  };
  const startSSO = (id) => { if (connecting) return; setConnecting(id); setTimeout(() => onAuth({ name: "", email: "" }), 950); };

  return (
    <div style={{ padding: "32px 32px 28px" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(140deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", marginBottom: 18, boxShadow: "0 8px 20px -6px var(--gold-glow)" }}>
        <Icon name="lock" size={20} />
      </div>
      <div className="eyebrow" style={{ marginBottom: 9 }}>{t("cauth.eyebrow")}</div>
      <h2 className="display" style={{ fontSize: 24, marginBottom: 7, letterSpacing: "-0.02em" }}>{t(mode === "signup" ? "cauth.signupTitle" : "cauth.title")}</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13.5, lineHeight: 1.5, marginBottom: 22 }}>{t(mode === "signup" ? "cauth.signupSub" : "cauth.sub")}</p>

      <div style={{ marginBottom: 18 }}>
        <SsoButtons connecting={connecting} onPick={startSSO} t={t} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 18px", color: "var(--text-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-mono)" }}>
        <span style={{ flex: 1, height: 1, background: "var(--hairline-soft)" }} />
        {t("login.or")}
        <span style={{ flex: 1, height: 1, background: "var(--hairline-soft)" }} />
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        {mode === "signup" && (
          <Field label={t("cauth.name")}>
            <TextInput type="text" value={name} placeholder="Alex Doe" autoComplete="name"
              onChange={e => setName(e.target.value)} />
          </Field>
        )}
        <Field label={t("cauth.email")}>
          <TextInput type="email" value={email} placeholder="you@email.com" autoComplete="email"
            onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field label={t("login.password")}>
          <div style={{ position: "relative" }}>
            <TextInput type={show ? "text" : "password"} value={pw} placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"}
              onChange={e => setPw(e.target.value)} style={{ paddingRight: 76 }} />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 5, padding: "6px 9px", borderRadius: 8, fontSize: 12, color: "var(--text-3)" }}>
              <Icon name={show ? "eyeoff" : "eye"} size={15} /> {show ? t("login.hide") : t("login.show")}
            </button>
          </div>
        </Field>
        <Button variant="primary" size="lg" full iconRight="arrowR" onClick={submit}>{t(mode === "signup" ? "cauth.create" : "cauth.signin")}</Button>
      </form>

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
        {mode === "signup" ? t("cauth.haveq") : t("cauth.newq")}{" "}
        <button type="button" onClick={() => setMode(m => m === "signup" ? "signin" : "signup")}
          style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13 }}>
          {t(mode === "signup" ? "cauth.signin" : "cauth.create")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Live chat widget (floating concierge, AI-powered) ---------- */
const CHAT_LANG_NAME = { en: "English", el: "Greek", de: "German", fr: "French", pt: "Portuguese", es: "Spanish", bg: "Bulgarian" };

/* Compact, factual knowledge base assembled from the live data tables so the
   concierge answers fleet & pricing questions accurately (no invented specs). */
function buildChatKnowledge(liveCars, liveDamage) {
  const cars = (liveCars && liveCars.length) ? liveCars : (typeof CARS !== "undefined" ? CARS : []);
  const openDmg = (liveDamage || []).filter(d => !d.resolved);
  // Exact standard total (base + 8% taxes & fees, no add-ons) using the SAME
  // formula as the site's priceBooking() — precomputed so the assistant never
  // has to do (and never gets wrong) the arithmetic.
  const stdTotal = (price, days) => { const base = price * days; return base + Math.round(base * 0.08); };
  const fleet = cars.map(c => {
    const out = c.status !== "Available";
    const hasDmg = openDmg.some(d => d.carId === c.id);
    const avail = out
      ? (hasDmg ? "CURRENTLY UNAVAILABLE — out of service (open damage report), cannot be booked" : "CURRENTLY UNAVAILABLE — in maintenance, cannot be booked")
      : "Available to book";
    const table = [1, 2, 3, 4, 5, 7].map(d => `${d}d=€${stdTotal(c.price, d)}`).join(", ");
    return `• ${c.name} (${c.brand}) — ${c.category}, ${c.year}. €${c.price}/day. ${c.seats} seats, ${c.transmission}, ${c.fuel}, ${c.power}, 0–100 ${c.zeroTo}, top ${c.topSpeed}, ${c.drivetrain}. Rating ${c.rating}/5 (${c.trips} trips). Pickup: ${c.location}. ${avail}.${c.tag ? " Tag: " + c.tag + "." : ""} STANDARD TOTALS incl. 8% taxes & fees, NO add-ons (use these exact numbers — do not recompute): ${table}. ${c.blurb} Features: ${(c.features || []).join(", ")}.`;
  }).join("\n");
  const unavailable = cars.filter(c => c.status !== "Available").map(c => c.name);
  const addons = (typeof ADDONS !== "undefined" ? ADDONS : []).map(a => `• ${a.name}: €${a.price} per ${a.unit} — ${a.desc}`).join("\n");
  const locs = (typeof LOCATION_INFO !== "undefined" ? LOCATION_INFO : []).map(l => `• ${l.name} (tel ${l.phone})`).join("\n");
  return [
    `FLEET (${cars.length} vehicles, all prices per day in euros):`, fleet,
    "", "AVAILABILITY RIGHT NOW:",
    unavailable.length
      ? `These vehicles are NOT available to book (in maintenance / out of service): ${unavailable.join(", ")}. Never offer to book these — suggest an available alternative instead.`
      : "All vehicles are currently available to book.",
    "", "ADD-ONS:", addons,
    "", "PICKUP LOCATIONS:", locs,
    "", "PRICING RULES (these produce the SAME figures as the website's booking calculator — follow them literally; never estimate, never invent a different number, never round differently):",
    "• EACH vehicle above lists its exact STANDARD TOTALS (incl. 8% taxes & fees, no add-ons) for 1/2/3/4/5/7 days. When the customer asks a price for one of those durations, READ the number straight from that list — do NOT recompute it. This is the standard, no-extras price and it matches the website exactly.",
    "• Rental days = number of calendar days between pickup and return, minimum 1.",
    "• If the duration is not in the list, compute: base = daily rate × days; taxes & fees = round(base × 0.08); standard total = base + taxes & fees.",
    "• Taxes & fees are exactly 8% of the base. THIS IS THE ONLY SURCHARGE.",
    "• IMPORTANT: do NOT add VAT, 24%, sales tax, service charge, or any other percentage. The only addition to the base is the 8% taxes & fees. Any VAT is already contained inside the price and must NEVER be added on top — adding it makes your quote too high.",
    "• Add-ons priced 'per day' are multiplied by the number of days; 'per trip' add-ons are charged once. Total WITH add-ons = the standard total + the add-on cost.",
    "• WHENEVER you quote a price, give BOTH: (1) the standard total without extras (read from the list), and (2) the total with whatever add-ons the customer mentioned (if none mentioned, name a couple of common add-ons and what they'd add). Keep the breakdown short.",
    "", "DISCOUNTS APPLIED AT CHECKOUT (these only ever LOWER the total — you do not know the customer's tier or promo code, so never fold them into your quote):",
    "• Loyalty tiers auto-discount the total: Silver 3%, Gold 6%, Platinum 10% (Bronze 0%). Gold/Platinum also get some add-ons free.",
    "• Promo codes may give a further percentage or fixed-euro discount.",
    "• Optional keyless entry adds a small flat fee (free for Gold/Platinum).",
    "• Quote the standard prices above, then note the exact final total — including any member discount or promo code — is shown on the booking screen when they tap Reserve. Never present your figure as higher than the standard, and never as the final charged amount.",
    "• Free cancellation up to 48 hours before pickup.",
  ].join("\n");
}

/* Deterministic price computation done in JS (NOT by the AI) for the car(s) and
   duration mentioned in the user's message, using the exact same formula as the
   site's priceBooking(). Injected as an authoritative answer so the assistant
   relays correct, website-matching figures instead of doing its own math. */
function computePriceFacts(userText, liveCars) {
  const cars = (liveCars && liveCars.length) ? liveCars : (typeof CARS !== "undefined" ? CARS : []);
  if (!cars.length) return "";
  const x = (userText || "").toLowerCase();
  const priceWords = /price|cost|how much|quote|rate|charge|τιμ|κοστ|πόσο|preis|kosten|precio|cuest|pre[çc]o|quanto|combien|co[uû]t/;
  if (!priceWords.test(x)) return "";

  // Which cars are referenced? Match on full name or any distinctive word.
  const stop = new Set(["the", "for", "and", "car", "rent", "rental", "hire", "a", "an", "of", "with", "days", "day"]);
  const matched = cars.filter(c => {
    const name = c.name.toLowerCase();
    if (x.includes(name)) return true;
    const words = name.split(/[\s-]+/).filter(w => w.length > 2 && !stop.has(w));
    return words.some(w => x.includes(w));
  });
  const targets = matched.length ? matched : (cars.length <= 4 ? cars : []);
  if (!targets.length) return "";

  // Duration: explicit "N day(s)" / "N-day", else default to 1 and also show 3 & 7.
  const dm = x.match(/(\d+)\s*[- ]?\s*(?:day|days|ημέρ|tag|d[ií]a|giorn|jour)/);
  const days = dm ? Math.max(1, parseInt(dm[1], 10)) : null;
  const durations = days ? [days] : [1, 3, 7];

  const addons = (typeof ADDONS !== "undefined" ? ADDONS : []);
  const stdTotal = (price, d) => { const base = price * d; return base + Math.round(base * 0.08); };
  const lines = [];
  targets.slice(0, 4).forEach(c => {
    const out = c.status !== "Available";
    durations.forEach(d => {
      const base = c.price * d;
      const fees = Math.round(base * 0.08);
      const std = base + fees;
      let line = `${c.name}, ${d} day${d > 1 ? "s" : ""}: base €${base} (€${c.price}×${d}) + €${fees} taxes & fees = STANDARD TOTAL €${std} (no add-ons).`;
      if (addons.length) {
        const parts = addons.slice(0, 3).map(a => {
          const cost = a.unit === "day" ? a.price * d : a.price;
          return `+ ${a.name} €${cost} → €${std + cost}`;
        });
        line += ` With one add-on: ${parts.join("; ")}.`;
      }
      if (out) line += " (NOTE: this car is currently unavailable to book.)";
      lines.push("• " + line);
    });
  });
  if (!lines.length) return "";
  return ["AUTHORITATIVE PRICE FACTS (computed by the system with the exact website formula — when answering this price question you MUST use these exact numbers verbatim; do not recompute, do not add VAT or any other tax, do not round differently):", ...lines].join("\n");
}

/* Minimal markdown for chat bubbles: **bold**, •/-/numbered lists, line breaks
   (newlines are preserved via white-space: pre-wrap on the bubble). */
function renderChatBody(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={k++}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function ChatWidget({ cars, damage, bookings = [], member = null, customerUser = null, onCreateBooking, onRequireAuth }) {
  const { t, lang } = useT();
  const [open, setOpen] = useStateC(false);
  const [unread, setUnread] = useStateC(false);
  const [typing, setTyping] = useStateC(false);
  const [closeMenu, setCloseMenu] = useStateC(false);
  const [text, setText] = useStateC("");
  // In-memory only — a page refresh starts a brand-new chat.
  const [msgs, setMsgs] = useStateC([]);
  const listRef = useRefC(null);
  const mobile = useIsMobile(560);

  useEffectC(() => {
    if (open && msgs.length === 0) pushAgent(t("chat.greeting"));
    if (open) setUnread(false);
  }, [open]);
  useEffectC(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs, typing, open]);

  function pushAgent(body) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { who: "agent", body }]);
      setOpen(o => { if (!o) setUnread(true); return o; });
    }, 850 + Math.random() * 500);
  }
  // Keyword fallback when the AI helper is unavailable / errors out.
  function fallbackReply(s) {
    const x = (s || "").toLowerCase();
    let key = "chat.r.default";
    if (/book|reserv|κρατ|buch|prenot|alquil/.test(x)) key = "chat.r.booking";
    else if (/locat|where|pickup|σημε|τοποθ|standort|ubicaci|local|onde|où/.test(x)) key = "chat.r.locations";
    else if (/price|cost|τιμ|κοστ|preis|precio|pre[çc]o|how much|πόσο/.test(x)) key = "chat.r.price";
    else if (/human|agent|person|άνθρωπ|μιλ|mensch|humano|persona|operator/.test(x)) key = "chat.r.human";
    setMsgs(m => [...m, { who: "agent", body: t(key) }]);
    setOpen(o => { if (!o) setUnread(true); return o; });
  }
  // AI-powered reply grounded in the live fleet/pricing knowledge.
  async function respond(history) {
    if (!(window.claude && window.claude.complete)) { fallbackReply(history.length ? history[history.length - 1].body : ""); return; }
    setTyping(true);
    const priceFacts = computePriceFacts(history.length ? history[history.length - 1].body : "", cars);
    const system = `You are the Apirental Concierge, a warm and concise assistant for a luxury car-rental service. \
Answer questions about the fleet, pricing, add-ons, pickup locations, and how to book. \
Use ONLY the data below — never invent cars, prices, or specifications. All prices are in euros (€). \
If a requested car or feature is not in the fleet, say so briefly and suggest the closest match. \
When asked about price, ALWAYS give two clear figures with a short breakdown: the standard booking total WITHOUT extras (base + 8% taxes & fees), and the total WITH the add-ons the customer mentioned. Use the per-day rate from the fleet list verbatim, apply only the 8% taxes & fees, and NEVER add VAT/24%/any other tax on top \u2014 that is the bug that makes quotes too high. Note that the exact final total, including any member discount or promo code, is confirmed on the booking screen \u2014 your figure is the standard price, never higher. \
If a car is marked CURRENTLY UNAVAILABLE / in maintenance / out of service, tell the user it can't be booked right now and recommend an available alternative — never start a booking for it. \
Keep answers short (1–4 sentences unless listing cars). \
BOOKING IN CHAT: the customer can reserve a car directly here. When the customer has chosen ONE specific car that is Available to book AND has given BOTH a pickup date and a return date, briefly confirm the choice in one sentence, then append on its OWN FINAL LINE exactly this directive (the customer sees a Confirm button instead of this text, so never explain or repeat it): \
<<BOOK car="EXACT CAR NAME" from="YYYY-MM-DD" to="YYYY-MM-DD">> \
Rules for the directive: only for a car listed as Available to book; use the car's exact name from the fleet; dates must be real YYYY-MM-DD and today or later (today is 2026-06-29, return after pickup); never emit it for an unavailable car, and never before you have a specific car AND both dates — ask for whatever is missing instead; at most one directive per message. If the customer is not signed in they will be prompted to sign in when they tap Confirm, so you can still offer it. \
Reply entirely in ${CHAT_LANG_NAME[lang] || "English"}.\n\n${buildChatKnowledge(cars, damage)}${priceFacts ? "\n\n" + priceFacts : ""}`;
    let convo = history.map(m => ({ role: m.who === "me" ? "user" : "assistant", content: m.body }));
    while (convo.length && convo[0].role === "assistant") convo.shift();
    const messages = [
      { role: "user", content: system + "\n\nReply only with 'Ready.' to confirm you understand." },
      { role: "assistant", content: "Ready." },
      ...convo,
    ];
    try {
      const reply = await window.claude.complete({ messages });
      setTyping(false);
      let body = (reply || "").trim();
      // Parse an optional <<BOOK ...>> directive into an inline confirmation card.
      let card = null;
      const dm = body.match(/<<\s*BOOK\s+([^>]+?)\s*>>/i);
      if (dm) {
        const a = dm[1];
        const cn = (a.match(/car\s*=\s*"([^"]+)"/i) || [])[1];
        const fr = (a.match(/from\s*=\s*"(\d{4}-\d{2}-\d{2})"/i) || [])[1];
        const to = (a.match(/to\s*=\s*"(\d{4}-\d{2}-\d{2})"/i) || [])[1];
        const car = cn && (cars.find(c => c.name.toLowerCase() === cn.toLowerCase()) || cars.find(c => c.name.toLowerCase().includes(cn.toLowerCase())));
        if (car && car.status === "Available" && fr && to && to > fr) {
          card = { carId: car.id, carName: car.name, from: fr, to: to };
        }
        body = body.replace(dm[0], "").trim();
      }
      if (body || card) {
        setMsgs(m => [...m, { who: "agent", body: body || t("chat.book.ready"), card }]);
        setOpen(o => { if (!o) setUnread(true); return o; });
      } else {
        fallbackReply(history.length ? history[history.length - 1].body : "");
      }
    } catch (e) {
      setTyping(false);
      fallbackReply(history.length ? history[history.length - 1].body : "");
    }
  }
  function send(body) {
    const b = (body == null ? text : body).trim();
    if (!b) return;
    const next = [...msgs, { who: "me", body: b }];
    setMsgs(next);
    setText("");
    respond(next);
  }
  // Confirm a reservation directly from the chat card.
  function confirmBooking(idx, card) {
    if (!customerUser) {
      setMsgs(m => [...m, { who: "agent", body: t("chat.book.signin") }]);
      onRequireAuth && onRequireAuth();
      return;
    }
    const car = cars.find(c => c.id === card.carId);
    if (!car || car.status !== "Available") {
      setMsgs(m => [...m, { who: "agent", body: t("chat.book.unavail") }]);
      return;
    }
    if (carConflicts(bookings, car.id, card.from, card.to).length) {
      setMsgs(m => [...m, { who: "agent", body: t("chat.book.dates") }]);
      return;
    }
    const priced = priceBooking(car, card.from, card.to, {});
    const ref = "AP-" + Math.floor(4900 + Math.random() * 99);
    const booking = {
      id: ref, carId: car.id, car: car.name,
      customer: customerUser.name || (customerUser.email ? customerUser.email.split("@")[0] : "Guest"), email: customerUser.email || "", phone: "", license: "", age: "",
      from: card.from, to: card.to, time: "10:00", pickup: car.location, dropoff: car.location,
      days: priced.days, addons: [], status: "Upcoming", total: priced.total,
      promoCode: null, discount: 0, tierDiscount: 0, tier: member ? member.tier : "bronze",
      keyless: false, keylessFee: 0, pointsEarned: Math.round(priced.total / 10), pointsRedeemed: 0,
      paymentMethod: "card", createdAt: new Date().toISOString(), source: "concierge-chat",
    };
    onCreateBooking && onCreateBooking(booking);
    setMsgs(m => m.map((mm, i) => i === idx ? { ...mm, card: { ...mm.card, done: true, ref } } : mm)
      .concat([{ who: "agent", body: t("chat.book.done", { car: car.name, ref }) }]));
    setOpen(o => { if (!o) setUnread(true); return o; });
  }
  function newChat() { setCloseMenu(false); setMsgs([]); pushAgent(t("chat.greeting")); }
  function endChat() { setCloseMenu(false); setMsgs([]); setOpen(false); }

  const quicks = ["chat.q1", "chat.q2", "chat.q3"];
  const panelW = mobile ? "calc(100vw - 28px)" : 360;
  const panelH = mobile ? "min(72vh, 540px)" : 500;

  return (
    <div style={{ position: "fixed", right: mobile ? 14 : 24, bottom: mobile ? 14 : 24, zIndex: 150, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
      {open && (
        <div className="pop-in" style={{
          width: panelW, height: panelH, display: "flex", flexDirection: "column", position: "relative",
          background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-lg)", overflow: "hidden",
        }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderBottom: "1px solid var(--hairline-soft)", background: "var(--bg-2)" }}>
            <div style={{ position: "relative", width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", flexShrink: 0 }}>
              <Icon name="chat" size={19} />
              <span style={{ position: "absolute", right: -1, bottom: -1, width: 11, height: 11, borderRadius: 999, background: "var(--green)", border: "2px solid var(--bg-2)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.1 }}>{t("chat.title")}</div>
              <div style={{ fontSize: 11.5, color: "var(--green)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--green)" }} /> {t("chat.online")}
              </div>
            </div>
            <button onClick={() => setCloseMenu(true)} aria-label="Chat options" style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--text-3)" }}>
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* close / new chat menu */}
          {closeMenu && (
            <>
              <div onClick={() => setCloseMenu(false)} style={{ position: "absolute", inset: 0, background: "var(--scrim)", zIndex: 5 }} />
              <div className="pop-in" style={{ position: "absolute", top: 62, right: 14, zIndex: 6, width: 216, padding: 8, background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: 14, boxShadow: "var(--shadow)" }}>
                <div style={{ padding: "6px 10px 10px", fontSize: 13.5, fontWeight: 700, borderBottom: "1px solid var(--hairline-soft)", marginBottom: 6 }}>{t("chat.endtitle")}</div>
                {[["refresh", "chat.new", newChat], ["x", "chat.end", endChat], ["chat", "chat.keep", () => setCloseMenu(false)]].map(([ic, key, fn]) => (
                  <button key={key} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, fontSize: 13.5, color: "var(--text-2)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <Icon name={ic} size={15} /> {t(key)}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* messages */}
          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.who === "me" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
                <div style={{
                  padding: "10px 13px", borderRadius: 14, fontSize: 13.6, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
                  background: m.who === "me" ? "linear-gradient(135deg, var(--gold), var(--gold-dim))" : "var(--surface-2)",
                  color: m.who === "me" ? "var(--gold-ink)" : "var(--text)",
                  borderBottomRightRadius: m.who === "me" ? 5 : 14,
                  borderBottomLeftRadius: m.who === "me" ? 14 : 5,
                  border: m.who === "me" ? "none" : "1px solid var(--hairline-soft)",
                }}>{renderChatBody(m.body)}</div>
                {m.card && (() => {
                  const car = cars.find(c => c.id === m.card.carId);
                  const priced = car ? priceBooking(car, m.card.from, m.card.to, {}) : null;
                  return (
                    <div style={{ marginTop: 8, padding: "13px 14px", borderRadius: 14, borderBottomLeftRadius: 5, background: "var(--bg-2)", border: "1px solid var(--gold-glow)" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{m.card.carName}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 2 }}>{fmtDate(m.card.from)} – {fmtDate(m.card.to)}{priced ? ` · ${priced.days} ${t("unit.day")}` : ""}</div>
                      {priced && <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>{fmtMoney(priced.total)} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)" }}>{t("chat.book.std")}</span></div>}
                      {m.card.done ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                          <Icon name="check" size={15} /> {t("chat.book.confirmed")} · <span style={{ fontFamily: "var(--font-mono)" }}>{m.card.ref}</span>
                        </div>
                      ) : (
                        <button onClick={() => confirmBooking(i, m.card)} style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                          color: "var(--gold-ink)", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}><Icon name="check" size={16} /> {t("chat.book.confirm")}</button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: "flex-start" }}>
                <div style={{ display: "flex", gap: 4, padding: "12px 14px", borderRadius: 14, borderBottomLeftRadius: 5, background: "var(--surface-2)", border: "1px solid var(--hairline-soft)" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-3)", animation: `chatDot 1s ${i * 0.16}s infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* quick replies */}
          {msgs.length <= 1 && (
            <div style={{ display: "flex", gap: 7, padding: "0 16px 10px", flexWrap: "wrap" }}>
              {quicks.map(q => (
                <button key={q} onClick={() => send(t(q))} style={{
                  padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                  color: "var(--gold)", background: "var(--gold-glow)", border: "1px solid var(--gold-glow)",
                }}>{t(q)}</button>
              ))}
            </div>
          )}

          {/* input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px 14px", borderTop: "1px solid var(--hairline-soft)" }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder={t("chat.placeholder")}
              style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--hairline-soft)", borderRadius: 999, padding: "11px 16px", color: "var(--text)", fontSize: 13.6, outline: "none" }}
            />
            <button onClick={() => send()} aria-label={t("chat.send")} disabled={!text.trim()} style={{
              width: 42, height: 42, flexShrink: 0, borderRadius: 999, display: "grid", placeItems: "center",
              background: text.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-dim))" : "var(--surface-2)",
              color: text.trim() ? "var(--gold-ink)" : "var(--text-3)", transition: "background .2s",
              border: text.trim() ? "none" : "1px solid var(--hairline-soft)",
            }}>
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* launcher */}
      <button onClick={() => setOpen(o => !o)} aria-label={t("chat.launch")} style={{
        position: "relative", width: 58, height: 58, borderRadius: 999, display: "grid", placeItems: "center",
        background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)",
        boxShadow: "0 14px 34px -10px var(--gold-glow), var(--shadow)", border: "none", cursor: "pointer",
        transition: "transform .2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
        <Icon name={open ? "x" : "chat"} size={24} />
        {unread && !open && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: 999, background: "var(--red)", border: "2px solid var(--bg)" }} />
        )}
      </button>
    </div>
  );
}

/* ---------- Damage reporting (photo upload, used by customer + admin) ---------- */
// Downscale uploaded images to keep the simulated DB (localStorage) small.
function filesToPhotos(files, cb) {
  const arr = Array.from(files).slice(0, 4);
  if (!arr.length) { cb([]); return; }
  const out = []; let pending = arr.length;
  arr.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const max = 1100; let { width, height } = img;
        if (width > max || height > max) { const r = Math.min(max / width, max / height); width = Math.round(width * r); height = Math.round(height * r); }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        out.push(canvas.toDataURL("image/jpeg", 0.72));
        if (--pending === 0) cb(out);
      };
      img.onerror = () => { if (--pending === 0) cb(out); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function DamageModal({ booking, bookings, cars, by, onClose, onSave }) {
  const { t } = useT();
  const fixed = !!booking;
  const [bookingId, setBookingId] = useStateC(booking ? booking.id : (bookings && bookings[0] ? bookings[0].id : ""));
  const [phase, setPhase] = useStateC("pickup");
  const [severity, setSeverity] = useStateC("minor");
  const [note, setNote] = useStateC("");
  const [photos, setPhotos] = useStateC([]);
  const [busy, setBusy] = useStateC(false);
  const list = bookings || (booking ? [booking] : []);
  const activeBooking = booking || list.find(b => b.id === bookingId);
  const car = activeBooking ? (cars || []).find(c => c.id === activeBooking.carId) : null;

  const onPick = (e) => {
    const files = e.target.files; if (!files || !files.length) return;
    setBusy(true);
    filesToPhotos(files, (arr) => { setPhotos(p => [...p, ...arr].slice(0, 4)); setBusy(false); });
    e.target.value = "";
  };
  const save = () => {
    if (!activeBooking) return;
    onSave({
      bookingId: activeBooking.id, carId: activeBooking.carId,
      carName: activeBooking.car || (car && car.name) || "",
      customer: activeBooking.customer || "", by, phase, severity, note: note.trim(), photos, resolved: false,
    });
    onClose();
  };

  return ReactDOM.createPortal((
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="pop-in" style={{ width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "var(--elevated)", border: "1px solid var(--hairline)", borderRadius: "var(--r-xl)", padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{t("dmg.eyebrow")}</div>
            <h3 className="display" style={{ fontSize: 22 }}>{t("dmg.title")}</h3>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--text-3)", border: "1px solid var(--hairline-soft)" }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {!fixed && (
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{t("dmg.booking")}</span>
              <select value={bookingId} onChange={e => setBookingId(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
                {list.map(b => <option key={b.id} value={b.id}>{b.id} · {b.car} · {b.customer}</option>)}
              </select>
            </label>
          )}
          {car && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg-2)", borderRadius: 11, border: "1px solid var(--hairline-soft)" }}>
              <img src={(window.PHOTO_MAP && window.PHOTO_MAP[car.photo]) || car.photo} alt="" style={{ width: 64, height: 42, objectFit: "cover", borderRadius: 8 }} />
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{car.name}</div><div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{activeBooking.id}</div></div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{t("dmg.phase")}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["pickup", "return"].map(p => (
                  <button key={p} onClick={() => setPhase(p)} style={segBtn(phase === p)}>{t("dmg.phase." + p)}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{t("dmg.severity")}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["minor", "major"].map(s => (
                  <button key={s} onClick={() => setSeverity(s)} style={segBtn(severity === s)}>{t("dmg.sev." + s)}</button>
                ))}
              </div>
            </div>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{t("dmg.note")}</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder={t("dmg.noteph")} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </label>

          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}>{t("dmg.photos")}</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative", width: 84, height: 64 }}>
                  <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9, border: "1px solid var(--hairline)" }} />
                  <button onClick={() => setPhotos(arr => arr.filter((_, j) => j !== i))} style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: 999, background: "var(--red)", color: "#fff", display: "grid", placeItems: "center", border: "2px solid var(--elevated)" }}><Icon name="x" size={11} /></button>
                </div>
              ))}
              {photos.length < 4 && (
                <label style={{ width: 84, height: 64, borderRadius: 9, border: "1.5px dashed var(--hairline)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text-3)", background: "var(--bg-2)" }}>
                  <input type="file" accept="image/*" multiple onChange={onPick} style={{ display: "none" }} />
                  <span style={{ display: "grid", placeItems: "center", gap: 2 }}><Icon name={busy ? "clock" : "camera"} size={20} /></span>
                </label>
              )}
            </div>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t("dmg.photohint")}</span>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "var(--text-2)", border: "1px solid var(--hairline-soft)" }}>{t("dmg.cancel")}</button>
            <button onClick={save} disabled={!activeBooking || busy} style={{ padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "var(--gold-ink)", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", border: "none", opacity: (!activeBooking || busy) ? 0.6 : 1 }}>{t("dmg.submit")}</button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}
function segBtn(on) {
  return { flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, textAlign: "center", cursor: "pointer", color: on ? "var(--gold-ink)" : "var(--text-2)", background: on ? "linear-gradient(135deg, var(--gold), var(--gold-dim))" : "var(--surface-2)", border: on ? "none" : "1px solid var(--hairline-soft)" };
}

/* ---------- My Trips (customer booking management) ---------- */
function TripCard({ b, car, onCancel, onModify, onReview, onDamage, existingReview, go }) {
  const { t } = useT();
  const eff = effectiveStatus(b);
  const tone = STATUS_TONE[eff] || "gold";
  const canCancel = eff === "Upcoming" || eff === "Active";
  const canModify = eff === "Upcoming";
  const canReview = eff === "Completed";
  const canDamage = eff === "Active" || eff === "Completed";
  const canKeyless = eff === "Active" && b.keyless;
  const [confirming, setConfirming] = useStateC(false);
  const [unlock, setUnlock] = useStateC("idle");   // idle | unlocking | open
  React.useEffect(() => {
    if (unlock !== "unlocking") return;
    const a = setTimeout(() => setUnlock("open"), 1600);
    return () => clearTimeout(a);
  }, [unlock]);
  React.useEffect(() => {
    if (unlock !== "open") return;
    const a = setTimeout(() => setUnlock("idle"), 6000);
    return () => clearTimeout(a);
  }, [unlock]);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", cursor: car ? "pointer" : "default" }} onClick={() => car && go && go("detail", null, car)}>
        {car
          ? <CarImage car={car} height={150} rounded={0} showLabel={false} />
          : <div style={{ height: 150, background: "var(--surface-2)" }} />}
        <div style={{ position: "absolute", top: 12, left: 12 }}><Badge tone={tone}>{txBStatus(t, eff)}</Badge></div>
        <div style={{ position: "absolute", top: 12, right: 12, background: "var(--glass)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "5px 11px", fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.04em", color: "var(--text)" }}>{b.id}</div>
      </div>
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 3 }}>{(car && car.brand) || ""}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{b.car || (car && car.name) || "—"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", fontSize: 13 }}>
          <Detail icon="calendar" label={t("trips.dates")} value={`${fmtDate(b.from)} – ${fmtDate(b.to)}`} />
          <Detail icon="clock" label={t("trips.days")} value={t("bk.daysnote", { n: b.days || daysBetween(b.from, b.to) || 1 }).split("·")[0].trim()} />
          <Detail icon="pin" label={t("trips.pickup")} value={txLoc(t, b.pickup)} />
          <Detail icon="card" label={t("trips.total")} value={fmtMoney(b.total)} />
        </div>
        {b.promoCode && b.discount > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 11px", background: "var(--bg-2)", border: "1px solid rgba(111,207,151,0.4)", borderRadius: 9 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="tag" size={13} /> {b.promoCode}
            </span>
            <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 12.5 }}>−{fmtMoney(b.discount)}</span>
          </div>
        )}
        {(canCancel || canReview || canModify) && (
          <div style={{ marginTop: "auto", paddingTop: 4 }}>
            {canReview ? (
              existingReview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ display: "inline-flex", gap: 1, flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map(n => <Icon key={n} name="star" size={14} stroke={existingReview.rating >= n ? 0 : 1.5} style={{ fill: existingReview.rating >= n ? "var(--gold)" : "none", color: "var(--gold)" }} />)}
                  </span>
                  <button onClick={() => onReview(b)} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gold)" }}>{t("trips.editReview")}</button>
                </div>
              ) : (
                <button onClick={() => onReview(b)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "var(--gold-ink)", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", border: "none" }}>
                  <Icon name="star" size={15} /> {t("trips.review")}
                </button>
              )
            ) : confirming ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "var(--text-3)", flex: 1 }}>{t("trips.cancelConfirm")}</span>
                <button onClick={() => setConfirming(false)} style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", border: "1px solid var(--hairline-soft)" }}>{t("trips.keep")}</button>
                <button onClick={() => { setConfirming(false); onCancel(b.id); }} style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: "#fff", background: "var(--red)", border: "none" }}>{t("trips.cancelYes")}</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                {canModify && (
                  <button onClick={() => onModify(b)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "var(--text)", background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
                    <Icon name="edit" size={15} /> {t("trips.modify")}
                  </button>
                )}
                <button onClick={() => setConfirming(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "var(--red)", background: "transparent", border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)" }}>
                  <Icon name="x" size={15} /> {t("trips.cancel")}
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <button onClick={() => printVoucher(b, { car, total: b.total, t })} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: "1 1 45%", padding: "9px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)" }}>
                <Icon name="copy" size={14} /> {t("confirm.voucher")}
              </button>
              <button onClick={() => printInvoice(b, { car, total: b.total, t })} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: "1 1 45%", padding: "9px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)" }}>
                <Icon name="card" size={14} /> {t("inv.download")}
              </button>
              {canDamage && onDamage && (
                <button onClick={() => onDamage(b)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: "1 1 100%", padding: "9px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", background: "var(--bg-2)", border: "1px solid var(--hairline-soft)" }}>
                  <Icon name="alert" size={14} /> {t("dmg.report")}
                </button>
              )}
              {canKeyless && (
                <button onClick={() => unlock === "idle" && setUnlock("unlocking")} disabled={unlock !== "idle"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: "1 1 100%", padding: "12px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: unlock === "open" ? "var(--green)" : "var(--gold-ink)", background: unlock === "open" ? "rgba(111,207,151,0.14)" : "linear-gradient(135deg, var(--gold), var(--gold-dim))", border: unlock === "open" ? "1px solid rgba(111,207,151,0.5)" : "none", transition: "all .3s" }}>
                  <Icon name={unlock === "open" ? "checkCircle" : "phone"} size={15} className={unlock === "unlocking" ? "spin" : ""} />
                  {unlock === "idle" ? t("keyless.unlock") : unlock === "unlocking" ? t("keyless.unlocking") : t("keyless.open")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Icon name={icon} size={15} style={{ color: "var(--gold)", marginTop: 1, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--text-3)", fontSize: 11 }}>{label}</div>
        <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, car, user, existing, onSubmit, onClose }) {
  const { t } = useT();
  const [rating, setRating] = useStateC(existing ? existing.rating : 0);
  const [body, setBody] = useStateC(existing ? existing.body : "");
  const valid = rating >= 1 && body.trim().length >= 3;
  const submit = () => {
    if (!valid) return;
    onSubmit({
      id: existing ? existing.id : undefined,
      bookingId: booking.id,
      carId: booking.carId,
      author: (user && user.name) || (booking.customer) || t("cauth.member"),
      email: (user && user.email) || booking.email || "",
      rating, body: body.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
    });
  };
  return (
    <div style={{ padding: "30px 30px 26px" }}>
      <div className="eyebrow" style={{ marginBottom: 9 }}>{t("trips.reviewEyebrow")}</div>
      <h2 className="display" style={{ fontSize: 23, marginBottom: 6, letterSpacing: "-0.02em" }}>{t("trips.reviewTitle")}</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13.5, marginBottom: 20 }}>{car ? car.name : booking.car} · {fmtDate(booking.from)} – {fmtDate(booking.to)}</p>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 9 }}>{t("trips.yourRating")}</div>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <Field label={t("trips.yourReview")}>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder={t("trips.reviewPlaceholder")}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, fontFamily: "var(--font-body)" }} />
      </Field>
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>{t("trips.keep")}</Button>
        <Button variant="primary" iconRight="arrowR" onClick={submit} disabled={!valid}
          style={{ flex: 2, opacity: valid ? 1 : 0.45, pointerEvents: valid ? "auto" : "none" }}>{t("trips.submitReview")}</Button>
      </div>
    </div>
  );
}

/* ---------- Rewards card (loyalty summary in My Trips) ---------- */
function RewardsCard({ member, mobile }) {
  const { t } = useT();
  const prog = loyaltyProgress(member.spend);
  const tierTone = { Bronze: "#c08552", Silver: "#b6b1a6", Gold: "var(--gold)", Platinum: "var(--gold-hi)" };
  return (
    <div style={{ background: "linear-gradient(135deg, var(--surface), var(--surface-2))", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", padding: mobile ? "20px" : "24px 28px", marginBottom: 38, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 20 : 32, alignItems: mobile ? "stretch" : "center" }}>
      {/* tier + points */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--gold-glow)", color: tierTone[member.tier] || "var(--gold)" }}>
          <Icon name="trophy" size={26} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-3)" }}>{t("loy.member")}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: tierTone[member.tier] || "var(--text)" }}>{member.tier}</div>
        </div>
      </div>

      {/* points balance */}
      <div style={{ textAlign: mobile ? "left" : "center", paddingLeft: mobile ? 0 : 8 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26 }} className="gold-text">{(member.points || 0).toLocaleString()}</div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t("loy.points")} · {fmtMoney(pointsToEuros(member.points))} {t("loy.value")}</div>
      </div>

      {/* progress to next tier */}
      <div style={{ flex: 1.4, minWidth: 0 }}>
        {prog.next ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text-2)", marginBottom: 7 }}>
              <span>{t("loy.toNext", { amount: fmtMoney(prog.toNext), tier: prog.next.id })}</span>
              <span style={{ color: "var(--text-3)" }}>{prog.pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", border: "1px solid var(--hairline-soft)" }}>
              <div style={{ width: `${prog.pct}%`, height: "100%", background: "linear-gradient(90deg, var(--gold-dim), var(--gold))", borderRadius: 999 }} />
            </div>
            {prog.next.discount > 0 && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>{t("loy.unlocks", { tier: prog.next.id, pct: prog.next.discount })}</div>}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gold)", fontSize: 13.5, fontWeight: 600 }}>
            <Icon name="star" size={15} style={{ fill: "var(--gold)" }} stroke={0} /> {t("loy.topTier")}
          </div>
        )}
      </div>
    </div>
  );
}

function MyTrips({ bookings, cars, reviews, member, user, onCancel, onUpdate, onAddReview, onAddDamage, go }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const [reviewFor, setReviewFor] = useStateC(null);
  const [modifyFor, setModifyFor] = useStateC(null);
  const [damageFor, setDamageFor] = useStateC(null);
  const carById = React.useMemo(() => Object.fromEntries((cars || []).map(c => [c.id, c])), [cars]);
  const reviewByBooking = React.useMemo(() => {
    const m = {};
    (reviews || []).forEach(r => { if (r.bookingId) m[r.bookingId] = r; });
    return m;
  }, [reviews]);
  const email = (user && user.email || "").trim().toLowerCase();
  const mine = (bookings || []).filter(b => {
    if (email && b.email) return (b.email || "").trim().toLowerCase() === email;
    return user && b.customer && b.customer.trim().toLowerCase() === (user.name || "").trim().toLowerCase();
  });
  const order = { Active: 0, Upcoming: 1, Completed: 2, Cancelled: 3 };
  const sorted = [...mine].sort((a, b) => (order[effectiveStatus(a)] - order[effectiveStatus(b)]) || (new Date(b.from) - new Date(a.from)));
  const upcoming = sorted.filter(b => { const s = effectiveStatus(b); return s === "Active" || s === "Upcoming"; });
  const past = sorted.filter(b => { const s = effectiveStatus(b); return s === "Completed" || s === "Cancelled"; });

  const Grid = ({ list }) => (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
      {list.map(b => <TripCard key={b.id} b={b} car={carById[b.carId]} onCancel={onCancel} onModify={setModifyFor} onReview={setReviewFor} onDamage={onAddDamage ? setDamageFor : null} existingReview={reviewByBooking[b.id]} go={go} />)}
    </div>
  );

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? "30px 18px 60px" : "54px 32px 80px", minHeight: "60vh" }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{t("trips.eyebrow")}</div>
      <h1 className="display" style={{ fontSize: mobile ? 32 : 40, marginBottom: 8, letterSpacing: "-0.02em" }}>{t("trips.title")}</h1>
      <p style={{ color: "var(--text-3)", fontSize: 15, marginBottom: 34 }}>
        {user && (user.name || user.email) ? t("trips.subFor", { name: user.name || user.email }) : t("trips.sub")}
      </p>

      {member && <RewardsCard member={member} mobile={mobile} />}

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, margin: "0 auto 20px", display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--gold)" }}>
            <Icon name="calendar" size={28} stroke={1.5} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{t("trips.emptyTitle")}</div>
          <p style={{ color: "var(--text-3)", fontSize: 14.5, maxWidth: 380, margin: "0 auto 22px", lineHeight: 1.5 }}>{t("trips.emptyBody")}</p>
          <Button variant="primary" iconRight="arrowR" onClick={() => go("browse")}>{t("trips.browse")}</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {upcoming.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                {t("trips.upcoming")} <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-body)", fontWeight: 500 }}>· {upcoming.length}</span>
              </h2>
              <Grid list={upcoming} />
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                {t("trips.past")} <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-body)", fontWeight: 500 }}>· {past.length}</span>
              </h2>
              <Grid list={past} />
            </div>
          )}
        </div>
      )}

      <Modal open={!!modifyFor} onClose={() => setModifyFor(null)} width={560} label="Modify booking">
        {modifyFor && (
          <ModifyBooking booking={modifyFor} car={carById[modifyFor.carId]} bookings={bookings}
            onSave={(upd) => { onUpdate(upd); setModifyFor(null); }}
            onClose={() => setModifyFor(null)} />
        )}
      </Modal>

      <Modal open={!!reviewFor} onClose={() => setReviewFor(null)} width={480} label="Write a review">
        {reviewFor && (
          <ReviewModal booking={reviewFor} car={carById[reviewFor.carId]} user={user}
            existing={reviewByBooking[reviewFor.id]}
            onSubmit={(rev) => { onAddReview(rev); setReviewFor(null); }}
            onClose={() => setReviewFor(null)} />
        )}
      </Modal>

      {damageFor && (
        <DamageModal booking={damageFor} cars={cars} by="customer"
          onSave={(r) => onAddDamage(r)}
          onClose={() => setDamageFor(null)} />
      )}
    </section>
  );
}

/* ---------- Promo banner (dismissible, rotates the active code) ---------- */
function pickFeaturedPromo(promos, seed) {
  const today = new Date().toISOString().slice(0, 10);
  const live = (promos || []).filter(p =>
    p.active && (!p.expires || p.expires >= today) && (p.limit === 0 || (p.used || 0) < p.limit)
  );
  if (!live.length) return null;
  // Order most-generous first for a consistent rotation order, then pick by seed
  // so the surfaced code changes on each reload and after every reservation.
  const score = p => p.type === "percent" ? p.value * 3 : p.value;   // ~€ per typical booking
  const ordered = live.slice().sort((a, b) => score(b) - score(a));
  const idx = ((seed || 0) % ordered.length + ordered.length) % ordered.length;
  return ordered[idx];
}

function PromoBanner({ promos, rotate = 0, onBook }) {
  const { t } = useT();
  // Random starting offset chosen once per page load → a different code each refresh.
  const baseRef = React.useRef(Math.floor(Math.random() * 997));
  const promo = React.useMemo(() => pickFeaturedPromo(promos, baseRef.current + rotate), [promos, rotate]);
  // Shows on every visit/reload — dismissal only hides it until the next load.
  const [dismissed, setDismissed] = useStateC(false);
  const [copied, setCopied] = useStateC(false);
  // A freshly rotated code (after a reservation) should re-show even if dismissed.
  React.useEffect(() => { setDismissed(false); setCopied(false); }, [rotate]);
  if (!promo || dismissed) return null;

  const close = () => setDismissed(true);
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(promo.code); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const offer = promo.type === "percent" ? `${promo.value}%` : fmtMoney(promo.value);

  return (
    <div style={{
      position: "relative", zIndex: 60,
      background: "linear-gradient(100deg, var(--gold-dim), var(--gold))",
      color: "var(--gold-ink)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
          <Icon name="tag" size={15} />
          {t("promobanner.text", { offer })}
        </span>
        <button onClick={copy} title={t("promobanner.copy")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: "rgba(0,0,0,0.16)", color: "var(--gold-ink)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", border: "1px solid rgba(0,0,0,0.12)" }}>
          {promo.code}
          <Icon name={copied ? "check" : "copy"} size={13} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: 0 }}>{copied ? t("promobanner.copied") : t("promobanner.copy")}</span>
        </button>
      </div>
      <button onClick={close} aria-label={t("promobanner.dismiss")}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 8, color: "var(--gold-ink)", opacity: 0.75 }}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

Object.assign(window, { SiteHeader, Hero, CategoryStrip, CarCard, Featured, HowItWorks, Footer, LangSwitcher, ThemeToggle, AccountMenu, CustomerAuth, ChatWidget, MyTrips, PromoBanner, RewardsCard, DamageModal, filesToPhotos });
