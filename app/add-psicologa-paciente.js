const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'crm_psicologia'});
  
  // Assign 2 patients per psychologist (IDs 4-13 for 10 psychologists, IDs 1-20 for patients)
  const assignments = [
    [4, 1, 2],
    [5, 3, 4],
    [6, 5, 6],
    [7, 7, 8],
    [8, 9, 10],
    [9, 11, 12],
    [10, 13, 14],
    [11, 15, 16],
    [12, 17, 18],
    [13, 19, 20],
  ];
  
  for (const [psicId, p1, p2] of assignments) {
    await c.query('UPDATE pacientes SET psicologa_id = ? WHERE id IN (?, ?)', [psicId, p1, p2]);
    console.log(`Assigned psychologist ${psicId} → patients ${p1}, ${p2}`);
  }
  
  const [r] = await c.query('SELECT p.id, p.nombre, p.apellido, p.psicologa_id, u.nombre as psic_nombre FROM pacientes p LEFT JOIN usuarios u ON p.psicologa_id = u.id LIMIT 5');
  console.log('\nSample:');
  r.forEach(row => console.log(row.id, row.nombre, row.apellido, '→', row.psic_nombre));
  
  await c.end();
  console.log('\nDone');
}
main();
