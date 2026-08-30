// Cloudflare Pages Serverless Function for Living Knowledge Graph Community Nodes
// Route: /api/nodes (GET, POST, OPTIONS)

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

export async function onRequestGet({ env }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60, s-maxage=60"
  };

  try {
    let communityNodes = [];
    let communityEdges = [];

    // Check if Cloudflare KV namespace is bound (e.g. env.COMMUNITY_GRAPH_KV)
    if (env && env.COMMUNITY_GRAPH_KV) {
      const stored = await env.COMMUNITY_GRAPH_KV.get("community_nodes", { type: "json" });
      if (stored && Array.isArray(stored)) {
        communityNodes = stored;
      }
      const storedEdges = await env.COMMUNITY_GRAPH_KV.get("community_edges", { type: "json" });
      if (storedEdges && Array.isArray(storedEdges)) {
        communityEdges = storedEdges;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      count: communityNodes.length,
      nodes: communityNodes,
      edges: communityEdges
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      nodes: [],
      edges: []
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const payload = await request.json();

    // 1. Validation & Sanitization Gate
    if (!payload || !payload.title) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required field: title"
      }), { status: 400, headers: corsHeaders });
    }

    const cleanTitle = String(payload.title).slice(0, 200).trim();
    const cleanAuthor = String(payload.author || "Academic Researcher").slice(0, 150).trim();
    const cleanAffil = String(payload.affil || "").slice(0, 150).trim();
    const cleanDoi = String(payload.doi || "Community Submission").slice(0, 120).trim();
    const cleanDesc = String(payload.desc || "").slice(0, 400).trim();
    const isCorpusLD = Boolean(payload.isCorpusLD);

    const nodeId = `global_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newNode = {
      id: nodeId,
      label: cleanTitle.length > 30 ? cleanTitle.slice(0, 28) + "..." : cleanTitle,
      domain: isCorpusLD ? "nexus" : "citation",
      author: cleanAuthor,
      affil: cleanAffil,
      doi: cleanDoi,
      desc: cleanDesc,
      radius: 19,
      timestamp: new Date().toISOString(),
      verifiedCorpusLD: isCorpusLD
    };

    const newEdge = {
      source: "corpusld_core",
      target: nodeId,
      predicate: isCorpusLD ? "FEDERATED_SCHEMA" : "COMMUNITY_INGEST",
      label: isCorpusLD ? "Verified CorpusLD Ingest" : "Community Ingest"
    };

    // 2. Persistence to Cloudflare KV (if bound)
    if (env && env.COMMUNITY_GRAPH_KV) {
      let existingNodes = await env.COMMUNITY_GRAPH_KV.get("community_nodes", { type: "json" }) || [];
      let existingEdges = await env.COMMUNITY_GRAPH_KV.get("community_edges", { type: "json" }) || [];

      // Limit to 500 nodes to prevent unbounded memory growth
      if (existingNodes.length >= 500) {
        existingNodes.shift();
        existingEdges.shift();
      }

      existingNodes.push(newNode);
      existingEdges.push(newEdge);

      await env.COMMUNITY_GRAPH_KV.put("community_nodes", JSON.stringify(existingNodes));
      await env.COMMUNITY_GRAPH_KV.put("community_edges", JSON.stringify(existingEdges));
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Node successfully federated to global living knowledge graph.",
      node: newNode,
      edge: newEdge
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
