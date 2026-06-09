/* CTO.fun prototype — app shell: routing, nav, footer. */

const NAV = [
  ["discover", "Discover"],
  ["graveyard", "Graveyard"],
  ["bounties", "Bounties"],
  ["proof", "Proof"],
];

function Header({ route, go, drawer, setDrawer }) {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <div className="brand" onClick={() => go("home")} style={{ cursor: "pointer" }}>
          <span className="mk"><Mark size={17} /></span>
          <span>CTO<span style={{ color: "var(--green)" }}>.fun</span></span>
        </div>
        <nav className="nav">
          {NAV.map(([k, label]) => (
            <a key={k} className={route.name === k || (k === "graveyard" && route.name === "revival") ? "on" : ""} onClick={() => go(k)}>{label}</a>
          ))}
        </nav>
        <div className="hdr-cta">
          <button className="btn btn-sm btn-ghost desktop-only" onClick={() => go("submit")}>Submit a token</button>
          <button className="btn btn-sm btn-solid desktop-only">Connect</button>
          <button className="burger" onClick={() => setDrawer(!drawer)} aria-label="Menu">{drawer ? "✕" : "☰"}</button>
        </div>
      </div>
      <div className={"drawer" + (drawer ? " open" : "")}>
        {NAV.map(([k, label]) => (
          <a key={k} className={route.name === k ? "on" : ""} onClick={() => { go(k); setDrawer(false); }}>{label}</a>
        ))}
        <a onClick={() => { go("submit"); setDrawer(false); }}>Submit a token</a>
        <button className="btn btn-solid" style={{ marginTop: 18, width: "100%" }}>Connect wallet</button>
      </div>
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="brand" style={{ fontSize: 15 }}>
            <span className="mk" style={{ width: 26, height: 26 }}><Mark size={15} /></span>
            <span>CTO<span style={{ color: "var(--green)" }}>.fun</span></span>
          </div>
          <p className="disc">CTO.fun is a community coordination protocol for reviving abandoned Pump.fun-origin tokens. Not affiliated with or endorsed by Pump.fun. Community takeovers are organized by independent contributors — this is not financial advice and not a promise of price recovery.</p>
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          {[["Discover", "discover"], ["Graveyard", "graveyard"], ["Bounties", "bounties"]].map(([l, k]) => (
            <span key={k} className="mono" style={{ fontSize: 12, color: "var(--dim)", cursor: "pointer" }} onClick={() => go(k)}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function ProofStub({ go }) {
  const m = window.CTO.metrics;
  return (
    <section className="hero lq-frame" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <AsciiShader opacity={0.14} mask="hero" />
      <div className="wrap" style={{ position: "relative", zIndex: 1, padding: "60px 28px" }}>
        <div className="eyebrow" style={{ letterSpacing: ".2em" }}>PROOF OF REVIVAL</div>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.03em", margin: "12px 0 0", maxWidth: 700 }}>Public proof, buybacks, and a permanent record</h1>
        <p style={{ color: "var(--dim)", maxWidth: 540, lineHeight: 1.6, marginTop: 16 }}>The Proof dashboard — bounty fees, token buybacks, graduated revivals, and the Hall of Revival — comes next in this build. Here's the headline state.</p>
        <div className="grid g4" style={{ marginTop: 32, maxWidth: 760 }}>
          {[[m.revived, "coins revived"], [fmtUsd(m.paid), "rewards paid"], [fmtNum(m.bountiesDone), "bounties done"], [fmtNum(m.submitted), "tokens submitted"]].map(([v, k]) => (
            <div key={k} className="lq-glass" style={{ padding: 18 }}>
              <div className="tnum" style={{ fontSize: 26, fontWeight: 600 }}>{v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginTop: 5 }}>{k}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{ marginTop: 28 }} onClick={() => go("graveyard")}>Back to graveyard</button>
      </div>
    </section>
  );
}

function App() {
  const [route, setRoute] = React.useState({ name: "home", param: null });
  const [drawer, setDrawer] = React.useState(false);
  const [queue, setQueue] = React.useState([]);
  const [toast, setToast] = React.useState("");
  const toastT = React.useRef(null);

  const go = (name, param = null) => {
    setRoute({ name, param });
    setDrawer(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const togglePick = (id) => {
    setQueue((q) => {
      const has = q.includes(id);
      flash(has ? "Removed from your work queue" : "Added to your work queue");
      return has ? q.filter((x) => x !== id) : [...q, id];
    });
  };

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(""), 2200);
  };

  const props = { go, queue, togglePick };
  let view;
  if (route.name === "home") view = <Landing {...props} />;
  else if (route.name === "discover") view = <Discover {...props} />;
  else if (route.name === "bounties") view = <Bounties {...props} />;
  else if (route.name === "graveyard") view = <Graveyard {...props} />;
  else if (route.name === "revival") view = <Revival {...props} />;
  else if (route.name === "proof") view = <Proof {...props} />;
  else if (route.name === "submit") view = <Submit {...props} />;
  else view = <Landing {...props} />;

  return (
    <div className="app lq-frame">
      <Header route={route} go={go} drawer={drawer} setDrawer={setDrawer} />
      <main style={{ flex: 1 }}>{view}</main>
      <Footer go={go} />
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
