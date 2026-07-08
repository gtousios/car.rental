/* ============================================================
   APIRENTAL — Shared UI primitives + icons
   ============================================================ */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

/* ---------- Icons (clean line set) ---------- */
const ICONS = {
  car: "M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v3h2m14-5a2 2 0 0 1 2 2v3h-2m0 0v2h-2v-2m-10 0v2H5v-2m0 0h14M7 14h.01M17 14h.01",
  bolt: "M13 2L4.5 13.5H11l-1 8.5L19.5 10.5H13l0-8.5z",
  mountain: "M3 20h18L14 7l-3.5 6L8 9l-5 11z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z",
  users: "M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 18.5c0-1.5-.7-2.8-1.8-3.5M6 18.5c0-1.5.7-2.8 1.8-3.5",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12c0-.5.06-1 .15-1.5l-1.6-1.2 1.6-2.8 1.9.6c.7-.6 1.5-1 2.4-1.4L9 3.5h3l.55 2.2c.9.3 1.7.8 2.4 1.4l1.9-.6 1.6 2.8-1.6 1.2c.1.5.15 1 .15 1.5s-.05 1-.15 1.5l1.6 1.2-1.6 2.8-1.9-.6c-.7.6-1.5 1-2.4 1.4L12 20.5H9l-.55-2.2c-.9-.3-1.7-.8-2.4-1.4l-1.9.6-1.6-2.8 1.6-1.2C4.06 13 4 12.5 4 12z",
  fuel: "M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h12M5 11h10M16 8l2.5 2.5a2 2 0 0 1 .6 1.4V18a1.5 1.5 0 0 0 3 0V9.5L18 6",
  seat: "M6 19v-3h9a2 2 0 0 0 2-2V4M6 16l-1.5-7M6 16h9M17 19h-3",
  gauge: "M12 14l4-4M5.6 18a9 9 0 1 1 12.8 0M12 14a2 2 0 1 0 0-.01",
  pin: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  arrowR: "M5 12h14M13 6l6 6-6 6",
  arrowL: "M19 12H5M11 6l-6 6 6 6",
  check: "M5 12l5 5 9-10",
  copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  checkCircle: "M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 6.5l3 3",
  trash: "M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0l1 13h8l1-13",
  download: "M12 3v12M8 11l4 4 4-4M5 21h14",
  dash: "M4 13h7V4H4v9zM13 21h7V11h-7v10zM13 4v4h7V4h-7zM4 21h7v-4H4v4z",
  cars: "M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14M6 14h.01M18 14h.01M3 16v2h2M19 18h2v-2",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  chart: "M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8M20 16v-3",
  shield: "M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  card: "M3 7h18v10H3zM3 11h18",
  logout: "M16 17l5-5-5-5M21 12H9M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4",
  menu: "M4 7h16M4 12h16M4 17h16",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4M14 4v4M6 10v4M12 16v4",
  heart: "M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20z",
  trophy: "M8 4h8v4a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 14h4M9 20h6M12 14v6",
  trend: "M3 17l6-6 4 4 7-8M21 7h-4M21 7v4",
  wrench: "M14.5 6.5a3.5 3.5 0 0 0-4.6 4.2l-6.6 6.6a1.5 1.5 0 0 0 2.1 2.1l6.6-6.6a3.5 3.5 0 0 0 4.2-4.6l-2.2 2.2-2-2 2.2-2.2z",
  alert: "M12 9v4M12 17h.01M10.3 3.9L2.4 18a1.6 1.6 0 0 0 1.4 2.4h16.4A1.6 1.6 0 0 0 21.6 18L13.7 3.9a1.6 1.6 0 0 0-2.8 0z",
  camera: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  sun: "M12 4V2M12 22v-2M5 5L3.5 3.5M20.5 20.5L19 19M4 12H2M22 12h-2M5 19l-1.5 1.5M20.5 3.5L19 5M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z",
  lock: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM12 14.5v2.5",
  tag: "M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6zM7.5 7.5h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeoff: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.1 6.1A17 17 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 3.1-.5",
  building: "M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 21V9h4a1 1 0 0 1 1 1v11M3 21h18M7.5 8h.01M10.5 8h.01M7.5 12h.01M10.5 12h.01M7.5 16h.01M10.5 16h.01",
  navigation: "M3 11l18-8-8 18-2-7-8-3z",
  user: "M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16m0 5v-5h5",
  chat: "M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5.3A8 8 0 1 1 21 11.5zM8.5 12h.01M12 12h.01M15.5 12h.01",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
};

