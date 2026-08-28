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

      // Waveform Mathematical Simulation
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const centerY = h / 2;
      const amplitude = h * 0.36;
      const frequency = 0.022; // Simulated 50 Hz on screen width
      const noiseAmp = (state.scopeNoise / 100) * (amplitude * 0.35);

      let lineColor = '#10b981'; // Green for normal
      if (state.scopeMode === 'fault-s1' || state.scopeMode === 'fault-s3') {
        lineColor = '#f43f5e'; // Red for fault
      }

      ctx.strokeStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10;

      for (let x = 0; x < w; x++) {
        const t = (x + time) * frequency;
        let yVal = Math.sin(t);

        // Harmonic noise perturbation
        if (state.scopeNoise > 0) {
          const harmonic = Math.sin(t * 3) * 0.15 + (Math.random() - 0.5) * 0.1;
          yVal += harmonic * (state.scopeNoise / 100);
        }

        // Fault Conditions Simulation
        if (state.scopeMode === 'fault-s1') {
          // S1 Open Circuit Fault: positive half-cycle is clipped / missing
          if (yVal > 0) {
            yVal = yVal * 0.08;
          }
        } else if (state.scopeMode === 'fault-s3') {
          // S3 Open Circuit Fault: negative half-cycle is clipped / missing
          if (yVal < 0) {
            yVal = yVal * 0.08;
          }
        }

        const y = centerY - yVal * amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      time += 1.8;
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Mode Buttons
    const modeBtns = document.querySelectorAll('.scope-mode-btn');
    const modeLabel = document.getElementById('scope-mode-label');
    const thdLabel = document.getElementById('scope-thd-label');

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-mode');
        state.scopeMode = mode;

        if (mode === 'normal') {
          modeLabel.textContent = 'Normal (Sinusoidal)';
          thdLabel.textContent = '< 2.1%';
          playSuccessSound();
        } else if (mode === 'fault-s1') {
          modeLabel.textContent = 'S1 Open Fault (Pos. Clipped)';
          thdLabel.textContent = '48.6% (Anomaly)';
          playFaultAlertSound();
          showToast('S1 Open-Circuit Fault injected into AC current signal.', 'error');
        } else if (mode === 'fault-s3') {
          modeLabel.textContent = 'S3 Open Fault (Neg. Clipped)';
          thdLabel.textContent = '49.2% (Anomaly)';
          playFaultAlertSound();
          showToast('S3 Open-Circuit Fault injected into AC current signal.', 'error');
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

  // --- 5. CORPUSLD 5-AGENT PIPELINE SIMULATOR ---
  const agentData = {
    1: {
      name: "Agent 1: Cover Page & Metadata Extractor",
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
              "location": "Pontianak, Indonesia"
            }
          }
        ],
        "datePublished": "2026-08-20",
        "genre": "Undergraduate Thesis",
        "inLanguage": "en-US",
        "keywords": ["TinyML", "ESP32-S3", "Solar PV Inverter", "Open-Circuit Fault", "1D-CNN"]
      }
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
      }
    },
    3: {
      name: "Agent 3: Quantitative Metrics & Parameters",
      exec: "0.003s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Observation",
        "observationSubject": "ESP32-S3 TinyML Hardware Performance",
        "measuredProperty": [
          {
            "@type": "PropertyValue",
            "name": "Model Size (INT8 Quantized)",
            "value": 142.4,
            "unitText": "Kilobytes",
            "pageNumber": 62
          },
          {
            "@type": "PropertyValue",
            "name": "SRAM Tensor Arena Footprint",
            "value": 38.2,
            "unitText": "Kilobytes",
            "pageNumber": 64
          },
          {
            "@type": "PropertyValue",
            "name": "Edge Inference Latency (Single Window)",
            "value": 42.8,
            "unitText": "Milliseconds",
            "pageNumber": 68
          },
          {
            "@type": "PropertyValue",
            "name": "Parameter Count",
            "value": 14820,
            "unitText": "Weights",
            "pageNumber": 54
          }
        ]
      }
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
      }
    },
    5: {
      name: "Agent 5: Universal Scientific Citation Extractor",
      exec: "0.004s",
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Deterministic Reference State Machine",
        "itemListElement": [
          {
            "@type": "ScholarlyArticle",
            "position": 1,
            "citationFormat": "IEEE [1]",
            "name": "Fault Diagnosis in Grid-Connected Photovoltaic Inverters Using Machine Learning",
            "author": "M. A. S. Rahman et al.",
            "publicationYear": 2024,
            "url": "https://doi.org/10.1109/TIE.2024.102938"
          },
          {
            "@type": "ScholarlyArticle",
            "position": 2,
            "citationFormat": "IEEE [2]",
            "name": "TinyML: Machine Learning on Extremely Low-Power Embedded Devices",
            "author": "C. R. Warden and D. Situnayake",
            "publicationYear": 2020,
            "publisher": "O'Reilly Media"
          }
        ]
      }
    }
  };

  function updateAgentViewer(step) {
    state.activeAgentStep = step;
    const data = agentData[step];
    if (!data) return;

    const labelEl = document.getElementById('agent-current-label');
    const timeEl = document.getElementById('agent-exec-time');
    const codeEl = document.getElementById('agent-output-code');

    if (labelEl) labelEl.textContent = data.name;
    if (timeEl) timeEl.textContent = `Execution: ${data.exec}`;
    if (codeEl) {
      codeEl.textContent = JSON.stringify(data.jsonld, null, 2);
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

    // Copy JSON-LD Button
    const copyBtn = document.getElementById('copy-jsonld-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = agentData[state.activeAgentStep];
        if (data && navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(data.jsonld, null, 2))
            .then(() => {
              showToast('Schema.org JSON-LD copied to clipboard!', 'success');
            })
            .catch(() => {
              showToast('Failed to copy to clipboard', 'error');
            });
        }
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
      const fault = faultSelect ? faultSelect.value : 'normal';
      const load = loadSlider ? parseFloat(loadSlider.value) : 5;
      const snr = noiseSlider ? parseInt(noiseSlider.value, 10) : 35;

      // Simulated classification probability calculations
      let pNormal = 0.0;
      let pS1 = 0.0;
      let pS3 = 0.0;
      let pDual = 0.0;

      if (fault === 'normal') {
        pNormal = 98.2 - (50 - snr) * 0.15;
        pS1 = 1.0 + (50 - snr) * 0.06;
        pS3 = 0.6 + (50 - snr) * 0.05;
        pDual = 0.2 + (50 - snr) * 0.04;
      } else if (fault === 's1-fault') {
        pS1 = 97.4 - (50 - snr) * 0.12;
        pNormal = 1.6 + (50 - snr) * 0.06;
        pS3 = 0.7 + (50 - snr) * 0.04;
        pDual = 0.3 + (50 - snr) * 0.02;
      } else if (fault === 's3-fault') {
        pS3 = 96.9 - (50 - snr) * 0.14;
        pNormal = 1.8 + (50 - snr) * 0.07;
        pS1 = 0.9 + (50 - snr) * 0.04;
        pDual = 0.4 + (50 - snr) * 0.03;
      } else if (fault === 's1-s2-fault') {
        pDual = 95.8 - (50 - snr) * 0.18;
        pS1 = 2.4 + (50 - snr) * 0.08;
        pS3 = 1.2 + (50 - snr) * 0.06;
        pNormal = 0.6 + (50 - snr) * 0.04;
      }

      // Normalize to sum ~100
      const sum = pNormal + pS1 + pS3 + pDual;
      pNormal = (pNormal / sum) * 100;
      pS1 = (pS1 / sum) * 100;
      pS3 = (pS3 / sum) * 100;
      pDual = (pDual / sum) * 100;

      // Update UI Bars
      const normFill = document.getElementById('prob-normal-fill');
      const s1Fill = document.getElementById('prob-s1-fill');
      const s3Fill = document.getElementById('prob-s3-fill');
      const dualFill = document.getElementById('prob-dual-fill');

      const normVal = document.getElementById('prob-normal-val');
      const s1Val = document.getElementById('prob-s1-val');
      const s3Val = document.getElementById('prob-s3-val');
      const dualVal = document.getElementById('prob-dual-val');

      if (normFill) normFill.style.width = `${pNormal.toFixed(1)}%`;
      if (s1Fill) s1Fill.style.width = `${pS1.toFixed(1)}%`;
      if (s3Fill) s3Fill.style.width = `${pS3.toFixed(1)}%`;
      if (dualFill) dualFill.style.width = `${pDual.toFixed(1)}%`;

      if (normVal) normVal.textContent = `${pNormal.toFixed(1)}%`;
      if (s1Val) s1Val.textContent = `${pS1.toFixed(1)}%`;
      if (s3Val) s3Val.textContent = `${pS3.toFixed(1)}%`;
      if (dualVal) dualVal.textContent = `${pDual.toFixed(1)}%`;

      // Update Verdict Box
      const iconEl = document.getElementById('verdict-icon');
      const textEl = document.getElementById('verdict-text');
      const subEl = document.getElementById('verdict-sub');
      const latEl = document.getElementById('bench-lat');

      const simulatedLatency = (41.5 + Math.random() * 2.5).toFixed(1);
      if (latEl) latEl.textContent = `${simulatedLatency} ms`;

      if (fault === 'normal') {
        if (iconEl) {
          iconEl.className = 'verdict-status-icon';
          iconEl.textContent = '✓';
        }
        if (textEl) {
          textEl.className = 'verdict-text';
          textEl.textContent = 'NORMAL OPERATION';
        }
        if (subEl) subEl.textContent = `Inverter operates normally at ${load.toFixed(1)}A RMS (Inference: ${simulatedLatency}ms)`;
        playSuccessSound();
      } else {
        if (iconEl) {
          iconEl.className = 'verdict-status-icon fault';
          iconEl.textContent = '!';
        }
        if (textEl) {
          textEl.className = 'verdict-text fault';
          textEl.textContent = fault.toUpperCase().replace('-', ' ') + ' DETECTED';
        }
        if (subEl) subEl.textContent = `AC current waveform anomaly detected by 1D-CNN INT8 (ESP32-S3: ${simulatedLatency}ms)`;
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
1. [CorpusLD]            : Multi-Agent Semantic Ingestion + Schema.org JSON-LD (v2.0)
2. [Notebook-LocalLM]    : Privacy-First Local RAG Workspace (~2GB RAM target)
3. [1D-CNN Inverter AI]  : TinyML Open-Circuit Fault Detector on ESP32-S3 (<200KB model)
Type project name for detailed specifications.
      `,
      corpusld: () => `
<span class="prompt-sys">CORPUSLD v2.0 (Apache-2.0):</span>
- 4-Tier Hybrid Parser (LlamaParse -> Unstructured -> PyPDF)
- 5-Agent Stepped RAG Pipeline (Metadata, Outline, Metrics, Table, Citations)
- 100% Validator Schema.org & Google Rich Results Ready
- Repository: https://github.com/sharriffajar/CorpusLD
      `,
      'fault-sim': () => `
<span class="prompt-sys">1D-CNN ESP32-S3 FAULT DETECTOR:</span>
- Model: INT8 Quantized 1D-CNN (<15k parameters, <200KB model size)
- SRAM: <100KB Arena | Latency: ~42.8ms at 240MHz core clock
- Status: Proof-of-concept pipeline validated
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
- Data & Semantic  : Schema.org, JSON-LD, Python, FastAPI, Streamlit
- DevOps & Tools   : Git, Docker, VS Code, IEEE Scientific Documentation
      `,
      roadmap: () => `
<span class="prompt-sys">ROADMAP 2026 - 2027:</span>
[Q1-Q3 2026] Done: 1D-CNN INT8 Pipeline, CorpusLD v2.0, LocalLM Studio
[Q4 2026]    Focus: Physical laboratory testbed dataset acquisition & paper submission
[2027]       Planned: Docker deployment, RAGAS automated benchmarking, CorpusLD v2.1
      `,
      contact: () => `
<span class="prompt-sys">CONTACT & VERIFIED LINKS:</span>
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
