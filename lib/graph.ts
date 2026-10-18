import { FalkorDB } from "falkordb";
import {
  CrisisRoom,
  SOSRequest,
  Resource,
  ResourceStatus,
  Shelter,
  WardLocation,
  RouteStatus,
  Agency,
  GraphData,
  GraphNode,
  GraphEdge,
} from "./types";

const GRAPH_NAME = process.env.FALKORDB_GRAPH_NAME || "rescuegrid";

let dbInstance: FalkorDB | null = null;

export async function getFalkorClient(): Promise<FalkorDB> {
  if (dbInstance) {
    return dbInstance;
  }

  const host = process.env.FALKORDB_HOST;
  const port = parseInt(process.env.FALKORDB_PORT || "6379", 10);
  const username = process.env.FALKORDB_USERNAME;
  const password = process.env.FALKORDB_PASSWORD;

  if (!host) {
    throw new Error("FalkorDB configuration missing: FALKORDB_HOST is required.");
  }

  try {
    dbInstance = await FalkorDB.connect({
      username: username || undefined,
      password: password || undefined,
      socket: {
        host,
        port,
      },
    });
    return dbInstance;
  } catch (error: any) {
    console.error("FalkorDB connection failure:", error);
    throw new Error(`Failed to connect to FalkorDB at ${host}:${port}: ${error.message}`);
  }
}

export async function getGraph() {
  const client = await getFalkorClient();
  return client.selectGraph(GRAPH_NAME);
}

// -------------------------------------------------------------
// 1. Schema Constraints & Indices
// -------------------------------------------------------------
export async function setupSchemaIndices() {
  const graph = await getGraph();
  const indexQueries = [
    "CREATE INDEX FOR (c:CrisisRoom) ON (c.id)",
    "CREATE INDEX FOR (p:Person) ON (p.id)",
    "CREATE INDEX FOR (s:SOSRequest) ON (s.id)",
    "CREATE INDEX FOR (r:Resource) ON (r.id)",
    "CREATE INDEX FOR (l:Location) ON (l.id)",
    "CREATE INDEX FOR (sh:Shelter) ON (sh.id)",
    "CREATE INDEX FOR (a:Agency) ON (a.id)",
  ];

  for (const q of indexQueries) {
    try {
      await graph.query(q);
    } catch (err: any) {
      // Index may already exist; FalkorDB throws harmless notice
      console.log(`Index notice: ${err.message}`);
    }
  }
}

// -------------------------------------------------------------
// 2. Crisis Room Lifecycle & Infrastructure Seeding (DATA.md)
// -------------------------------------------------------------
export async function createCrisisRoom(room: CrisisRoom, shouldSeed = false): Promise<void> {
  const graph = await getGraph();
  await setupSchemaIndices();

  // Create room node
  const cypher = `
    MERGE (r:CrisisRoom { id: $id })
    ON CREATE SET
      r.name = $name,
      r.location = $location,
      r.created_at = $created_at,
      r.status = $status
    RETURN r
  `;

  await graph.query(cypher, { params: { ...room } as Record<string, any> });

  // Only seed infrastructure if explicitly requested
  if (shouldSeed) {
    await seedInfrastructure(room.id, room.location);
  }
}

