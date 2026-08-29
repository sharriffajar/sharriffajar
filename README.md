<p align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:000000,50:0d1117,100:000000&height=280&section=header&text=%3E_sharrif_fajar&fontSize=58&fontColor=00FF00&animation=blink&fontAlign=left&fontAlignY=42&desc=root@edge-ai-dev:~$+whoami&descSize=17&descColor=00FF00&descAlign=left&descAlignY=72" />
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono:wght@400;700&size=15&pause=600&color=00FF00&background=000000&center=true&vCenter=true&width=750&lines=$+cat+about.txt;%E2%96%B6+Name.....:+Sharrif+Fajar;%E2%96%B6+Role.....:+Electrical+Engineering+Student+%40+UNTAN;%E2%96%B6+Focus....:+Edge+AI+%26+TinyML+Developer;$+echo+%22Building+%3C200KB+AI+models%22;$+neofetch" />
</p>

<p align="center">
  <a href="https://sharriffajar.pages.dev/"><img src="https://img.shields.io/badge/🌐_Website-sharriffajar.pages.dev-00FF00?style=for-the-badge&logo=googlechrome&logoColor=black" /></a>
  <a href="mailto:sharriffajar@gmail.com"><img src="https://img.shields.io/badge/📧_Email-sharriffajar@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a>
  <a href="https://github.com/sharriffajar"><img src="https://img.shields.io/badge/GitHub-sharriffajar-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://www.linkedin.com/in/sharriffajar"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
</p>

---

## 📊 Quick Stats

<p align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=sharriffajar&background=000000&border=00FF00&stroke=00FF00&ring=00FF00&fire=00FF00&currStreakLabel=00FF00&sideLabels=00FF00&sideNums=00FF00&dates=00FF00&hide_border=true" />
</p>

---

## 👨‍🎓 About Me

