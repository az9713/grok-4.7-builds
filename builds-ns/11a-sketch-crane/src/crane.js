// Harbor crane geometry + physics builder.
// Used by the Node self-test and by the browser page, so the solver that
// passes on the command line is the solver the page runs.
//
// Constraint graph (why pulling ONE pin drops the whole crane):
//   static heel block --weld-- pin --weld-- mast --weld-- cab --weld-- jib
// The heel block stands BESIDE the mast, not under it. The pin is the only
// tie-down. Mast, cab, and jib stay welded to each other, so when the pin
// is pulled the unbalanced jib topples the entire frame. Nothing is
// keyframed: removePin only deletes that body and its two welds.
//
// The crate hangs from a trolley on a 1-DOF rail (linearFactor). Cable
// friction scales the friction-drive force. At the default it crosses the
// boom; at zero the drive slips and the crate stays put.

import * as CANNON from 'cannon-es';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from './physics-config.js';

export const CRATE_FAR_X = 3.15;
export const DEFAULT_CRATE_MASS = 80;

const G_STATIC = 1;
const G_STRUCT = 2;
const G_LOAD = 4;

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

function makeBox(world, { mass, half, position, material, group, mask, name, color, damping }) {
  const body = new CANNON.Body({
    mass,
    material,
    allowSleep: false,
    linearDamping: damping ?? 0.04,
    angularDamping: 0.08,
    collisionFilterGroup: group,
    collisionFilterMask: mask,
  });
  body.addShape(new CANNON.Box(new CANNON.Vec3(half[0], half[1], half[2])));
  body.position.set(position[0], position[1], position[2]);
  body.userData = { name, color, half, shape: 'box', removed: false };
  world.addBody(body);
  return body;
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

export function createSim({ friction = DEFAULT_FRICTION, crateMass = DEFAULT_CRATE_MASS } = {}) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.solver.iterations = SOLVER_ITERATIONS;
  world.allowSleep = false;

  const material = new CANNON.Material('crane');
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

  const ground = makeBox(world, {
    mass: 0, half: [40, 0.5, 40], position: [0, -0.5, 0], material,
    group: G_STATIC, mask: G_STRUCT | G_LOAD, name: 'ground', color: 0x6b5344,
  });

  // Heel block is beside the mast (x < -0.5). It never stands under the mast,
  // so it cannot catch the frame once the pin is gone.
  const heel = makeBox(world, {
    mass: 0, half: [0.2, 0.62, 0.32], position: [-0.86, 0.62, 0], material,
    group: G_STATIC, mask: G_STRUCT | G_LOAD, name: 'heel', color: 0x5c5348,
  });

  const pin = makeBox(world, {
    mass: 6, half: [0.14, 0.05, 0.05], position: [-0.42, 0.46, 0], material,
    group: G_STRUCT, mask: G_STATIC, name: 'pin', color: 0xd1a15a,
  });

  // Mast bottom sits 3cm off the quay. The pin, not the ground, holds it.
  const mast = makeBox(world, {
    mass: 240, half: [0.22, 2.15, 0.22], position: [0, 2.18, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'mast', color: 0x6d726c,
  });

  const cab = makeBox(world, {
    mass: 300, half: [0.58, 0.46, 0.52], position: [0.1, 4.86, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'cab', color: 0xb23a2f,
  });

  const jib = makeBox(world, {
    mass: 360, half: [2.05, 0.11, 0.16], position: [2.28, 5.5, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'jib', color: 0x8b9088,
  });

  const trolley = makeBox(world, {
    mass: 18, half: [0.16, 0.08, 0.14], position: [1.12, 5.28, 0], material,
    group: G_LOAD, mask: G_STATIC, name: 'trolley', color: 0x2a2a2a,
  });
  trolley.linearFactor.set(1, 0, 0);
  trolley.angularFactor.set(0, 0, 0);

  const crate = makeBox(world, {
    mass: crateMass, half: [0.36, 0.3, 0.36], position: [1.12, 3.22, 0], material,
    group: G_LOAD, mask: G_STATIC | G_STRUCT, name: 'crate', color: 0xc4a06a,
  });

  const cableLen = trolley.position.distanceTo(crate.position);
  const cable = stiffen(new CANNON.DistanceConstraint(trolley, crate, cableLen, 1e7), 1e7);
  world.addConstraint(cable);

  const pinWelds = [weld(world, heel, pin), weld(world, pin, mast)];
  const frameWelds = [weld(world, mast, cab), weld(world, cab, jib), weld(world, mast, jib)];

  const structural = [mast, cab, jib];
  for (const b of structural) b.userData.rest = b.position.clone();
  const far = markFar(structural, pin.position);

  const visuals = [heel, pin, mast, cab, jib, trolley, crate];
  const sketch = [];
  for (const b of visuals) sketch.push(...boxEdges(b));
  sketch.push([
    [trolley.position.x, trolley.position.y, trolley.position.z],
    [crate.position.x, crate.position.y + crate.userData.half[1], crate.position.z],
  ]);

  const bodies = {
    friction,
    pinRemoved: false,
    ground, heel, pin, mast, cab, jib, trolley, crate,
    structural, pinWelds, frameWelds, cable, contactMaterial,
    visuals, sketch,
    farInitial: far.farD,
    nearestInitial: far.nearD,
  };
  return { world, bodies, contactMaterial };
}

export function removePin(world, bodies) {
  if (bodies.pinRemoved) return;
  for (const c of bodies.pinWelds) world.removeConstraint(c);
  world.removeBody(bodies.pin);
  bodies.pinRemoved = true;
  bodies.pin.userData.removed = true;
  bodies.trolley.linearFactor.set(1, 1, 1);
  bodies.trolley.angularFactor.set(1, 1, 1);
  for (const b of bodies.structural) b.wakeUp();
  bodies.trolley.wakeUp();
  bodies.crate.wakeUp();
}

export function setCrateMass(bodies, mass) {
  bodies.crate.mass = mass;
  bodies.crate.updateMassProperties();
}

export function setFriction(bodies, contactMaterial, friction) {
  bodies.friction = friction;
  contactMaterial.friction = friction;
}

export function fixedStep(world, bodies) {
  if (!bodies.pinRemoved) {
    const trolley = bodies.trolley;
    if (trolley.position.x < CRATE_FAR_X + 0.45) {
      const drive = 520 * bodies.friction;
      trolley.applyForce(new CANNON.Vec3(drive, 0, 0), trolley.position);
      if (trolley.velocity.x > 1.8) trolley.velocity.x = 1.8;
    } else if (trolley.velocity.x > 0) {
      trolley.velocity.x *= 0.9;
    }
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
