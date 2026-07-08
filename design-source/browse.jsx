/* ============================================================
   APIRENTAL — Browse (filters + grid) & Car detail
   ============================================================ */
const { useState: useStateBr, useMemo: useMemoBr } = React;

/* ---------- Browse ---------- */
function BrowseView({ cars, bookings = [], filter, setFilter, onClick, onBook }) {
  const { t } = useT();
  const mobile = useIsMobile(760);
  const [sort, setSort] = useStateBr("featured");

  const filtered = useMemoBr(() => {
    let r = cars.filter(c => {
      if (filter.cat !== "All" && c.category !== filter.cat) return false;
      if (filter.trans !== "Any" && c.transmission !== filter.trans) return false;
      if (filter.seats !== "Any" && c.seats < +filter.seats) return false;
      if (c.price < filter.priceMin || c.price > filter.priceMax) return false;
      if (filter.q && !(`${c.brand} ${c.name}`.toLowerCase().includes(filter.q.toLowerCase()))) return false;
      if (filter.from && filter.to && !isCarAvailable(bookings, c.id, filter.from, filter.to)) return false;
      return true;
    });
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "featured") r = [...r].sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
    return r;
  }, [cars, bookings, filter, sort]);

  const fleetMax = 900;
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "24px 18px 50px" : "30px 32px 60px" }}>
      <div className="fade-in" style={{ marginBottom: 26 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{t("browse.eyebrow")}</div>
        <h1 className="display" style={{ fontSize: mobile ? 32 : 40 }}>{t("browse.title")}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "264px 1fr", gap: mobile ? 20 : 28, alignItems: "start" }}>
        {/* Filters */}
        <aside style={{ position: mobile ? "static" : "sticky", top: 88, background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <Icon name="sliders" size={18} style={{ color: "var(--gold)" }} />
            <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 16 }}>{t("browse.filters")}</span>
            <button onClick={() => setFilter({ cat: "All", trans: "Any", seats: "Any", priceMin: 0, priceMax: fleetMax, q: "", from: "", to: "" })}
              style={{ marginLeft: "auto", fontSize: 12, color: "var(--gold)" }}>{t("browse.reset")}</button>
          </div>

          <FilterGroup label={t("browse.dates")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{t("bk.pickupdate")}</div>
                <TextInput type="date" value={filter.from || ""} onChange={e => setFilter({ ...filter, from: e.target.value })} style={{ padding: "9px 10px", fontSize: 12.5 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{t("bk.returndate")}</div>
                <TextInput type="date" value={filter.to || ""} min={filter.from || undefined} onChange={e => setFilter({ ...filter, to: e.target.value })} style={{ padding: "9px 10px", fontSize: 12.5 }} />
              </div>
            </div>
            {filter.from && filter.to && (
              <button onClick={() => setFilter({ ...filter, from: "", to: "" })} style={{ marginTop: 9, fontSize: 11.5, color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="x" size={12} /> {t("browse.cleardates")}
              </button>
            )}
          </FilterGroup>

          <Field label={t("browse.search")} style={{ marginBottom: 18 }}>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-3)" }} />
              <TextInput value={filter.q} placeholder={t("browse.searchph")} onChange={e => setFilter({ ...filter, q: e.target.value })} style={{ paddingLeft: 36 }} />
            </div>
          </Field>

          <FilterGroup label={t("browse.class")}>
            {["All", ...CATEGORIES].map(c => (
              <Chip key={c} active={filter.cat === c} onClick={() => setFilter({ ...filter, cat: c })}>{c === "All" ? t("search.all") : txCat(t, c)}</Chip>
            ))}
          </FilterGroup>

          <FilterGroup label={`${t("browse.maxprice")} · ${fmtMoney(filter.priceMax)}`}>
            <input type="range" min={50} max={fleetMax} step={10} value={filter.priceMax}
              onChange={e => setFilter({ ...filter, priceMax: +e.target.value })}
              style={{ width: "100%", accentColor: "var(--gold)" }} />
          </FilterGroup>

          <FilterGroup label={t("browse.trans")}>
            {["Any", "Automatic", "Manual"].map(tr => (
              <Chip key={tr} active={filter.trans === tr} onClick={() => setFilter({ ...filter, trans: tr })}>{tr === "Any" ? t("browse.any") : tr === "Automatic" ? t("trans.automatic") : t("trans.manual")}</Chip>
            ))}
          </FilterGroup>

          <FilterGroup label={t("browse.minseats")} last>
            {["Any", "2", "4", "5"].map(s => (
              <Chip key={s} active={filter.seats === s} onClick={() => setFilter({ ...filter, seats: s })}>{s === "Any" ? t("browse.any") : s}</Chip>
            ))}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ color: "var(--text-2)", fontSize: 14 }}><b style={{ color: "var(--text)" }}>{filtered.length}</b> {t("browse.available")}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>{t("browse.sort")}</span>
              <Select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto", padding: "9px 34px 9px 14px", fontSize: 13.5 }}>
                <option value="featured">{t("sort.featured")}</option>
                <option value="price-asc">{t("sort.priceasc")}</option>
                <option value="price-desc">{t("sort.pricedesc")}</option>
                <option value="rating">{t("sort.rating")}</option>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "70px 0", textAlign: "center", color: "var(--text-3)" }}>
              <Icon name="search" size={36} style={{ opacity: 0.4, marginBottom: 14 }} />
              <p>{t("browse.empty")}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 22 }}>
              {filtered.map(c => <CarCard key={c.id} car={c} onClick={onClick} onBook={onBook} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 18, paddingBottom: last ? 0 : 18, borderBottom: last ? "none" : "1px solid var(--hairline-soft)" }}>
      <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 11, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{children}</div>
    </div>
  );
}
function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, transition: "all .18s",
      background: active ? "var(--gold-glow)" : "var(--bg-2)",
      color: active ? "var(--gold-hi)" : "var(--text-2)",
      border: `1px solid ${active ? "var(--gold-glow)" : "var(--hairline-soft)"}`,
    }}>{children}</button>
  );
}

