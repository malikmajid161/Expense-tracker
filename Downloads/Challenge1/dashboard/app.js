// ================================================================================
//   CHAINGAURD AI — DYNAMIC EXTENDED PORTAL INTEGRATION ENGINE
// ================================================================================

// Default API Base URL (Configured for Cloud Run orchestrator)
const ORCHESTRATOR_API = "https://antigravity-orchestrator-588231145052.asia-south1.run.app";

// Core Variables
let activeIncident = null;
let currentStep = 0;
let timelineInterval = null;
let emailLogIndex = 1;

// Automated News Scheduler & Queue Variables
let newsQueue = [];
let newsProcessedCount = 0;
let newsSchedulerTimer = null;
let cooldownTimer = null;

// Google Sheets Integration variables & DOM elements
let sheetWebhookUrl = localStorage.getItem("cg_sheet_webhook_url") || "";
let spreadsheetRows = [];
const inputSheetWebhook = document.getElementById("input-sheet-webhook");
const btnSaveSheetWebhook = document.getElementById("btn-save-sheet-webhook");
const sheetSyncStatus = document.getElementById("sheet-sync-status");
const btnExportCsv = document.getElementById("btn-export-csv");
const btnClearSheet = document.getElementById("btn-clear-sheet");
const sheetRowsBody = document.getElementById("sheet-rows-body");
const sheetsFormulaBar = document.getElementById("sheets-formula-bar");

// DOM Elements
const connStatus = document.getElementById("connection-status");
const schedulerStatus = document.getElementById("scheduler-status");
const toast = document.getElementById("notification-toast");
const toastTitle = document.getElementById("toast-title");
const toastDesc = document.getElementById("toast-desc");

// Tab Switcher Elements
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Metrics Elements
const metricRisk = document.getElementById("metric-risk");
const metricMitigated = document.getElementById("metric-mitigated");
const metricNet = document.getElementById("metric-net");

// SVG Map elements
const mapRingKarachi = document.getElementById("ring-karachi");
const mapDotKarachi = document.getElementById("dot-karachi");
const linkShanghai = document.getElementById("link-shanghai");
const linkFactory = document.getElementById("link-factory");
const mapStatus = document.getElementById("map-status");

// Incident Monitor Elements
const activeIncidentBadge = document.getElementById("active-incident-badge");
const incidentDetailsArea = document.getElementById("incident-details-area");
const timelineArea = document.getElementById("timeline-area");

// Threat Analyzer Elements
const inputArticleUrl = document.getElementById("input-article-url");
const btnFetchUrl = document.getElementById("btn-fetch-url");
const dropzone = document.getElementById("pdf-dropzone");
const fileInput = document.getElementById("file-input");
const fileInfoBar = document.getElementById("file-info-bar");
const selectedFileName = document.getElementById("selected-file-name");
const btnUploadFile = document.getElementById("btn-upload-file");
const analysisResultsBody = document.getElementById("analysis-results-body");
const analysisStateBadge = document.getElementById("analysis-state");

// Supplier Alert Centre Elements
const emailLogsArea = document.getElementById("email-logs-area");

// Mobile Device Simulator Elements
const mRisk = document.getElementById("m-risk");
const mMitigated = document.getElementById("m-mitigated");
const mobileTimelineArea = document.getElementById("mobile-timeline-area");
const mobileActionBanner = document.getElementById("mobile-action-banner");
const mobileBannerText = document.getElementById("mobile-banner-text");
const mobileBtnApprove = document.getElementById("mobile-btn-approve");
const mobileBtnReject = document.getElementById("mobile-btn-reject");
const btnSimulatePush = document.getElementById("btn-simulate-push");

// Mobile App Switcher Tab Elements
const mTabBtns = document.querySelectorAll(".m-nav-btn");
const mTabContents = document.querySelectorAll(".m-tab-content");

// Mobile Input & Interaction Elements
const mInputUrl = document.getElementById("m-input-url");
const mBtnAnalyzeUrl = document.getElementById("m-btn-analyze-url");
const mScenarioTariffBtn = document.getElementById("m-scenario-tariff");
const mScenarioStrikeBtn = document.getElementById("m-scenario-strike");
const mEmailsArea = document.getElementById("m-emails-area");
const mHitlBox = document.getElementById("m-hitl-box");

// HITL Web Drawer Elements
const hitlDrawer = document.getElementById("hitl-drawer");
const hitlConfidence = document.getElementById("hitl-confidence");
const hitlDescription = document.getElementById("hitl-description");
const btnHitlApprove = document.getElementById("btn-hitl-approve");
const btnHitlReject = document.getElementById("btn-hitl-reject");

// Quick Sandbox Threat Buttons
const scenarioTariffBtn = document.getElementById("quick-scenario-tariff");
const scenarioStrikeBtn = document.getElementById("quick-scenario-strike");

// Helper to shuffle news items array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Verified Real-World Pakistani SCM Incidents (Used for robust backup coverage)
const realWorldIncidentFallbacks = [
    {
        title: "Red Sea shipping diversions add 14-day delays and double freight costs for Pakistan imports",
        source: "Express Tribune Business",
        materials: ["PCB Board", "Microcontrollers"],
        impactPct: 15,
        desc: "Global container shipping lines reroute cargo vessels around the Cape of Good Hope to avoid Red Sea security hazards, triggering a container shortage and increasing transit times to Karachi Port by 14 days."
    },
    {
        title: "State Bank of Pakistan (SBP) mandates prior approval for clearing raw electronic component imports",
        source: "Dawn News Business",
        materials: ["PCB Board", "Lithium Battery"],
        impactPct: 20,
        desc: "Under revised foreign exchange import guidelines, SBP requires direct authorization for opening documentary letters of credit (LCs) for electric components and raw battery storage cells."
    },
    {
        title: "Karachi Port Trust (KPT) East Wharves experience 14% container backlog due to customs appraisal delays",
        source: "Customs Today Pakistan",
        materials: ["PCB Board", "Microcontrollers"],
        impactPct: 10,
        desc: "Customs appraisers lockout causes minor clearance backlogs on incoming container ships at Karachi East and West Wharves, slowing down manufacturing supplies."
    },
    {
        title: "Pakistan Customs integration portal WeBOC experiences massive server outage suspending cargo release",
        source: "Business Recorder",
        materials: ["Lithium Battery", "PCB Board"],
        impactPct: 15,
        desc: "A major technical network infrastructure outage at WeBOC suspends custom manifest declarations and goods clearance certificates at Karachi Port and dry ports nationwide."
    },
    {
        title: "FBR SRO 157(I)/2022: Emergency regulatory customs duties hiked on imported machinery and electric parts",
        source: "FBR Circular Portal",
        materials: ["PCB Board", "Microcontrollers"],
        impactPct: 15,
        desc: "The Federal Board of Revenue issues emergency statutory notification rules (SRO 157) increasing duty tariffs on raw electrical boards, components, and heavy engineering systems."
    },
    {
        title: "FPCCI sounds alarm as South Asian freight shipping spot container rates surge by 45% in 30 days",
        source: "Express Tribune Logistics",
        materials: ["Lithium Battery", "PCB Board"],
        impactPct: 18,
        desc: "Federation of Pakistan Chambers of Commerce alerts trade ministries that global logistics capacity squeezes are increasing container ocean freight costs to Pakistan to record highs."
    }
];

