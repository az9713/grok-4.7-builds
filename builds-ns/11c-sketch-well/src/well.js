// Spiral-stair well geometry + physics builder.
//
// Constraint graph (why removing ONE tread drops the whole spiral):
//   static socket --weld-- hub tread --weld-- every other tread
// Treads are not stacked. They do not touch, and none of them is welded
// to the socket except the hub. Pull that one tread and every spoke weld
// goes with it, so treads on the far side of the spiral fall too -- not
// only the neighbors of the gap. removeTread only deletes that body and
// its welds. Nothing is keyframed.
//
// A bucket hangs in the open shaft. Block friction is the windlass grip:
// the rope pays out in proportion to friction. At the default the bucket
// descends past the stair; at zero the drum slips and the bucket stays up.

import * as CANNON from 'cannon-es';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from './physics-config.js';

export const DEFAULT_BUCKET_MASS = 16;
export const TREAD_COUNT = 10;
export const HUB_INDEX = 2;

const G_STATIC = 1;
const G_STRUCT = 2;
const G_LOAD = 4;

const BASE_Y = 1.82;
const RISE = 0.3;
const RADIUS = 0.8;
const ANGLE0 = 0.35;
const D_ANGLE = (Math.PI * 2 * 0.8) / (TREAD_COUNT - 1);

function stiffen(constraint, maxForce) {
  // Equation.stiffness is not read by the solver. SPOOK params (a, b, eps)
  // are baked by setSpookParams, and they must use the same dt the world steps.
  for (const eq of constraint.equations) {
    eq.maxForce = maxForce;
    eq.minForce = -maxForce;
    eq.setSpookParams(CONTACT_STIFFNESS, CONTACT_RELAXATION, FIXED_DT);
  }
  return constraint;
}

function weld(world, a, b) {
  const c = new CANNON.LockConstraint(a, b, { maxForce: 1e8 });
  world.addConstraint(c);
  return stiffen(c, 1e8);
}

function markFar(structural, removedPos) {
  let farBody = null;
  let farD = -1;
  let nearD = Infinity;
  for (const b of structural) {
    const d = b.position.distanceTo(removedPos);
    b.userData.distFromRemoved = d;
    b.userData.far = false;
    if (d > farD) { farD = d; farBody = b; }
    if (d < nearD) nearD = d;
  }
  if (farBody) farBody.userData.far = true;
  return { farD, nearD };
}

function boxEdges(body) {
  const half = body.userData.half;
  const q = body.quaternion;
  const corners = [];
  for (const z of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const x of [-1, 1]) {
        const v = q.vmult(new CANNON.Vec3(x * half[0], y * half[1], z * half[2]));
        corners.push([body.position.x + v.x, body.position.y + v.y, body.position.z + v.z]);
      }
    }
  }
  const pairs = [[0, 1], [4, 5], [0, 4], [1, 5], [2, 3], [6, 7], [2, 6], [3, 7], [0, 2], [1, 3], [4, 6], [5, 7]];
  return pairs.map(([a, b]) => [corners[a], corners[b]]);
}

export function lowestTreadBottom(bodies) {
  let y = Infinity;
  for (const t of bodies.treads) {
    if (t.userData.removed) continue;
    const bottom = t.position.y - t.userData.half[1];
    if (bottom < y) y = bottom;
  }
  return y;
}