export async function seedInfrastructure(roomId: string, region: string): Promise<void> {
  const graph = await getGraph();

  // 1. Seed Operational Agencies
  const agencies: Agency[] = [
    { id: "agency-ndrf", name: "NDRF 4th Battalion", type: "government" },
    { id: "agency-army", name: "Army Corps of Engineers", type: "government" },
    { id: "agency-redcross", name: "Red Cross Disaster Cell", type: "NGO" },
    { id: "agency-volunteers", name: "Fisherfolk Guild Rescue Fleet", type: "volunteer_group" },
  ];

  for (const a of agencies) {
    await graph.query(
      `MERGE (ag:Agency { id: $id })
       ON CREATE SET ag.name = $name, ag.type = $type`,
      { params: a as any }
    );
  }

  // 2. Seed Wards / Locations for this region
  const wards: WardLocation[] = [
    { id: `${roomId}-w1`, name: "Sector 1 Lower Basin", region, accessibility_status: "flooded" },
    { id: `${roomId}-w2`, name: "Bridge Crossing East", region, accessibility_status: "blocked" },
    { id: `${roomId}-w3`, name: "High Ground Ridge", region, accessibility_status: "accessible" },
    { id: `${roomId}-w4`, name: "Central Transit Ward", region, accessibility_status: "accessible" },
    { id: `${roomId}-w5`, name: "Main Emergency Staging Hub", region, accessibility_status: "accessible" },
    { id: `${roomId}-w6`, name: "North Escarpment", region, accessibility_status: "accessible" },
  ];

  for (const w of wards) {
    await graph.query(
      `MATCH (room:CrisisRoom { id: $roomId })
       MERGE (loc:Location { id: $id })
       ON CREATE SET loc.name = $name, loc.region = $region, loc.accessibility_status = $accessibility_status
       MERGE (room)-[:HAS_ZONE]->(loc)`,
      { params: { roomId, ...w } }
    );
  }

  // 3. Connect Routes between Wards
  const routes = [
    { from: `${roomId}-w5`, to: `${roomId}-w4`, status: "clear" },
    { from: `${roomId}-w4`, to: `${roomId}-w1`, status: "clear" },
    { from: `${roomId}-w4`, to: `${roomId}-w2`, status: "blocked" },
    { from: `${roomId}-w3`, to: `${roomId}-w1`, status: "clear" },
    { from: `${roomId}-w5`, to: `${roomId}-w6`, status: "clear" },
  ];

  for (const route of routes) {
    await graph.query(
      `MATCH (from:Location { id: $from }), (to:Location { id: $to })
       MERGE (from)-[:CONNECTED_BY { status: $status }]->(to)`,
      { params: route }
    );
  }

  // 4. Seed Shelters
  const shelters: Shelter[] = [
    {
      id: `${roomId}-sh1`,
      name: "St. Jude Emergency Shelter",
      capacity: 500,
      current_occupancy: 380,
      location_id: `${roomId}-w5`,
    },
    {
      id: `${roomId}-sh2`,
      name: "Civic Transit Hall",
      capacity: 350,
      current_occupancy: 120,
      location_id: `${roomId}-w4`,
    },
  ];

  for (const s of shelters) {
    await graph.query(
      `MATCH (loc:Location { id: $location_id })
       MERGE (sh:Shelter { id: $id })
       ON CREATE SET sh.name = $name, sh.capacity = $capacity, sh.current_occupancy = $current_occupancy
       MERGE (sh)-[:LOCATED_IN]->(loc)`,
      { params: s as any }
    );
  }

  // 5. Seed Starter Resources
  const starterResources: Resource[] = [
    {
      id: `${roomId}-res-boat-1`,
      name: "NDRF Motor Raft 01",
      type: "boat",
      status: "available",
      location_id: `${roomId}-w5`,
      agency_id: "agency-ndrf",
      capacity: 8,
    },
    {
      id: `${roomId}-res-boat-2`,
      name: "Fisherfolk Skiff Alpha",
      type: "boat",
      status: "available",
      location_id: `${roomId}-w4`,
      agency_id: "agency-volunteers",
      capacity: 6,
    },
    {
      id: `${roomId}-res-amb-1`,
      name: "Rapid Trauma Ambulance 03",
      type: "ambulance",
      status: "available",
      location_id: `${roomId}-w5`,
      agency_id: "agency-redcross",
      capacity: 2,
    },
    {
      id: `${roomId}-res-food-1`,
      name: "Ration Pack Bundle 400",
      type: "food",
      status: "available",
      location_id: `${roomId}-w5`,
      agency_id: "agency-redcross",
      capacity: 400,
    },
  ];

  for (const r of starterResources) {
    await graph.query(
      `MATCH (loc:Location { id: $location_id }), (ag:Agency { id: $agency_id })
       MERGE (res:Resource { id: $id })
       ON CREATE SET res.name = $name, res.type = $type, res.status = $status, res.capacity = $capacity
       MERGE (res)-[:LOCATED_IN]->(loc)
       MERGE (res)-[:OWNED_BY]->(ag)`,
      { params: r as any }
    );
  }
}