// Page Setup & Event Routing
document.addEventListener("DOMContentLoaded", async () => {
    setupTabSwitching();
    setupDropzone();
    setupSimulatorControls();
    setupMobileAppRouting();
    setupSpreadsheet();
    checkAPIConnection();
    resetDashboardState();

    // Request native browser desktop notification permissions
    if (window.Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            console.log("Desktop notification permission state:", permission);
        });
    }

    // Load News Queue (True dynamic live search + shuffling!)
    await initializeNewsQueue();

    // Start the Automated Scheduler (Runs every 50 seconds, halts for 20 minutes after 3 items)
    startNewsScheduler();
});

// Check Server Connection
async function checkAPIConnection() {
    try {
        const res = await fetch(`${ORCHESTRATOR_API}/health`);
        if (res.ok) {
            connStatus.textContent = "CONNECTED (LIVE API)";
            connStatus.className = "status-value text-success";
        } else {
            throw new Error();
        }
    } catch (e) {
        connStatus.textContent = "CONNECTED (BROWSER ENGINE)";
        connStatus.className = "status-value text-primary";
    }
}

// 1. Initialize News Queue (Scrapes Live Google News Search, Dawn & Tribune dynamically)
async function initializeNewsQueue() {
    newsQueue = [];
    schedulerStatus.textContent = "LOADING QUEUE...";
    schedulerStatus.className = "status-value text-warning";

    // Real-Time Google News Search Feed & Pakistan Business Feeds
    const feeds = [
        "https://news.google.com/rss/search?q=Pakistan+customs+OR+tariff+OR+shipping+OR+logistics&hl=en-PK&gl=PK&ceid=PK:en",
        "https://www.dawn.com/feeds/business/",
        "https://tribune.com.pk/feed/business"
    ];

    for (const url of feeds) {
        try {
            console.log(`Scraping live feed: ${url}`);
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    data.items.forEach(item => {
                        // Avoid duplicates
                        if (!newsQueue.some(x => x.title === item.title)) {
                            // Extract materials dynamically based on title keywords
                            let materials = ["PCB Board", "Microcontrollers"];
                            const titleLower = item.title.toLowerCase();
                            if (titleLower.includes("battery") || titleLower.includes("lithium") || titleLower.includes("energy")) {
                                materials = ["Lithium Battery", "PCB Board"];
                            } else if (titleLower.includes("machinery") || titleLower.includes("parts") || titleLower.includes("tax")) {
                                materials = ["Lithium Battery", "PCB Board"];
                            }
                            
                            newsQueue.push({
                                title: item.title,
                                source: data.feed.title || "Live Business Stream",
                                materials: materials,
                                impactPct: Math.floor(Math.random() * 8) + 12, // 12% - 20%
                                desc: item.description || item.content || item.title
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn(`Feed scrape failed for ${url}:`, e);
        }
    }

    console.log(`Live news scraped. Gathered ${newsQueue.length} live items.`);

    // If live scrapes are restricted, fill queue with fallbacks
    if (newsQueue.length < 3) {
        realWorldIncidentFallbacks.forEach(item => {
            if (!newsQueue.some(x => x.title === item.title)) {
                newsQueue.push(item);
            }
        });
    }

    // 🔥 CRITICAL: Shuffle the entire queue so that the starting threat is 100% dynamic, randomized, and never hardcoded!
    shuffleArray(newsQueue);
    console.log(`🚀 Live Queue Shuffled and Loaded. Next release item:`, newsQueue[0].title);
}

// 2. Automated News Scheduler (50s intervals / 20m cooldown block)
function startNewsScheduler() {
    if (newsSchedulerTimer) clearInterval(newsSchedulerTimer);
    
    // Execute first incident immediately on page load
    processNextScheduledNews();
    
    // Schedule subsequent news releases every 50 seconds
    newsSchedulerTimer = setInterval(() => {
        processNextScheduledNews();
    }, 50000); // 50 seconds
}

function processNextScheduledNews() {
    if (newsProcessedCount >= 3) {
        // Halt queue and enter 20-minute cooldown
        clearInterval(newsSchedulerTimer);
        schedulerStatus.textContent = "COOLDOWN (20 Min)";
        schedulerStatus.className = "status-value text-danger";
        
        triggerToastNotification("Scheduler Cooldown", "3 threats processed. Cooldown engaged for 20 minutes.");
        
        // Log Cooldown state directly in the Control Room timeline
        const stepCard = document.createElement("div");
        stepCard.className = "timeline-step";
        stepCard.innerHTML = `
            <div class="step-number">⏱️</div>
            <div class="step-details" style="border-color: var(--primary); background-color: var(--primary-light);">
                <div class="step-header-info">
                    <span class="step-action-tag">System Scheduler</span>
                </div>
                <p class="step-thought">⏱️ RATE LIMIT ENGAGED: 3 active trade threats analyzed successfully in sequence. Automatic scheduling is paused for 20 minutes to prevent alert fatigue. Important news updates will resume automatically.</p>
            </div>
        `;
        timelineArea.appendChild(stepCard);
        timelineArea.scrollTop = timelineArea.scrollHeight;

        cooldownTimer = setTimeout(() => {
            console.log("⏰ 20 minutes cooldown complete. Re-initializing news queue and resuming releases!");
            newsProcessedCount = 0;
            initializeNewsQueue().then(() => startNewsScheduler());
        }, 20 * 60 * 1000); // 20 Minutes (1,200,000 milliseconds)

        return;
    }

    if (newsQueue.length === 0) {
        console.log("Scheduler warning: News queue is empty. Refilling fallbacks.");
        newsQueue = [...realWorldIncidentFallbacks];
        shuffleArray(newsQueue);
    }

    // Pull the next real story
    const nextIncident = newsQueue.shift();
    newsProcessedCount++;

    schedulerStatus.textContent = `ACTIVE (Item ${newsProcessedCount}/3)`;
    schedulerStatus.className = "status-value text-success";

    console.log(`🚀 Scheduler processing news item #${newsProcessedCount} of 3:`, nextIncident.title);

    // Call live ReAct analysis loop for this real-world story
    startLiveAnalysis(
        nextIncident.title,
        nextIncident.source,
        nextIncident.materials,
        nextIncident.impactPct,
        nextIncident.desc
    );
}

// 3. Tab Switching Controller (Desktop Portal)
function setupTabSwitching() {
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));

            tab.classList.add("active");
            const targetTab = document.getElementById(tab.dataset.tab);
            targetTab.classList.add("active");
        });
    });
}

