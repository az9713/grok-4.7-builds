// Physics self-test. Steps the same chair builder the page uses.
// Run: node build/physics-selftest.mjs

import {
  createSim, removeDowel, fixedStep, displacementReport, setFriction, bookOnSeat,
  DEFAULT_BOOK_MASS,
} from '../src/chair.js';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from '../src/physics-config.js';

const STEPS = 420;

function finiteReport(report) {
  return Number.isFinite(report.maxD) && Number.isFinite(report.farD);
}

function run({ friction, bookMass, pullDowel, label }) {
  const { world, bodies, contactMaterial } = createSim({ friction, bookMass });
  setFriction(bodies, contactMaterial, friction);
  if (pullDowel) removeDowel(world, bodies);
  for (let i = 0; i < STEPS; i++) fixedStep(world, bodies);
  const report = displacementReport(bodies);
  const book = bookOnSeat(bodies);
  console.log(
    `${label}: friction=${friction} dowelRemoved=${!!pullDowel} ` +
    `max structural=${report.maxD.toFixed(4)} m  book=(${book.x.toFixed(3)}, ${book.y.toFixed(3)}) onSeat=${book.on} ` +
    `(far ${report.farName} ${report.farD.toFixed(3)} m, ${report.over} bodies >0.5m)`
  );
  return { report, book, bodies };
}

console.log(`--- chair physics self-test (cannon-es, dt=${FIXED_DT}, iterations=${SOLVER_ITERATIONS}, stiffness=${CONTACT_STIFFNESS}, relaxation=${CONTACT_RELAXATION}) ---`);

const hold = run({
  friction: DEFAULT_FRICTION,
  bookMass: DEFAULT_BOOK_MASS,
  pullDowel: false,
  label: 'default (should HOLD, book STAYS)',
});
const fall = run({
  friction: DEFAULT_FRICTION,
  bookMass: DEFAULT_BOOK_MASS,
  pullDowel: true,
  label: 'dowel pulled (should FOLD, whole chair)',
});
const slip = run({
  friction: 0,
  bookMass: DEFAULT_BOOK_MASS,
  pullDowel: false,
  label: 'joint friction = 0 (book should SLIDE OFF)',
});

const farIsFar = fall.bodies.farInitial > fall.bodies.nearestInitial * 1.5;
const holdOk = finiteReport(hold.report) && hold.report.maxD < 0.05 && hold.book.on && hold.book.traveled;
const fallOk = finiteReport(fall.report) && fall.report.over >= 3 && fall.report.farD > 0.4 && farIsFar;
const slipOk = !slip.book.on && hold.book.on;

console.log('\nSummary:');
console.log(`  hold threshold check: max structural ${hold.report.maxD.toFixed(4)} m, book on seat=${hold.book.on}, traveled=${hold.book.traveled} ${holdOk ? 'PASS (<0.05m)' : 'FAIL'}`);
console.log(`  collapse check: ${fall.report.over} bodies >0.5m, far ${fall.report.farName} (started ${fall.bodies.farInitial.toFixed(2)} m from dowel, nearest ${fall.bodies.nearestInitial.toFixed(2)} m) moved ${fall.report.farD.toFixed(3)} m ${fallOk ? 'PASS' : 'FAIL'}`);
for (const row of fall.report.rows) {
  console.log(`    ${row.name}: ${row.d.toFixed(3)} m${row.far ? '  [far]' : ''}  (start ${row.fromRemoved.toFixed(2)} m from dowel)`);
}
console.log(`  friction discrimination: friction=0 book on seat=${slip.book.on} (x=${slip.book.x.toFixed(3)}) vs default on seat=${hold.book.on} ${slipOk ? 'PASS (slider changes result)' : 'FAIL'}`);

const pass = holdOk && fallOk && slipOk;
console.log(pass ? 'OVERALL PASS' : 'OVERALL FAIL');
if (!pass) process.exit(1);
