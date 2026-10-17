import { FalkorDB } from 'falkordb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Connecting to FalkorDB Cloud...');
  const host = process.env.FALKORDB_HOST;
  const port = parseInt(process.env.FALKORDB_PORT || '6379', 10);
  const username = process.env.FALKORDB_USERNAME;
  const password = process.env.FALKORDB_PASSWORD;

  console.log(`Target: ${host}:${port} (user: ${username})`);

  try {
    const db = await FalkorDB.connect({
      username,
      password,
      socket: {
        host,
        port,
      }
    });

    console.log('Connected successfully to FalkorDB!');

    // List graphs
    // FalkorDB uses client commands or graph listing
    // In FalkorDB, we can select a graph, e.g. "rescuegrid"
    const graph = db.selectGraph('rescuegrid');
    
    // Check if graph has any nodes
    try {
      const res = await graph.query('MATCH (n) RETURN count(n) as total');
      console.log('Current nodes in "rescuegrid" graph:', res.data);
    } catch (err) {
      console.log('Graph "rescuegrid" query check:', err.message);
    }

    await db.close();
    console.log('DB connection test complete.');
  } catch (error) {
    console.error('Error connecting to FalkorDB:', error);
  }
}

main();