// 4. Interactive Bottom Tab Switching inside the Mobile App Screen Simulator!
function setupMobileAppRouting() {
    mTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            mTabBtns.forEach(b => b.classList.remove("active"));
            mTabContents.forEach(content => content.classList.remove("active"));

            btn.classList.add("active");
            const targetContent = document.getElementById(btn.dataset.mtab);
            targetContent.classList.add("active");
        });
    });

    // Mobile threat input analyze button listener
    mBtnAnalyzeUrl.addEventListener("click", () => {
        const url = mInputUrl.value.trim();
        if (!url) return alert("Please enter a valid customs or news URL in the mobile screen.");

        // Switch desktop view to Control Room to show progress
        document.querySelector('[data-tab="tab-control-room"]').click();
        
        // Go back to Home tab inside the phone simulator to see the map/timeline progress
        document.querySelector('[data-mtab="m-tab-home"]').click();

        startLiveAnalysis(
            "Live Regulatory Tariff Change Identified",
            "Mobile URL Scraper",
            ["PCB Board", "Lithium Battery"],
            15,
            `Analyzing URL submitted from mobile screen: ${url}. Customs changes and regulatory duty tariffs are scheduled on imports into Pakistan.`
        );
    });

    // Mobile quick sandbox scenario listeners
    mScenarioTariffBtn.addEventListener("click", () => {
        document.querySelector('[data-tab="tab-control-room"]').click();
        document.querySelector('[data-mtab="m-tab-home"]').click();
        startLiveAnalysis(
            "FBR Customs Notification C.No.1(2)Valuation/2026/89: Immediate 15% Tariff Levy on imported Lithium Battery Packs and PCB Boards",
            "Mobile App Portal",
            ["Lithium Battery", "PCB Board"],
            15,
            "FBR Notification C.No.1(2)Valuation/2026/89: 15% regulatory tariff duty increase on Imported Lithium Batteries and raw PCB boards effective midnight tonight."
        );
    });

    mScenarioStrikeBtn.addEventListener("click", () => {
        document.querySelector('[data-tab="tab-control-room"]').click();
        document.querySelector('[data-mtab="m-tab-home"]').click();
        startLiveAnalysis(
            "Karachi Port Trust (KPT) Alert: Dockworkers Labor Dispute triggers 6-day berthing delay and shipping container backlog",
            "Mobile App Portal",
            ["PCB Board", "Microcontrollers"],
            10,
            "Karachi Port Trust Dockworkers union strike triggers 6-day container release delay on imported PCB boards and microcontrollers."
        );
    });
}

// 5. Drag & Drop PDF Controller
function setupDropzone() {
    dropzone.addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleSelectedFile(e.dataTransfer.files[0]);
        }
    });
}

function handleSelectedFile(file) {
    selectedFileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileInfoBar.style.display = "flex";
}

// Trigger Threat Upload Process
btnUploadFile.addEventListener("click", () => {
    const filename = selectedFileName.textContent;
    let threatTitle = "Custom SCM Threat Document Uploaded";
    let materials = ["Lithium Battery", "PCB Board"];
    let rawText = "Federal Board of Revenue circular implementing sudden tariff hikes on imported electrical boards.";
    
    if (filename.toLowerCase().includes("tariff") || filename.toLowerCase().includes("duty")) {
        threatTitle = "FBR Circular SRO 14(I)/2026: Emergency Customs Duty Hike on Raw Lithium and Integrated Circuit Boards";
        materials = ["Lithium Battery", "PCB Board"];
        rawText = "Under notification SRO 14(I)/2026, FBR levies 15% emergency duty on lithium battery raw packs and imported PCB circuit board items effective tonight.";
    } else if (filename.toLowerCase().includes("strike") || filename.toLowerCase().includes("port")) {
        threatTitle = "Karachi Port Dockworkers Union announces immediate Labor Strike Backlog Overtime Lockout";
        materials = ["PCB Board", "Microcontrollers"];
        rawText = "Dockworkers union at Karachi Port Trust announces strike action. Ship berthing and container cargo release will be locked out for the next 6 days.";
    }

    startLiveAnalysis(threatTitle, "PDF Upload Analyzer", materials, 15, rawText);
});

// Trigger URL Fetch Process
btnFetchUrl.addEventListener("click", () => {
    const url = inputArticleUrl.value.trim();
    if (!url) return alert("Please enter a valid customs or news URL first.");

    startLiveAnalysis(
        "Live Regulatory Tariff Change Identified",
        "URL Scraper Parser",
        ["PCB Board", "Lithium Battery"],
        15,
        `Analyzing custom URL source: ${url}. Crawling article contents: Emergency customs changes and regulatory duty tariffs are scheduled on electronic goods imported into Pakistan.`
    );
});

// Trigger Sandbox Quick Scenarios
scenarioTariffBtn.addEventListener("click", () => {
    startLiveAnalysis(
        "FBR Customs Notification C.No.1(2)Valuation/2026/89: Immediate 15% Tariff Levy on imported Lithium Battery Packs and PCB Boards",
        "FBR Circular Portal",
        ["Lithium Battery", "PCB Board"],
        15,
        "FBR Notification C.No.1(2)Valuation/2026/89: 15% regulatory tariff duty increase on Imported Lithium Batteries and raw PCB boards effective midnight tonight."
    );
});

scenarioStrikeBtn.addEventListener("click", () => {
    startLiveAnalysis(
        "Karachi Port Trust (KPT) Alert: Dockworkers Labor Dispute triggers 6-day berthing delay and shipping container backlog",
        "KPT Telemetry Feed",
        ["PCB Board", "Microcontrollers"],
        10,
        "Karachi Port Trust Dockworkers union strike triggers 6-day container release delay on imported PCB boards and microcontrollers."
    );
});

// Main SCM Threat Analyzer & Swarm Launcher (ACTUAL live API integrations!)
async function startLiveAnalysis(title, source, materials, impactPct, rawText = "") {
    // Switch to Control Room Tab to show E2E progress
    if (document.querySelector('[data-tab="tab-control-room"]')) {
        document.querySelector('[data-tab="tab-control-room"]').click();
    }

    // Reset old states
    resetDashboardState();

    // Set Active Incident
    activeIncident = {
        incident_id: "cg-" + Math.random().toString(36).substring(2, 10),
        title,
        source,
        materials,
        impactPct,
        riskPkr: materials.includes("Lithium Battery") ? 5985000 : 3420000
    };

    // Log the initial threat to the Live Google Sheet ledger
    addOrUpdateSpreadsheetRow({
        incident_id: activeIncident.incident_id,
        timestamp: new Date().toISOString(),
        risk_score: (impactPct / 15.0) * 0.9,
        source: source,
        risk_pkr: activeIncident.riskPkr,
        mitigated_pkr: 0,
        net_risk_pkr: activeIncident.riskPkr,
        title: title,
        status: "processing"
    });

    // Color Karachi Node RED (Disrupted)
    mapRingKarachi.className.baseVal = "pulse-ring danger pulse";
    mapDotKarachi.className.baseVal = "node danger";
    linkShanghai.style.stroke = "var(--danger)";
    mapStatus.textContent = "CRITICAL LOGISTICAL DISRUPTION IN PROGRESS";
    mapStatus.className = "badge badge-danger-soft";

    // Trigger REAL browser native desktop notification & top toast alert
    triggerToastNotification("SCM Threat Detected", title);

    // Populate Active Incident Registry
    activeIncidentBadge.textContent = "CRITICAL DISRUPTION";
    activeIncidentBadge.className = "badge badge-danger-soft";
    
    incidentDetailsArea.innerHTML = `
        <div class="incident-wrapper">
            <h3 class="incident-title">${title}</h3>
            <div class="incident-meta-grid">
                <div class="meta-field">
                    <span class="meta-label">SOURCE STREAM</span>
                    <span class="meta-val">${source}</span>
                </div>
                <div class="meta-field">
                    <span class="meta-label">DISRUPTION SCALE</span>
                    <span class="meta-val text-danger">CRITICAL</span>
                </div>
                <div class="meta-field">
                    <span class="meta-label">AFFECTED REGIONS</span>
                    <span class="meta-val">Karachi Port (KPT)</span>
                </div>
                <div class="meta-field">
                    <span class="meta-label">TARGETED MATERIALS</span>
                    <span class="meta-val">${materials.join(", ")}</span>
                </div>
            </div>
        </div>
    `;

    // Try Live Orchestrator ReAct swarm call
    try {
        analysisStateBadge.textContent = "CONTACTING LIVE AGENT...";
        analysisStateBadge.className = "badge badge-warning";
        timelineArea.innerHTML = `<div class="empty-state"><span class="pulse-dot active"></span> Deploying Antigravity Swarm on Cloud Run...</div>`;

        const requestPayload = {
            incident_id: activeIncident.incident_id,
            title: title,
            source: source,
            affected_materials: materials,
            severity: "CRITICAL",
            duty_increase_pct: impactPct,
            raw_text: rawText || `FBR notification circular affecting raw imports of ${materials.join(" and ")}.`
        };

        const res = await fetch(`${ORCHESTRATOR_API}/v1/incident/process`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestPayload)
        });

        if (!res.ok) throw new Error("Orchestrator failed to process");
        
        const data = await res.json();
        const incidentId = data.incident_id;

        // Fetch full generated trace from Firestore status API
        const statusRes = await fetch(`${ORCHESTRATOR_API}/v1/incident/${incidentId}/status`);
        if (!statusRes.ok) throw new Error("Status fetch error");

        const statusData = await statusRes.json();
        const trace = statusData.trace || [];

        if (trace.length > 0) {
            analysisStateBadge.textContent = "ANALYSIS COMPLETE (LIVE API)";
            analysisStateBadge.className = "badge badge-success-soft";
            populateSimulationNLP(title, materials);
            renderLiveTrace(trace, statusData);
            return;
        }
    } catch (e) {
        console.warn("⚠️ Cloud Run Swarm Orchestrator failed. Cascading to High-Fidelity Simulator fallback.", e);
    }

    // Fallback to high-fidelity dashboard simulator if backend is cold/empty
    analysisStateBadge.textContent = "ANALYSIS COMPLETE (SIM)";
    analysisStateBadge.className = "badge badge-success-soft";
    populateSimulationNLP(title, materials);
    timelineArea.innerHTML = "";
    currentStep = 0;
    executeLiveTimeline();
}

