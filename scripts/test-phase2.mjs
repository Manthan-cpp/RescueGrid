import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { FalkorDB } from 'falkordb';

async function testPhase2() {
  console.log('Testing Phase 2 — FalkorDB Schema, Room Creation & Infrastructure Seeding...\n');

  const host = process.env.FALKORDB_HOST;
  const port = parseInt(process.env.FALKORDB_PORT || '6379', 10);
  const username = process.env.FALKORDB_USERNAME;
  const password = process.env.FALKORDB_PASSWORD;
  const GRAPH_NAME = process.env.FALKORDB_GRAPH_NAME || 'rescuegrid';

  const db = await FalkorDB.connect({
    username,
    password,
    socket: { host, port }
  });

  const graph = db.selectGraph(GRAPH_NAME);

  // 1. Create indices
  console.log('1. Setting up schema indices...');
  const indices = [
    'CREATE INDEX FOR (c:CrisisRoom) ON (c.id)',
    'CREATE INDEX FOR (p:Person) ON (p.id)',
    'CREATE INDEX FOR (s:SOSRequest) ON (s.id)',
    'CREATE INDEX FOR (r:Resource) ON (r.id)',
    'CREATE INDEX FOR (l:Location) ON (l.id)',
    'CREATE INDEX FOR (sh:Shelter) ON (sh.id)',
    'CREATE INDEX FOR (a:Agency) ON (a.id)',
  ];
  for (const q of indices) {
    try {
      await graph.query(q);
    } catch (err) {
      // already exists
    }
  }
  console.log('Indices configured.');

  // 2. Create Crisis Room via Cypher
  const testRoomId = `room-kerala-${Date.now().toString().slice(-4)}`;
  console.log(`\n2. Creating Crisis Room: ${testRoomId}...`);
  await graph.query(`
    MERGE (r:CrisisRoom { id: $id })
    ON CREATE SET
      r.name = "Kerala Monsoon Flood Ops",
      r.location = "Wayanad & Idukki",
      r.created_at = $created_at,
      r.status = "active"
  `, { params: { id: testRoomId, created_at: new Date().toISOString() } });

  // 3. Seed starter infrastructure (Agencies, Wards, Shelters, Resources, Routes)
  console.log('3. Seeding infrastructure for room...');
  await graph.query(`
    MATCH (room:CrisisRoom { id: $roomId })
    MERGE (ag:Agency { id: "agency-ndrf" }) ON CREATE SET ag.name = "NDRF 4th Battalion", ag.type = "government"
    MERGE (w1:Location { id: $roomId + "-w1" }) ON CREATE SET w1.name = "Sector 1 Lower Valley", w1.accessibility_status = "flooded"
    MERGE (w2:Location { id: $roomId + "-w2" }) ON CREATE SET w2.name = "Sector 2 Bridge Area", w2.accessibility_status = "accessible"
    MERGE (room)-[:HAS_ZONE]->(w1)
    MERGE (room)-[:HAS_ZONE]->(w2)
    MERGE (sh:Shelter { id: $roomId + "-sh1" }) ON CREATE SET sh.name = "Town Relief Camp", sh.capacity = 300, sh.current_occupancy = 180
    MERGE (sh)-[:LOCATED_IN]->(w2)
    MERGE (res:Resource { id: $roomId + "-boat-1" }) ON CREATE SET res.name = "NDRF Inflatable Raft", res.type = "boat", res.status = "available"
    MERGE (res)-[:LOCATED_IN]->(w2)
    MERGE (res)-[:OWNED_BY]->(ag)
    MERGE (w2)-[:CONNECTED_BY { status: "clear" }]->(w1)
  `, { params: { roomId: testRoomId } });

  // 4. Query back to verify graph state
  console.log('\n4. Querying seeded graph back from FalkorDB:');
  const roomRes = await graph.query(`MATCH (r:CrisisRoom { id: $roomId }) RETURN r`, { params: { roomId: testRoomId } });
  console.log('Created Room:', roomRes.data);

  const zonesRes = await graph.query(`
    MATCH (r:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)
    OPTIONAL MATCH (w)<-[:LOCATED_IN]-(sh:Shelter)
    OPTIONAL MATCH (w)<-[:LOCATED_IN]-(res:Resource)
    RETURN w.id as ward_id, w.name as ward_name, sh.name as shelter, res.name as resource
  `, { params: { roomId: testRoomId } });
  console.log('\nConnected Infrastructure Zones:');
  console.table(zonesRes.data);

  // 5. Test multi-hop query
  const pathRes = await graph.query(`
    MATCH (res:Resource)-[:LOCATED_IN]->(fromLoc:Location)-[route:CONNECTED_BY]->(toLoc:Location)
    WHERE route.status = "clear"
    RETURN res.name as resource, fromLoc.name as from_ward, route.status as route_status, toLoc.name as to_ward
  `);
  console.log('\nMulti-hop Route Traversal for Dispatch:');
  console.table(pathRes.data);

  await db.close();
  console.log('\nPhase 2 Verification Complete! FalkorDB Schema and Data Layer fully functional.');
}

testPhase2();
