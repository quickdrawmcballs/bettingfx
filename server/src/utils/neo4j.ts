// npm install --save neo4j-driver
// node example.js
import neo4j from 'neo4j-driver';

// const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'test'))
// const driver = neo4j.driver('bolt://54.174.67.107:7687',
//         neo4j.auth.basic('neo4j', 'daughters-henry-fats'),
//         {/* encrypted: 'ENCRYPTION_OFF' */}
//     );

const query =
  `
  MATCH (movie:Movie {title:$favorite})<-[:ACTED_IN]-(actor)-[:ACTED_IN]->(rec:Movie) 
  RETURN distinct rec.title as title LIMIT 20
  `;

const query2 = `MATCH (n:Person) RETURN n.name as title LIMIT 25`;

const params = {"favorite": "The Matrix"};

const session = driver.session({database:"neo4j"});

session.run(query2, params)
  .then((result) => {
    result.records.forEach((record) => {
        console.log(record.get('title'));
    });
    session.close();
    driver.close();
  })
  .catch((error) => {
    console.error(error);
  });