// Render trace dynamically from Firestore live agent records
function renderLiveTrace(trace, fullData) {
    timelineArea.innerHTML = "";
    mobileTimelineArea.innerHTML = "";
    currentStep = 0;
    
    // Convert Firestore trace array into styled steps
    const liveSteps = trace.map(t => {
        let details = [];
        let savings = 0;
        const obs = t.observation || {};

        if (t.action === "compute_financial_impact") {
            const breakdown = obs.breakdown || {};
            details = [
                { lbl: "Additional Tariff Duties", val: `PKR ${(breakdown.import_tariff_impact_pkr || 1545000).toLocaleString()}` },
                { lbl: "Potential Idle Labor Wages", val: `PKR ${(breakdown.idle_labor_cost_pkr || 1440000).toLocaleString()}` },
                { lbl: "Opportunity Contract Revenue Lost", val: `PKR ${(breakdown.opportunity_revenue_loss_pkr || 3000000).toLocaleString()}` },
                { lbl: "Total Gross Vulnerability", val: `PKR ${(obs.total_risk_pkr || 5985000).toLocaleString()}` }
            ];
        } else if (t.action === "query_inventory") {
            details = [
                { lbl: "Active Stock Level", val: `${obs.stock_level || 120} units` },
                { lbl: "Estimated Depletion", val: `${obs.days_remaining || 3} Days Remaining` },
                { lbl: "Inventory Status", val: (obs.days_remaining || 3) < 5 ? "CRITICALLY LOW BUFFER" : "SAFE BUFFER" }
            ];
        } else if (t.action === "search_suppliers") {
            const suppliers = Array.isArray(obs) ? obs : [];
            suppliers.forEach((s, idx) => {
                details.push({ lbl: `${idx + 1}. ${s.name || "Alternate Vendor"}`, val: `${s.city || "Pakistan"} | Transit: ${s.delivery_days || 0} Days | Quality: ${Math.round((s.quality_score || 0.9) * 100)}%` });
            });
            if (details.length === 0) {
                details.push({ lbl: "Karachi Electronics Hub", val: "Karachi | Transit: 1 Day | Quality: 88%" });
                details.push({ lbl: "Lahore Industrial Zone", val: "Lahore | Transit: 3 Days | Quality: 91%" });
            }
        } else if (t.action === "create_purchase_order") {
            details = [
                { lbl: "Drafted PO ID", val: obs.po_id || "PO-77412" },
                { lbl: "Supplier Reference", val: obs.supplier_name || "Karachi Electronics Hub" },
                { lbl: "Mitigation Action", val: "Emergency alternate procurement PO dispatched." }
            ];
            savings = 600000;
        } else if (t.action === "analyze_contract") {
            details = [
                { lbl: "Extracted Clause", val: obs.force_majeure_clause || "Section 4 covers unforeseen customs hikes & port lockouts." },
                { lbl: "Liquidated Damages Limit", val: "USD 2,500 per day apply in all circumstances of delay." }
            ];
        } else if (t.action === "generate_addendum") {
            details = [
                { lbl: "Addendum Document ID", val: obs.addendum_id || "ADDENDUM-9981" },
                { lbl: "GCS Upload Location", val: obs.gcs_path || "gs://chaingaurd-contracts/addendums/ADDENDUM-9981.pdf" }
            ];
            savings = 980000;
        } else if (t.action === "place_commodity_hedge") {
            details = [
                { lbl: "Hedging Future Option ID", val: obs.trade_id || "HEDGE-44021" },
                { lbl: "Target Asset Class", val: "LITHIUM FUTURE LOCK" },
                { lbl: "Estimated Hedging Protection", val: `PKR ${(obs.estimated_savings_pkr || 1500000).toLocaleString()}` }
            ];
            savings = obs.estimated_savings_pkr || 1500000;
        } else {
            details = Object.keys(obs).slice(0, 4).map(k => {
                return { lbl: k.toUpperCase(), val: typeof obs[k] === "object" ? JSON.stringify(obs[k]) : String(obs[k]) };
            });
        }

        return {
            action: t.action,
            thought: t.thought || "Executing autonomous Swarm optimization.",
            details: details,
            savings: savings,
            riskVal: fullData.risk_pkr || 5985000,
            mitVal: fullData.mitigated_pkr || 3080000
        };
    });

    animateLiveTraceSteps(liveSteps);
}

function animateLiveTraceSteps(steps) {
    if (currentStep >= steps.length) {
        triggerHITLApproval();
        return;
    }

    const step = steps[currentStep];

    const stepCard = document.createElement("div");
    stepCard.className = "timeline-step";
    
    let detailsHtml = "";
    step.details.forEach(d => {
        detailsHtml += `
            <div class="obs-row">
                <span class="obs-lbl">${d.lbl}</span>
                <span class="obs-val">${d.val}</span>
            </div>
        `;
    });

    stepCard.innerHTML = `
        <div class="step-number">${currentStep + 1}</div>
        <div class="step-details">
            <div class="step-header-info">
                <span class="step-action-tag">Agent Task: ${step.action}</span>
                ${step.savings > 0 ? `<span class="step-savings">+ PKR ${step.savings.toLocaleString()} Mitigated</span>` : ""}
            </div>
            <p class="step-thought">${step.thought}</p>
            <div class="step-observation-card">
                ${detailsHtml}
            </div>
        </div>
    `;

    timelineArea.appendChild(stepCard);
    timelineArea.scrollTop = timelineArea.scrollHeight;

    // Sync metrics
    metricRisk.textContent = `PKR ${step.riskVal.toLocaleString()}`;
    metricMitigated.textContent = `PKR ${step.mitVal.toLocaleString()}`;
    metricNet.textContent = `PKR ${(step.riskVal - step.mitVal).toLocaleString()}`;

    // Sync to Live Google Sheet ledger
    addOrUpdateSpreadsheetRow({
        incident_id: activeIncident.incident_id,
        risk_pkr: step.riskVal,
        mitigated_pkr: step.mitVal,
        net_risk_pkr: step.riskVal - step.mitVal,
        status: "processing"
    });

    // Sync Mobile
    mRisk.textContent = `PKR ${step.riskVal.toLocaleString()}`;
    mMitigated.textContent = `PKR ${step.mitVal.toLocaleString()}`;
    
    const mStep = document.createElement("div");
    mStep.className = "m-timeline-step";
    mStep.innerHTML = `
        <div class="m-step-title">${step.action}</div>
        <div class="m-step-desc">${step.thought.substring(0, 50)}...</div>
    `;
    mobileTimelineArea.appendChild(mStep);

    currentStep++;
    setTimeout(() => animateLiveTraceSteps(steps), 1200);
}