export function createSim({ friction = DEFAULT_FRICTION, bucketMass = DEFAULT_BUCKET_MASS } = {}) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.solver.iterations = SOLVER_ITERATIONS;
  world.allowSleep = false;

  const material = new CANNON.Material('stone');
  const contactMaterial = new CANNON.ContactMaterial(material, material, {
    friction,
    restitution: 0,
    contactEquationStiffness: CONTACT_STIFFNESS,
    contactEquationRelaxation: CONTACT_RELAXATION,
    frictionEquationStiffness: CONTACT_STIFFNESS,
    frictionEquationRelaxation: CONTACT_RELAXATION,
  });
  world.addContactMaterial(contactMaterial);
  const fallback = world.defaultContactMaterial;
  fallback.friction = friction;
  fallback.restitution = 0;
  fallback.contactEquationStiffness = CONTACT_STIFFNESS;
  fallback.contactEquationRelaxation = CONTACT_RELAXATION;
  fallback.frictionEquationStiffness = CONTACT_STIFFNESS;
  fallback.frictionEquationRelaxation = CONTACT_RELAXATION;

  const ground = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(30, 0.5, 30)),
    material,
    position: new CANNON.Vec3(0, -0.5, 0),
    collisionFilterGroup: G_STATIC,
    collisionFilterMask: G_STRUCT | G_LOAD,
  });
  ground.userData = { name: 'ground', half: [30, 0.5, 30], shape: 'box', color: 0x6b5344, removed: false };
  world.addBody(ground);

  const half = [0.34, 0.06, 0.14];
  const treads = [];
  for (let i = 0; i < TREAD_COUNT; i++) {
    const angle = ANGLE0 + i * D_ANGLE;
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    const radial = q.vmult(new CANNON.Vec3(1, 0, 0));
    const y = BASE_Y + i * RISE;
    const body = new CANNON.Body({
      mass: 32,
      material,
      allowSleep: false,
      linearDamping: 0.04,
      angularDamping: 0.08,
      collisionFilterGroup: G_STRUCT,
      collisionFilterMask: G_STATIC | G_STRUCT,
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(half[0], half[1], half[2])));
    body.position.set(radial.x * RADIUS, y, radial.z * RADIUS);
    body.quaternion.copy(q);
    const warm = i === HUB_INDEX ? 0xb08968 : 0x8d8678;
    body.userData = {
      name: i === HUB_INDEX ? 'tread-hub' : `tread-${i}`,
      color: warm,
      half,
      shape: 'box',
      removed: false,
      index: i,
    };
    world.addBody(body);
    treads.push(body);
  }

  const hub = treads[HUB_INDEX];
  const out = new CANNON.Vec3(hub.position.x, 0, hub.position.z);
  out.normalize();
  const socket = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(0.16, 0.16, 0.16)),
    position: new CANNON.Vec3(
      hub.position.x + out.x * 0.95,
      hub.position.y,
      hub.position.z + out.z * 0.95,
    ),
    collisionFilterGroup: G_STATIC,
    collisionFilterMask: G_STRUCT | G_LOAD,
  });
  socket.userData = { name: 'socket', half: [0.16, 0.16, 0.16], shape: 'box', color: 0x5e584e, removed: false };
  world.addBody(socket);

  const hubWelds = [weld(world, socket, hub)];
  for (let i = 0; i < treads.length; i++) {
    if (i === HUB_INDEX) continue;
    hubWelds.push(weld(world, hub, treads[i]));
  }

  const anchor = new CANNON.Body({
    mass: 0,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.08, 0.12)),
    position: new CANNON.Vec3(0, 5.45, 0),
    collisionFilterGroup: G_STATIC,
    collisionFilterMask: G_LOAD,
  });
  anchor.userData = { name: 'windlass', half: [0.12, 0.08, 0.12], shape: 'box', color: 0x4a453e, removed: false };
  world.addBody(anchor);

  const bucket = new CANNON.Body({
    mass: bucketMass,
    material,
    allowSleep: false,
    linearDamping: 0.02,
    angularDamping: 0.2,
    collisionFilterGroup: G_LOAD,
    collisionFilterMask: G_STATIC,
    shape: new CANNON.Cylinder(0.16, 0.14, 0.28, 10),
    position: new CANNON.Vec3(0, 4.72, 0),
  });
  bucket.linearFactor.set(0, 1, 0);
  bucket.angularFactor.set(0, 0, 0);
  bucket.userData = {
    name: 'bucket',
    color: 0x6a5138,
    shape: 'cyl',
    cyl: { rTop: 0.16, rBot: 0.14, h: 0.28 },
    half: [0.16, 0.14, 0.16],
    removed: false,
    startY: 4.72,
  };
  world.addBody(bucket);

  const ropeLen = anchor.position.distanceTo(bucket.position);
  const rope = stiffen(new CANNON.DistanceConstraint(anchor, bucket, ropeLen, 1e7), 1e7);
  world.addConstraint(rope);

  const structural = treads.filter((t) => t !== hub);
  for (const b of treads) b.userData.rest = b.position.clone();
  const far = markFar(structural, hub.position);

  const sketch = [];
  for (const b of [...treads, socket, anchor]) sketch.push(...boxEdges(b));
  sketch.push([
    [anchor.position.x, anchor.position.y, anchor.position.z],
    [bucket.position.x, bucket.position.y + 0.14, bucket.position.z],
  ]);

  // Circle of the well mouth, so the lift reads as a round shaft.
  const mouth = [];
  const mouthY = BASE_Y + (TREAD_COUNT - 1) * RISE + 0.45;
  for (let k = 0; k <= 20; k++) {
    const a0 = (k / 20) * Math.PI * 2;
    const a1 = ((k + 1) / 20) * Math.PI * 2;
    mouth.push([
      [Math.cos(a0) * 1.35, mouthY, Math.sin(a0) * 1.35],
      [Math.cos(a1) * 1.35, mouthY, Math.sin(a1) * 1.35],
    ]);
  }
  sketch.push(...mouth);

  const bodies = {
    friction,
    treadRemoved: false,
    ground, socket, anchor, bucket, hub, treads, rope,
    structural, hubWelds, contactMaterial,
    visuals: [...treads, socket, bucket],
    sketch,
    farInitial: far.farD,
    nearestInitial: far.nearD,
    ropeRate: 0.00915,
  };
  return { world, bodies, contactMaterial };
}

export function removeTread(world, bodies) {
  if (bodies.treadRemoved) return;
  for (const c of bodies.hubWelds) world.removeConstraint(c);
  world.removeBody(bodies.hub);
  bodies.treadRemoved = true;
  bodies.hub.userData.removed = true;
  for (const b of bodies.structural) b.wakeUp();
}

export function setBucketMass(bodies, mass) {
  bodies.bucket.mass = mass;
  bodies.bucket.updateMassProperties();
}

export function setFriction(bodies, contactMaterial, friction) {
  bodies.friction = friction;
  contactMaterial.friction = friction;
}

export function fixedStep(world, bodies) {
  const mu = Math.max(0, bodies.friction);
  if (mu > 0 && bodies.rope.distance < 6.2) {
    bodies.rope.distance += bodies.ropeRate * (mu / DEFAULT_FRICTION);
  }
  world.step(FIXED_DT);
}

export function displacementReport(bodies) {
  const rows = [];
  let maxD = 0;
  let over = 0;
  let farD = 0;
  let farName = '';
  for (const b of bodies.structural) {
    const d = b.position.distanceTo(b.userData.rest);
    rows.push({
      name: b.userData.name,
      d,
      far: !!b.userData.far,
      fromRemoved: b.userData.distFromRemoved,
    });
    if (d > maxD) maxD = d;
    if (d > 0.5) over += 1;
    if (b.userData.far) { farD = d; farName = b.userData.name; }
  }
  return { maxD, over, farD, farName, rows };
}
