// Kitchen chair geometry + physics builder.
//
// Constraint graph (why pulling ONE dowel folds the whole chair):
//   every part --weld-- dowel
// Seat, four legs, two rails, and the back are not stacked on each other
// and are not welded to each other. The dowel under the seat is the only
// hub. Feet touch the desk, so with the dowel in, the rigid frame stands
// and carries the book. Pull the dowel and every weld disappears together:
// the seat drops and the outward-leaning legs topple, including the leg
// farthest from the peg. No tween runs on removal -- removeDowel only
// deletes that body and its welds.
//
// The book is set onto the seat with a sideways speed. Joint friction is
// the wood contact friction: at the default the book stays on the seat;
// at zero it slides off.

import * as CANNON from 'cannon-es';
import {
  SOLVER_ITERATIONS, CONTACT_STIFFNESS, CONTACT_RELAXATION, DEFAULT_FRICTION, FIXED_DT,
} from './physics-config.js';

export const DEFAULT_BOOK_MASS = 7;

const G_STATIC = 1;
const G_STRUCT = 2;
const G_LOAD = 4;

const SEAT_Y = 1.02;
const SEAT_HALF = [0.28, 0.04, 0.24];
const LEAN = 0.24;

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

function makeBox(world, { mass, half, position, quat, material, group, mask, name, color, linDamp, angDamp }) {
  const body = new CANNON.Body({
    mass,
    material,
    allowSleep: false,
    linearDamping: linDamp ?? 0.05,
    angularDamping: angDamp ?? 0.12,
    collisionFilterGroup: group,
    collisionFilterMask: mask,
  });
  body.addShape(new CANNON.Box(new CANNON.Vec3(half[0], half[1], half[2])));
  body.position.set(position[0], position[1], position[2]);
  if (quat) body.quaternion.copy(quat);
  body.userData = { name, color, half, shape: 'box', removed: false };
  world.addBody(body);
  return body;
}

function placeLeg(world, material, name, topX, topZ) {
  const hx = 0.04;
  const hz = 0.04;
  const topY = SEAT_Y - SEAT_HALF[1] - 0.03;
  const hy = ((topY - 0.01) / Math.cos(LEAN)) / 2;
  const body = new CANNON.Body({
    mass: 5.5,
    material,
    allowSleep: false,
    linearDamping: 0.05,
    angularDamping: 0.1,
    collisionFilterGroup: G_STRUCT,
    collisionFilterMask: G_STATIC | G_LOAD,
  });
  body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
  const ox = Math.sign(topX) || 1;
  const oz = Math.sign(topZ) || 1;
  const axis = new CANNON.Vec3(-oz, 0, ox);
  axis.normalize();
  body.quaternion.setFromAxisAngle(axis, LEAN * (ox === oz ? 1 : 1));
  const topLocal = body.quaternion.vmult(new CANNON.Vec3(0, hy, 0));
  body.position.set(topX - topLocal.x, topY - topLocal.y, topZ - topLocal.z);
  let minY = Infinity;
  for (const x of [-hx, hx]) {
    for (const y of [-hy, hy]) {
      for (const z of [-hz, hz]) {
        const w = body.quaternion.vmult(new CANNON.Vec3(x, y, z));
        minY = Math.min(minY, body.position.y + w.y);
      }
    }
  }
  body.position.y += 0.008 - minY;
  body.userData = { name, color: 0x7a4e2c, half: [hx, hy, hz], shape: 'box', removed: false };
  world.addBody(body);
  return body;
}