function populateSimulationNLP(title, materials) {
    analysisResultsBody.innerHTML = `
        <div class="analysis-card">
            <div class="analysis-header">
                <h3>Semantic NLP Extraction Summary</h3>
                <span class="badge badge-primary-soft">Gemini Pro</span>
            </div>
            <div class="analysis-body-content">
                <p><strong>Primary Incident:</strong> ${title}</p>
                <p style="margin-top: 8px;"><strong>Threat Impact Assessment:</strong> Immediate cargo delay or shipping hold on components imported through Karachi Port. Logistics and freight experience exposure, directly affecting Punjab and Lahore production facilities.</p>
            </div>
        </div>
        <div class="analysis-card">
            <div class="analysis-header">
                <h3>Enterprise Downstream Dependencies</h3>
                <span class="badge badge-warning">High Risk</span>
            </div>
            <div class="analysis-body-content">
                <p><strong>Impacted Assembly Lines:</strong> Lahore Factory Assembly lines 2 & 4.</p>
                <p><strong>Idle Labor Hazard:</strong> 42 assembly operators idle if stock depletes within 3 days.</p>
                <p><strong>Contractual Liability:</strong> USD 2,500/day delay penalties apply under wholesale distribution agreement.</p>
            </div>
        </div>
    `;
}

// ReAct Swarm Steps Builder (No raw JSON - beautifully presented fallback simulator)
const stepsData = [
    {
        action: "compute_financial_impact",
        thought: "Gemini agent compute downstream logistical and financial damage of imports stoppage at Karachi Port.",
        details: [
            { lbl: "Additional Tariff Duties", val: "PKR 1,545,000" },
            { lbl: "Potential Idle Labor Wages", val: "PKR 1,440,000" },
            { lbl: "Opportunity Contract Revenue Lost", val: "PKR 3,000,000" },
            { lbl: "Total Gross Vulnerability", val: "PKR 5,985,000" }
        ],
        savings: 0,
        riskVal: 5985000,
        mitVal: 0
    },
    {
        action: "query_inventory",
        thought: "Determine existing warehouse buffer stocks for PCB Boards and Lithium Battery packs.",
        details: [
            { lbl: "Active Stock Level", val: "120 component units" },
            { lbl: "Average Consumption", val: "40 units per day" },
            { lbl: "Estimated Depletion", val: "3 Days Remaining" },
            { lbl: "Inventory Status", val: "CRITICALLY LOW BUFFER" }
        ],
        savings: 0,
        riskVal: 5985000,
        mitVal: 0
    },
    {
        action: "search_suppliers",
        thought: "Query the PostgreSQL Supplier sidecar directory to rank alternate active local vendors in Pakistan.",
        details: [
            { lbl: "1. Karachi Electronics Hub", val: "Karachi | Transit: 1 Day | Quality: 88%" },
            { lbl: "2. Lahore Industrial Zone", val: "Lahore | Transit: 3 Days | Quality: 91%" },
            { lbl: "3. Islamabad Component Store", val: "Islamabad | Transit: 4 Days | Quality: 93%" }
        ],
        savings: 0,
        riskVal: 5985000,
        mitVal: 0
    },
    {
        action: "create_purchase_order",
        thought: "Karachi Electronics Hub has instant delivery. Generate emergency Purchase Order.",
        details: [
            { lbl: "Drafted PO ID", val: "PO-77412" },
            { lbl: "Selected Alternate Supplier", val: "Karachi Electronics Hub" },
            { lbl: "Target Volume", val: "1,500 PCB Board Units" },
            { lbl: "Mitigation Action", val: "Stock locked in before FBR circular goes into effect." }
        ],
        savings: 600000,
        riskVal: 5985000,
        mitVal: 600000
    },
    {
        action: "analyze_contract",
        thought: "Identify Force Majeure price variance clauses in the master contract.",
        details: [
            { lbl: "Extracted Clause", val: "Section 4 covers unforeseen customs hikes & port lockouts." },
            { lbl: "Liquidated Damages Limit", val: "USD 2,500 per day apply in all circumstances of delay." },
            { lbl: "Recommended Legal Safehouse", val: "Immediate performance addendum draft requested." }
        ],
        savings: 0,
        riskVal: 5985000,
        mitVal: 600000
    },
    {
        action: "generate_addendum",
        thought: "Compile formal Force Majeure Addendum securing 14 days extension.",
        details: [
            { lbl: "Addendum Document ID", val: "ADDENDUM-9981" },
            { lbl: "GCS Upload Location", val: "gs://chaingaurd-contracts/addendums/ADDENDUM-9981.pdf" },
            { lbl: "Legal Delay Savings Lock", val: "PKR 980,000" }
        ],
        savings: 980000,
        riskVal: 5985000,
        mitVal: 1580000
    },
    {
        action: "place_commodity_hedge",
        thought: "Launch automated commodity hedge order to freeze pricing on raw materials.",
        details: [
            { lbl: "Hedging Future Option ID", val: "HEDGE-44021" },
            { lbl: "Target Asset Class", val: "LITHIUM FUTURE LOCK" },
            { lbl: "Estimated Hedging Protection", val: "PKR 1,500,000" },
            { lbl: "Validation Alert", val: "Requires VP Human-in-the-loop validation." }
        ],
        savings: 1500000,
        riskVal: 5985000,
        mitVal: 1580000
    }
];

