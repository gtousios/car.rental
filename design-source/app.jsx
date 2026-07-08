/* ============================================================
   APIRENTAL — Root app (site ⇄ admin, shared state)
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

/* ---- Live accent palettes (Tweaks panel) ----
   Stored value is [accent, accentHi, accentDim]; glow + ink are derived.
   Applied as inline CSS vars on <html> so it overrides both the dark
   and light theme blocks in styles.css. */
const ACCENT_PALETTES = [
  ["#8b5cf6", "#a78bfa", "#6d28d9"],  // Royal Purple (default)
  ["#6d5dfc", "#9b8cff", "#4b3fd6"],  // Indigo
  ["#3b82f6", "#60a5fa", "#1d4ed8"],  // Electric Blue
  ["#f43f5e", "#fb7185", "#be123c"],  // Ruby
  ["#10b981", "#34d399", "#047857"],  // Emerald
  ["#f59e0b", "#fbbf24", "#b45309"],  // Amber
  ["#ec4899", "#f472b6", "#be185d"],  // Rose
  ["#d4af37", "#eccd6b", "#9a7d28"],  // Champagne Gold
  ["#cbd5e1", "#f1f5f9", "#94a3b8"],  // Platinum (mono)
];
function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
/* dark text on light accents, white on dark accents — keeps button labels legible */
function inkFor(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const br = (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
  return br > 0.6 ? "#0b0b10" : "#ffffff";
}
function applyAccent(palette) {
  if (!Array.isArray(palette)) return;
  const [main, hi, dim] = palette;
  const root = document.documentElement;
  root.style.setProperty("--gold", main);
  root.style.setProperty("--gold-hi", hi);
  root.style.setProperty("--gold-dim", dim);
  root.style.setProperty("--gold-glow", hexToRgba(main, 0.24));
  root.style.setProperty("--gold-ink", inkFor(main));
  try { localStorage.setItem("apirental.accent", JSON.stringify(palette)); } catch (e) {}
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#8b5cf6", "#a78bfa", "#6d28d9"]
}/*EDITMODE-END*/;

function CustomerSite({ cars, bookings, reviews, promos, promoRotate, member, damage, onAddDamage, notifChannel, onSetNotifChannel, customerUser, onCustomerAuth, onCustomerSignOut, onCreateBooking, onCancelBooking, onUpdateBooking, onAddReview, toAdmin }) {
  const [view, setView] = useStateApp("home");      // home | browse | detail | how | contact | locations | mytrips
  const [selected, setSelected] = useStateApp(null);
  const [scrolled, setScrolled] = useStateApp(false);
  const [filter, setFilter] = useStateApp({ cat: "All", trans: "Any", seats: "Any", priceMin: 0, priceMax: 900, q: "", from: "", to: "" });
  const [booking, setBooking] = useStateApp(null);   // car being booked
  const [authCar, setAuthCar] = useStateApp(null);   // car awaiting sign-in before booking
  const [signInOpen, setSignInOpen] = useStateApp(false);  // plain header sign-in
  const scrollRef = React.useRef(null);

  const go = (v, cat, car) => {
    if (cat) setFilter(f => ({ ...f, cat }));
    if (car) setSelected(car);
    setView(v);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const openCar = (car) => { setSelected(car); go("detail"); };
  // Reserve requires a signed-in customer — browsing stays open to everyone.
  const startBooking = (car) => { if (customerUser) setBooking(car); else setAuthCar(car); };

  return (
    <div ref={scrollRef} onScroll={e => setScrolled(e.target.scrollTop > 20)}
      style={{ height: "100vh", overflowY: "auto", background: "var(--bg)" }}>
      <PromoBanner promos={promos} rotate={promoRotate} />
      <SiteHeader view={view} go={go} toAdmin={toAdmin} scrolled={scrolled} user={customerUser} member={member} bookings={bookings} notifChannel={notifChannel} onSetNotifChannel={onSetNotifChannel} onSignIn={() => setSignInOpen(true)} onSignOut={onCustomerSignOut} />

      {view === "home" && (
        <div className="fade-in">
          <Hero go={go} onSearch={(s) => { setFilter(f => ({ ...f, cat: s.cat })); go("browse"); }} />
          <CategoryStrip cars={cars} go={go} />
          <Featured cars={cars} onClick={openCar} onBook={startBooking} go={go} />
          <HowItWorks />
          <Footer toAdmin={toAdmin} go={go} />
        </div>
      )}

      {view === "browse" && (
        <>
          <BrowseView cars={cars} bookings={bookings} filter={filter} setFilter={setFilter} onClick={openCar} onBook={startBooking} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      {view === "how" && (
        <>
          <HowItWorksPage go={go} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      {view === "contact" && (
        <>
          <ConciergePage go={go} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      {view === "locations" && (
        <>
          <LocationsPage go={go} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      {view === "detail" && selected && (
        <>
          <DetailView car={selected} cars={cars} reviews={reviews} onBack={() => go("browse")} onBook={startBooking} onClick={openCar} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      {view === "mytrips" && (
        <>
          <MyTrips bookings={bookings} cars={cars} reviews={reviews} member={member} user={customerUser} onCancel={onCancelBooking} onUpdate={onUpdateBooking} onAddReview={onAddReview} onAddDamage={onAddDamage} go={go} />
          <Footer toAdmin={toAdmin} go={go} />
        </>
      )}

      <Modal open={!!booking} onClose={() => setBooking(null)} width={840} label="Book vehicle">
        {booking && <BookingFlow car={booking} bookings={bookings} promos={promos} member={member} user={customerUser} onClose={() => setBooking(null)} onComplete={onCreateBooking} />}
      </Modal>

      <Modal open={!!authCar} onClose={() => setAuthCar(null)} width={460} label="Sign in to reserve">
        {authCar && <CustomerAuth onAuth={(u) => { onCustomerAuth(u); const c = authCar; setAuthCar(null); setBooking(c); }} />}
      </Modal>

      <Modal open={signInOpen} onClose={() => setSignInOpen(false)} width={460} label="Sign in">
        {signInOpen && <CustomerAuth onAuth={(u) => { onCustomerAuth(u); setSignInOpen(false); }} />}
      </Modal>

      <ChatWidget cars={cars} damage={damage} bookings={bookings} member={member} customerUser={customerUser} onCreateBooking={onCreateBooking} onRequireAuth={() => setSignInOpen(true)} />
    </div>
  );
}

/* ============================================================
   Simulated database — persists to localStorage so reservations
   (and admin edits) survive reloads and are shared between the
   customer site and the admin console.
   ============================================================ */
const DB_KEYS = { cars: "apirental.db.cars", bookings: "apirental.db.bookings", customers: "apirental.db.customers", reviews: "apirental.db.reviews", promos: "apirental.db.promos", maintenance: "apirental.db.maintenance", damage: "apirental.db.damage", notifchannels: "apirental.db.notifchannels" };
function dbLoad(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return seed;
}
function dbSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// Seed a maintenance record per car so the tracker has realistic data on first load.
function seedMaintenance(cars) {
  const today = new Date();
  const offsets = [-22, 14, 48, 95, 160, -6, 33, 78, 120, -14, 60, 25];
  const map = {};
  cars.forEach((c, i) => {
    const next = new Date(today); next.setDate(next.getDate() + offsets[i % offsets.length]);
    const last = new Date(next); last.setMonth(last.getMonth() - 6);
    map[c.id] = {
      nextService: next.toISOString().slice(0, 10),
      lastService: last.toISOString().slice(0, 10),
      odometer: 7200 + i * 2350,
      inService: false,
      notes: "",
    };
  });
  return map;
}
/* Load the persisted fleet but fold in any seed cars added since (matched by id),
   so new vehicles in data.jsx always surface while admin edits are preserved. */
function loadCars() {
  const stored = dbLoad(DB_KEYS.cars, null);
  if (!Array.isArray(stored)) return CARS;
  const byId = Object.fromEntries(CARS.map(c => [c.id, c]));
  // Backfill any fields added to data.jsx after this record was persisted
  // (e.g. `plate`), while preserving admin edits already stored.
  const merged = stored.map(c => byId[c.id] ? { ...byId[c.id], ...c } : c);
  const ids = new Set(stored.map(c => c.id));
  return merged.concat(CARS.filter(c => !ids.has(c.id)));
}

/* Derive 2-letter initials from a full name */
function initialsOf(name) {
  return (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "—";
}

/* Add a booking's customer to the customers "table": update an existing
   member (matched by email) or create a new one. */
function upsertCustomer(list, b) {
  const email = (b.email || "").trim().toLowerCase();
  const idx = email ? list.findIndex(c => (c.email || "").trim().toLowerCase() === email) : -1;
  const netPoints = (b.pointsEarned || 0) - (b.pointsRedeemed || 0);
  if (idx >= 0) {
    const c = list[idx];
    const copy = list.slice();
    const spend = c.spend + b.total;
    copy[idx] = { ...c, trips: c.trips + 1, spend, phone: b.phone || c.phone, points: Math.max(0, (c.points || 0) + netPoints), tier: loyaltyTier(spend).id };
    return copy;
  }
  const newC = {
    id: "u" + Date.now().toString(36),
    name: b.customer,
    email: b.email || "",
    phone: b.phone || "",
    since: String(new Date().getFullYear()),
    trips: 1,
    spend: b.total,
    points: Math.max(0, netPoints),
    tier: loyaltyTier(b.total).id,
    initials: initialsOf(b.customer),
  };
  return [newC, ...list];
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffectApp(() => { applyAccent(tw.accent); }, [tw.accent]);

  const [mode, setMode] = useStateApp(() => {
    try {
      if (window.__BACKOFFICE__) return "admin";
      const q = (location.search + " " + location.hash).toLowerCase();
      if (q.includes("admin") || q.includes("backoffice") || q.includes("back-office")) return "admin";
    } catch (e) {}
    return "site";
  });   // site | admin
  // Back-office auth is session-only: never persisted, so leaving the console
  // (or reopening the page) always requires the password again.
  const [authed, setAuthed] = useStateApp(false);
  const [cars, setCars] = useStateApp(loadCars);
  const [bookings, setBookings] = useStateApp(() => dbLoad(DB_KEYS.bookings, BOOKINGS));
  const [promoRotate, setPromoRotate] = useStateApp(0);
  const [customers, setCustomers] = useStateApp(() => dbLoad(DB_KEYS.customers, CUSTOMERS));
  const [reviews, setReviews] = useStateApp(() => dbLoad(DB_KEYS.reviews, REVIEWS));
  const [promos, setPromos] = useStateApp(() => dbLoad(DB_KEYS.promos, PROMOS));
  const [maintenance, setMaintenance] = useStateApp(() => dbLoad(DB_KEYS.maintenance, {}));
  const [damage, setDamage] = useStateApp(() => dbLoad(DB_KEYS.damage, []));
  const [notifChannels, setNotifChannels] = useStateApp(() => dbLoad(DB_KEYS.notifchannels, {}));
  const [customerUser, setCustomerUser] = useStateApp(() => dbLoad("apirental.customer", null));

  // Persist whenever the "tables" change.
  useEffectApp(() => { dbSave(DB_KEYS.bookings, bookings); }, [bookings]);
  useEffectApp(() => { dbSave(DB_KEYS.cars, cars); }, [cars]);
  useEffectApp(() => { dbSave(DB_KEYS.customers, customers); }, [customers]);
  useEffectApp(() => { dbSave(DB_KEYS.reviews, reviews); }, [reviews]);
  useEffectApp(() => { dbSave(DB_KEYS.promos, promos); }, [promos]);
  useEffectApp(() => { dbSave(DB_KEYS.maintenance, maintenance); }, [maintenance]);
  useEffectApp(() => { dbSave(DB_KEYS.damage, damage); }, [damage]);
  useEffectApp(() => { dbSave(DB_KEYS.notifchannels, notifChannels); }, [notifChannels]);
  useEffectApp(() => { dbSave("apirental.customer", customerUser); }, [customerUser]);

  // Cars with their displayed rating recomputed from real reviews (blended with the seed).
  const ratedCars = React.useMemo(
    () => cars.map(c => { const r = carRating(c, reviews); return { ...c, rating: r.value, reviewCount: r.count }; }),
    [cars, reviews]
  );

  // The signed-in customer's loyalty record (points/tier/spend), matched by email.
  const member = React.useMemo(() => {
    if (!customerUser) return null;
    const email = (customerUser.email || "").trim().toLowerCase();
    const rec = customers.find(c => (c.email || "").trim().toLowerCase() === email);
    const spend = rec ? rec.spend : 0;
    return { points: rec ? (rec.points || 0) : 0, spend, tier: loyaltyTier(spend).id, trips: rec ? rec.trips : 0 };
  }, [customerUser, customers]);

  const customerAuth = (u) => setCustomerUser(u || { name: "", email: "" });
  const customerSignOut = () => setCustomerUser(null);

  const createBooking = (b) => {
    setBookings(prev => [b, ...prev]);
    // bump trips count on the car
    setCars(prev => prev.map(c => c.id === b.carId ? { ...c, trips: c.trips + 1 } : c));
    // add or update the customer record
    setCustomers(prev => upsertCustomer(prev, b));
    // increment promo redemption count if one was used
    if (b.promoCode) setPromos(prev => prev.map(p => p.code === b.promoCode ? { ...p, used: (p.used || 0) + 1 } : p));
    // rotate the banner to a fresh code after every reservation
    setPromoRotate(n => n + 1);
  };

  const cancelBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Cancelled" } : b));
  };
  const updateBooking = (updated) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
  };

  // Add or replace a customer's review for a booking; one review per booking.
  const addReview = (rev) => {
    setReviews(prev => {
      const without = prev.filter(r => !(r.bookingId && r.bookingId === rev.bookingId));
      return [{ ...rev, id: rev.id || ("r" + Date.now().toString(36)), hidden: false }, ...without];
    });
  };
  const toggleReviewHidden = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  };

  // Promo code management (admin)
  const savePromo = (promo, originalCode) => {
    setPromos(prev => {
      const key = (originalCode || promo.code).toUpperCase();
      const exists = prev.some(p => p.code.toUpperCase() === key);
      if (exists) return prev.map(p => p.code.toUpperCase() === key ? { ...p, ...promo } : p);
      return [{ used: 0, ...promo }, ...prev];
    });
  };
  const deletePromo = (code) => setPromos(prev => prev.filter(p => p.code !== code));

  // Fleet maintenance (admin)
  const markServiced = (carId) => setMaintenance(prev => {
    const today = new Date(); const next = new Date(today); next.setMonth(next.getMonth() + 6);
    const cur = prev[carId] || {};
    return { ...prev, [carId]: { ...cur, lastService: today.toISOString().slice(0, 10), nextService: next.toISOString().slice(0, 10), inService: false } };
  });
  const setInService = (carId, on) => setMaintenance(prev => ({ ...prev, [carId]: { ...(prev[carId] || {}), inService: on } }));
  const updateMaintenance = (carId, patch) => setMaintenance(prev => ({ ...prev, [carId]: { ...(prev[carId] || {}), ...patch } }));

  // Damage reports (customer + admin). Logging a report takes the car out of
  // service (status -> Maintenance) so it can't be booked and shows as
  // unavailable in the availability calendar. Resolving the last open report
  // for a car puts it back into service.
  const addDamageReport = (report) => {
    setDamage(prev => [{ ...report, id: report.id || ("d" + Date.now().toString(36)), createdAt: new Date().toISOString() }, ...prev]);
    if (report.carId) setCars(prev => prev.map(c => c.id === report.carId ? { ...c, status: "Maintenance" } : c));
  };
  const resolveDamage = (id) => {
    const cur = damage.find(d => d.id === id);
    setDamage(prev => prev.map(d => d.id === id ? { ...d, resolved: !d.resolved } : d));
    if (cur && cur.carId) {
      const reopening = cur.resolved; // toggling an already-resolved report back open
      const otherOpen = damage.some(d => d.carId === cur.carId && d.id !== id && !d.resolved);
      const stillOut = reopening || otherOpen;
      setCars(prev => prev.map(c => c.id === cur.carId ? { ...c, status: stillOut ? "Maintenance" : "Available" } : c));
    }
  };

  // Notification channel preference per customer email ("email" | "sms").
  const userEmailKey = ((customerUser && customerUser.email) || "").trim().toLowerCase();
  const userChannel = notifChannels[userEmailKey] || "email";
  const setUserChannel = (ch) => { if (userEmailKey) setNotifChannels(prev => ({ ...prev, [userEmailKey]: ch })); };

  const login = () => { setAuthed(true); };
  const signOut = () => { setAuthed(false); try { localStorage.removeItem("apirental.auth"); } catch (e) {} setMode("site"); };
  // Leaving the back office ends the session — re-entry requires the password.
  const exitAdmin = () => { setAuthed(false); setMode("site"); };

  let content;
  if (mode === "admin") {
    content = authed
      ? <AdminApp cars={cars} setCars={setCars} bookings={bookings} setBookings={setBookings} customers={customers} reviews={reviews} promos={promos} maintenance={maintenance} damage={damage} notifChannels={notifChannels} onMarkServiced={markServiced} onSetInService={setInService} onUpdateMaintenance={updateMaintenance} onResolveDamage={resolveDamage} onAddDamage={addDamageReport} onToggleReview={toggleReviewHidden} onUpdateBooking={updateBooking} onSavePromo={savePromo} onDeletePromo={deletePromo} toSite={exitAdmin} onSignOut={signOut} />
      : <StaffLogin onAuth={login} onBack={exitAdmin} />;
  } else {
    content = <CustomerSite cars={ratedCars} bookings={bookings} reviews={reviews} promos={promos} promoRotate={promoRotate} member={member} damage={damage} onAddDamage={addDamageReport} notifChannel={userChannel} onSetNotifChannel={setUserChannel} customerUser={customerUser} onCustomerAuth={customerAuth} onCustomerSignOut={customerSignOut} onCreateBooking={createBooking} onCancelBooking={cancelBooking} onUpdateBooking={updateBooking} onAddReview={addReview} toAdmin={() => setMode("admin")} />;
  }

  return (
    <>
      {content}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent color" />
        <TweakColor label="Theme accent" value={tw.accent} options={ACCENT_PALETTES}
          onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <LangProvider><App /></LangProvider>
);
