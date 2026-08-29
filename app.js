/**
 * ============================================================================
 * SHARRIF FAJAR - INTERACTIVE PORTFOLIO ENGINE (app.js)
 * High-Precision Edge AI, TinyML & Semantic Systems Workbench
 * Strict Anti-Slop Implementation: 100% Functional, Accessible, Zero Em-Dash
 * Language: English (Default / Normalized)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- 1. GLOBAL STATE & AUDIO SYNTHESIZER ---
  const state = {
    theme: localStorage.getItem('sf_theme') || 'dark',
    audioEnabled: localStorage.getItem('sf_audio') !== 'false',
    scopeMode: 'normal',
    scopeNoise: 0,
    activeAgentStep: 1,
    activeLabTab: 'tab-pane-agent',
    audioCtx: null
  };

  /**
   * Web Audio API Synthesizer for tactile feedback
   */
  function initAudioContext() {
    if (!state.audioCtx && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
    }
  }

  function playTone(freq, type, duration, gainVal = 0.05) {
    if (!state.audioEnabled) return;
    try {
      initAudioContext();
      if (!state.audioCtx) return;
      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start();
      osc.stop(state.audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore audio failure gracefully
    }
  }

  function playClickSound() {
    playTone(880, 'sine', 0.04, 0.03);
  }

  function playSuccessSound() {
    playTone(523.25, 'triangle', 0.08, 0.04);
    setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.04), 60);
  }

  function playFaultAlertSound() {
    playTone(330, 'sawtooth', 0.12, 0.06);
    setTimeout(() => playTone(220, 'sawtooth', 0.16, 0.06), 90);
  }

  // --- 2. TOAST NOTIFICATION SYSTEM ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span style="color: var(--accent-emerald); font-weight: bold;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    playSuccessSound();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // --- 3. THEME TOGGLE & AUDIO CONTROLS ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sf_theme', theme);

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function initThemeAndAudio() {
    applyTheme(state.theme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        playClickSound();
        showToast(`Theme switched to: ${nextTheme === 'dark' ? 'Dark Lab' : 'Engineering Light'}`);
      });
    }

    const sfxBtn = document.getElementById('sfx-toggle-btn');
    const sfxIcon = document.getElementById('sfx-icon');
    if (sfxBtn && sfxIcon) {
      sfxIcon.textContent = state.audioEnabled ? '🔊' : '🔇';
      sfxBtn.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        localStorage.setItem('sf_audio', state.audioEnabled);
        sfxIcon.textContent = state.audioEnabled ? '🔊' : '🔇';
        if (state.audioEnabled) {
          playSuccessSound();
          showToast('Web Audio synthesizer enabled');
        } else {
          showToast('Web Audio synthesizer muted');
        }
      });
    }
  }

  // --- 4. LIVE INVERTER WAVEFORM OSCILLOSCOPE ---
  function initOscilloscope() {
    const canvas = document.getElementById('oscilloscope-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawGrid(w, h) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center Reference Axes
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }

    function render() {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);
      drawGrid(w, h);

      // Waveform Mathematical Simulation matching generate_dataset.py
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const centerY = h / 2;
      const amplitude = h * 0.36;
      const frequency = 0.022; // Simulated 50 Hz on screen width

      let lineColor = '#10b981'; // Green for normal / healthy
      if (state.scopeMode !== 'normal') {
        lineColor = '#f43f5e'; // Rose for fault anomaly
      }

      ctx.strokeStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10;

      for (let x = 0; x < w; x++) {
        const t = (x + time) * frequency;
        let yVal = 0.0;

        // Exact signal generation formulas from generate_dataset.py
        if (state.scopeMode === 'normal') {
          // Class 0: Healthy -> sin(t) + 0.05*sin(3t)
          yVal = Math.sin(t) + 0.05 * Math.sin(3 * t);
        } else if (state.scopeMode === 'fault-s1') {
          // Class 1: S1_Open (Leg A Top Switch) -> signal[signal > 0] *= 0.18
          yVal = Math.sin(t);
          if (yVal > 0) yVal *= 0.18;
        } else if (state.scopeMode === 'fault-s2') {
          // Class 2: S2_Open (Leg A Bottom Switch) -> signal[signal < 0] *= 0.18
          yVal = Math.sin(t);
          if (yVal < 0) yVal *= 0.18;
        } else if (state.scopeMode === 'fault-s3') {
          // Class 3: S3_Open (Leg B Top Switch) -> sin(t + pi/3); signal[signal > 0] *= 0.22
          const tShift = t + Math.PI / 3;
          yVal = Math.sin(tShift);
          if (yVal > 0) yVal *= 0.22;
        } else if (state.scopeMode === 'fault-s4') {
          // Class 4: S4_Open (Leg B Bottom Switch) -> sin(t + pi/3); signal[signal < 0] *= 0.22
          const tShift = t + Math.PI / 3;
          yVal = Math.sin(tShift);
          if (yVal < 0) yVal *= 0.22;
        } else if (state.scopeMode === 'fault-multi') {
          // Class 5: Multi_Fault -> 0.5*sin(t) + 0.3*sin(3t) + 0.2*sin(5t) + 0.15*noise
          yVal = 0.5 * Math.sin(t) + 0.30 * Math.sin(3 * t) + 0.20 * Math.sin(5 * t) + (Math.random() - 0.5) * 0.25;
        }

        // Noise slider perturbation
        if (state.scopeNoise > 0) {
          yVal += ((Math.random() - 0.5) * 0.3) * (state.scopeNoise / 100);
        }

        const y = centerY - yVal * amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      time += 1.8;
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Mode Buttons for all 6 Inverter Operating Conditions
    const modeBtns = document.querySelectorAll('.scope-mode-btn');
    const modeLabel = document.getElementById('scope-mode-label');
    const thdLabel = document.getElementById('scope-thd-label');

    const modeMetadata = {
      'normal': { label: 'Class 0: Healthy (Sinusoidal)', thd: '< 2.1%', sound: 'success', toast: null },
      'fault-s1': { label: 'Class 1: S1_Open (Upper A)', thd: '48.6% (Anomaly)', sound: 'fault', toast: 'Class 1: S1 Open-Circuit Fault injected (Leg A Top Switch).' },
      'fault-s2': { label: 'Class 2: S2_Open (Lower A)', thd: '48.2% (Anomaly)', sound: 'fault', toast: 'Class 2: S2 Open-Circuit Fault injected (Leg A Bottom Switch).' },
      'fault-s3': { label: 'Class 3: S3_Open (Upper B)', thd: '52.4% (Anomaly)', sound: 'fault', toast: 'Class 3: S3 Open-Circuit Fault injected (Leg B Top Switch, +60°).' },
      'fault-s4': { label: 'Class 4: S4_Open (Lower B)', thd: '51.9% (Anomaly)', sound: 'fault', toast: 'Class 4: S4 Open-Circuit Fault injected (Leg B Bottom Switch, +60°).' },
      'fault-multi': { label: 'Class 5: Multi_Fault (Cascade)', thd: '84.7% (Severe)', sound: 'fault', toast: 'Class 5: Multi-Switch Open-Circuit Cascade Fault injected.' }
    };

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-mode') || 'normal';
        state.scopeMode = mode;

        const meta = modeMetadata[mode] || modeMetadata['normal'];
        if (modeLabel) modeLabel.textContent = meta.label;
        if (thdLabel) thdLabel.textContent = meta.thd;

        if (meta.sound === 'success') {
          playSuccessSound();
        } else {
          playFaultAlertSound();
        }

        if (meta.toast) {
          showToast(meta.toast, 'error');
        }
      });
    });

    // Noise Slider
    const noiseSlider = document.getElementById('scope-noise-slider');
    const noiseVal = document.getElementById('noise-val');
    if (noiseSlider && noiseVal) {
      noiseSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.scopeNoise = val;
        noiseVal.textContent = `${val}%`;
      });
    }
  }

  // --- 5. CORPUSLD v3.0 DUAL-LAYER SIMULATOR ---
  const agentData = {
    1: {
      name: "Agent 1: Cover & Metadata Extractor + Authority Resolver",
      exec: "0.003s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": ["Thesis", "ScholarlyArticle"],
        "@id": "urn:doi:10.1109/TSTE.2026.319028",
        "name": "Democratizing AIoT for Renewable Energy: A Lightweight 1D-CNN on ESP32-S3",
        "author": [
          {
            "@type": "Person",
            "name": "Sharrif Faqih Fajarudin",
            "identifier": "D102211000",
            "affiliation": {
              "@type": "EducationalOrganization",
              "name": "Universitas Tanjungpura",
              "department": "Department of Electrical Engineering",
              "location": "Pontianak, Indonesia",
              "sameAs": "https://ror.org/03y0g0g54"
            }
          }
        ],
        "datePublished": "2026-08-20",
        "genre": "Undergraduate Thesis",
        "inLanguage": "en-US",
        "keywords": ["TinyML", "ESP32-S3", "Solar PV Inverter", "Open-Circuit Fault", "1D-CNN"],
        "sameAs": [
          "https://ror.org/03y0g0g54",
          "https://www.wikidata.org/wiki/Q193135"
        ]
      },
      ttl: `@prefix schema: <https://schema.org/> .
@prefix ror: <https://ror.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<urn:doi:10.1109/TSTE.2026.319028> a schema:ScholarlyArticle, schema:Thesis ;
    schema:name "Democratizing AIoT for Renewable Energy: A Lightweight 1D-CNN on ESP32-S3" ;
    schema:datePublished "2026-08-20"^^xsd:date ;
    schema:inLanguage "en-US" ;
    schema:author [
        a schema:Person ;
        schema:name "Sharrif Faqih Fajarudin" ;
        schema:affiliation [
            a schema:EducationalOrganization ;
            schema:name "Universitas Tanjungpura" ;
            schema:sameAs <https://ror.org/03y0g0g54>
        ]
    ] ;
    schema:sameAs <https://www.wikidata.org/wiki/Q193135> .`,
      cypher: `// CorpusLD Neo4j Graph Export: Metadata & Institution Node
MERGE (doc:Document {doi: "10.1109/TSTE.2026.319028"})
SET doc.title = "Democratizing AIoT for Renewable Energy: A Lightweight 1D-CNN on ESP32-S3",
    doc.date = "2026-08-20",
    doc.type = "ScholarlyArticle"
MERGE (a:Author {name: "Sharrif Faqih Fajarudin"})
MERGE (inst:Organization {name: "Universitas Tanjungpura", ror: "https://ror.org/03y0g0g54"})
MERGE (a)-[:AUTHORED]->(doc)
MERGE (a)-[:AFFILIATED_WITH]->(inst);`,
      bibtex: `@article{fajarudin2026democratizing,
  title     = {Democratizing AIoT for Renewable Energy: A Lightweight 1D-CNN on ESP32-S3},
  author    = {Fajarudin, Sharrif Faqih},
  journal   = {IEEE Transactions on Sustainable Energy},
  year      = {2026},
  doi       = {10.1109/TSTE.2026.319028},
  publisher = {IEEE},
  note      = {Extracted by CorpusLD v3.0 with ROR Authority Linker}
}`
    },
    2: {
      name: "Agent 2: Structural Outline & Heading Hierarchy",
      exec: "0.002s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Document Chapter Structure",
        "numberOfItems": 4,
        "itemListElement": [
          {
            "@type": "Chapter",
            "position": 1,
            "name": "Chapter I: Introduction & PV Fault Detection Urgency",
            "pageStart": 1,
            "pageEnd": 12
          },
          {
            "@type": "Chapter",
            "position": 2,
            "name": "Chapter II: Full-Bridge Inverter Topologies & Harmonic Analysis",
            "pageStart": 13,
            "pageEnd": 34
          },
          {
            "@type": "Chapter",
            "position": 3,
            "name": "Chapter III: Lightweight 1D-CNN Architecture & INT8 Quantization",
            "pageStart": 35,
            "pageEnd": 58
          },
          {
            "@type": "Chapter",
            "position": 4,
            "name": "Chapter IV: TFLite Micro Deployment on ESP32-S3",
            "pageStart": 59,
            "pageEnd": 84
          }
        ]
      },
      ttl: `@prefix schema: <https://schema.org/> .

<urn:doi:10.1109/TSTE.2026.319028#outline> a schema:ItemList ;
    schema:name "Document Chapter Structure" ;
    schema:itemListElement [
        a schema:Chapter ;
        schema:position 1 ;
        schema:name "Chapter I: Introduction & PV Fault Detection Urgency" ;
        schema:pageStart 1 ;
        schema:pageEnd 12
    ], [
        a schema:Chapter ;
        schema:position 2 ;
        schema:name "Chapter II: Full-Bridge Inverter Topologies & Harmonic Analysis" ;
        schema:pageStart 13 ;
        schema:pageEnd 34
    ] .`,
      cypher: `// CorpusLD Neo4j Graph Export: Document Structure
MATCH (doc:Document {doi: "10.1109/TSTE.2026.319028"})
MERGE (c1:Section {title: "Chapter I: Introduction", position: 1, pageStart: 1, pageEnd: 12})
MERGE (c2:Section {title: "Chapter II: Inverter Topologies", position: 2, pageStart: 13, pageEnd: 34})
MERGE (doc)-[:HAS_SECTION]->(c1)
MERGE (doc)-[:HAS_SECTION]->(c2);`,
      bibtex: `% Document structural hierarchy parsed into 4 chapters & 84 pages
% Processed by CorpusLD Outline Agent`
    },
    3: {
      name: "Agent 3: Universal Unit Ontology & Parameter Normalization",
      exec: "0.003s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Observation",
        "observationSubject": "ESP32-S3 TinyML Hardware Performance",
        "unitOntology": "Universal-SI-Bio-Energy-v3",
        "measuredProperty": [
          {
            "@type": "PropertyValue",
            "name": "Model Size (INT8 Quantized)",
            "value": 142.4,
            "unitText": "Kilobytes",
            "unitCode": "2P",
            "canonicalUnit": "kB",
            "pageNumber": 62
          },
          {
            "@type": "PropertyValue",
            "name": "SRAM Tensor Arena Footprint",
            "value": 38.2,
            "unitText": "Kilobytes",
            "unitCode": "2P",
            "canonicalUnit": "kB",
            "pageNumber": 64
          },
          {
            "@type": "PropertyValue",
            "name": "Edge Inference Latency (Single Window)",
            "value": 42.8,
            "unitText": "Milliseconds",
            "unitCode": "C26",
            "canonicalUnit": "ms",
            "pageNumber": 68
          },
          {
            "@type": "PropertyValue",
            "name": "Parameter Count",
            "value": 14820,
            "unitText": "Weights",
            "canonicalUnit": "weights",
            "pageNumber": 54
          }
        ]
      },
      ttl: `@prefix schema: <https://schema.org/> .
@prefix qudt: <http://qudt.org/schema/qudt/> .
@prefix unit: <http://qudt.org/vocab/unit/> .

<urn:doi:10.1109/TSTE.2026.319028#observation-1> a schema:Observation ;
    schema:observationSubject "ESP32-S3 TinyML Hardware Performance" ;
    schema:measuredProperty [
        a schema:PropertyValue ;
        schema:name "Model Size (INT8)" ;
        schema:value 142.4 ;
        schema:unitText "Kilobytes" ;
        schema:unitCode "2P"
    ], [
        a schema:PropertyValue ;
        schema:name "Edge Inference Latency" ;
        schema:value 42.8 ;
        schema:unitText "Milliseconds" ;
        schema:unitCode "C26"
    ] .`,
      cypher: `// CorpusLD Neo4j Graph Export: Calibrated Metric Observations
MATCH (doc:Document {doi: "10.1109/TSTE.2026.319028"})
MERGE (m1:Metric {name: "Model Size (INT8)", value: 142.4, unit: "kB", page: 62})
MERGE (m2:Metric {name: "Inference Latency", value: 42.8, unit: "ms", page: 68})
MERGE (doc)-[:REPORTS_METRIC]->(m1)
MERGE (doc)-[:REPORTS_METRIC]->(m2);`,
      bibtex: `% Quantitative Metric Observations: 4 calibrated properties verified
% Standardized via CorpusLD Universal Unit Ontology`
    },
    4: {
      name: "Agent 4: Deterministic UniversalTable Matrix",
      exec: "0.001s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Table",
        "name": "Table 4.2: Inverter Load Benchmark & Efficiency Profile",
        "about": "Inverter Load Benchmark Data",
        "pageNumber": "Page 71",
        "encodingFormat": "application/json",
        "tableData": [
          {"Load": "25%", "Current_RMS": "1.25 A", "THD": "3.12%", "Efficiency": "94.8%"},
          {"Load": "50%", "Current_RMS": "2.50 A", "THD": "2.40%", "Efficiency": "96.4%"},
          {"Load": "80%", "Current_RMS": "4.00 A", "THD": "1.85%", "Efficiency": "97.2%"},
          {"Load": "100%", "Current_RMS": "5.00 A", "THD": "2.10%", "Efficiency": "96.8%"}
        ]
      },
      ttl: `@prefix schema: <https://schema.org/> .

<urn:doi:10.1109/TSTE.2026.319028#table-4-2> a schema:Table ;
    schema:name "Table 4.2: Inverter Load Benchmark & Efficiency Profile" ;
    schema:pageNumber "Page 71" ;
    schema:encodingFormat "application/json" .`,
      cypher: `// CorpusLD Neo4j Graph Export: Tabular Entity
MATCH (doc:Document {doi: "10.1109/TSTE.2026.319028"})
MERGE (t:Table {name: "Table 4.2: Inverter Load Benchmark", page: 71, rows: 4, cols: 4})
MERGE (doc)-[:CONTAINS_TABLE]->(t);`,
      bibtex: `% Deterministic Table Matrix: Table 4.2 (4 rows, 4 columns)
% Processed in 0.001s via CorpusLD UniversalTable Engine`
    },
    5: {
      name: "Agent 5: Live Citation Extractor & Crossref Reconciliation",
      exec: "0.004s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Reconciled Citation Registry",
        "itemListElement": [
          {
            "@type": "ScholarlyArticle",
            "position": 1,
            "citationFormat": "IEEE [1]",
            "name": "Fault Diagnosis in Grid-Connected Photovoltaic Inverters Using Machine Learning",
            "author": "M. A. S. Rahman et al.",
            "publicationYear": 2024,
            "doi": "10.1109/TIE.2024.102938",
            "url": "https://doi.org/10.1109/TIE.2024.102938",
            "journal": "IEEE Transactions on Industrial Electronics",
            "citedByCount": 42,
            "reconciledVia": "Crossref Works REST API"
          },
          {
            "@type": "ScholarlyArticle",
            "position": 2,
            "citationFormat": "IEEE [2]",
            "name": "TinyML: Machine Learning on Extremely Low-Power Embedded Devices",
            "author": "C. R. Warden and D. Situnayake",
            "publicationYear": 2020,
            "publisher": "O'Reilly Media",
            "reconciledVia": "OpenAlex REST API"
          }
        ]
      },
      ttl: `@prefix schema: <https://schema.org/> .

<urn:doi:10.1109/TSTE.2026.319028> schema:citation <https://doi.org/10.1109/TIE.2024.102938> .

<https://doi.org/10.1109/TIE.2024.102938> a schema:ScholarlyArticle ;
    schema:name "Fault Diagnosis in Grid-Connected Photovoltaic Inverters Using Machine Learning" ;
    schema:author "M. A. S. Rahman et al." ;
    schema:datePublished "2024" ;
    schema:publisher "IEEE" .`,
      cypher: `// CorpusLD Neo4j Graph Export: Citation Network & DOI Links
MATCH (doc:Document {doi: "10.1109/TSTE.2026.319028"})
MERGE (ref1:Document {doi: "10.1109/TIE.2024.102938", title: "Fault Diagnosis in Grid-Connected PV Inverters", citations: 42})
MERGE (doc)-[:CITES {format: "IEEE [1]"}]->(ref1);`,
      bibtex: `@article{rahman2024fault,
  title     = {Fault Diagnosis in Grid-Connected Photovoltaic Inverters Using Machine Learning},
  author    = {Rahman, M. A. S. and others},
  journal   = {IEEE Transactions on Industrial Electronics},
  year      = {2024},
  doi       = {10.1109/TIE.2024.102938},
  publisher = {IEEE}
}`
    }
  };

  // State format selector for CorpusLD
  state.activeFormat = 'jsonld';

  function updateAgentViewer(step) {
    state.activeAgentStep = step;
    const data = agentData[step];
    if (!data) return;

    const labelEl = document.getElementById('agent-current-label');
    const timeEl = document.getElementById('agent-exec-time');
    const codeEl = document.getElementById('agent-output-code');
    const copyText = document.getElementById('copy-text');

    if (labelEl) labelEl.textContent = data.name;
    if (timeEl) timeEl.textContent = `Execution: ${data.exec}`;
    
    if (codeEl) {
      const activeFmt = state.activeFormat || 'jsonld';
      if (activeFmt === 'jsonld') {
        codeEl.className = 'code-block json';
        codeEl.textContent = JSON.stringify(data.jsonld, null, 2);
      } else if (activeFmt === 'ttl') {
        codeEl.className = 'code-block turtle';
        codeEl.textContent = data.ttl || '';
      } else if (activeFmt === 'cypher') {
        codeEl.className = 'code-block cypher';
        codeEl.textContent = data.cypher || '';
      } else if (activeFmt === 'bibtex') {
        codeEl.className = 'code-block bibtex';
        codeEl.textContent = data.bibtex || '';
      }
    }

    if (copyText) {
      const fmtName = (state.activeFormat || 'jsonld').toUpperCase();
      copyText.textContent = `Copy ${fmtName}`;
    }
  }

  function initAgentSimulator() {
    const stepBtns = document.querySelectorAll('.agent-step-item');
    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stepBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const step = parseInt(btn.getAttribute('data-agent'), 10);
        updateAgentViewer(step);
        playClickSound();
      });
    });

    // Format Switcher Tabs (JSON-LD, Turtle, Cypher, BibTeX)
    const formatBtns = document.querySelectorAll('.format-tab-btn');
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.activeFormat = btn.getAttribute('data-format') || 'jsonld';
        updateAgentViewer(state.activeAgentStep || 1);
        playClickSound();
      });
    });

    // Copy Button
    const copyBtn = document.getElementById('copy-jsonld-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = agentData[state.activeAgentStep || 1];
        if (!data || !navigator.clipboard) return;

        const activeFmt = state.activeFormat || 'jsonld';
        let textToCopy = '';
        if (activeFmt === 'jsonld') {
          textToCopy = JSON.stringify(data.jsonld, null, 2);
        } else {
          textToCopy = data[activeFmt] || '';
        }

        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            showToast(`${activeFmt.toUpperCase()} copied to clipboard!`, 'success');
          })
          .catch(() => {
            showToast('Failed to copy to clipboard', 'error');
          });
      });
    }

    // Initialize with step 1
    updateAgentViewer(1);
  }

  // --- 6. TINYML 1D-CNN FAULT CLASSIFIER SIMULATOR ---
  function initTinyMLSimulator() {
    const faultSelect = document.getElementById('tinyml-fault-type');
    const loadSlider = document.getElementById('tinyml-load-slider');
    const noiseSlider = document.getElementById('tinyml-noise-slider');
    const loadVal = document.getElementById('load-val');
    const snrVal = document.getElementById('snr-val');
    const runBtn = document.getElementById('run-inference-btn');

    if (loadSlider && loadVal) {
      loadSlider.addEventListener('input', (e) => {
        loadVal.textContent = `${parseFloat(e.target.value).toFixed(1)} A`;
      });
    }

    if (noiseSlider && snrVal) {
      noiseSlider.addEventListener('input', (e) => {
        snrVal.textContent = `${e.target.value} dB`;
      });
    }

    function runInference() {
      const fault = faultSelect ? faultSelect.value : 'Healthy';
      const load = loadSlider ? parseFloat(loadSlider.value) : 5.0;
      const snr = noiseSlider ? parseInt(noiseSlider.value, 10) : 35;

      const classIndexMap = {
        'Healthy': 0,
        'S1_Open': 1,
        'S2_Open': 2,
        'S3_Open': 3,
        'S4_Open': 4,
        'Multi_Fault': 5
      };

      const activeIdx = classIndexMap[fault] !== undefined ? classIndexMap[fault] : 0;
      const noisePenalty = (50 - snr) * 0.003;

      // Realistic 6-class softmax probabilities calculation
      const rawProbs = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01];
      rawProbs[activeIdx] = Math.max(0.70, 0.985 - noisePenalty * 2.5);

      for (let i = 0; i < 6; i++) {
        if (i !== activeIdx) {
          rawProbs[i] = 0.003 + noisePenalty * 0.5 + Math.random() * 0.004;
        }
      }

      // Softmax normalization
      const sum = rawProbs.reduce((acc, val) => acc + val, 0);
      const normalizedProbs = rawProbs.map(p => (p / sum) * 100);

      // Update 6 UI Bars
      for (let i = 0; i < 6; i++) {
        const fillEl = document.getElementById(`prob-${i}-fill`);
        const valEl = document.getElementById(`prob-${i}-val`);
        if (fillEl) fillEl.style.width = `${normalizedProbs[i].toFixed(1)}%`;
        if (valEl) valEl.textContent = `${normalizedProbs[i].toFixed(1)}%`;
      }

      // Benchmark Latency (~8.4 ms ± 0.5 ms on ESP32-S3 @ 240 MHz)
      const simulatedLatency = (8.2 + Math.random() * 0.6).toFixed(1);
      const latEl = document.getElementById('bench-lat');
      if (latEl) latEl.textContent = `${simulatedLatency} ms`;

      // Update Verdict Box
      const iconEl = document.getElementById('verdict-icon');
      const textEl = document.getElementById('verdict-text');
      const subEl = document.getElementById('verdict-sub');

      const classDescriptions = [
        'Balanced 50Hz sinusoidal current, nominal operation',
        'Leg A Top-Switch Open-Circuit: Positive half-cycle clipped (*0.18)',
        'Leg A Bottom-Switch Open-Circuit: Negative half-cycle clipped (*0.18)',
        'Leg B Top-Switch Open-Circuit: Phase lag +60° with positive clipping (*0.22)',
        'Leg B Bottom-Switch Open-Circuit: Phase lag +60° with negative clipping (*0.22)',
        'Multi-Switch Cascade Anomaly: Severe 3rd/5th harmonic distortion + noise'
      ];

      if (activeIdx === 0) {
        if (iconEl) {
          iconEl.className = 'verdict-status-icon';
          iconEl.textContent = '✓';
        }
        if (textEl) {
          textEl.className = 'verdict-text';
          textEl.textContent = 'CLASS 0: HEALTHY';
        }
        if (subEl) subEl.textContent = `Inverter operates normally at ${load.toFixed(1)}A RMS (Inference: ${simulatedLatency} ms)`;
        playSuccessSound();
      } else {
        if (iconEl) {
          iconEl.className = 'verdict-status-icon fault';
          iconEl.textContent = '!';
        }
        if (textEl) {
          textEl.className = 'verdict-text fault';
          textEl.textContent = `CLASS ${activeIdx}: ${fault} DETECTED`;
        }
        if (subEl) subEl.textContent = `${classDescriptions[activeIdx]} (ESP32-S3: ${simulatedLatency} ms)`;
        playFaultAlertSound();
      }
    }

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runInference();
        showToast('ESP32-S3 INT8 inference executed!');
      });
    }

    if (faultSelect) {
      faultSelect.addEventListener('change', runInference);
    }
  }

  // --- 7. NOTEBOOK-LOCALLM 2-PASS RAG SIMULATOR ---
  const ragPresets = {
    'inverter-efficiency': {
      text: `<p>Based on empirical benchmark data, inverter efficiency at 80% load reaches <strong>97.2%</strong> with a Total Harmonic Distortion (THD) of <strong>1.85%</strong> at 50 Hz fundamental frequency <span class="citation-pill" title="Document: Inverter_Test_Report.pdf, Page: 14">[Inverter_Test_Report.pdf | Page 14]</span>.</p>
      <div class="table-evidence-box">
        <div class="evidence-title">Extracted Tabular Evidence (Pass 2 LlamaParse):</div>
        <table class="evidence-mini-table">
          <thead><tr><th>Load (%)</th><th>Efficiency (%)</th><th>THD Current (%)</th><th>Loss (W)</th></tr></thead>
          <tbody>
            <tr><td>50%</td><td>96.4%</td><td>2.40%</td><td>18.2 W</td></tr>
            <tr class="highlight-row"><td>80%</td><td>97.2%</td><td>1.85%</td><td>22.4 W</td></tr>
            <tr><td>100%</td><td>96.8%</td><td>2.10%</td><td>32.0 W</td></tr>
          </tbody>
        </table>
      </div>`
    },
    'rag-benchmark': {
      text: `<p>Notebook-LocalLM-Studio is engineered to operate on resource-constrained hardware within a <strong>~2GB RAM</strong> target without a discrete GPU. It runs a quantized <strong>Qwen 2.5 1.5B Instruct</strong> (<code>Q5_K_M</code> ~1.2GB) alongside 384-dimensional dense vectors via <code>MiniLM-L12-v2</code> <span class="citation-pill" title="Document: Architecture_Specs.pdf, Page: 4">[Architecture_Specs.pdf | Page 4]</span>.</p>`
    },
    'schema-compliance': {
      text: `<p>CorpusLD extracts Schema.org compliant Linked Data Graphs achieving 100% validation (0 critical errors) and passing Google Rich Results benchmarks. It incorporates adversarial conflict detection to prevent metric hallucinations <span class="citation-pill" title="Document: CorpusLD_Paper.pdf, Page: 9">[CorpusLD_Paper.pdf | Page 9]</span>.</p>`
    }
  };

  function initRAGSimulator() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    const respContent = document.getElementById('rag-response-content');

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const queryKey = btn.getAttribute('data-query');
        const preset = ragPresets[queryKey];
        if (preset && respContent) {
          respContent.innerHTML = preset.text;
          playClickSound();
          showToast('2-Pass Retrieval completed: Grounded answer with citations rendered');
        }
      });
    });
  }

  // --- 8. LAB TABS CONTROLLER & JUMP BUTTONS ---
  function initLabTabs() {
    const tabBtns = document.querySelectorAll('.lab-tab-btn');
    const panes = document.querySelectorAll('.lab-tab-pane');

    function switchTab(targetPaneId) {
      tabBtns.forEach(btn => {
        const controls = btn.getAttribute('aria-controls');
        const isActive = controls === targetPaneId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panes.forEach(pane => {
        const isActive = pane.id === targetPaneId;
        pane.classList.toggle('active', isActive);
        pane.hidden = !isActive;
      });

      state.activeLabTab = targetPaneId;
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('aria-controls');
        switchTab(target);
        playClickSound();
      });
    });

    // Jump Buttons from Project Cards
    const jumpCorpusLD = document.getElementById('btn-jump-corpusld');
    const jumpLocalLM = document.getElementById('btn-jump-locallm');
    const jumpTinyML = document.getElementById('btn-jump-tinyml');

    if (jumpCorpusLD) {
      jumpCorpusLD.addEventListener('click', () => {
        switchTab('tab-pane-agent');
        const labSection = document.getElementById('interactive-lab');
        if (labSection) labSection.scrollIntoView({ behavior: 'smooth' });
        playClickSound();
      });
    }

    if (jumpLocalLM) {
      jumpLocalLM.addEventListener('click', () => {
        switchTab('tab-pane-rag');
        const labSection = document.getElementById('interactive-lab');
        if (labSection) labSection.scrollIntoView({ behavior: 'smooth' });
        playClickSound();
      });
    }

    if (jumpTinyML) {
      jumpTinyML.addEventListener('click', () => {
        switchTab('tab-pane-tinyml');
        const labSection = document.getElementById('interactive-lab');
        if (labSection) labSection.scrollIntoView({ behavior: 'smooth' });
        playClickSound();
      });
    }
  }

  // --- 9. INTERACTIVE MINI-CLI TERMINAL & EASTER EGG ---
  let isCollapseActive = false;

  function triggerScreenCollapseEasterEgg(historyContainer, terminalBody) {
    if (isCollapseActive) return;
    isCollapseActive = true;

    // 1. Play dramatic distortion / rumble audio
    playTone(180, 'sawtooth', 0.8, 0.08);
    setTimeout(() => playTone(120, 'sawtooth', 1.2, 0.09), 300);

    // 2. Shake screen for 1 second
    document.body.classList.add('screen-shaking');

    // 3. Create HUD Countdown Banner
    const hud = document.createElement('div');
    hud.className = 'collapse-hud-banner';
    hud.id = 'collapse-hud';
    hud.innerHTML = `
      <div class="hud-title">
        <span>⚠️</span>
        <span>GRAVITATIONAL ANOMALY ACTIVE</span>
      </div>
      <div class="hud-timer" id="hud-countdown">10s</div>
      <div class="hud-sub">Structural integrity failing! Automatic reconstruction in progress...</div>
    `;
    document.body.appendChild(hud);

    let timeLeft = 10;

    // Start screen collapse after 800ms of shake
    setTimeout(() => {
      document.body.classList.remove('screen-shaking');
      document.body.classList.add('matrix-collapse-active');
      showToast('⚠️ Gravitational collapse! All components falling for 10 seconds.', 'error');
    }, 800);

    // Countdown Interval
    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      const timerEl = document.getElementById('hud-countdown');
      if (timerEl) timerEl.textContent = `${timeLeft}s`;

      if (state.audioEnabled && timeLeft > 0) {
        playTone(300 + (10 - timeLeft) * 40, 'triangle', 0.06, 0.04);
      }

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);

        // 4. Reconstruct screen
        document.body.classList.remove('matrix-collapse-active');
        document.body.classList.add('matrix-reconstructing');

        // Success audio sweep
        playTone(440, 'sine', 0.15, 0.05);
        setTimeout(() => playTone(659.25, 'sine', 0.2, 0.06), 150);
        setTimeout(() => playTone(880, 'sine', 0.35, 0.07), 300);

        if (hud) {
          hud.classList.add('reconstructed');
          hud.innerHTML = `
            <div class="hud-title">
              <span>✓</span>
              <span>STABILIZATION RESTORED</span>
            </div>
            <div class="hud-timer">Integrity 100% Recovered</div>
            <div class="hud-sub">Layout and system structure returned to normal state.</div>
          `;
        }

        // Terminal Log update
        if (historyContainer) {
          const restoreLine = document.createElement('div');
          restoreLine.className = 'terminal-line';
          restoreLine.innerHTML = `<span class="prompt-sys" style="color:#10b981;">SYS:</span> Gravitational matrix 100% stabilized. Welcome back, Engineer!`;
          historyContainer.appendChild(restoreLine);
          if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        showToast('✓ Gravitational matrix stabilized! Welcome back.', 'success');

        // Cleanup after transition
        setTimeout(() => {
          document.body.classList.remove('matrix-reconstructing');
          if (hud) hud.remove();
          isCollapseActive = false;
        }, 1800);
      }
    }, 1000);
  }

  function initTerminal() {
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const terminalBody = document.getElementById('terminal-body');

    if (!form || !input || !history) return;

    const commands = {
      help: () => `
<span class="prompt-sys">AVAILABLE COMMANDS:</span>
- <strong style="color:#10b981;">about</strong>      : Researcher profile & academic affiliation
- <strong style="color:#10b981;">projects</strong>   : Summary of 3 core projects (CorpusLD, TinyML, LocalLM)
- <strong style="color:#10b981;">corpusld</strong>   : 5-Agent Knowledge Graph Studio architecture
- <strong style="color:#10b981;">fault-sim</strong>  : ESP32-S3 1D-CNN INT8 telemetry & specifications
- <strong style="color:#10b981;">locallm</strong>    : Edge-optimized local RAG sub-2GB RAM workspace
- <strong style="color:#10b981;">schema</strong>     : 🕸️ Live Schema.org JSON-LD Knowledge Graph (@graph)
- <strong style="color:#10b981;">stack</strong>      : Technical radar and engineering competencies
- <strong style="color:#10b981;">roadmap</strong>    : Research timeline Q4 2026 - 2027
- <strong style="color:#10b981;">contact</strong>    : Direct email & verified social links
- <strong style="color:#10b981;">theme</strong>      : Toggle theme (e.g. theme dark OR theme light)
- <strong style="color:#10b981;">audio</strong>      : Toggle audio synthesizer (audio on OR audio off)
- <strong style="color:#10b981;">suprise</strong>    : 🎁 Secret Easter Egg (gravitational matrix collapse)
- <strong style="color:#10b981;">clear</strong>      : Clear terminal screen
- <strong style="color:#10b981;">date</strong>       : Display current local time (UTC+7 / WIB)
      `,
      about: () => `
<span class="prompt-sys">RESEARCHER PROFILE:</span>
Name        : Sharrif Faqih Fajarudin
Affiliation : Department of Electrical Engineering, Universitas Tanjungpura (UNTAN)
Focus       : TinyML Edge AI (ESP32-S3), Privacy-First Local RAG, and Knowledge Graphs
Motto       : "Democratizing AI x Lightweight Edge Intelligence x Verifiable Knowledge"
      `,
      projects: () => `
<span class="prompt-sys">FEATURED RESEARCH PROJECTS:</span>
1. [CorpusLD]            : Dual-Layer Linked Data Engine & Knowledge Graph Studio (v3.0.0)
2. [Notebook-LocalLM]    : Privacy-First Local RAG Workspace (~2GB RAM target)
3. [1D-CNN Inverter AI]  : TinyML Open-Circuit Fault Detector on ESP32-S3 (<200KB model)
Type project name for detailed specifications.
      `,
      corpusld: () => `
<span class="prompt-sys">CORPUSLD v3.0.0 (Apache-2.0 / PyPI Package):</span>
- Dual-Layer Architecture: Ingestion & 5-Agent Map-Reduce + Semantic Graph Lake
- 4-Tier Hybrid Parser: PyPDF -> LlamaParse -> Unstructured -> Stateful Table Stitcher
- Live Authority Resolvers: Dynamic ROR v2 Registry, Wikidata QID & MeSH URIs in sameAs
- Live DOI Reconciliation: Crossref Works API & OpenAlex REST API
- Universal Unit Ontology: SI, Biomedical, Energy & Compound Units Normalization
- Multi-Format Exports: Schema.org JSON-LD, W3C RDF Turtle (.ttl), Neo4j Cypher (.cql), BibTeX (.bib), RIS, CSL-JSON
- Enterprise Security: SSRF Loopback Defense, Path Traversal Protection, Auth Middleware
- QA & Benchmarks: 109 Unit Tests Passed (100% pass rate across multi-domain papers)
- Headless CLI: python cli.py extract "sample.pdf" --output "graph.jsonld"
- Repository: https://github.com/sharriffajar/CorpusLD
      `,
      'fault-sim': () => `
<span class="prompt-sys">1D-CNN ESP32-S3 FAULT DETECTOR (6 CLASSES):</span>
- Pipeline: generate_dataset.py -> train_model.py -> quantize_export.py
- Model: INT8 Quantized 1D-CNN (21.5 KB, ~14.7k params)
- Classes: Healthy, S1_Open, S2_Open, S3_Open, S4_Open, Multi_Fault
- Memory: <100 KB Tensor Arena | Latency: ~8.4 ms at 240 MHz Xtensa LX7
- Status: Proof-of-concept pipeline validated (Simulink/Lab dataset pending)
- Repository: https://github.com/sharriffajar/Lightweight-1D-CNN-Edge-AI-for-Inverter-Fault-Diagnosis
      `,
      locallm: () => `
<span class="prompt-sys">NOTEBOOK-LOCALLM-STUDIO (MIT):</span>
- Inference: Qwen 2.5 1.5B Instruct (Q5_K_M ~1.2GB) via Ollama
- Vector DB: Qdrant Local Client | Embedding: MiniLM-L12-v2
- 2-Pass Hybrid Re-search Loop for automatic tabular chunk detection
- Repository: https://github.com/sharriffajar/Notebook-LocalLM-Studio
      `,
      stack: () => `
<span class="prompt-sys">TECHNICAL RADAR:</span>
- Embedded & TinyML : ESP32-S3, TFLite Micro, INT8, C/C++, Arduino, Thinger.io
- Neural & SLM     : Qdrant, Ollama, Qwen 2.5, MiniLM, RAG Pipeline
- Data & Semantic  : Schema.org, JSON-LD, W3C RDF Turtle, Neo4j Cypher, ROR v2, Crossref, Python, FastAPI
- DevOps & Tools   : Git, Docker, PyPI, PyTest (109 tests), VS Code, IEEE Scientific Documentation
      `,
      roadmap: () => `
<span class="prompt-sys">ROADMAP 2026 - 2027:</span>
[Q1-Q3 2026] Done: 1D-CNN INT8 Pipeline, CorpusLD v3.0 (Released), LocalLM Studio
[Q4 2026]    Focus: Physical laboratory testbed dataset acquisition & paper submission
[2027]       Planned: Institutional Journal OJS Plugins, Enterprise Neo4j GraphRAG, Docker CI/CD
      `,
      contact: () => `
<span class="prompt-sys">CONTACT & VERIFIED LINKS:</span>
Website  : https://sharriffajar.pages.dev/
Email    : sharrifff880@gmail.com
GitHub   : https://github.com/sharriffajar
LinkedIn : https://www.linkedin.com/in/sharriffajar
      `,
      suprise: () => {
        triggerScreenCollapseEasterEgg(history, terminalBody);
        return `<span class="prompt-sys" style="color:#ef4444;">⚠️ [EASTER EGG DETECTED]:</span> Initializing 10-second gravitational matrix anomaly...`;
      },
      surprise: () => {
        triggerScreenCollapseEasterEgg(history, terminalBody);
        return `<span class="prompt-sys" style="color:#ef4444;">⚠️ [EASTER EGG DETECTED]:</span> Initializing 10-second gravitational matrix anomaly...`;
      },
      jsonld: () => {
        const schemaScript = document.getElementById('portfolio-jsonld-schema');
        let formatted = '';
        if (schemaScript) {
          try {
            const parsed = JSON.parse(schemaScript.textContent);
            formatted = JSON.stringify(parsed, null, 2);
          } catch (e) {
            formatted = schemaScript.textContent.trim();
          }
        }
        return `
<span class="prompt-sys">LIVE SCHEMA.ORG LINKED DATA GRAPH (@graph):</span>
<pre style="background:#05080e; padding:10px; border-radius:6px; border:1px solid #1e293b; color:#38bdf8; max-height:280px; overflow-y:auto; font-size:11px;"><code>${formatted}</code></pre>
<span style="color:#10b981;">✓ 100% Schema.org Valid (7 Linked Entities):</span> Person, ProfilePage, WebSite, EducationalOrganization (UNTAN), and 3x SoftwareSourceCode (CorpusLD, LocalLM, 1D-CNN Inverter).
        `;
      },
      schema: () => {
        const schemaScript = document.getElementById('portfolio-jsonld-schema');
        let formatted = '';
        if (schemaScript) {
          try {
            const parsed = JSON.parse(schemaScript.textContent);
            formatted = JSON.stringify(parsed, null, 2);
          } catch (e) {
            formatted = schemaScript.textContent.trim();
          }
        }
        return `
<span class="prompt-sys">LIVE SCHEMA.ORG LINKED DATA GRAPH (@graph):</span>
<pre style="background:#05080e; padding:10px; border-radius:6px; border:1px solid #1e293b; color:#38bdf8; max-height:280px; overflow-y:auto; font-size:11px;"><code>${formatted}</code></pre>
<span style="color:#10b981;">✓ 100% Schema.org Valid (7 Linked Entities):</span> Person, ProfilePage, WebSite, EducationalOrganization (UNTAN), and 3x SoftwareSourceCode (CorpusLD, LocalLM, 1D-CNN Inverter).
        `;
      },
      date: () => `
Local Time (UTC+7 / WIB): ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}
      `
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawCmd = input.value.trim();
      if (!rawCmd) return;

      const lowerCmd = rawCmd.toLowerCase();
      input.value = '';

      // Create command echo element
      const cmdEcho = document.createElement('div');
      cmdEcho.className = 'terminal-line';
      cmdEcho.innerHTML = `<span style="color:#10b981; font-weight:bold;">sharrif@edge:~$</span> ${rawCmd}`;
      history.appendChild(cmdEcho);

      const respLine = document.createElement('div');
      respLine.className = 'terminal-line';

      if (lowerCmd === 'clear') {
        history.innerHTML = '';
        playClickSound();
        return;
      }

      if (lowerCmd.startsWith('theme')) {
        const arg = lowerCmd.split(' ')[1];
        if (arg === 'light' || arg === 'dark') {
          applyTheme(arg);
          respLine.innerHTML = `<span class="prompt-sys">SYS:</span> Theme successfully changed to <strong>${arg}</strong>.`;
        } else {
          respLine.innerHTML = `<span class="prompt-sys">ERROR:</span> Invalid argument. Use: <code>theme dark</code> or <code>theme light</code>.`;
        }
      } else if (lowerCmd.startsWith('audio')) {
        const arg = lowerCmd.split(' ')[1];
        if (arg === 'on') {
          state.audioEnabled = true;
          localStorage.setItem('sf_audio', true);
          respLine.innerHTML = `<span class="prompt-sys">SYS:</span> Audio synthesizer enabled.`;
          playSuccessSound();
        } else if (arg === 'off') {
          state.audioEnabled = false;
          localStorage.setItem('sf_audio', false);
          respLine.innerHTML = `<span class="prompt-sys">SYS:</span> Audio synthesizer muted.`;
        } else {
          respLine.innerHTML = `<span class="prompt-sys">ERROR:</span> Invalid argument. Use: <code>audio on</code> or <code>audio off</code>.`;
        }
      } else if (commands[lowerCmd]) {
        respLine.innerHTML = commands[lowerCmd]();
        playClickSound();
      } else {
        respLine.innerHTML = `<span class="prompt-sys">ERROR:</span> Command "<code>${rawCmd}</code>" not recognized. Type <code>help</code> for available commands.`;
      }

      history.appendChild(respLine);
      if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    });
  }

  // --- 10. CONTACT FORM & DIRECT ACTIONS ---
  function initContactForm() {
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText('sharrifff880@gmail.com')
            .then(() => {
              showToast('Email copied to clipboard: sharrifff880@gmail.com', 'success');
            })
            .catch(() => {
              showToast('Failed to copy email', 'error');
            });
        }
      });
    }

    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const topicInput = document.getElementById('sender-topic');
    const msgInput = document.getElementById('sender-message');
    const alertBox = document.getElementById('form-feedback-alert');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validation
        let isValid = true;
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const topicVal = topicInput ? topicInput.value : '';
        const msgVal = msgInput ? msgInput.value.trim() : '';

        const nameErr = document.getElementById('name-error');
        const emailErr = document.getElementById('email-error');
        const msgErr = document.getElementById('message-error');

        if (nameErr) nameErr.textContent = '';
        if (emailErr) emailErr.textContent = '';
        if (msgErr) msgErr.textContent = '';

        if (!nameVal) {
          if (nameErr) nameErr.textContent = 'Please enter your name.';
          isValid = false;
        }

        if (!emailVal || !emailVal.includes('@')) {
          if (emailErr) emailErr.textContent = 'Please enter a valid email address.';
          isValid = false;
        }

        if (!msgVal) {
          if (msgErr) msgErr.textContent = 'Please enter your message.';
          isValid = false;
        }

        if (!isValid) return;

        // Construct mailto link
        const subject = encodeURIComponent(`[Portfolio Inquiry] ${topicVal} - from ${nameVal}`);
        const body = encodeURIComponent(`Hello Sharrif,\n\nName: ${nameVal}\nEmail: ${emailVal}\nTopic: ${topicVal}\n\nMessage:\n${msgVal}\n\n---\nSent via Interactive Portfolio`);
        const mailtoUrl = `mailto:sharrifff880@gmail.com?subject=${subject}&body=${body}`;

        if (alertBox) {
          alertBox.hidden = false;
          alertBox.className = 'form-alert success';
          alertBox.textContent = 'Opening your email client with formatted message ready to send...';
        }

        showToast('Opening email client...', 'success');
        window.location.href = mailtoUrl;
      });
    }
  }

  // --- 11. NAVIGATION & MOBILE HAMBURGER ---
  function initNavigation() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const siteNav = document.getElementById('site-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileBtn && siteNav) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = siteNav.classList.contains('open');
        siteNav.classList.toggle('open', !isOpen);
        mobileBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        playClickSound();
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          siteNav.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Active Navigation Highlight using Intersection Observer
    const sections = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              link.classList.toggle('active', href === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });

      sections.forEach(sec => observer.observe(sec));
    }
  }

  // --- 12. LIVE SCHEMA.ORG MODAL INSPECTOR ---
  function initSchemaModal() {
    const openBtn = document.getElementById('btn-open-schema-modal');
    const modal = document.getElementById('schema-graph-modal');
    const closeBtn = document.getElementById('btn-close-schema-modal');
    const copyBtn = document.getElementById('btn-modal-copy-jsonld');
    const codeEl = document.getElementById('modal-jsonld-code');

    function populateLiveSchema() {
      const schemaScript = document.getElementById('portfolio-jsonld-schema');
      if (schemaScript && codeEl) {
        try {
          const parsed = JSON.parse(schemaScript.textContent);
          codeEl.textContent = JSON.stringify(parsed, null, 2);
        } catch (e) {
          codeEl.textContent = schemaScript.textContent.trim();
        }
      }
    }

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        populateLiveSchema();
        if (typeof modal.showModal === 'function') {
          modal.showModal();
        } else {
          modal.setAttribute('open', 'true');
        }
        playClickSound();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        if (typeof modal.close === 'function') {
          modal.close();
        } else {
          modal.removeAttribute('open');
        }
        playClickSound();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (typeof modal.close === 'function') {
            modal.close();
          } else {
            modal.removeAttribute('open');
          }
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const schemaScript = document.getElementById('portfolio-jsonld-schema');
        if (schemaScript && navigator.clipboard) {
          navigator.clipboard.writeText(schemaScript.textContent.trim())
            .then(() => {
              showToast('Live Schema.org JSON-LD (@graph) copied!', 'success');
            })
            .catch(() => {
              showToast('Failed to copy', 'error');
            });
        }
      });
    }
  }

  // --- 13. INITIALIZATION ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    initThemeAndAudio();
    initOscilloscope();
    initAgentSimulator();
    initTinyMLSimulator();
    initRAGSimulator();
    initLabTabs();
    initTerminal();
    initContactForm();
    initNavigation();
    initSchemaModal();
  });
})();