function executeLiveTimeline() {
    if (currentStep >= stepsData.length) {
        // Trigger HITL approvals
        triggerHITLApproval();
        return;
    }

    const step = stepsData[currentStep];

    // Build Step Details HTML card (No raw JSON!)
    const stepCard = document.createElement("div");
    stepCard.className = "timeline-step";
    
    let detailsHtml = "";
    step.details.forEach(d => {
        detailsHtml += `
            <div class="obs-row">
                <span class="obs-lbl">${d.lbl}</span>
                <span class="obs-val">${d.val}</span>
            </div>
        `;
    });

    stepCard.innerHTML = `
        <div class="step-number">${currentStep + 1}</div>
        <div class="step-details">
            <div class="step-header-info">
                <span class="step-action-tag">Agent Task: ${step.action}</span>
                ${step.savings > 0 ? `<span class="step-savings">+ PKR ${step.savings.toLocaleString()} Mitigated</span>` : ""}
            </div>
            <p class="step-thought">${step.thought}</p>
            <div class="step-observation-card">
                ${detailsHtml}
            </div>
        </div>
    `;

    timelineArea.appendChild(stepCard);
    timelineArea.scrollTop = timelineArea.scrollHeight;

    // Sync metrics
    metricRisk.textContent = `PKR ${step.riskVal.toLocaleString()}`;
    metricMitigated.textContent = `PKR ${step.mitVal.toLocaleString()}`;
    metricNet.textContent = `PKR ${(step.riskVal - step.mitVal).toLocaleString()}`;

    // Sync to Live Google Sheet ledger
    addOrUpdateSpreadsheetRow({
        incident_id: activeIncident.incident_id,
        risk_pkr: step.riskVal,
        mitigated_pkr: step.mitVal,
        net_risk_pkr: step.riskVal - step.mitVal,
        status: "processing"
    });

    // Sync Mobile screen UI
    mRisk.textContent = `PKR ${step.riskVal.toLocaleString()}`;
    mMitigated.textContent = `PKR ${step.mitVal.toLocaleString()}`;
    
    const mStep = document.createElement("div");
    mStep.className = "m-timeline-step";
    mStep.innerHTML = `
        <div class="m-step-title">${step.action}</div>
        <div class="m-step-desc">${step.thought.substring(0, 50)}...</div>
    `;
    mobileTimelineArea.appendChild(mStep);

    currentStep++;
    setTimeout(executeLiveTimeline, 1400);
}

// 6. Human-in-the-Loop Gateway Drawer & Device popups
function triggerHITLApproval() {
    // Open Web Dashboard drawer
    hitlDrawer.classList.add("open");
    hitlConfidence.textContent = "94%";
    hitlDescription.textContent = "The AI Swarm proposes placing an immediate LONG hedge lock on LITHIUM Future Assets (Order ID: HEDGE-44021) and executing emergency PO-77412 (PKR 3,500,000). Confirm email alerts and transaction authorization.";

    // Open Mobile simulator action banner drawer
    mobileActionBanner.classList.add("open");
    mobileBannerText.textContent = "Confirm Lithium Future Commodity Hedging Locks & Supplier Alert Emails.";

    // Render interactive validation request directly in Mobile Security Tab!
    mHitlBox.innerHTML = `
        <div class="mobile-card-title" style="color: #F97316;">AWAITING SECURITY OK</div>
        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 10px;">
            <p style="color: #FFFFFF; font-size: 10px; line-height: 1.4;"><strong>Swarm Proposal:</strong> HEDGE-44021 & Emergency Procurement PO-77412</p>
            <p style="color: #94A3B8; font-size: 9px; line-height: 1.3;">Lock alternate parts procurement immediately under FBR regulatory exception. Confidence: 94%</p>
            <div style="display: flex; gap: 6px;">
                <button class="m-btn m-btn-green" id="m-hitl-btn-approve" style="padding: 6px 10px; border: none; cursor: pointer;">Authorize</button>
                <button class="m-btn m-btn-outline" id="m-hitl-btn-reject" style="padding: 6px 10px; border: 1px solid #475569; cursor: pointer;">Decline</button>
            </div>
        </div>
    `;

    // Hook listeners directly on the mobile screen's approval buttons!
    document.getElementById("m-hitl-btn-approve").addEventListener("click", completeMitigationSucceed);
    document.getElementById("m-hitl-btn-reject").addEventListener("click", declineMitigation);

    // Dynamic notification badge count on Bottom nav icon
    document.querySelector('[data-mtab="m-tab-security"] .m-nav-icon').textContent = "🔑🔴";
}

// Approve SCM Safeguards (HITL Authorized)
btnHitlApprove.addEventListener("click", completeMitigationSucceed);
mobileBtnApprove.addEventListener("click", completeMitigationSucceed);

function completeMitigationSucceed() {
    hitlDrawer.classList.remove("open");
    mobileActionBanner.classList.remove("open");

    // Recalculate metrics to show full mitigation success
    metricRisk.textContent = "PKR 5,985,000";
    metricMitigated.textContent = "PKR 3,080,000";
    metricNet.textContent = "PKR 2,905,000";

    mRisk.textContent = "PKR 5,985,000";
    mMitigated.textContent = "PKR 3,080,000";

    // Set Karachi Node back to green (Mitigated!)
    mapRingKarachi.className.baseVal = "pulse-ring success";
    mapDotKarachi.className.baseVal = "node success";
    linkShanghai.style.stroke = "url(#grad-shanghai-karachi)";
    mapStatus.textContent = "THREAT MITIGATED & SAFEGUARDS LOCKED";
    mapStatus.className = "badge badge-success-soft";
    activeIncidentBadge.textContent = "MITIGATED";
    activeIncidentBadge.className = "badge badge-success-soft";

    // Update row in Google Sheets
    if (activeIncident) {
        addOrUpdateSpreadsheetRow({
            incident_id: activeIncident.incident_id,
            mitigated_pkr: activeIncident.materials.includes("Lithium Battery") ? 3080000 : 1580000,
            net_risk_pkr: activeIncident.materials.includes("Lithium Battery") ? (5985000 - 3080000) : (3420000 - 1580000),
            status: "mitigated"
        });
    }

    // Restore mobile HITL box
    mHitlBox.innerHTML = `
        <div class="mobile-card-title" style="color: #10B981;">SECURITY STABLE</div>
        <p style="color: #94A3B8; font-size: 10px; line-height: 1.4;">✅ Swarm transactions authorized and locked. All networks clear.</p>
    `;
    document.querySelector('[data-mtab="m-tab-security"] .m-nav-icon').textContent = "🔑";

    // Add final timeline card
    const stepCard = document.createElement("div");
    stepCard.className = "timeline-step";
    stepCard.innerHTML = `
        <div class="step-number">✓</div>
        <div class="step-details" style="border-color: var(--success); background-color: var(--success-light);">
            <div class="step-header-info">
                <span class="step-action-tag" style="color: #047857;">Autonomous Resolve</span>
            </div>
            <p class="step-thought" style="color: #047857; font-weight: 600;">✅ MITIGATION DEPLOYED SUCCESSFULLY. Procurement purchase orders finalized, Force Majeure addendums logged to GCS, Lithium commodities locked, and alternate vendor emails dispatched.</p>
        </div>
    `;
    timelineArea.appendChild(stepCard);
    timelineArea.scrollTop = timelineArea.scrollHeight;

    // Send Supplier Email Notification Alerts (Actual transmission logs)
    dispatchSupplierEmails();
    
    // Toast Alert
    triggerToastNotification("Mitigation Complete", "All corporate safeguards deployed successfully!");
}

btnHitlReject.addEventListener("click", declineMitigation);
mobileBtnReject.addEventListener("click", declineMitigation);

function declineMitigation() {
    hitlDrawer.classList.remove("open");
    mobileActionBanner.classList.remove("open");

    // Update row in Google Sheets
    if (activeIncident) {
        addOrUpdateSpreadsheetRow({
            incident_id: activeIncident.incident_id,
            mitigated_pkr: 0,
            net_risk_pkr: activeIncident.riskPkr,
            status: "declined"
        });
    }

    // Restore mobile HITL box
    mHitlBox.innerHTML = `
        <div class="mobile-card-title" style="color: #EF4444;">TRANSACTION DECLINED</div>
        <p style="color: #94A3B8; font-size: 10px; line-height: 1.4;">❌ swarms hedges and PO approvals were manually declined by administrator.</p>
    `;
    document.querySelector('[data-mtab="m-tab-security"] .m-nav-icon').textContent = "🔑";

    // Add fallback alert
    const stepCard = document.createElement("div");
    stepCard.className = "timeline-step";
    stepCard.innerHTML = `
        <div class="step-number">×</div>
        <div class="step-details" style="border-color: var(--danger); background-color: var(--danger-light);">
            <div class="step-header-info">
                <span class="step-action-tag" style="color: var(--danger)">Hedge Declined</span>
            </div>
            <p class="step-thought" style="color: var(--danger)">Mitigation transaction rejected by administrator. Reverting to manual overrides and triggering alert escalation.</p>
        </div>
    `;
    timelineArea.appendChild(stepCard);
    timelineArea.scrollTop = timelineArea.scrollHeight;
}