// -------------------------------------------------------------
// 3. SOS Request Creation & Dispatch Updates
// -------------------------------------------------------------
export async function createSOS(sos: SOSRequest, roomId?: string): Promise<void> {
  const graph = await getGraph();
  const cypher = `
    MERGE (loc:Location { id: $location_id })
    ON CREATE SET loc.name = $location_name, loc.accessibility_status = 'accessible'
    MERGE (s:SOSRequest { id: $id })
    ON CREATE SET
      s.description = $description,
      s.urgency = $urgency,
      s.status = $status,
      s.timestamp = $timestamp,
      s.people_count = $people_count
    MERGE (s)-[:LOCATED_IN]->(loc)
    RETURN s
  `;

  await graph.query(cypher, { params: { ...sos, location_name: sos.location_name || sos.location_id } as any });

  if (roomId) {
    await graph.query(
      `MATCH (cr:CrisisRoom { id: $roomId }), (loc:Location { id: $location_id })
       MERGE (cr)-[:HAS_ZONE]->(loc)`,
      { params: { roomId, location_id: sos.location_id } }
    );
  }
}

export async function addResource(res: Resource, roomId?: string): Promise<void> {
  const graph = await getGraph();
  const cypher = `
    MERGE (loc:Location { id: $location_id })
    ON CREATE SET loc.name = $location_name, loc.accessibility_status = 'accessible'
    MERGE (r:Resource { id: $id })
    ON CREATE SET
      r.name = $name,
      r.type = $type,
      r.status = $status,
      r.capacity = $capacity,
      r.contact_phone = $contact_phone,
      r.notes = $notes,
      r.lat = $lat,
      r.lng = $lng
    MERGE (r)-[:LOCATED_IN]->(loc)
    RETURN r
  `;

  await graph.query(cypher, {
    params: {
      ...res,
      location_name: res.location_name || res.location_id,
      capacity: Number(res.capacity) || 1,
      contact_phone: res.contact_phone || "",
      notes: res.notes || "",
      lat: Number(res.lat) || 0,
      lng: Number(res.lng) || 0,
    } as any,
  });

  // Link to Agency if provided
  if (res.agency_name || res.agency_id) {
    const agencyId = res.agency_id || `agency-${(res.agency_name || "vol").toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const agencyName = res.agency_name || "Emergency Response Team";
    await graph.query(
      `MATCH (r:Resource { id: $resId })
       MERGE (ag:Agency { id: $agencyId })
       ON CREATE SET ag.name = $agencyName, ag.type = 'NGO'
       MERGE (r)-[:OWNED_BY]->(ag)`,
      { params: { resId: res.id, agencyId, agencyName } }
    );
  }

  if (roomId) {
    await graph.query(
      `MATCH (cr:CrisisRoom { id: $roomId }), (loc:Location { id: $location_id })
       MERGE (cr)-[:HAS_ZONE]->(loc)`,
      { params: { roomId, location_id: res.location_id } }
    );
  }
}

export async function updateResourceStatus(resourceId: string, status: ResourceStatus): Promise<void> {
  const graph = await getGraph();
  await graph.query(
    `MATCH (r:Resource { id: $resourceId })
     SET r.status = $status
     RETURN r`,
    { params: { resourceId, status } }
  );
}

export async function addShelter(shelter: Shelter, roomId?: string): Promise<void> {
  const graph = await getGraph();
  const cypher = `
    MERGE (loc:Location { id: $location_id })
    ON CREATE SET loc.name = $location_name, loc.accessibility_status = 'accessible'
    MERGE (s:Shelter { id: $id })
    ON CREATE SET
      s.name = $name,
      s.capacity = $capacity,
      s.current_occupancy = $current_occupancy,
      s.has_medical = $has_medical,
      s.has_generator = $has_generator,
      s.contact_phone = $contact_phone,
      s.lat = $lat,
      s.lng = $lng
    MERGE (s)-[:LOCATED_IN]->(loc)
    RETURN s
  `;

  await graph.query(cypher, {
    params: {
      ...shelter,
      location_name: shelter.location_name || shelter.location_id,
      capacity: Number(shelter.capacity) || 50,
      current_occupancy: Number(shelter.current_occupancy) || 0,
      has_medical: Boolean(shelter.has_medical),
      has_generator: Boolean(shelter.has_generator),
      contact_phone: shelter.contact_phone || "",
      lat: Number(shelter.lat) || 0,
      lng: Number(shelter.lng) || 0,
    } as any,
  });

  if (roomId) {
    await graph.query(
      `MATCH (cr:CrisisRoom { id: $roomId }), (loc:Location { id: $location_id })
       MERGE (cr)-[:HAS_ZONE]->(loc)`,
      { params: { roomId, location_id: shelter.location_id } }
    );
  }
}

export async function updateShelterOccupancy(shelterId: string, current_occupancy: number): Promise<void> {
  const graph = await getGraph();
  await graph.query(
    `MATCH (s:Shelter { id: $shelterId })
     SET s.current_occupancy = $current_occupancy
     RETURN s`,
    { params: { shelterId, current_occupancy: Math.max(0, current_occupancy) } }
  );
}

export async function reportRoadHazard(
  fromLocId: string,
  toLocId: string,
  status: RouteStatus,
  notes?: string,
  roomId?: string
): Promise<void> {
  const graph = await getGraph();
  
  // 1. Create or update directional road route
  const cypher = `
    MERGE (l1:Location { id: $fromLocId })
    MERGE (l2:Location { id: $toLocId })
    MERGE (l1)-[r:CONNECTED_BY]->(l2)
    SET r.status = $status, r.notes = $notes, r.last_updated = $timestamp
    RETURN r
  `;

  await graph.query(cypher, {
    params: {
      fromLocId,
      toLocId,
      status,
      notes: notes || "",
      timestamp: new Date().toISOString(),
    },
  });

  // 2. Also update reverse route for bidirectional consistency
  await graph.query(
    `MATCH (l1:Location { id: $fromLocId }), (l2:Location { id: $toLocId })
     MERGE (l2)-[r:CONNECTED_BY]->(l1)
     SET r.status = $status, r.notes = $notes, r.last_updated = $timestamp`,
    {
      params: {
        fromLocId,
        toLocId,
        status,
        notes: notes || "",
        timestamp: new Date().toISOString(),
      },
    }
  );

  // 3. If route is blocked or flooded, update the destination location's accessibility status
  if (status === "blocked" || status === "restricted") {
    await graph.query(
      `MATCH (loc:Location { id: $toLocId })
       SET loc.accessibility_status = 'blocked'`,
      { params: { toLocId } }
    );
  } else if (status === "clear") {
    await graph.query(
      `MATCH (loc:Location { id: $toLocId })
       SET loc.accessibility_status = 'accessible'`,
      { params: { toLocId } }
    );
  }

  // 4. Link locations to room if provided
  if (roomId) {
    await graph.query(
      `MATCH (cr:CrisisRoom { id: $roomId }), (l1:Location { id: $fromLocId }), (l2:Location { id: $toLocId })
       MERGE (cr)-[:HAS_ZONE]->(l1)
       MERGE (cr)-[:HAS_ZONE]->(l2)`,
      { params: { roomId, fromLocId, toLocId } }
    );
  }
}

export async function assignResourceToSOS(
  sosId: string,
  resourceId: string,
  reasoning: string
): Promise<void> {
  const graph = await getGraph();
  const cypher = `
    MATCH (s:SOSRequest { id: $sosId }), (r:Resource { id: $resourceId })
    SET s.status = 'assigned', r.status = 'assigned'
    MERGE (s)-[a:ASSIGNED_TO]->(r)
    SET a.assigned_at = $timestamp, a.reasoning = $reasoning
    RETURN s, r
  `;

  await graph.query(cypher, { params: { sosId, resourceId, reasoning, timestamp: new Date().toISOString() } });
}

export async function resolveSOS(sosId: string): Promise<void> {
  const graph = await getGraph();
  
  // 1. Mark SOS as resolved
  await graph.query(
    `MATCH (s:SOSRequest { id: $sosId }) SET s.status = 'resolved' RETURN s`,
    { params: { sosId } }
  );

  // 2. If it was assigned to a resource, release the resource back to 'available' and delete ASSIGNED_TO edge
  await graph.query(
    `MATCH (s:SOSRequest { id: $sosId })-[a:ASSIGNED_TO]->(r:Resource)
     SET r.status = 'available'
     DELETE a`,
    { params: { sosId } }
  );
}

export async function deleteCrisisRoom(roomId: string): Promise<void> {
  const graph = await getGraph();
  const cypher = `
    MATCH (cr:CrisisRoom { id: $roomId })
    OPTIONAL MATCH (cr)-[:HAS_ZONE]->(loc:Location)
    OPTIONAL MATCH (loc)<-[:LOCATED_IN]-(item)
    DETACH DELETE cr, loc, item
  `;
  await graph.query(cypher, { params: { roomId } });
}

// -------------------------------------------------------------
// 4. Querying Live Graph State
// -------------------------------------------------------------
export async function getCrisisRooms(): Promise<CrisisRoom[]> {
  const graph = await getGraph();
  const res = await graph.query("MATCH (c:CrisisRoom) RETURN c");
  if (!res.data) return [];
  return res.data.map((row: any) => row.c?.properties || row.c);
}

export async function getFullGraphData(roomId?: string): Promise<GraphData> {
  const graph = await getGraph();
  
  if (roomId) {
    const nodeQuery = `
      MATCH (cr:CrisisRoom { id: $roomId })
      OPTIONAL MATCH (cr)-[:HAS_ZONE]->(loc:Location)
      OPTIONAL MATCH (loc)<-[:LOCATED_IN]-(r:Resource)
      OPTIONAL MATCH (r)-[:OWNED_BY]->(ag:Agency)
      OPTIONAL MATCH (loc)<-[:LOCATED_IN]-(sh:Shelter)
      OPTIONAL MATCH (loc)<-[:LOCATED_IN]-(s:SOSRequest)
      OPTIONAL MATCH (s)-[:ASSIGNED_TO]->(res:Resource)
      WITH [cr, loc, r, ag, sh, s, res] AS nodeGroups
      UNWIND nodeGroups AS n
      WITH DISTINCT n
      WHERE n IS NOT NULL
      RETURN n, labels(n)[0] as labelType
    `;

    const [nodeRes, hzRes, connRes, locRes, asgnRes, ownRes] = await Promise.all([
      graph.query(nodeQuery, { params: { roomId } }),
      graph.query(`MATCH (cr:CrisisRoom { id: $roomId })-[r:HAS_ZONE]->(loc:Location) RETURN cr.id as source, loc.id as target, 'HAS_ZONE' as relType`, { params: { roomId } }),
      graph.query(`MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(l1:Location)-[r:CONNECTED_BY]->(l2:Location)<-[:HAS_ZONE]-(cr) RETURN l1.id as source, l2.id as target, 'CONNECTED_BY' as relType`, { params: { roomId } }),
      graph.query(`MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(loc:Location)<-[r:LOCATED_IN]-(item) RETURN item.id as source, loc.id as target, 'LOCATED_IN' as relType`, { params: { roomId } }),
      graph.query(`MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(loc:Location)<-[:LOCATED_IN]-(s:SOSRequest)-[r:ASSIGNED_TO]->(res:Resource) RETURN s.id as source, res.id as target, 'ASSIGNED_TO' as relType`, { params: { roomId } }),
      graph.query(`MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(loc:Location)<-[:LOCATED_IN]-(res:Resource)-[r:OWNED_BY]->(ag:Agency) RETURN res.id as source, ag.id as target, 'OWNED_BY' as relType`, { params: { roomId } }),
    ]);

    const nodes: GraphNode[] = (nodeRes.data || []).map((row: any) => {
      const n = row.n;
      const props = n.properties || {};
      return {
        id: props.id || String(n.id),
        label: props.name || props.description || props.id || row.labelType,
        type: row.labelType || "Location",
        properties: props,
      };
    });

    const rawEdges = [
      ...(hzRes.data || []),
      ...(connRes.data || []),
      ...(locRes.data || []),
      ...(asgnRes.data || []),
      ...(ownRes.data || []),
    ];

    const edges: GraphEdge[] = rawEdges.map((row: any, idx: number) => ({
      id: `edge-${idx}`,
      source: row.source,
      target: row.target,
      label: row.relType || "CONNECTED",
      properties: {},
    }));

    return { nodes, edges };
  }

  // Fallback if no roomId provided
  const nodeQuery = `
    MATCH (n)
    RETURN DISTINCT n, labels(n)[0] as labelType
  `;

  const edgeQuery = `
    MATCH (a)-[rel]->(b)
    RETURN rel, a.id as source, b.id as target, type(rel) as relType
  `;

  const nodeRes = await graph.query(nodeQuery);
  const edgeRes = await graph.query(edgeQuery);

  const nodes: GraphNode[] = (nodeRes.data || []).map((row: any) => {
    const n = row.n;
    const props = n.properties || {};
    return {
      id: props.id || String(n.id),
      label: props.name || props.description || props.id || row.labelType,
      type: row.labelType || "Location",
      properties: props,
    };
  });

  const edges: GraphEdge[] = (edgeRes.data || []).map((row: any, idx: number) => {
    return {
      id: `edge-${idx}`,
      source: row.source,
      target: row.target,
      label: row.relType || "CONNECTED",
      properties: row.rel?.properties || {},
    };
  });

  return { nodes, edges };
}

// -------------------------------------------------------------
// 5. Raw Cypher Execution (For Query Agent)
// -------------------------------------------------------------
export async function executeCypher(
  cypher: string,
  params?: Record<string, any>
): Promise<{ data: any[]; durationMs: number }> {
  const graph = await getGraph();
  const start = Date.now();
  const res = await graph.query(cypher, params ? { params } : undefined);
  const durationMs = Date.now() - start;
  return { data: res.data || [], durationMs };
}

// -------------------------------------------------------------
// 6. Comprehensive Room State Retrieval
// -------------------------------------------------------------
export async function getRoomDetails(roomId: string) {
  const graph = await getGraph();

  // Wards
  const wardsRes = await graph.query(
    `MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)
     RETURN w`,
    { params: { roomId } }
  );
  const wards: WardLocation[] = (wardsRes.data || []).map((row: any) => row.w.properties || row.w);

  // Shelters
  const sheltersRes = await graph.query(
    `MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)<-[:LOCATED_IN]-(sh:Shelter)
     RETURN sh, w.name as location_name`,
    { params: { roomId } }
  );
  const shelters: Shelter[] = (sheltersRes.data || []).map((row: any) => ({
    ...(row.sh.properties || row.sh),
    location_name: row.location_name,
  }));

  // Resources
  const resourcesRes = await graph.query(
    `MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)<-[:LOCATED_IN]-(r:Resource)
     OPTIONAL MATCH (r)-[:OWNED_BY]->(ag:Agency)
     RETURN r, w.name as location_name, ag.name as agency_name`,
    { params: { roomId } }
  );
  const resources: Resource[] = (resourcesRes.data || []).map((row: any) => ({
    ...(row.r.properties || row.r),
    location_name: row.location_name,
    agency_name: row.agency_name,
  }));

  // SOS Requests
  const sosRes = await graph.query(
    `MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)<-[:LOCATED_IN]-(s:SOSRequest)
     OPTIONAL MATCH (s)-[:ASSIGNED_TO]->(res:Resource)
     RETURN s, w.name as location_name, res.name as assigned_resource_name`,
    { params: { roomId } }
  );
  const sosRequests: SOSRequest[] = (sosRes.data || []).map((row: any) => ({
    ...(row.s.properties || row.s),
    location_name: row.location_name,
    assigned_resource_name: row.assigned_resource_name,
  }));

  // Full Graph
  const graphData = await getFullGraphData(roomId);

  return {
    wards,
    shelters,
    resources,
    sosRequests,
    graphData,
  };
}
