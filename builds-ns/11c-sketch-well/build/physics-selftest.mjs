// Physics self-test. Steps the same well builder the page uses.
// Run: node build/physics-selftest.mjs

import {
  createSim, removeTread, fixedStep, displacementReport, setFriction, lowestTreadBottom,
  DEFAULT_BUCKET_MASS,
} from '../src/well.js';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from '../src/physics-config.js';

const STEPS = 420;

function finiteReport(report) {
  return Number.isFinite(report.maxD) && Number.isFinite(report.farD);
}

function run({ friction, bucketMass, pullTread, label }) {
  const { world, bodies, contactMaterial } = createSim({ friction, bucketMass });
  setFriction(bodies, contactMaterial, friction);
  const stairBottom = lowestTreadBottom(bodies);
  if (pullTread) removeTread(world, bodies);
  let minBucketY = bodies.bucket.position.y;
  for (let i = 0; i < STEPS; i++) {
    fixedStep(world, bodies);
    if (bodies.bucket.position.y < minBucketY) minBucketY = bodies.bucket.position.y;
  }
  const report = displacementReport(bodies);
  console.log(
    `${label}: friction=${friction} treadRemoved=${!!pullTread} ` +
    `max structural=${report.maxD.toFixed(4)} m  bucketMinY=${minBucketY.toFixed(3)} stairBottom=${stairBottom.toFixed(3)} ` +
    `(far ${report.farName} ${report.farD.toFixed(3)} m, ${report.over} bodies >0.5m)`
  );
  return { report, minBucketY, stairBottom, bodies };
}

console.log(`--- well physics self-test (cannon-es, dt=${FIXED_DT}, iterations=${SOLVER_ITERATIONS}, stiffness=${CONTACT_STIFFNESS}, relaxation=${CONTACT_RELAXATION}) ---`);

const hold = run({
  friction: DEFAULT_FRICTION,
  bucketMass: DEFAULT_BUCKET_MASS,
  pullTread: false,
  label: 'default (should HOLD, bucket LOWERS past stair)',
});
const fall = run({
  friction: DEFAULT_FRICTION,
  bucketMass: DEFAULT_BUCKET_MASS,
  pullTread: true,
  label: 'tread removed (should DROP, whole spiral)',
});
const slip = run({
  friction: 0,
  bucketMass: DEFAULT_BUCKET_MASS,
  pullTread: false,
  label: 'block friction = 0 (bucket should STAY up)',
});

const farIsFar = fall.bodies.farInitial > fall.bodies.nearestInitial * 1.5;
const lowered = hold.minBucketY < hold.stairBottom - 0.05;
const holdOk = finiteReport(hold.report) && hold.report.maxD < 0.05 && lowered;
const fallOk = finiteReport(fall.report) && fall.report.over >= 3 && fall.report.farD > 0.4 && farIsFar;
const slipOk = slip.minBucketY > slip.stairBottom + 0.4 && hold.minBucketY < slip.minBucketY - 0.8;

console.log('\nSummary:');
console.log(`  hold threshold check: max structural ${hold.report.maxD.toFixed(4)} m ${holdOk ? 'PASS (<0.05m)' : 'FAIL'}`);
console.log(`  load travel check: bucket min y ${hold.minBucketY.toFixed(3)} m, stair bottom ${hold.stairBottom.toFixed(3)} m ${lowered ? 'PASS' : 'FAIL'}`);
console.log(`  collapse check: ${fall.report.over} bodies >0.5m, far ${fall.report.farName} (started ${fall.bodies.farInitial.toFixed(2)} m from tread, nearest ${fall.bodies.nearestInitial.toFixed(2)} m) moved ${fall.report.farD.toFixed(3)} m ${fallOk ? 'PASS' : 'FAIL'}`);
for (const row of fall.report.rows) {
  console.log(`    ${row.name}: ${row.d.toFixed(3)} m${row.far ? '  [far]' : ''}  (start ${row.fromRemoved.toFixed(2)} m from hub)`);
}
console.log(`  friction discrimination: friction=0 bucket min y ${slip.minBucketY.toFixed(3)} vs default ${hold.minBucketY.toFixed(3)} ${slipOk ? 'PASS (slider changes result)' : 'FAIL'}`);

const pass = holdOk && fallOk && slipOk;
console.log(pass ? 'OVERALL PASS' : 'OVERALL FAIL');
if (!pass) process.exit(1);