> 🎓 **Electrical Engineering Student** at [Universitas Tanjungpura](https://untan.ac.id), Pontianak, Indonesia

Passionate about **democratizing AI for edge devices** and **renewable energy reliability**. Building lightweight ML systems that run on resource-constrained hardware (<200KB model size, <100KB RAM) while maintaining high precision for real-world applications.

**Research Focus:**
- 🔬 Open-Circuit Fault Detection for Solar PV Inverters
- 📚 Privacy-First Local RAG Systems for Document Intelligence
- 🕸️ Knowledge Graph Extraction & Schema.org JSON-LD Generation

---

## 🚀 Featured Projects

### 🧬 [CorpusLD](https://github.com/sharriffajar/CorpusLD) — *Dual-Layer Academic Linked Data & Knowledge Graph Studio*

[![PyPI](https://img.shields.io/badge/PyPI-v3.0.0-blue.svg?style=flat-square&logo=pypi)](https://github.com/sharriffajar/CorpusLD)
[![Tests](https://img.shields.io/badge/Unit%20Tests-109%20Passed-success.svg?style=flat-square)](https://github.com/sharriffajar/CorpusLD)
[![Schema.org](https://img.shields.io/badge/Schema.org-100%25%20Compliant-success.svg?style=flat-square&logo=w3c)](https://schema.org/)
[![W3C RDF](https://img.shields.io/badge/W3C%20RDF-Turtle%20.ttl-blue.svg?style=flat-square&logo=w3c)](https://www.w3.org/TR/turtle/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Cypher%20Export-008CC1.svg?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat-square)](https://github.com/sharriffajar/CorpusLD)

| **Aspect** | **Details** |
|------------|-------------|
| **Type** | Dual-Layer Academic Linked Data Extraction Engine & Deep Knowledge Graph Studio |
| **Target** | Unstructured Scientific Papers, Technical Reports & Patents → Schema.org JSON-LD, RDF Turtle, Neo4j Cypher |
| **Innovation** | 4-Tier Hybrid Parser + 5-Agent Map-Reduce + Live Authority Resolvers (ROR v2 / Wikidata / MeSH / Crossref) |

```text
Layer 1 (Ingestion & Extraction Engine):
  PDF Upload → 4-Tier Hybrid Parser (PyPDF→LlamaParse→Unstructured→Table Stitcher) → 
  5-Agent Map-Reduce Pipeline (Metadata, Outline, Metrics, UniversalTable, Citations) → 
  Universal Unit Ontology Normalization (SI, Biomedical, Energy, Compound)

Layer 2 (Semantic Graph & Linked Data Layer):
  Live Authority Resolvers (ROR v2 Registry, Wikidata QID, MeSH, Crossref & OpenAlex DOI) → 
  Adversarial KG Conflict Detection & Graph Health Analysis → 
  Multi-Format Semantic Export (Schema.org JSON-LD, W3C Turtle .ttl, Neo4j Cypher .cql, BibTeX, RIS, CSL-JSON)
```

**Tech Stack:** `Python 3.10+` · `FastAPI 3.0` · `W3C RDF Turtle` · `Neo4j Cypher` · `Crossref & OpenAlex REST` · `ROR v2` · `Qdrant` · `IBM Granite Embedding` · `Ollama / Gemini / Groq`

**Key Features:**
- 🤖 **5-Agent Map-Reduce Pipeline** with automated running header/footer stripping & cross-page table stitching.
- 🏛️ **Live Domain Authority Linker** (Dynamic ROR v2 lookup for global research institutions + canonical Wikidata QID & MeSH URIs in `sameAs`).
- 📄 **Live DOI Reconciliation Engine** (Crossref Works API & OpenAlex REST API resolving missing DOIs, journal containers, and citation metrics).
- 🧪 **Universal Unit Ontology** (Standardized conversion & boundary validation for SI, Biomedical, Energy, and Compound units).
- 📦 **Multi-Format Semantic Exports** (Schema.org JSON-LD, W3C RDF Turtle `.ttl`, Neo4j Cypher `.cql`, BibTeX `.bib`, RIS `.ris`, CSL-JSON, Google Scholar Meta).
- ⚡ **Dynamic Cost & Complexity Router** (Heuristic document complexity tiering across Gemini 2.5 Pro/Flash, Groq LLaMA 3.3 70B, and local Ollama).
- 🛡️ **Enterprise Security Hardened** (SSRF loopback protection, strict path traversal defense, API Key/Bearer auth, and DOM XSS sanitization).
- 📊 **109 Automated Tests Passed** across evaluated multi-domain ground-truth benchmarks.

**Status:** ✅ Released v3.0.0 (Open-Core & PyPI Package) | Apache-2.0 Licensed

---

### 🌐 [Notebook-LocalLM-Studio](https://github.com/sharriffajar/Notebook-LocalLM-Studio) — *Active Development*

| **Aspect** | **Details** |
|------------|-------------|
| **Type** | Enterprise-grade RAG Workspace |
| **Target** | Multi-document PDF intelligence (local, privacy-first) |
| **Innovation** | 3-Tier Parser Pipeline + Heuristic Table Detection + Citation System |

```text
Pipeline: PDF Upload → Tiered Parsing (LlamaParse→Unstructured→pypdf) → 
         Multilingual Embedding → Qdrant Vector DB → 
         Qwen 2.5 1.5B Inference → Evidence-Backed Response with Citations
```

**Tech Stack:** `Python` · `Streamlit` · `Qdrant` · `Ollama` · `MiniLM-L12-v2` · `pypdf`

**Key Features:**
- 🧠 Ultra-low resource (~2GB RAM target)
- 🔄 Smart re-search loop for table/metric extraction
- 🌐 Multilingual semantic retrieval (ID ↔ EN)
- 📚 Multi-document citation system `[Doc.pdf | Hal. X]`

---

### ⚡ [Lightweight 1D-CNN Edge AI for Inverter Fault Diagnosis](https://github.com/sharriffajar/Lightweight-1D-CNN-Edge-AI-for-Inverter-Fault-Diagnosis) — *Thesis Project*

| **Aspect** | **Details** |
|------------|-------------|
| **Type** | TinyML / Embedded AI Fault Diagnosis System |
| **Target** | Real-time Open-Circuit Fault (OCF) detection on ESP32-S3 |
| **Model Specs** | INT8 Quantized 1D-CNN (21.5 KB, ~14.7k params, ~8.4 ms latency) |
| **Fault Classes** | 6 Classes: Healthy, S1_Open, S2_Open, S3_Open, S4_Open, Multi_Fault |

```text
Pipeline: generate_dataset.py (128-sample window) → train_model.py (1D-CNN) → 
         quantize_export.py (INT8 TFLite ~21.5KB) → TFLite Micro on ESP32-S3 → 
         IoT Telemetry via Thinger.io
```

**Tech Stack:** `ESP32-S3` · `TensorFlow/Keras` · `TFLite Micro` · `C/C++` · `Thinger.io`

**Paper:** *"Democratizing AIoT for Renewable Energy Reliability: A Lightweight CNN and ESP32-S3-Based Inverter Fault Detection System"*

**Status:** 🧪 Proof-of-concept pipeline validated | 🔜 Physical lab testbed acquisition scheduled


---

## 🛠️ Tech Stack & Expertise

### **Languages & Frameworks**

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=cplusplus&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

### **AI & Machine Learning**

![TinyML](https://img.shields.io/badge/TinyML-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![TFLite](https://img.shields.io/badge/TFLite_Micro-4CAF50?style=flat-square&logo=tensorflow&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-8E44AD?style=flat-square&logo=openai&logoColor=white)

### **Data & Semantic Web**

![Qdrant](https://img.shields.io/badge/Qdrant-D31F58?style=flat-square&logo=qdrant&logoColor=white)
![Schema.org](https://img.shields.io/badge/Schema.org-1ED962?style=flat-square&logo=json&logoColor=black)
![JSON-LD](https://img.shields.io/badge/JSON--LD-005A9C?style=flat-square&logo=json&logoColor=white)
![W3C RDF](https://img.shields.io/badge/W3C_RDF-Turtle_.ttl-blue?style=flat-square&logo=w3c&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-Cypher-008CC1?style=flat-square&logo=neo4j&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=flat-square&logo=streamlit&logoColor=white)

### **Embedded & IoT**

![ESP32](https://img.shields.io/badge/ESP32--S3-E7352C?style=flat-square&logo=espressif&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=flat-square&logo=arduino&logoColor=white)
![Thinger.io](https://img.shields.io/badge/Thinger.io-222222?style=flat-square&logo=internetexplorer&logoColor=white)

### **DevOps & Tools**

![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white)

---

## 🎯 Current Focus

```
┌─────────────────────────────────────────────────────────────┐
│  Current & 2027 Roadmap                                     │
├─────────────────────────────────────────────────────────────┤
│  🔬 Thesis Completion                                       │
│     └─ Physical dataset acquisition for OCF detection       │
│                                                             │
│  🧠 Knowledge Graph & Linked Data Framework                 │
│     ├─ CorpusLD v3.0 Released (Dual-Layer, ROR, Neo4j, TTL) │
│     └─ Enterprise SLA & Institutional Journal OJS Plugins   │
│                                                             │
│  📚 Local RAG Workspace                                     │
│     ├─ Notebook-LocalLM-Studio sub-2GB RAM optimization     │
│     └─ Docker containerization & RAGAS evaluation harness   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤝 Let's Connect!

> 💡 **Open to collaborations** on: Edge AI, TinyML, Renewable Energy monitoring, Knowledge Graphs, and Privacy-First AI systems

<p align="center">
  <a href="https://sharriffajar.pages.dev/"><img src="https://img.shields.io/badge/🌐_Website-sharriffajar.pages.dev-00FF00?style=flat-square&logo=googlechrome&logoColor=black" /></a>
  <a href="mailto:sharriffajar@gmail.com"><img src="https://img.shields.io/badge/📧_Email-sharriffajar@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white" /></a>
  <a href="https://github.com/sharriffajar"><img src="https://img.shields.io/badge/🐙_GitHub-sharriffajar-181717?style=flat-square&logo=github&logoColor=white" /></a>
  <a href="https://www.linkedin.com/in/sharriffajar"><img src="https://img.shields.io/badge/💼_LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white" /></a>
</p>

<p align="center">
  <i>"Democratizing AI × Lightweight Edge Intelligence × Verifiable Knowledge"</i>
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=sharriffajar&color=38BDF8&style=flat-square" />
</p>
