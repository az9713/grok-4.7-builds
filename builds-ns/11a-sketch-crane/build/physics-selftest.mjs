// Physics self-test. Steps the same crane builder the page uses.
// Run: node build/physics-selftest.mjs

import {
  createSim, removePin, fixedStep, displacementReport, setFriction,
  CRATE_FAR_X, DEFAULT_CRATE_MASS,
} from '../src/crane.js';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from '../src/physics-config.js';

const STEPS = 420; // 3.5s at dt = 1/120

function finiteReport(report) {
  return Number.isFinite(report.maxD) && Number.isFinite(report.farD);
}

function run({ friction, crateMass, pullPin, label }) {
  const { world, bodies, contactMaterial } = createSim({ friction, crateMass });
  setFriction(bodies, contactMaterial, friction);
  if (pullPin) removePin(world, bodies);
  let maxCrateX = bodies.crate.position.x;
  for (let i = 0; i < STEPS; i++) {
    fixedStep(world, bodies);
    if (bodies.crate.position.x > maxCrateX) maxCrateX = bodies.crate.position.x;
  }
  const report = displacementReport(bodies);
  console.log(
    `${label}: friction=${friction} pinRemoved=${!!pullPin} ` +
    `max structural=${report.maxD.toFixed(4)} m  crateMaxX=${maxCrateX.toFixed(3)} ` +
    `(far ${report.farName} ${report.farD.toFixed(3)} m, ${report.over} bodies >0.5m)`
  );
  return { report, maxCrateX, bodies };
}

console.log(`--- crane physics self-test (cannon-es, dt=${FIXED_DT}, iterations=${SOLVER_ITERATIONS}, stiffness=${CONTACT_STIFFNESS}, relaxation=${CONTACT_RELAXATION}) ---`);

const hold = run({
  friction: DEFAULT_FRICTION,
  crateMass: DEFAULT_CRATE_MASS,
  pullPin: false,
  label: 'default (should HOLD, crate CROSSES)',
});
const fall = run({
  friction: DEFAULT_FRICTION,
  crateMass: DEFAULT_CRATE_MASS,
  pullPin: true,
  label: 'pin removed (should FALL, whole crane)',
});
const slip = run({
  friction: 0,
  crateMass: DEFAULT_CRATE_MASS,
  pullPin: false,
  label: 'cable friction = 0 (crate should NOT cross)',
});

const farIsFar = fall.bodies.farInitial > fall.bodies.nearestInitial * 1.5;
const holdOk = finiteReport(hold.report) && hold.report.maxD < 0.05;
const crossOk = hold.maxCrateX > CRATE_FAR_X;
const fallOk = finiteReport(fall.report) && fall.report.over >= 3 && fall.report.farD > 0.4 && farIsFar;
const slipOk = slip.maxCrateX < CRATE_FAR_X - 0.4 && hold.maxCrateX > slip.maxCrateX + 0.8;

console.log('\nSummary:');
console.log(`  hold threshold check: max structural ${hold.report.maxD.toFixed(4)} m ${holdOk ? 'PASS (<0.05m)' : 'FAIL'}`);
console.log(`  load travel check: crate max x ${hold.maxCrateX.toFixed(3)} m (need > ${CRATE_FAR_X}) ${crossOk ? 'PASS' : 'FAIL'}`);
console.log(`  collapse check: ${fall.report.over} bodies >0.5m, far ${fall.report.farName} (started ${fall.bodies.farInitial.toFixed(2)} m from pin, nearest ${fall.bodies.nearestInitial.toFixed(2)} m) moved ${fall.report.farD.toFixed(3)} m ${fallOk ? 'PASS' : 'FAIL'}`);
for (const row of fall.report.rows) {
  console.log(`    ${row.name}: ${row.d.toFixed(3)} m${row.far ? '  [far]' : ''}  (start ${row.fromRemoved.toFixed(2)} m from pin)`);
}
console.log(`  friction discrimination: friction=0 crate max x ${slip.maxCrateX.toFixed(3)} vs default ${hold.maxCrateX.toFixed(3)} ${slipOk ? 'PASS (slider changes result)' : 'FAIL'}`);

const pass = holdOk && crossOk && fallOk && slipOk;
console.log(pass ? 'OVERALL PASS' : 'OVERALL FAIL');
if (!pass) process.exit(1);