function Icon({ name, size = 20, stroke = 1.6, className = "", style = {} }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const CAT_ICON = {
  "Luxury & Exotic": "bolt",
  "SUV & Off-road": "mountain",
  "Electric": "bolt",
  "Everyday": "car",
};

/* ---------- Button ---------- */
function Button({ children, variant = "primary", size = "md", icon, iconRight, full, style = {}, ...props }) {
  const sizes = {
    sm: { padding: "8px 14px", fontSize: 13 },
    md: { padding: "12px 22px", fontSize: 14.5 },
    lg: { padding: "16px 30px", fontSize: 16 },
  };
  const variants = {
    primary: { background: "linear-gradient(120deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", fontWeight: 700, boxShadow: "0 10px 28px -10px var(--gold-glow)" },
    ghost: { background: "transparent", color: "var(--text)", border: "1px solid var(--hairline)" },
    dark: { background: "var(--elevated)", color: "var(--text)", border: "1px solid var(--hairline-soft)" },
    danger: { background: "rgba(224,106,90,0.12)", color: "var(--red)", border: "1px solid rgba(224,106,90,0.3)" },
    link: { background: "transparent", color: "var(--gold)", padding: 0 },
  };
  return (
    <button {...props} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
      borderRadius: 999, letterSpacing: "0.01em", fontFamily: "var(--font-body)",
      transition: "transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .2s, filter .2s, background .2s",
      width: full ? "100%" : "auto", whiteSpace: "nowrap",
      ...sizes[size], ...variants[variant], ...style,
    }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(.97)"}
      onMouseUp={e => e.currentTarget.style.transform = ""}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
    >
      {icon && <Icon name={icon} size={size === "lg" ? 19 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 19 : 17} />}
    </button>
  );
}

/* ---------- Badge / Chip ---------- */
function Badge({ children, tone = "gold", style = {} }) {
  const tones = {
    gold:  { background: "var(--gold-glow)", color: "var(--gold-hi)", border: "1px solid var(--gold-glow)" },
    green: { background: "rgba(111,207,151,0.12)", color: "var(--green)", border: "1px solid rgba(111,207,151,0.28)" },
    red:   { background: "rgba(224,106,90,0.12)", color: "var(--red)", border: "1px solid rgba(224,106,90,0.28)" },
    amber: { background: "rgba(224,177,90,0.12)", color: "var(--amber)", border: "1px solid rgba(224,177,90,0.28)" },
    neutral:{ background: "rgba(245,240,230,0.06)", color: "var(--text-2)", border: "1px solid var(--hairline-soft)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px",
      borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em",
      fontFamily: "var(--font-body)", textTransform: "uppercase", ...tones[tone], ...style,
    }}>{children}</span>
  );
}

const STATUS_TONE = { Available: "green", Active: "green", Upcoming: "amber", Completed: "neutral", Cancelled: "red", Maintenance: "amber" };

/* ---------- Stars ---------- */
function Stars({ value, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--gold)" }}>
      <Icon name="star" size={size} stroke={0} style={{ fill: "var(--gold)" }} />
      <span style={{ fontSize: size, fontWeight: 700, color: "var(--text)" }}>{value.toFixed(1)}</span>
    </span>
  );
}