/* ---------- Car detail ---------- */
function DetailView({ car, onBack, onBook, cars, reviews, onClick }) {
  const { t } = useT();
  const mobile = useIsMobile(820);
  const [activeImg, setActiveImg] = useStateBr(0);
  const related = cars.filter(c => c.category === car.category && c.id !== car.id).slice(0, 3);
  const carReviews = visibleReviewsFor(reviews, car.id).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const specs = [
    { icon: "gauge", label: t("spec.zero"), value: car.zeroTo },
    { icon: "bolt", label: t("spec.power"), value: car.power },
    { icon: "trend", label: t("spec.top"), value: car.topSpeed },
    { icon: "seat", label: t("spec.seats"), value: car.seats },
    { icon: "gear", label: t("spec.trans"), value: car.transmission === "Automatic" ? t("trans.automatic") : t("trans.manual") },
    { icon: "fuel", label: t("spec.fuel"), value: txFuel(t, car.fuel) },
    { icon: "car", label: t("spec.drive"), value: car.drivetrain },
    { icon: "calendar", label: t("spec.year"), value: car.year },
  ];
  return (
    <div className="fade-in" style={{ maxWidth: 1240, margin: "0 auto", padding: mobile ? "16px 18px 50px" : "20px 32px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: 14, marginBottom: 22, padding: "6px 0" }}>
        <Icon name="arrowL" size={17} /> {t("detail.back")}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.5fr 1fr", gap: mobile ? 26 : 36, alignItems: "start" }}>
        {/* gallery */}
        <div>
          <CarImage car={car} height={mobile ? 240 : 400} rounded={22} slotId={`car-${car.id}-0`} placeholder={`Drop ${car.brand} — main photo`} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 12 }}>
            {["Interior", "Rear", "Detail"].map((lbl, i) => (
              <CarImage key={lbl} car={car} height={92} rounded={12} slotId={`car-${car.id}-${i + 1}`} placeholder={lbl} />
            ))}
          </div>

          {/* specs grid */}
          <div style={{ marginTop: 34 }}>
            <h3 className="display" style={{ fontSize: 22, marginBottom: 20 }}>{t("detail.specs")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "22px 18px" }}>
              {specs.map(s => <Spec key={s.label} {...s} />)}
            </div>
          </div>

          {/* features */}
          <div style={{ marginTop: 34 }}>
            <h3 className="display" style={{ fontSize: 22, marginBottom: 18 }}>{t("detail.highlights")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px),1fr))", gap: "12px 24px" }}>
              {car.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14.5, color: "var(--text-2)" }}>
                  <Icon name="check" size={16} style={{ color: "var(--gold)", flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sticky booking card */}
        <div style={{ position: mobile ? "static" : "sticky", top: 88, order: mobile ? -1 : 0 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", padding: 28, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Badge tone="gold">{txCat(t, car.category)}</Badge>
              <Badge tone={STATUS_TONE[car.status]}>{txStatus(t, car.status)}</Badge>
            </div>
            <div style={{ color: "var(--text-3)", fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>{car.brand}</div>
            <h1 className="display" style={{ fontSize: 30, margin: "3px 0 12px", lineHeight: 1.05 }}>{car.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-3)", fontSize: 13.5, marginBottom: 16 }}>
              <Stars value={car.rating} /> {car.reviewCount ? <span>· {t("detail.reviewsCount", { n: car.reviewCount })}</span> : null} · {car.trips} {t("detail.trips")}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="pin" size={14} style={{ color: "var(--gold)" }} />{txLoc(t, car.location)}</span>
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.55, marginBottom: 22 }}>{car.blurb}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20, paddingBottom: 22, borderBottom: "1px solid var(--hairline-soft)" }}>
              <span className="display gold-text" style={{ fontSize: 38 }}>{fmtMoney(car.price)}</span>
              <span style={{ color: "var(--text-3)", fontSize: 15 }}>{t("card.perday")}</span>
            </div>
            <Button variant="primary" size="lg" full iconRight="arrowR" onClick={() => onBook(car)}
              disabled={car.status === "Maintenance"}
              style={{ opacity: car.status === "Maintenance" ? 0.4 : 1, pointerEvents: car.status === "Maintenance" ? "none" : "auto" }}>
              {car.status === "Maintenance" ? t("detail.unavailable") : t("detail.reserve")}
            </Button>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, color: "var(--text-3)", fontSize: 12.5 }}>
              <Icon name="shield" size={15} style={{ color: "var(--green)" }} /> {t("detail.cancel")}
            </div>
          </div>
        </div>
      </div>

      {/* reviews */}
      <div style={{ marginTop: 56 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          <h3 className="display" style={{ fontSize: 24 }}>{t("detail.reviews")}</h3>
          {carReviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--text-3)", fontSize: 14 }}>
              <Stars value={car.rating} size={15} /> · {t("detail.reviewsCount", { n: carReviews.length })}
            </div>
          )}
        </div>
        {carReviews.length === 0 ? (
          <div style={{ padding: "28px 24px", background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", color: "var(--text-3)", fontSize: 14.5 }}>{t("detail.noReviews")}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(min(100%, 360px), 1fr))", gap: 16 }}>
            {carReviews.map(rev => {
              const initials = (rev.author || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
              return (
                <div key={rev.id} style={{ background: "var(--surface)", border: "1px solid var(--hairline-soft)", borderRadius: "var(--r-lg)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", fontWeight: 700, fontSize: 13.5 }}>{initials}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{rev.author}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ display: "inline-flex", gap: 1 }}>
                          {[1, 2, 3, 4, 5].map(n => <Icon key={n} name="star" size={12} stroke={rev.rating >= n ? 0 : 1.5} style={{ fill: rev.rating >= n ? "var(--gold)" : "none", color: "var(--gold)" }} />)}
                        </span>
                        {rev.verified && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                            <Icon name="shield" size={12} /> {t("detail.verified")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ color: "var(--text-3)", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(rev.date)}</div>
                  </div>
                  <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.55, margin: 0 }}>{rev.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* related */}
      {related.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h3 className="display" style={{ fontSize: 24, marginBottom: 22 }}>{t("detail.related")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px),1fr))", gap: 22 }}>
            {related.map(c => <CarCard key={c.id} car={c} onClick={onClick} onBook={onBook} />)}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BrowseView, DetailView });