export function createSim({ friction = DEFAULT_FRICTION, bookMass = DEFAULT_BOOK_MASS } = {}) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.solver.iterations = SOLVER_ITERATIONS;
  world.allowSleep = false;

  const material = new CANNON.Material('wood');
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
    mass: 0, half: [20, 0.5, 20], position: [0, -0.5, 0], material,
    group: G_STATIC, mask: G_STRUCT | G_LOAD, name: 'ground', color: 0x6b5344,
  });

  const seat = makeBox(world, {
    mass: 16, half: SEAT_HALF, position: [0, SEAT_Y, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'seat', color: 0x8d5a34,
  });

  const legFL = placeLeg(world, material, 'leg-fl', -0.18, 0.15);
  const legFR = placeLeg(world, material, 'leg-fr', 0.18, 0.15);
  const legBL = placeLeg(world, material, 'leg-bl', -0.18, -0.15);
  const legBR = placeLeg(world, material, 'leg-br', 0.18, -0.15);

  const railL = makeBox(world, {
    mass: 2.4, half: [0.03, 0.035, 0.12], position: [-0.24, 0.72, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'rail-l', color: 0x6e4428,
  });
  const railR = makeBox(world, {
    mass: 2.4, half: [0.03, 0.035, 0.12], position: [0.24, 0.72, 0], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'rail-r', color: 0x6e4428,
  });

  const back = makeBox(world, {
    mass: 7, half: [0.24, 0.34, 0.025], position: [0, 1.48, -0.32], material,
    group: G_STRUCT, mask: G_STATIC | G_LOAD, name: 'back', color: 0x7d5230,
  });

  // The dowel sits in the cavity under the seat, clear of every other part.
  // Front-left of center so the back-right leg is unambiguously the far body.
  const dowel = makeBox(world, {
    mass: 0.45, half: [0.035, 0.035, 0.07], position: [-0.1, 0.84, 0.06], material,
    group: G_STRUCT, mask: G_STATIC, name: 'dowel', color: 0xd2b48a,
  });

  const book = makeBox(world, {
    mass: bookMass, half: [0.13, 0.032, 0.095], position: [-0.04, 1.16, 0], material,
    group: G_LOAD, mask: G_STATIC | G_STRUCT, name: 'book', color: 0x243456,
    linDamp: 0.02, angDamp: 0.45,
  });
  book.velocity.set(0.72, -0.15, 0);
  book.userData.startX = book.position.x;
  book.userData.startY = book.position.y;

  const parts = [seat, legFL, legFR, legBL, legBR, railL, railR, back];
  const dowelWelds = parts.map((p) => weld(world, dowel, p));

  const structural = parts;
  for (const b of structural) b.userData.rest = b.position.clone();
  const far = markFar(structural, dowel.position);

  const visuals = [dowel, ...parts, book];
  const sketch = [];
  for (const b of visuals) sketch.push(...boxEdges(b));

  const bodies = {
    friction,
    dowelRemoved: false,
    ground, seat, dowel, book,
    legs: [legFL, legFR, legBL, legBR],
    rails: [railL, railR],
    back,
    structural, dowelWelds, contactMaterial,
    visuals, sketch,
    farInitial: far.farD,
    nearestInitial: far.nearD,
    seatHalfX: SEAT_HALF[0],
    seatHalfZ: SEAT_HALF[2],
  };
  return { world, bodies, contactMaterial };
}

export function removeDowel(world, bodies) {
  if (bodies.dowelRemoved) return;
  for (const c of bodies.dowelWelds) world.removeConstraint(c);
  world.removeBody(bodies.dowel);
  bodies.dowelRemoved = true;
  bodies.dowel.userData.removed = true;
  for (const b of bodies.structural) b.wakeUp();
  bodies.book.wakeUp();
}

export function setBookMass(bodies, mass) {
  bodies.book.mass = mass;
  bodies.book.updateMassProperties();
}

export function setFriction(bodies, contactMaterial, friction) {
  bodies.friction = friction;
  contactMaterial.friction = friction;
}

export function fixedStep(world, bodies) {
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

export function bookOnSeat(bodies) {
  const seat = bodies.seat;
  const book = bodies.book;
  const hx = bodies.seatHalfX - 0.13;
  const hz = bodies.seatHalfZ - 0.095;
  const on = Math.abs(book.position.x - seat.position.x) < hx + 0.04
    && Math.abs(book.position.z - seat.position.z) < hz + 0.04
    && book.position.y > seat.position.y
    && book.position.y < seat.position.y + 0.22;
  const traveled = Math.abs(book.position.x - book.userData.startX) > 0.06
    || (book.userData.startY - book.position.y) > 0.03;
  return { on, traveled, x: book.position.x, y: book.position.y, z: book.position.z };
}