/* ---------- Reviews helpers ---------- */
// Visible (non-hidden) reviews for a car.
function visibleReviewsFor(reviews, carId) {
  return (reviews || []).filter(r => r.carId === carId && !r.hidden);
}
// Displayed rating = seed rating used as a prior, blended with real visible reviews.
function carRating(car, reviews) {
  const vis = visibleReviewsFor(reviews, car.id);
  if (!vis.length) return { value: car.rating, count: 0 };
  const PRIOR = 8; // weight of the seed rating
  const sum = vis.reduce((a, r) => a + r.rating, 0);
  const value = (car.rating * PRIOR + sum) / (PRIOR + vis.length);
  return { value: Math.round(value * 10) / 10, count: vis.length };
}
// Trip status derived from dates (a trip whose return date has passed is Completed),
// unless explicitly Cancelled. Used to gate reviews and section trips.
function effectiveStatus(b, today = new Date()) {
  if (!b) return "Upcoming";
  if (b.status === "Cancelled") return "Cancelled";
  const t = today.toISOString().slice(0, 10);
  if (b.to && b.to < t) return "Completed";
  if (b.from && b.from <= t && (!b.to || b.to >= t)) return "Active";
  return "Upcoming";
}

/* ---------- Promo codes ----------
   Validate a code against the grand total. Returns
   { ok, promo, discount, newTotal } or { ok:false, reason }. */
function validatePromo(codeStr, total, promos, today = new Date()) {
  const code = (codeStr || "").trim().toUpperCase();
  if (!code) return { ok: false, reason: "empty" };
  const promo = (promos || []).find(p => p.code.toUpperCase() === code);
  if (!promo) return { ok: false, reason: "notfound" };
  if (!promo.active) return { ok: false, reason: "inactive" };
  const t = today.toISOString().slice(0, 10);
  if (promo.expires && promo.expires < t) return { ok: false, reason: "expired" };
  if (promo.limit > 0 && (promo.used || 0) >= promo.limit) return { ok: false, reason: "limit" };
  const discount = promo.type === "percent"
    ? Math.round(total * promo.value / 100)
    : Math.min(promo.value, total);
  return { ok: true, promo, discount, newTotal: Math.max(0, total - discount) };
}

/* ---------- Interactive star input ---------- */
function StarInput({ value, onChange, size = 30 }) {
  const [hover, setHover] = React.useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => {
        const on = (hover || value) >= n;
        return (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
            style={{ padding: 2, lineHeight: 0, color: on ? "var(--gold)" : "var(--text-3)", transition: "color .12s, transform .12s", transform: on ? "scale(1.05)" : "scale(1)" }}>
            <Icon name="star" size={size} stroke={on ? 0 : 1.5} style={{ fill: on ? "var(--gold)" : "none" }} />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Car image (baked-in photo, or user-fillable slot) ---------- */
function CarImage({ car, height = 200, rounded = 14, showLabel = true, style = {}, slotId, placeholder }) {
  const id = slotId || `car-${car.id}-0`;
  const h = typeof height === "number" ? height + "px" : height;
  const isMain = id === `car-${car.id}-0`;

  // If this car has a baked-in photo and we're rendering its primary image, show it.
  if (car.photo && isMain) {
    const src = (window.PHOTO_MAP && window.PHOTO_MAP[car.photo]) || car.photo;
    return (
      <div style={{ position: "relative", width: "100%", height: h, borderRadius: (rounded || 0) + "px", overflow: "hidden", ...style }}>
        <img src={src} alt={car.name} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {showLabel && (
          <div style={{
            position: "absolute", top: 12, left: 14, fontFamily: "var(--font-mono)",
            fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase",
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          }}>{car.color}</div>
        )}
      </div>
    );
  }

  return (
    <image-slot
      id={id}
      shape="rounded"
      radius={String(rounded || 0)}
      placeholder={placeholder || `Drop ${car.brand || "car"} photo`}
      style={{
        display: "block", width: "100%", height: h,
        borderRadius: (rounded || 0) + "px", color: "rgba(245,240,230,0.45)", ...style,
      }}
    ></image-slot>
  );
}

/* ---------- Spec pill ---------- */
function Spec({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center",
        background: "var(--surface-2)", border: "1px solid var(--hairline-soft)", color: "var(--gold)", flexShrink: 0,
      }}><Icon name={icon} size={18} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{value}</div>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, children, width = 520, label }) {
  useEffect(() => {
    if (!open) return;
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200, background: "var(--scrim)",
      backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 24,
      animation: "fadeIn .25s ease both",
    }}>
      <div className="pop-in" onClick={e => e.stopPropagation()} role="dialog" aria-label={label} style={{
        width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto",
        background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-lg)",
      }}>{children}</div>
    </div>
  );
}