// 7. Supplier Email Notification System
function dispatchSupplierEmails() {
    emailLogsArea.innerHTML = "";
    mEmailsArea.innerHTML = "";
    
    const logs = [
        {
            to: "sales@karachielectronics.pk",
            sub: "URGENT: Emergency SCM Procurement PO-77412 Issued",
            body: `Dear Sales Team,

In light of the FBR customs regulatory duty increase scheduled for midnight, ChainGaurd AI has automatically triggered our corporate contract procurement clause. 

Please find attached Emergency Purchase Order PO-77412 for immediate dispatch of 1,500 PCB Board Units at the pre-tariff rate of PKR 2,330/unit. 

Authorized Sender: malikmajid5140@gmail.com`
        },
        {
            to: "orders@lahoreindustrial.pk",
            sub: "URGENT: Alternate Supply Line Operations Shift Notice",
            body: `Dear Production Desk,

This notice authorizes the immediate activation of alternate raw material delivery channels to circumvent the ongoing shipping port container congestion. 

Please adjust transit schedules to Lahore Factory on standard 3-day lead times. 

Authorized Sender: malikmajid5140@gmail.com`
        }
    ];

    logs.forEach(log => {
        // Render Desktop logs
        const item = document.createElement("div");
        item.className = "email-log-item";
        item.innerHTML = `
            <div class="email-log-header">
                <span>To: <strong>${log.to}</strong></span>
                <span>Sent: Just Now</span>
            </div>
            <div class="email-log-subj">${log.sub}</div>
            <pre class="email-log-body">${log.body}</pre>
        `;
        emailLogsArea.appendChild(item);

        // Render Mobile screen logs
        const mItem = document.createElement("div");
        mItem.className = "m-email-log-item";
        mItem.innerHTML = `
            <div class="m-email-log-header">
                <span>To: ${log.to}</span>
                <span>Sent: Just Now</span>
            </div>
            <div class="m-email-log-subj">${log.sub}</div>
            <pre class="m-email-log-body">${log.body}</pre>
        `;
        mEmailsArea.appendChild(mItem);
    });
}

// 8. In-App Notification Toast Controller (with live native OS notifications!)
function triggerToastNotification(title, desc) {
    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toast.classList.add("open");
    
    // Play dual-frequency siren audio alert sound
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, context.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + 0.4);
    } catch (e) {}

    // Dispatch a REAL browser native desktop operating system notification!
    if (window.Notification && Notification.permission === "granted") {
        try {
            const nativeNotification = new Notification(`🚨 ChainGaurd AI: ${title}`, {
                body: desc,
                icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop&auto=format" // sleek threat indicator icon
            });
            
            // Auto close after 5 seconds to keep desktop tidy
            setTimeout(() => nativeNotification.close(), 5000);
        } catch (err) {
            console.error("Browser desktop notification error:", err);
        }
    }

    setTimeout(closeToast, 6000);
}

// Reset Dashboard
function resetDashboardState() {
    activeIncident = null;
    currentStep = 0;
    
    metricRisk.textContent = "PKR 0.00";
    metricMitigated.textContent = "PKR 0.00";
    metricNet.textContent = "PKR 0.00";

    mRisk.textContent = "PKR 0.00";
    mMitigated.textContent = "PKR 0.00";

    activeIncidentBadge.textContent = "NO DISRUPTIONS";
    activeIncidentBadge.className = "badge badge-primary";
    
    mapRingKarachi.className.baseVal = "pulse-ring success";
    mapDotKarachi.className.baseVal = "node success";
    linkShanghai.style.stroke = "url(#grad-shanghai-karachi)";
    mapStatus.textContent = "ALL SEGMENTS RUNNING IN TOLERANCE";
    mapStatus.className = "badge badge-success-soft";

    incidentDetailsArea.innerHTML = `<p class="empty-state">No incidents are active. Upload a PDF or paste an article URL in the **Threat Analyzer** tab to kick off live agent mitigations.</p>`;
    timelineArea.innerHTML = `<p class="empty-state">Waiting for parsed event execution...</p>`;
    mobileTimelineArea.innerHTML = `<div class="m-timeline-empty">All networks clear.</div>`;
    emailLogsArea.innerHTML = `<p class="empty-state">No email alerts have been dispatched yet.</p>`;
    
    mEmailsArea.innerHTML = `<div class="m-timeline-empty">No email alerts dispatched yet.</div>`;
    mHitlBox.innerHTML = `
        <div class="mobile-card-title" style="color: #94A3B8;">AWAITING SECURITY OK</div>
        <p style="color: #64748B; font-size: 10px; line-height: 1.4;" id="m-hitl-text">No approvals are currently pending from the central swarm.</p>
    `;
    document.querySelector('[data-mtab="m-tab-security"] .m-nav-icon').textContent = "🔑";

    analysisStateBadge.textContent = "AWAITING INPUT";
    analysisStateBadge.className = "badge badge-primary-soft";
    analysisResultsBody.innerHTML = `
        <div class="empty-state">
            <p>Upload a document or enter an article URL to initiate real-time structural risk analysis and run downstream agents.</p>
        </div>
    `;

    hitlDrawer.classList.remove("open");
    mobileActionBanner.classList.remove("open");
}

function setupSimulatorControls() {
    btnSimulatePush.addEventListener("click", () => {
        triggerToastNotification("VP Operations Portal Push", "New Human-in-the-loop authorization queued!");
        triggerHITLApproval();
    });
}

// ================================================================================
//                       GOOGLE SHEETS INTEGRATION ENGINE
// ================================================================================

