// Shared cannon-es solver constants. The page (src/main.js) and the Node
// self-test (build/physics-selftest.mjs) both import this module, so the
// solver checked on the command line is the solver that runs live.
//
// These are the arch-bridge defaults: real-mass contacts need a much stiffer
// contact equation than cannon-es ships with, plus a long iteration count,
// or a locked assembly creeps. Retune only if a self-test shows these
// defaults cannot both hold the structure and still let it fall.
export const SOLVER_ITERATIONS = 150;
export const CONTACT_STIFFNESS = 2e10;
export const CONTACT_RELAXATION = 3;
export const DEFAULT_FRICTION = 0.65;
export const FIXED_DT = 1 / 120;