/* ---------- Form field ---------- */
function Field({ label, children, hint, style = {} }) {
  return (
    <label style={{ display: "block", ...style }}>
      {label && <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 7, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</div>}
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 5 }}>{hint}</div>}
    </label>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: "var(--r-sm)",
  background: "var(--bg-2)", border: "1px solid var(--hairline-soft)",
  color: "var(--text)", fontSize: 14.5, outline: "none", transition: "border-color .2s, box-shadow .2s",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }}
    onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px var(--gold-glow)"; props.onFocus?.(e); }}
    onBlur={e => { e.target.style.borderColor = "var(--hairline-soft)"; e.target.style.boxShadow = "none"; props.onBlur?.(e); }} />;
}

function Select({ children, ...props }) {
  return <select {...props} style={{ ...inputStyle, appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23837e74' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36, cursor: "pointer", ...(props.style || {}) }}>
    {children}</select>;
}

/* ---------- Logo ---------- */
function Logo({ size = 22, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: size * 1.55, height: size * 1.55, borderRadius: 10, display: "grid", placeItems: "center",
        background: "linear-gradient(135deg, var(--gold), var(--gold-dim))", color: "var(--gold-ink)", flexShrink: 0,
        boxShadow: "0 8px 22px -8px var(--gold-glow)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.92, letterSpacing: "-0.04em" }}>A</span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: size, letterSpacing: "-0.02em" }}>
        Api<span style={{ color: "var(--gold)" }}>rental</span>
      </span>
    </div>
  );
}

/* ---------- helpers ---------- */
function daysBetween(a, b) {
  if (!a || !b) return 0;
  const d = (new Date(b) - new Date(a)) / 86400000;
  return Math.max(0, Math.round(d));
}
function fmtMoney(n) { return new Intl.NumberFormat("de-DE").format(n) + " €"; }
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ---------- availability helpers ----------
   Availability is derived from the bookings "table" (the same source the
   admin Availability calendar uses). ISO yyyy-mm-dd strings compare
   correctly with < / >, so no Date parsing is needed. Ranges are
   inclusive on both ends. */
function datesOverlap(aFrom, aTo, bFrom, bTo) {
  return aFrom <= bTo && aTo >= bFrom;
}
function carConflicts(bookings, carId, from, to, excludeId) {
  if (!from || !to) return [];
  return (bookings || []).filter(b =>
    b.carId === carId &&
    b.status !== "Cancelled" &&
    b.id !== excludeId &&
    datesOverlap(from, to, b.from, b.to)
  );
}
function isCarAvailable(bookings, carId, from, to, excludeId) {
  return carConflicts(bookings, carId, from, to, excludeId).length === 0;
}

/* ---------- responsive hook ---------- */
function useIsMobile(bp = 760) {
  const [m, setM] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= bp : false));
  useEffect(() => {
    const on = () => setM(window.innerWidth <= bp);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return m;
}

/* ---------- Brand logos for SSO ---------- */
function BrandLogo({ id }) {
  if (id === "google") return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
  if (id === "apple") return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.16 1.76-3.2 1.84-3.25-1-1.47-2.57-1.67-3.13-1.69-1.33-.13-2.6.78-3.28.78-.67 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.15-1.51 2.62-.39 6.5 1.08 8.63.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.83.68 1.17-.02 1.91-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.3-3.46zM14.2 6.34c.6-.73 1-1.74.89-2.74-.86.03-1.9.57-2.52 1.3-.55.64-1.04 1.67-.91 2.65.96.07 1.94-.49 2.54-1.21z" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
const SSO_PROVIDERS = [["google", "Google"], ["apple", "Apple"], ["microsoft", "Microsoft"]];

/* ---------- SSO button row (shared by staff + customer auth) ---------- */
function SsoButtons({ connecting, onPick, t }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {SSO_PROVIDERS.map(([id, label]) => (
        <button key={id} type="button" disabled={!!connecting} onClick={() => onPick(id)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "11px 14px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--hairline)", color: "var(--text)", fontSize: 14, fontWeight: 600, opacity: connecting && connecting !== id ? 0.45 : 1, cursor: connecting ? "default" : "pointer", transition: "opacity .2s" }}>
          {connecting === id ? (
            <>
              <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid var(--hairline)", borderTopColor: "var(--text)", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              {t("login.connecting")}
            </>
          ) : (
            <><BrandLogo id={id} /> {t("login.continue", { provider: label })}</>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Loyalty ----------
   Tier from lifetime spend, progress to next tier, and points math. */
function loyaltyTier(spend) {
  const tiers = (typeof LOYALTY !== "undefined" ? LOYALTY.tiers : []);
  let cur = tiers[0];
  for (const t of tiers) { if ((spend || 0) >= t.min) cur = t; }
  return cur || { id: "Bronze", min: 0, discount: 0, freeAddons: [], keylessFree: false };
}
function loyaltyProgress(spend) {
  const tiers = (typeof LOYALTY !== "undefined" ? LOYALTY.tiers : []);
  const tier = loyaltyTier(spend);
  const idx = tiers.findIndex(t => t.id === tier.id);
  const next = tiers[idx + 1] || null;
  if (!next) return { tier, next: null, toNext: 0, pct: 100 };
  const span = next.min - tier.min;
  const done = Math.max(0, (spend || 0) - tier.min);
  return { tier, next, toNext: Math.max(0, next.min - (spend || 0)), pct: Math.min(100, Math.round(done / span * 100)) };
}
function pointsToEuros(points) {
  const rate = (typeof LOYALTY !== "undefined" ? LOYALTY.redeemRate : 100);
  return Math.floor((points || 0) / rate);
}

/* ---------- Greek license plate ---------- */
// Ring of 12 gold EU stars for the blue strip.
function EuStars({ size }) {
  const cx = size / 2, cy = size / 2, ring = size * 0.34;
  const star = "M0,-1 L0.2245,-0.309 0.9511,-0.309 0.3633,0.118 0.5878,0.809 0,0.382 -0.5878,0.809 -0.3633,0.118 -0.9511,-0.309 -0.2245,-0.309 Z";
  const s = size * 0.1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * ring, y = cy + Math.sin(a) * ring;
        return <path key={i} d={star} transform={`translate(${x} ${y}) scale(${s})`} fill="#FFCC00" />;
      })}
    </svg>
  );
}
// Realistic EU/Greek number plate. `value` like "ΙΟΑ 5318" or "ΙΟΑ-5318".
function GreekPlate({ value, height = 46, style = {} }) {
  const h = height;
  const raw = (value || "").trim();
  const m = raw.match(/^([A-Za-zΑ-Ωα-ω]+)[\s-]*([0-9]+)$/);
  const letters = m ? m[1].toUpperCase() : raw.toUpperCase();
  const nums = m ? m[2] : "";
  return (
    <div style={{
      display: "inline-flex", alignItems: "stretch", height: h, background: "#fff",
      borderRadius: Math.round(h * 0.14), border: `${Math.max(1, h * 0.03)}px solid #12141a`,
      overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", lineHeight: 1, ...style,
    }}>
      <div style={{ width: h * 0.56, background: "#003399", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: `${h * 0.09}px 0` }}>
        <EuStars size={h * 0.42} />
        <span style={{ color: "#fff", fontSize: h * 0.24, fontWeight: 700, letterSpacing: 0.4, fontFamily: "Arial, sans-serif" }}>GR</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: h * 0.12, padding: `0 ${h * 0.28}px`, color: "#111", fontWeight: 800, fontSize: h * 0.52, letterSpacing: h * 0.03, fontFamily: "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif" }}>
        <span>{letters}</span>
        <span style={{ fontWeight: 700, transform: "translateY(-6%)" }}>-</span>
        <span>{nums}</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, ICONS, CAT_ICON, Button, Badge, STATUS_TONE, Stars, CarImage, Spec, GreekPlate,
  Modal, Field, TextInput, Select, inputStyle, Logo,
  daysBetween, fmtMoney, fmtDate, useIsMobile,
  datesOverlap, carConflicts, isCarAvailable,
  BrandLogo, SSO_PROVIDERS, SsoButtons,
  visibleReviewsFor, carRating, effectiveStatus, StarInput, validatePromo,
  loyaltyTier, loyaltyProgress, pointsToEuros,
});