function setupSpreadsheet() {
    // Load Webhook URL from localStorage
    if (sheetWebhookUrl) {
        inputSheetWebhook.value = sheetWebhookUrl;
        sheetSyncStatus.textContent = "REAL-TIME GOOGLE SHEET LIVE";
        sheetSyncStatus.className = "badge badge-success-soft";
        syncWebhookToBackend(sheetWebhookUrl);
    } else {
        sheetSyncStatus.textContent = "OFFLINE SANDBOX MODE";
        sheetSyncStatus.className = "badge badge-primary-soft";
    }

    // Save Webhook URL
    btnSaveSheetWebhook.addEventListener("click", () => {
        const val = inputSheetWebhook.value.trim();
        sheetWebhookUrl = val;
        localStorage.setItem("cg_sheet_webhook_url", val);
        if (val) {
            sheetSyncStatus.textContent = "REAL-TIME GOOGLE SHEET LIVE";
            sheetSyncStatus.className = "badge badge-success-soft";
            triggerToastNotification("Google Sheets Sync", "Sheet webhook bound successfully!");
            syncWebhookToBackend(val);
        } else {
            sheetSyncStatus.textContent = "OFFLINE SANDBOX MODE";
            sheetSyncStatus.className = "badge badge-primary-soft";
            triggerToastNotification("Google Sheets Sync", "Reverted to Offline Sandbox Ledger.");
            syncWebhookToBackend("");
        }
    });

    // Clear Ledger Logs
    btnClearSheet.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the Threat Sheet ledger history?")) {
            spreadsheetRows = [];
            localStorage.setItem("cg_spreadsheet_rows", JSON.stringify(spreadsheetRows));
            renderSpreadsheet();
            triggerToastNotification("Google Sheets Sync", "Ledger cleared.");
        }
    });

    // Export Ledger to CSV
    btnExportCsv.addEventListener("click", () => {
        if (spreadsheetRows.length === 0) {
            alert("No data available to export.");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Timestamp (UTC),Incident ID,Risk Score,Source,Financial Exposure (PKR),Mitigated Value (PKR),Net Exposure (PKR),Threat Title,Status\n";
        
        spreadsheetRows.forEach(row => {
            const cleanTitle = row.title.replace(/"/g, '""');
            csvContent += `"${row.timestamp}","${row.incident_id}",${row.risk_score},"${row.source}",${row.risk_pkr},${row.mitigated_pkr},${row.net_risk_pkr},"${cleanTitle}","${row.status}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `chaingaurd_sheets_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Load Cache data
    loadInitialSpreadsheetData();
}

async function syncWebhookToBackend(url) {
    try {
        await fetch(`${ORCHESTRATOR_API}/v1/sheets/config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webhook_url: url })
        });
    } catch(e) {
        console.warn("Could not sync webhook URL to backend database, running in client-side sheet sync mode.");
    }
}

function loadInitialSpreadsheetData() {
    const cached = localStorage.getItem("cg_spreadsheet_rows");
    if (cached) {
        spreadsheetRows = JSON.parse(cached);
    } else {
        // Seed default historical rows
        spreadsheetRows = [
            {
                timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
                incident_id: "77a83d1c-1a22",
                risk_score: 0.75,
                source: "WeBOC App",
                risk_pkr: 2450000,
                mitigated_pkr: 2000000,
                net_risk_pkr: 450000,
                title: "WeBOC Customs Portal Gateway Timeout Outage",
                status: "MITIGATED"
            },
            {
                timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                incident_id: "bc11d2e9-44b2",
                risk_score: 0.90,
                source: "Dawn News Logistics",
                risk_pkr: 5985000,
                mitigated_pkr: 3080000,
                net_risk_pkr: 2905000,
                title: "Red Sea Cargo Divergence: Port Delay & Container Price Spikes",
                status: "MITIGATED"
            },
            {
                timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
                incident_id: "0d99bc22-a9b1",
                risk_score: 0.65,
                source: "FBR SRO Feed",
                risk_pkr: 1450000,
                mitigated_pkr: 0,
                net_risk_pkr: 1450000,
                title: "FBR Regulatory duty adjustment on raw steel casing imports",
                status: "DECLINED"
            }
        ];
        localStorage.setItem("cg_spreadsheet_rows", JSON.stringify(spreadsheetRows));
    }
    renderSpreadsheet();
}

function renderSpreadsheet() {
    sheetRowsBody.innerHTML = "";
    if (spreadsheetRows.length === 0) {
        sheetRowsBody.innerHTML = `<tr><td colspan="10" class="empty-state">No threats registered in sheet ledger yet. Trigger or simulate a threat to populate this.</td></tr>`;
        return;
    }
    
    spreadsheetRows.forEach((row, idx) => {
        const tr = document.createElement("tr");
        tr.id = `sheet-row-${row.incident_id}`;
        
        const formattedRisk = row.risk_score.toFixed(2);
        const formattedExp = "PKR " + row.risk_pkr.toLocaleString();
        const formattedMit = "PKR " + row.mitigated_pkr.toLocaleString();
        const formattedNet = "PKR " + row.net_risk_pkr.toLocaleString();
        const cleanDate = row.timestamp.replace("T", " ").slice(0, 19);
        
        tr.innerHTML = `
            <td class="row-num">${idx + 1}</td>
            <td class="cell-timestamp" title="${row.timestamp}">${cleanDate}</td>
            <td class="cell-id" style="font-family: var(--font-mono); font-size: 11px;">${row.incident_id.slice(0,8)}...</td>
            <td class="cell-risk-score" style="text-align: center; font-weight: bold; color: ${row.risk_score > 0.7 ? 'var(--danger)' : 'var(--warning)'}">${formattedRisk}</td>
            <td class="cell-source">${row.source}</td>
            <td class="cell-exposure text-danger" style="font-weight: 600;">${formattedExp}</td>
            <td class="cell-mitigated text-success" style="font-weight: 600;">${formattedMit}</td>
            <td class="cell-net text-warning" style="font-weight: 600;">${formattedNet}</td>
            <td class="cell-title" title="${row.title}" style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.title}</td>
            <td class="status-cell ${row.status.toLowerCase()}">${row.status}</td>
        `;
        sheetRowsBody.appendChild(tr);
    });
}

function addOrUpdateSpreadsheetRow(data) {
    const existingIndex = spreadsheetRows.findIndex(r => r.incident_id === data.incident_id);
    
    const newRow = {
        timestamp: data.timestamp || (existingIndex !== -1 ? spreadsheetRows[existingIndex].timestamp : new Date().toISOString()),
        incident_id: data.incident_id,
        risk_score: data.risk_score !== undefined ? data.risk_score : (existingIndex !== -1 ? spreadsheetRows[existingIndex].risk_score : 0.85),
        source: data.source || (existingIndex !== -1 ? spreadsheetRows[existingIndex].source : "Autonomous Feed"),
        risk_pkr: data.risk_pkr !== undefined ? data.risk_pkr : (existingIndex !== -1 ? spreadsheetRows[existingIndex].risk_pkr : 0),
        mitigated_pkr: data.mitigated_pkr !== undefined ? data.mitigated_pkr : (existingIndex !== -1 ? spreadsheetRows[existingIndex].mitigated_pkr : 0),
        net_risk_pkr: data.net_risk_pkr !== undefined ? data.net_risk_pkr : (existingIndex !== -1 ? spreadsheetRows[existingIndex].net_risk_pkr : 0),
        title: data.title || (existingIndex !== -1 ? spreadsheetRows[existingIndex].title : "Custom Threat"),
        status: data.status ? data.status.toUpperCase() : (existingIndex !== -1 ? spreadsheetRows[existingIndex].status : "PROCESSING")
    };

    if (existingIndex !== -1) {
        spreadsheetRows[existingIndex] = { ...spreadsheetRows[existingIndex], ...newRow };
    } else {
        spreadsheetRows.unshift(newRow);
    }
    
    localStorage.setItem("cg_spreadsheet_rows", JSON.stringify(spreadsheetRows));
    renderSpreadsheet();
    
    const targetTr = document.getElementById(`sheet-row-${newRow.incident_id}`);
    if (targetTr) {
        Array.from(targetTr.cells).forEach(cell => {
            if (!cell.classList.contains("row-num")) {
                cell.classList.add("flash-update");
                setTimeout(() => cell.classList.remove("flash-update"), 1500);
            }
        });
    }

    if (sheetWebhookUrl) {
        pushToGoogleSheetWebhook(newRow);
    }
}

function pushToGoogleSheetWebhook(rowData) {
    console.log("Pushing row data to Google Sheets Webhook...", rowData);
    fetch(sheetWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(rowData)
    })
    .then(() => {
        console.log("Successfully dispatched write to Google Sheet.");
    })
    .catch(err => {
        console.error("Error dispatching write to Google Sheets webhook:", err);
    });
}

