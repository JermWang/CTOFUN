/* CTO.fun prototype — data layer. Mirrors the real domain model. */

window.CTO = (function () {
  const candidates = [
    { id: "rugz", sym: "RUGZ", name: "Rugzilla", dormant: 248, replies: 412, ath: 1_800_000, mcap: 41_200, last: "Oct 02", qual: 86, migrated: true, status: "vote", risk: "Low",
      blurb: "Kaiju that eats rugs. Dev vanished after a failed CEX rumor; 2.1k holders still in the group.",
      reasons: ["Mint renounced", "2.1k holders live", "Strong kaiju lore"], spark: [38,52,45,68,84,40,22,18,24] },
    { id: "gpepe", sym: "GPEPE", name: "Ghost Pepe", dormant: 96, replies: 188, ath: 640_000, mcap: 18_700, last: "Aug 19", qual: 74, migrated: false, status: "review", risk: "Low",
      blurb: "Haunted-frog angle is unused this cycle. Clean contract, small loyal community.",
      reasons: ["Clean contract", "Loyal Telegram", "Unused angle"], spark: [20,30,48,40,28,18,14,16,12] },
    { id: "dcb", sym: "DCB", name: "Dead Cat Bounce", dormant: 180, replies: 503, ath: 2_100_000, mcap: 6_300, last: "Nov 21", qual: 62, migrated: true, status: "review", risk: "High",
      blurb: "The name is the joke traders already know. Prior LP removal — needs new liquidity commitment.",
      reasons: ["Self-aware meme", "High ATH cap", "Needs new LP"], spark: [60,72,55,30,18,10,8,12,9] },
    { id: "wlive", sym: "WLIVE", name: "Wojak Lives", dormant: 64, replies: 920, ath: 3_400_000, mcap: 92_000, last: "Sep 01", qual: 78, migrated: true, status: "newly", risk: "Low",
      blurb: "5.1k holders and a still-talking Telegram with no admins. Mostly needs leadership.",
      reasons: ["5.1k holders", "Telegram alive", "Leaderless"], spark: [44,66,80,72,60,52,48,55,58] },
    { id: "laz", sym: "LAZ", name: "Lazaroo", dormant: 268, replies: 240, ath: 410_000, mcap: 12_400, last: "Sep 14", qual: 72, migrated: false, status: "candidate", risk: "Med",
      blurb: "Kangaroo back from the dead — on-theme for this very protocol. Strong lore, no identity yet.",
      reasons: ["On-theme lore", "Safe contract", "No identity yet"], spark: [30,40,52,44,30,20,16,14,18] },
    { id: "fomof", sym: "FOMOF", name: "Fomo Frog", dormant: 142, replies: 661, ath: 980_000, mcap: 28_900, last: "Oct 28", qual: 81, migrated: true, status: "candidate", risk: "Low",
      blurb: "Already proved a comeback once. Active scout interest and a clean LP make it low-friction.",
      reasons: ["Proven comeback", "Active scouts", "Clean LP"], spark: [50,58,46,38,30,42,55,62,70] },
  ];

  const sweep = { last: "14s ago", found: 23, threshold: 60, scanned: 1_842, sources: ["Pump.fun", "DexScreener", "On-chain"] };

  // CTO workflow stages → bounty categories
  const workflow = [
    { k: "Scout", d: "Find dormant tokens", open: 4, paid: 150 },
    { k: "Research", d: "What happened & why", open: 2, paid: 120 },
    { k: "Audit", d: "Contract & safety", open: 1, paid: 200 },
    { k: "Lore", d: "Manifesto & narrative", open: 3, paid: 80 },
    { k: "Design", d: "Identity & assets", open: 5, paid: 250 },
    { k: "Website", d: "Build or repair", open: 1, paid: 300 },
    { k: "Social", d: "Channels & campaigns", open: 6, paid: 120 },
    { k: "Moderation", d: "Telegram & Discord", open: 2, paid: 90 },
    { k: "Outreach", d: "Ethical holder contact", open: 1, paid: 110 },
    { k: "Proof", d: "Public revival record", open: 2, paid: 140 },
  ];

  const bounties = [
    { id: "b1", sym: "RUGZ", title: "Redesign the Rugzilla mascot", cat: "Design", reward: 250, subs: 3, max: 1, status: "open", deadline: "6d left",
      desc: "A modern kaiju that eats rugs. Vector + transparent PNGs in multiple poses.", criteria: ["Originality", "Brand fit", "Versatility", "Polish"] },
    { id: "b2", sym: "RUGZ", title: "Write the RUGZ CTO manifesto", cat: "Lore", reward: 80, subs: 6, max: 1, status: "in review", deadline: "2d left",
      desc: "The resurrection myth + community manifesto. Must include the takeover disclaimer.", criteria: ["Narrative", "Tone", "Clarity", "Disclaimer"] },
    { id: "b3", sym: "RUGZ", title: "Stand up & moderate the Telegram", cat: "Social", reward: 120, subs: 4, max: 2, status: "open", deadline: "4d left",
      desc: "Rules, welcome flow, anti-scam config, and a 7-day moderation rota.", criteria: ["Setup quality", "Anti-scam", "Responsiveness"] },
    { id: "b4", sym: "—", title: "Scout 10 dead Pump.fun tokens", cat: "Scout", reward: 150, subs: 9, max: 3, status: "open", deadline: "9d left",
      desc: "Submit 10 abandoned launches with surviving holders and clean contracts.", criteria: ["Revival potential", "Accuracy", "Risk diligence"] },
    { id: "b5", sym: "GPEPE", title: "Design Ghost Pepe banner + PFP set", cat: "Design", reward: 180, subs: 2, max: 1, status: "open", deadline: "5d left",
      desc: "Haunted-frog banner + a 4-piece PFP set for the relaunch.", criteria: ["Originality", "Brand fit", "Polish"] },
    { id: "b6", sym: "RUGZ", title: "Audit the RUGZ contract & LP", cat: "Audit", reward: 200, subs: 1, max: 1, status: "open", deadline: "3d left",
      desc: "Confirm authorities renounced, scan for malicious functions, assess liquidity.", criteria: ["Thoroughness", "Evidence", "Clear writeup"] },
  ];

  const phases = ["Discovery", "Review", "Vote", "Setup", "Rebuild", "Relaunch", "Growth", "Graduation"];

  const revival = {
    id: "rugz", sym: "RUGZ", name: "Rugzilla", score: 79, phase: "Rebuild", contract: "Rugz4kP2…StUvWx",
    manifesto: "RUGZ was left behind, but the kaiju is not dead. This is a community-led revival organized by independent contributors — not the original developers. We rebuild the culture, content, and public presence transparently, funded entirely through bounties.",
    risk: { level: "Low", note: "Mint + freeze authority renounced. No malicious functions found. Liquidity thin but present — a new LP commitment is the first rebuild task." },
    breakdown: [
      { k: "Meme", v: 9 }, { k: "Community", v: 7 }, { k: "Safety", v: 8 },
      { k: "Liquidity", v: 5 }, { k: "Lore", v: 9 }, { k: "Ticker", v: 8 },
    ],
    votes: { revive: 312, research: 61, skip: 44 },
    spend: 2840, active: 5, done: 11, contributors: 27,
    roadmap: ["Rebuild visual identity", "Relaunch Telegram w/ moderation rota", "Ship landing page + risk disclosure", "Release lore thread + meme pack", "30-day content calendar", "Graduate to Hall of Revival"],
  };

  // Graveyard list — token status hierarchy
  const graveyard = [
    { id: "rugz", sym: "RUGZ", name: "Rugzilla", status: "active", score: 79, risk: "Low", holders: 2143, dormant: 248, ath: 1_800_000 },
    { id: "wlive", sym: "WLIVE", name: "Wojak Lives", status: "newly", score: 78, risk: "Low", holders: 5120, dormant: 64, ath: 3_400_000 },
    { id: "gpepe", sym: "GPEPE", name: "Ghost Pepe", status: "review", score: 74, risk: "Low", holders: 880, dormant: 96, ath: 640_000 },
    { id: "fomof", sym: "FOMOF", name: "Fomo Frog", status: "vote", score: 81, risk: "Low", holders: 1980, dormant: 142, ath: 980_000 },
    { id: "laz", sym: "LAZ", name: "Lazaroo", status: "candidate", score: 72, risk: "Med", holders: 640, dormant: 268, ath: 410_000 },
    { id: "dcb", sym: "DCB", name: "Dead Cat Bounce", status: "review", score: 62, risk: "High", holders: 410, dormant: 180, ath: 2_100_000 },
    { id: "fomo2", sym: "FOMOF", name: "Fomo Frog (v1)", status: "graduated", score: 84, risk: "Low", holders: 4800, dormant: 0, ath: 980_000 },
  ];

  const STATUS = {
    newly: { label: "Newly Found", dot: "idle" },
    review: { label: "Under Review", dot: "warn" },
    candidate: { label: "Candidate", dot: "warn" },
    vote: { label: "Up For Vote", dot: "live" },
    selected: { label: "Selected", dot: "live" },
    active: { label: "Active CTO", dot: "live" },
    graduated: { label: "Graduated", dot: "live" },
  };

  const metrics = { revived: 14, paid: 68400, contributors: 1240, bountiesDone: 421, submitted: 312 };

  // Proof of Revival — fees fund token buybacks (5% of completed bounties)
  const proof = {
    feesCollected: 3420,
    tokenBought: 2_910_000,
    tokenBurned: 2_140_000,
    tokenRecycled: 770_000,
    buybacks: [
      { id: "bb1", fee: 142, tokens: 121_340, tx: "5xQ…8aF", date: "Jun 08", status: "burned", source: "Bounty fees" },
      { id: "bb2", fee: 98, tokens: 83_110, tx: "3kR…2nV", date: "Jun 07", status: "burned", source: "Bounty fees" },
      { id: "bb3", fee: 210, tokens: 179_800, tx: "9mH…1xW", date: "Jun 06", status: "recycled", source: "Featured listing" },
      { id: "bb4", fee: 64, tokens: 54_900, tx: "7yT…3nQ", date: "Jun 05", status: "burned", source: "Bounty fees" },
      { id: "bb5", fee: 156, tokens: 132_700, tx: "2vB…6kP", date: "Jun 04", status: "burned", source: "Bounty fees" },
    ],
  };

  // Hall of Revival — graduated community takeovers
  const hall = [
    { id: "fomof", sym: "FOMOF", name: "Fomo Frog", score: 84, graduated: "Apr 22", contributors: 51, bounties: 38, spend: 6120,
      before: { holders: 1200, telegram: 900, site: "Dead" }, after: { holders: 4800, telegram: 3600, site: "Live" } },
    { id: "revc", sym: "REVC", name: "Revenant Cat", score: 80, graduated: "Mar 30", contributors: 34, bounties: 26, spend: 4180,
      before: { holders: 740, telegram: 610, site: "Expired" }, after: { holders: 3100, telegram: 2450, site: "Live" } },
    { id: "phx", sym: "PHX", name: "Phoenix Pepe", score: 88, graduated: "Feb 14", contributors: 63, bounties: 47, spend: 8240,
      before: { holders: 2050, telegram: 1400, site: "Stale" }, after: { holders: 7600, telegram: 5900, site: "Live" } },
  ];

  return { candidates, sweep, workflow, bounties, phases, revival, graveyard, STATUS, metrics, proof, hall };
})();
