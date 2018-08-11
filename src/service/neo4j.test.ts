import Neo4j from './neo4j';
import test from 'ava';

test('Execute a simple query should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.cypher('RETURN 1 AS test');
  t.is(result.length, 1);
  t.is(result[0].test, 1);
});

test('Get labels should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result: string[] = await neo4j.labels();
  t.is(result.length, 2);
  t.true(result.includes('Movie') && result.includes('Person'));
});

test('Get relationshipType should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.relationshipTypes();
  t.is(result.length, 6);
  t.true(result.includes('ACTED_IN') && result.includes('PRODUCED'));
});

test('Get properties should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.properties();
  t.is(result.length, 8);
  t.true(result.includes('name') && result.includes('title'));
});

test('Get indexes should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.indexes();
  t.is(result.length, 3);
});

test('Get constraints should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.constraints();
  t.is(result.length, 4);
});

test('Get schema should work', async (t) => {
  let neo4j = new Neo4j('bolt://localhost:17687', 'neo4j', 'admin');
  const result = await neo4j.schema();
  t.is(result.nodes.length, 2);
  t.is(result.edges.length, 6);
});
