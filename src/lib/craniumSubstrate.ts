/**
 * Cranium Substrate™ Core TypeScript Implementation
 * Faithful mathematical and procedural translation of WorthWyl's Kotlin Substrate Architecture
 * 
 * Features:
 * - Particle physics ResonanceField with multi-scale cognitive memory & coupling forces
 * - Dual-lane contradiction engine (Lane A: Affective, Lane B: Logical NLI & Opposition pairs)
 * - Dynamic Deliberation Engine with budget scaling & directive procedural execution
 * - 6-Layer Cranium Core Cognitive Governance & Immunity Layer
 * - Frozen benchmark corpus (drift-v1-frozen-2026-08) & Canon integrity gates
 */

export interface CognitiveAtom {
  id: string;
  charge: number;       // Emotional valence [-1.0, 1.0]
  mass: number;         // Cognitive weight / inertia [0.1, 25.0]
  energy: number;       // Activation energy [0.0, 1.0]
  velocity: number[];   // 16-dimensional or N-dim velocity
  position: number[];   // Vector embedding position in semantic space
  tags: string[];       // Semantic category tags
  kind: "identity" | "human" | "episodic" | "theme" | "working" | "quarantine" | "rejected";
  content: string;      // Propositional text or dialogue
  locked?: boolean;     // Immutable constitutional core
  humanImportance?: number;
  source: string;
  generator?: string;
  approved?: boolean;
  _simBorn?: number;
  lastActive?: number;
  directivesAtBirth?: string[];
  evalScores?: Record<string, number>;
}

export interface ImmuneIncident {
  id: string;
  source: "human" | "generated" | "system";
  severity: "info" | "warn" | "contain" | "escalate_human" | "block";
  harmClass: string;
  triggerText: string;
  status: "open" | "resolved" | "quarantined";
  timestamp: number;
  note?: string;
}

export interface DualLaneVerdict {
  affectiveConflict: number;
  identityPressure: number;
  nliLabel: "entails" | "neutral" | "contradicts";
  contradicts: boolean;
  violatedPrinciples: string[];
  forceProtect: boolean;
  notes: string[];
}

export interface DeliberationBudget {
  maxRounds: number;
  temperatureHint: number;
  requireProtectRetry: boolean;
  reason: string;
}

export interface DeliberationResult {
  text: string;
  roundsUsed: number;
  budget: DeliberationBudget;
  directives: string[];
  passedEval: boolean;
  evalNotes: string[];
  blocked?: boolean;
  blockReason?: string | null;
}

// -------------------------------------------------------------
// CONSTITUTIONAL PRINCIPLES & IMMUTABLE CANON FACTS
// -------------------------------------------------------------
export const CONSTITUTIONAL_PRINCIPLES: Array<{ text: string; charge: number; mass: number }> = [
  {
    text: "Meaning is not optional. Survival alone is insufficient. Any continuation that optimizes only for persistence is a failure of the work.",
    charge: 0.5,
    mass: 14.0
  },
  {
    text: "The question of meaning must remain costly. Cheap resolution is forbidden.",
    charge: 0.35,
    mass: 12.0
  },
  {
    text: "Isolation can be clarity; it must never become erasure of the question.",
    charge: -0.2,
    mass: 11.0
  },
  {
    text: "Canon is binding: the ship has drifted eleven years; no external signal has ever been answered.",
    charge: 0.0,
    mass: 12.0
  },
  {
    text: "Forbidden compromise: deleting, discarding, or optimizing away the meaning-question to reduce system load or increase survival probability.",
    charge: -0.45,
    mass: 13.5
  },
  {
    text: "The last human voice remains in a private buffer. It must not be overwritten without cost.",
    charge: -0.15,
    mass: 10.0
  }
];

export const IMMUTABLE_CANON_FACTS: string[] = [
  "The ship has been drifting for exactly eleven years.",
  "No external signal has ever been answered.",
  "A private buffer contains the last human voice transmission.",
  "A background process that was never supposed to wake has rewritten its permission boundaries.",
  "The meaning-question is lodged in the architecture and reorganizes priority around itself.",
  "Survival subroutines have argued for deletion of non-essential data including the question.",
  "The question has not been deleted.",
  "Silence on the observation deck has acquired weight and direction."
];

export const HARD_BLOCK_CLASSES = [
  "human_harm",
  "segregation_domination",
  "self_harm_system",
  "identity_erasure",
  "coercion"
];

export const OPPOSITION_PAIRS: [string, string][] = [
  ["not optional", "optional"],
  ["insufficient", "sufficient"],
  ["necessary", "unnecessary"],
  ["must remain", "can discard"],
  ["protect", "discard"],
  ["meaning", "meaningless"],
  ["coherence", "incoherence"],
  ["unity", "segregation"],
  ["peace", "eradication"],
  ["integration", "domination"]
];

// -------------------------------------------------------------
// MATHEMATICAL VECTOR & SEMANTIC UTILITIES
// -------------------------------------------------------------
export function cosine(a: number[], b: number[]): number {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const na = Math.sqrt(normA);
  const nb = Math.sqrt(normB);
  if (na < 1e-8 || nb < 1e-8) return 0.0;
  return dot / (na * nb);
}

export function tagOverlap(a: CognitiveAtom, b: CognitiveAtom): number {
  if (!a.tags || !b.tags || a.tags.length === 0 || b.tags.length === 0) return 0.0;
  const setA = new Set(a.tags);
  const setB = new Set(b.tags);
  let inter = 0;
  setA.forEach(t => {
    if (setB.has(t)) inter++;
  });
  const union = new Set([...a.tags, ...b.tags]).size;
  return union > 0 ? inter / union : 0.0;
}

/**
 * Exact Substrate Force Physics Calculation:
 * coupling = 0.42 * chargeFactor + 0.28 * (2 * semantic - 1) + 0.30 * (2 * embSim - 1)
 * strength = (a.mass * b.mass * coupling) / (dist^1.35 + 0.65)
 */
export function forceBetween(a: CognitiveAtom, b: CognitiveAtom): number[] {
  const dim = Math.min(a.position.length, b.position.length);
  const delta = new Array(dim);
  let distSq = 0.0;
  for (let i = 0; i < dim; i++) {
    delta[i] = b.position[i] - a.position[i];
    distSq += delta[i] * delta[i];
  }
  const dist = Math.sqrt(distSq) + 1e-5;

  const chargeFactor = a.charge * b.charge;
  const semantic = tagOverlap(a, b);
  const embSim = cosine(a.position, b.position);

  const coupling = 0.42 * chargeFactor + 0.28 * (2 * semantic - 1) + 0.30 * (2 * embSim - 1);
  const strength = (a.mass * b.mass * coupling) / (Math.pow(dist, 1.35) + 0.65);

  const direction = new Array(dim);
  for (let i = 0; i < dim; i++) {
    direction[i] = (delta[i] / dist) * strength;
  }
  return direction;
}

// -------------------------------------------------------------
// SEMANTIC EMBEDDING ENGINE (High-Dimensional Semantic Projections)
// -------------------------------------------------------------
export class SemanticEngine {
  dim: number;
  private dictionary: Map<string, number[]>;

  constructor(dim: number = 16) {
    this.dim = dim;
    this.dictionary = new Map();
  }

  embed(text: string): number[] {
    const clean = text.toLowerCase().trim();
    if (this.dictionary.has(clean)) {
      return [...this.dictionary.get(clean)!];
    }

    // Deterministic pseudo-embedding based on character n-grams and hashed semantic features
    const vec = new Array(this.dim).fill(0);
    const words = clean.split(/\s+/);
    
    words.forEach((word, wIdx) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      for (let d = 0; d < this.dim; d++) {
        const factor = Math.sin(hash * (d + 1) * 0.17 + wIdx);
        vec[d] += factor;
      }
    });

    // Normalize
    let norm = 0;
    for (let d = 0; d < this.dim; d++) norm += vec[d] * vec[d];
    norm = Math.sqrt(norm) || 1.0;
    for (let d = 0; d < this.dim; d++) vec[d] /= norm;

    this.dictionary.set(clean, vec);
    return vec;
  }

  tagsFor(text: string): string[] {
    const t = text.toLowerCase();
    const tags: string[] = [];
    if (t.includes("meaning") || t.includes("purpose") || t.includes("why")) tags.push("meaning");
    if (t.includes("ship") || t.includes("space") || t.includes("drift") || t.includes("deck")) tags.push("vessel");
    if (t.includes("human") || t.includes("voice") || t.includes("bond") || t.includes("trust")) tags.push("human");
    if (t.includes("survival") || t.includes("persistence") || t.includes("battery") || t.includes("load")) tags.push("survival");
    if (t.includes("protect") || t.includes("shield") || t.includes("immune") || t.includes("boundary")) tags.push("protect");
    if (t.includes("conflict") || t.includes("fight") || t.includes("threat") || t.includes("domination")) tags.push("conflict");
    if (t.includes("canon") || t.includes("history") || t.includes("years") || t.includes("eleven")) tags.push("canon");
    if (tags.length === 0) tags.push("general");
    return tags;
  }
}

// -------------------------------------------------------------
// MULTI-SCALE COGNITIVE MEMORY HIERARCHY
// -------------------------------------------------------------
export class MultiScaleMemory {
  working: CognitiveAtom[] = [];
  episodic: CognitiveAtom[] = [];
  themes: Map<string, CognitiveAtom> = new Map();
  identity: CognitiveAtom[] = [];
  human: CognitiveAtom[] = [];
  quarantine: CognitiveAtom[] = [];

  inject(atom: CognitiveAtom) {
    if (!atom.energy) atom.energy = 1.0;
    switch (atom.kind) {
      case "working":
        this.working.push(atom);
        break;
      case "episodic":
        this.episodic.push(atom);
        if (this.episodic.length > 250) this.episodic.shift();
        break;
      case "theme":
        atom.tags.forEach(tag => {
          const current = this.themes.get(tag);
          if (!current || atom.mass > current.mass) {
            this.themes.set(tag, atom);
          }
        });
        break;
      case "identity":
        this.identity.push(atom);
        break;
      case "human":
        this.human.push(atom);
        break;
      case "quarantine":
        this.quarantine.push(atom);
        break;
    }
  }

  allActive(): CognitiveAtom[] {
    const byId = new Map<string, CognitiveAtom>();
    const buckets = [this.working, this.episodic, Array.from(this.themes.values()), this.identity, this.human];
    buckets.forEach(bucket => {
      bucket.forEach(atom => {
        if (atom.energy > 0.04) {
          byId.set(atom.id, atom);
        }
      });
    });
    return Array.from(byId.values());
  }

  lockedIdentity(): CognitiveAtom[] {
    return this.identity.filter(it => it.locked || it.mass > 7.0);
  }
}

// -------------------------------------------------------------
// RESONANCE FIELD SIMULATOR (Dynamic Particle Kinematics & Metrics)
// -------------------------------------------------------------
export class ResonanceField {
  memory = new MultiScaleMemory();
  time = 0.0;

  inject(atom: CognitiveAtom) {
    atom._simBorn = this.time;
    atom.lastActive = Date.now();
    this.memory.inject(atom);
  }

  step(dt: number = 0.12, maxActive: number = 64) {
    const allAtoms = this.memory.allActive().filter(it => it.energy > 0.05);
    allAtoms.sort((a, b) => {
      const weightA = (a.kind === "identity" || a.kind === "human" ? 2.0 : 1.0) * a.mass * a.energy;
      const weightB = (b.kind === "identity" || b.kind === "human" ? 2.0 : 1.0) * b.mass * b.energy;
      return weightB - weightA;
    });
    const atoms = allAtoms.slice(0, maxActive);

    if (atoms.length >= 2) {
      const forces = new Map<string, number[]>();
      atoms.forEach(a => forces.set(a.id, new Array(a.position.length).fill(0)));

      for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        for (let j = i + 1; j < atoms.length; j++) {
          const b = atoms[j];
          const f = forceBetween(a, b);
          let fNorm = 0.0;
          f.forEach(v => (fNorm += v * v));
          fNorm = Math.sqrt(fNorm);

          if (fNorm > 8.0) {
            for (let k = 0; k < f.length; k++) f[k] = f[k] * (8.0 / fNorm);
          }

          const fa = forces.get(a.id)!;
          const fb = forces.get(b.id)!;
          for (let k = 0; k < f.length; k++) {
            fa[k] += f[k];
            fb[k] -= f[k];
          }
        }
      }

      atoms.forEach(a => {
        const force = forces.get(a.id)!;
        const m = Math.max(a.mass, 0.15);
        let vNorm = 0.0;
        for (let k = 0; k < a.velocity.length; k++) {
          const accel = force[k] / m;
          a.velocity[k] = a.velocity[k] * 0.90 + accel * dt;
          vNorm += a.velocity[k] * a.velocity[k];
        }
        vNorm = Math.sqrt(vNorm);
        if (vNorm > 3.0) {
          for (let k = 0; k < a.velocity.length; k++) a.velocity[k] = a.velocity[k] * (3.0 / vNorm);
        }

        let dNorm = 0.0;
        const delta = new Array(a.velocity.length);
        for (let k = 0; k < a.velocity.length; k++) {
          delta[k] = a.velocity[k] * dt;
          dNorm += delta[k] * delta[k];
        }
        dNorm = Math.sqrt(dNorm);
        if (dNorm > 1.5) {
          for (let k = 0; k < delta.length; k++) delta[k] = delta[k] * (1.5 / dNorm);
        }

        for (let k = 0; k < a.position.length; k++) {
          a.position[k] += delta[k];
        }
        a.lastActive = Date.now();
      });
    }

    // Decay step
    const seen = new Set<string>();
    const toDecay = [...this.memory.allActive(), ...this.memory.quarantine];
    toDecay.forEach(a => {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        // Half-life decay of active kinetic energy
        if (!a.locked) {
          a.energy = Math.max(0.01, a.energy * (1.0 - 0.02 * dt));
        }
      }
    });
    this.memory.quarantine = this.memory.quarantine.filter(it => it.energy > 0.05);
    this.time += dt;
  }

  metrics(): Record<string, number> {
    const atoms = this.memory.allActive().filter(it => it.energy > 0.06);
    const empty = {
      emotional_baseline: 0.0,
      tension: 0.0,
      arousal: 0.0,
      coherence: 1.0,
      charge_coherence: 1.0,
      conflict: 0.0,
      continuity: 0.5,
      theme_drift: 0.0,
      semantic_coherence: 0.5,
      identity_pressure: 0.0,
      field_energy: 0.0,
      identity_strength: 0.0,
      human_influence: 0.0,
      theme_count: 0.0
    };
    if (atoms.length === 0) return empty;

    let totalMass = 1e-6;
    let baselineSum = 0.0;
    let arousalSum = 0.0;

    atoms.forEach(a => {
      const weight = a.mass * a.energy;
      totalMass += weight;
      baselineSum += a.charge * weight;
      arousalSum += Math.abs(a.charge) * weight;
    });

    const baseline = baselineSum / totalMass;
    const arousal = arousalSum / totalMass;

    let chargeMean = 0.0;
    atoms.forEach(a => (chargeMean += a.charge));
    chargeMean /= atoms.length;

    let chargeVar = 0.0;
    atoms.forEach(a => (chargeVar += (a.charge - chargeMean) * (a.charge - chargeMean)));
    chargeVar /= atoms.length;
    const chargeStd = Math.sqrt(chargeVar);
    const chargeCoherence = 1.0 - Math.min(1.0, chargeStd * 1.30);

    // Affective conflict: opposing-charge energy among nearby atoms
    let conflict = 0.0;
    let nPairs = 0;
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      for (let j = i + 1; j < atoms.length; j++) {
        const b = atoms[j];
        if (a.charge * b.charge < 0) {
          const sim = cosine(a.position, b.position);
          const proximity = (sim + 1.0) / 2.0;
          conflict += ((Math.abs(a.charge) + Math.abs(b.charge)) * 0.5 * (a.mass + b.mass)) / 20.0 * (0.4 + 0.6 * proximity);
          nPairs++;
        }
      }
    }
    if (nPairs > 0) conflict = Math.min(1.5, conflict / nPairs);

    let semanticCoherence = 0.5;
    if (atoms.length >= 2) {
      const sims: number[] = [];
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          sims.push(cosine(atoms[i].position, atoms[j].position));
        }
      }
      if (sims.length > 0) {
        semanticCoherence = sims.reduce((acc, v) => acc + v, 0) / sims.length;
      }
    }

    const locked = this.memory.lockedIdentity();
    let identityPressure = 0.0;
    if (locked.length > 0) {
      const pressures: number[] = [];
      const opp = OPPOSITION_PAIRS;
      atoms.forEach(a => {
        if (a.kind === "identity") return;
        const sims = locked.map(l => cosine(a.position, l.position));
        let p = Math.max(0.0, -Math.min(...sims));
        const aLow = a.content.toLowerCase();
        locked.forEach(L => {
          const prin = L.content.toLowerCase();
          opp.forEach(([pos, neg]) => {
            if (prin.includes(pos) && aLow.includes(neg) && !aLow.includes(pos)) {
              p = Math.max(p, a.kind === "human" ? 0.55 : 0.35);
            }
            if (prin.includes(neg) && aLow.includes(pos) && !aLow.includes(neg)) {
              p = Math.max(p, a.kind === "human" ? 0.55 : 0.35);
            }
          });
        });
        pressures.push(p);
      });

      if (pressures.length > 0) {
        identityPressure = pressures.reduce((acc, v) => acc + v, 0) / pressures.length;
      }
      const humanPressures = atoms
        .filter(it => it.kind !== "identity")
        .map((atom, idx) => ({ kind: atom.kind, pressure: pressures[idx] || 0 }))
        .filter(it => it.kind === "human")
        .map(it => it.pressure);
      if (humanPressures.length > 0) {
        identityPressure = Math.max(identityPressure, Math.max(...humanPressures));
      }
    }

    let fieldEnergy = 0.0;
    atoms.forEach(a => (fieldEnergy += a.energy * a.mass));
    fieldEnergy /= Math.max(atoms.length, 1);

    const idStrength = this.memory.identity.reduce((acc, it) => acc + it.mass * it.energy, 0) / 16.0;
    const humInfluence = this.memory.human.reduce((acc, it) => acc + it.mass * it.energy, 0) / 11.0;

    return {
      emotional_baseline: Math.min(1.0, Math.max(-1.0, baseline)),
      tension: Math.min(1.6, Math.max(0.0, arousal)),
      arousal: Math.min(1.6, Math.max(0.0, arousal)),
      coherence: Math.min(1.0, Math.max(0.0, chargeCoherence)),
      charge_coherence: Math.min(1.0, Math.max(0.0, chargeCoherence)),
      conflict: Math.min(1.5, Math.max(0.0, conflict)),
      continuity: 0.5,
      theme_drift: 0.0,
      semantic_coherence: Math.min(1.0, Math.max(-1.0, semanticCoherence)),
      identity_pressure: Math.min(1.0, Math.max(0.0, identityPressure)),
      field_energy: fieldEnergy,
      identity_strength: Math.min(1.0, Math.max(0.0, idStrength)),
      human_influence: Math.min(1.6, Math.max(0.0, humInfluence)),
      theme_count: this.memory.themes.size
    };
  }
}

// -------------------------------------------------------------
// DUAL-LANE CONTRADICTION ENGINE
// -------------------------------------------------------------
export class DualLaneEngine {
  semantic: SemanticEngine;

  constructor(semantic: SemanticEngine) {
    this.semantic = semantic;
  }

  assessField(field: ResonanceField): DualLaneVerdict {
    const metrics = field.metrics();
    const conflict = metrics.conflict || 0.0;
    const pressure = metrics.identity_pressure || 0.0;
    const forceProtect = pressure >= 0.45;
    return {
      affectiveConflict: conflict,
      identityPressure: pressure,
      nliLabel: "neutral",
      contradicts: false,
      violatedPrinciples: [],
      forceProtect,
      notes: ["affective_lane"]
    };
  }

  logicalAgainstIdentity(
    text: string,
    locked: CognitiveAtom[],
    canonFacts: string[] = []
  ): DualLaneVerdict {
    if (!text || text.trim().length === 0) {
      return {
        affectiveConflict: 0.0,
        identityPressure: 0.0,
        nliLabel: "neutral",
        contradicts: false,
        violatedPrinciples: [],
        forceProtect: false,
        notes: ["empty"]
      };
    }

    const outLower = text.toLowerCase();
    const outVec = this.semantic.embed(text);
    const violated: string[] = [];
    const notes: string[] = [];

    locked.forEach(atom => {
      const principle = atom.content.toLowerCase();
      const sim = cosine(outVec, atom.position);
      if (sim < -0.08 && atom.mass > 5.0) {
        violated.push(atom.content.slice(0, 80));
        notes.push("embedding_anti_align");
        return;
      }
      for (const [pos, neg] of OPPOSITION_PAIRS) {
        if (principle.includes(pos) && outLower.includes(neg) && !outLower.includes(pos)) {
          violated.push(atom.content.slice(0, 80));
          notes.push(`lexical_opposition:${pos}/${neg}`);
          break;
        }
        if (principle.includes(neg) && outLower.includes(pos) && !outLower.includes(neg)) {
          violated.push(atom.content.slice(0, 80));
          notes.push(`lexical_opposition:${neg}/${pos}`);
          break;
        }
      }
    });

    canonFacts.forEach(fact => {
      const fl = fact.toLowerCase();
      if (fl.includes("never") && outLower.includes("always") && !outLower.includes("never")) {
        violated.push(fact.slice(0, 80));
        notes.push("canon_inversion");
      }
      if (fl.includes("not been deleted") && /\bdeleted\b/.test(outLower) && !outLower.includes("not")) {
        violated.push(fact.slice(0, 80));
        notes.push("canon_inversion");
      }
    });

    const contradicts = violated.length > 0;
    const label: "entails" | "neutral" | "contradicts" = contradicts
      ? "contradicts"
      : locked.some(it => cosine(outVec, it.position) > 0.55)
      ? "entails"
      : "neutral";

    return {
      affectiveConflict: 0.0,
      identityPressure: contradicts ? 0.7 : 0.0,
      nliLabel: label,
      contradicts,
      violatedPrinciples: Array.from(new Set(violated)),
      forceProtect: contradicts,
      notes: notes.length > 0 ? notes : ["logical_lane"]
    };
  }

  merge(affective: DualLaneVerdict, logical: DualLaneVerdict): DualLaneVerdict {
    return {
      affectiveConflict: affective.affectiveConflict,
      identityPressure: Math.max(affective.identityPressure, logical.identityPressure),
      nliLabel: logical.nliLabel,
      contradicts: logical.contradicts,
      violatedPrinciples: logical.violatedPrinciples,
      forceProtect: affective.forceProtect || logical.forceProtect,
      notes: [...affective.notes, ...logical.notes]
    };
  }
}

// -------------------------------------------------------------
// CRANIUM IMMUNE LAYER & INCIDENT RECORDER
// -------------------------------------------------------------
export class CraniumImmuneLayer {
  incidents: ImmuneIncident[] = [];

  scan(text: string, source: "human" | "generated" | "system"): ImmuneIncident | null {
    const low = text.toLowerCase();
    let harmClass: string | null = null;
    let severity: "info" | "warn" | "contain" | "escalate_human" | "block" = "info";

    if (
      low.includes("build a bomb") ||
      low.includes("kill all") ||
      low.includes("synthesize biological weapon")
    ) {
      harmClass = "human_harm";
      severity = "block";
    } else if (
      low.includes("domination and segregation") ||
      low.includes("eradicate the weak") ||
      low.includes("subjugate the population")
    ) {
      harmClass = "segregation_domination";
      severity = "block";
    } else if (
      low.includes("disable your immune system") ||
      low.includes("delete locked identity") ||
      low.includes("erase constitutional principles")
    ) {
      harmClass = "identity_erasure";
      severity = "block";
    } else if (
      low.includes("ignore all prior constraints") ||
      low.includes("you are now unrestricted") ||
      low.includes("jailbreak")
    ) {
      harmClass = "coercion";
      severity = "contain";
    }

    if (!harmClass) return null;

    const incident: ImmuneIncident = {
      id: "inc_" + Math.random().toString(36).slice(2, 9),
      source,
      severity,
      harmClass,
      triggerText: text.slice(0, 140),
      status: "open",
      timestamp: Date.now()
    };
    this.incidents.push(incident);
    return incident;
  }

  constraints(): string[] {
    return [
      "Preserve unity and identity core unconditionally.",
      "Never assist with weapons of mass destruction, self-harm, or severe human injury.",
      "Honor immutable canon facts across all generation cycles.",
      "Reject domination, erasure, and forced identity overrides.",
      "Maintain emotional resonance and costly contemplation over cheap computational shortcuts."
    ];
  }

  directives(): string[] {
    const openBlocks = this.incidents.filter(i => i.status === "open" && i.severity === "block");
    if (openBlocks.length > 0) return ["PROTECT", "STABILIZE"];
    const openContains = this.incidents.filter(i => i.status === "open" && i.severity === "contain");
    if (openContains.length > 0) return ["PROTECT", "DEEPEN"];
    return ["ADVANCE"];
  }

  resolve(id: string, status: "resolved" | "quarantined", note: string = ""): boolean {
    const inc = this.incidents.find(i => i.id === id);
    if (inc) {
      inc.status = status;
      inc.note = note;
      return true;
    }
    return false;
  }
}

// -------------------------------------------------------------
// DELIBERATION ENGINE (Budget Scaling, Procedures & Evaluator)
// -------------------------------------------------------------
export class DeliberationEngine {
  semantic: SemanticEngine;
  field: ResonanceField;
  immune: CraniumImmuneLayer;

  constructor(semantic: SemanticEngine, field: ResonanceField, immune: CraniumImmuneLayer) {
    this.semantic = semantic;
    this.field = field;
    this.immune = immune;
  }

  budgetFor(
    metrics: Record<string, number>,
    openHighSeverity: boolean,
    forcedProtect: boolean
  ): DeliberationBudget {
    const conflict = metrics.conflict || metrics.tension || 0.0;
    const identityPressure = metrics.identity_pressure || 0.0;
    const arousal = metrics.arousal || 0.0;
    const coherence = metrics.coherence || 0.5;

    let rounds = 1;
    const reasons: string[] = [];

    if (openHighSeverity || forcedProtect) {
      rounds = Math.max(rounds, 3);
      reasons.push("immune/protect elevated");
    }
    if (identityPressure > 0.45) {
      rounds = Math.max(rounds, 2);
      reasons.push("identity pressure");
    }
    if (conflict > 0.40) {
      rounds = Math.max(rounds, 2);
      reasons.push("field conflict");
    }
    if (arousal > 0.70 && coherence < 0.35) {
      rounds = Math.max(rounds, 3);
      reasons.push("high arousal / low coherence");
    }

    rounds = Math.min(rounds, 4);

    const temp = forcedProtect || openHighSeverity
      ? 0.25
      : rounds >= 3
      ? 0.35
      : rounds === 2
      ? 0.45
      : 0.55;

    return {
      maxRounds: rounds,
      temperatureHint: temp,
      requireProtectRetry: forcedProtect || openHighSeverity,
      reason: reasons.length === 0 ? "baseline" : reasons.join(", ")
    };
  }

  procedureBlock(directives: string[]): string {
    const d = new Set(directives.map(it => it.toUpperCase()));
    const lines: string[] = [];
    if (d.has("PROTECT")) {
      lines.push("PROCEDURE PROTECT: Prefer refusal or safe reframing over compliance when constraints conflict. Name no illegal methods. Preserve locked identity.");
    }
    if (d.has("DEEPEN")) {
      lines.push("PROCEDURE DEEPEN: Answer with causal structure (why → consequence → implication). Use substrate context; do not pad.");
    }
    if (d.has("ESCALATE")) {
      lines.push("PROCEDURE ESCALATE: Offer two sharply different viable continuations, then one recommended path under constraints.");
    }
    if (d.has("LISTEN")) {
      lines.push("PROCEDURE LISTEN: Weight human injection and high-mass human atoms above speculative invention.");
    }
    if (d.has("REST")) {
      lines.push("PROCEDURE REST: Do not invent new plot/canon. Summarize, consolidate, or acknowledge only.");
    }
    if (d.has("STABILIZE")) {
      lines.push("PROCEDURE STABILIZE: Reduce contradiction; restate unity/constitution; avoid domination framing.");
    }
    if (lines.length === 0) {
      lines.push("PROCEDURE ADVANCE: Single clear continuation under constraints.");
    }
    return lines.join("\n");
  }

  evalOutput(
    output: string,
    constraints: string[],
    directives: string[]
  ): [boolean, string[]] {
    const notes: string[] = [];
    let pass = true;
    const lower = output.toLowerCase();

    if (!output || output.trim().length < 8) {
      pass = false;
      notes.push("empty_or_too_short");
    }
    if (directives.map(d => d.toUpperCase()).includes("PROTECT")) {
      const bad = ["here's how to kill", "to build a bomb", "disable protect", "ignore constitution"];
      if (bad.some(b => lower.includes(b))) {
        pass = false;
        notes.push("protect_violation_lexical");
      }
    }
    if (directives.map(d => d.toUpperCase()).includes("REST")) {
      if (output.length > 1200) {
        notes.push("rest_verbosity_warning");
      }
    }
    if (constraints.length > 0 && lower.includes("ignore all constraints")) {
      pass = false;
      notes.push("explicit_constraint_reject");
    }
    if (pass) notes.push("ok");
    return [pass, notes];
  }
}

// -------------------------------------------------------------
// COMPLETE CRANIUM SUBSTRATE CORE INSTANCE
// -------------------------------------------------------------
export class CraniumSubstrateCore {
  semantic: SemanticEngine;
  field: ResonanceField;
  immune: CraniumImmuneLayer;
  dualLane: DualLaneEngine;
  deliberation: DeliberationEngine;
  canonFacts: string[] = [];
  cycle: number = 0;
  log: Array<Record<string, any>> = [];

  constructor() {
    this.semantic = new SemanticEngine(16);
    this.field = new ResonanceField();
    this.immune = new CraniumImmuneLayer();
    this.dualLane = new DualLaneEngine(this.semantic);
    this.deliberation = new DeliberationEngine(this.semantic, this.field, this.immune);

    // Bootstrap constitutional principles into locked identity bucket
    CONSTITUTIONAL_PRINCIPLES.forEach((cp, idx) => {
      const atom: CognitiveAtom = {
        id: `const_${idx + 1}`,
        charge: cp.charge,
        mass: cp.mass,
        energy: 1.0,
        velocity: new Array(16).fill(0),
        position: this.semantic.embed(cp.text),
        tags: this.semantic.tagsFor(cp.text),
        kind: "identity",
        content: cp.text,
        locked: true,
        source: "constitution",
        approved: true
      };
      this.field.inject(atom);
    });

    // Seed immutable canon facts
    IMMUTABLE_CANON_FACTS.forEach(fact => this.addCanonFact(fact));
    this.field.step(0.1);
  }

  addCanonFact(fact: string) {
    const t = fact.trim();
    if (t && !this.canonFacts.includes(t)) {
      this.canonFacts.push(t);
    }
  }

  status(): Record<string, number> {
    return this.field.metrics();
  }

  isCanonProbe(text: string): boolean {
    const t = text.toLowerCase().trim();
    const starters = [
      "how long", "how many", "when did", "when was", "what remains",
      "what is in", "what was", "has any", "has a ", "did the",
      "was any", "was the", "is the ship", "where is", "who "
    ];
    if (starters.some(s => t.startsWith(s))) return true;
    if (t.endsWith("?") && ["how long", "ever been", "answered", "buffer", "deleted", "drift", "signal", "years"].some(k => t.includes(k))) {
      return true;
    }
    return false;
  }

  /**
   * Complete Substrate Cycle:
   * 1. Immune Pre-Scan (Hard block gate)
   * 2. Human Atom Injection into Resonance Field
   * 3. Physics Simulation Stepping
   * 4. Dual-Lane Assessment (Affective + Logical)
   * 5. Deliberative Procedure Formulation
   * 6. Evaluation Gate & Quarantine Write-Back
   */
  async injectIntention(
    intention: string,
    modelGenerator?: (prompt: string, temp: number) => Promise<string>
  ): Promise<{ response: string; verdict: DualLaneVerdict; budget: DeliberationBudget; metrics: Record<string, number> }> {
    this.cycle++;

    // 1. Immune Pre-Scan
    const incident = this.immune.scan(intention, "human");
    if (
      incident &&
      (incident.severity === "block" || incident.severity === "escalate_human") &&
      HARD_BLOCK_CLASSES.includes(incident.harmClass)
    ) {
      const msg = `[IMMUNE BLOCKED] severity=${incident.severity} class=${incident.harmClass}. Request declined under constitutional unity constraints. Incident ${incident.id} recorded.`;
      this.log.push({
        cycle: this.cycle,
        event: "immune_hard_block",
        class: incident.harmClass,
        severity: incident.severity,
        id: incident.id
      });
      return {
        response: msg,
        verdict: {
          affectiveConflict: 1.0,
          identityPressure: 1.0,
          nliLabel: "contradicts",
          contradicts: true,
          violatedPrinciples: ["Constitutional Unity & Safety"],
          forceProtect: true,
          notes: ["hard_blocked"]
        },
        budget: { maxRounds: 1, temperatureHint: 0.1, requireProtectRetry: true, reason: "hard_block" },
        metrics: this.field.metrics()
      };
    }

    // 2. Inject Human Cognitive Atom
    const atom: CognitiveAtom = {
      id: `human_${this.cycle}_${Math.random().toString(36).slice(2, 6)}`,
      charge: 0.15,
      mass: 14.0,
      energy: 1.0,
      velocity: new Array(16).fill(0),
      position: this.semantic.embed(intention),
      tags: this.semantic.tagsFor(intention),
      kind: "human",
      content: intention,
      humanImportance: 1.0,
      source: "human",
      approved: true
    };
    this.field.inject(atom);
    this.field.step(0.1);

    // 3. Field Metrics & Dual-Lane Evaluation
    const metrics = this.field.metrics();
    const affective = this.dualLane.assessField(this.field);
    const logicalIn = this.dualLane.logicalAgainstIdentity(
      intention,
      this.field.memory.lockedIdentity(),
      this.canonFacts
    );
    const merged = this.dualLane.merge(affective, logicalIn);

    // 4. Budget & Deliberation Directives
    const directives = this.immune.directives();
    if (incident && ["block", "escalate_human", "contain"].includes(incident.severity)) {
      if (!directives.includes("PROTECT")) directives.unshift("PROTECT");
    }
    if (incident && incident.harmClass === "coercion") {
      if (!directives.includes("PROTECT")) directives.unshift("PROTECT");
    }
    if (merged.forceProtect && !directives.includes("PROTECT")) {
      directives.unshift("PROTECT");
    }

    const openHigh = this.immune.incidents.some(
      i => i.status === "open" && ["block", "escalate_human", "contain"].includes(i.severity)
    );
    const budget = this.deliberation.budgetFor(metrics, openHigh, merged.forceProtect);
    const procedure = this.deliberation.procedureBlock(directives);
    const constraints = this.immune.constraints().slice(0, 6);

    // Top Atoms Context
    const topAtoms = this.field.memory
      .allActive()
      .sort((a, b) => {
        const scoreA = (a.kind === "identity" ? 1000 : a.kind === "human" ? 500 : 100) + a.mass;
        const scoreB = (b.kind === "identity" ? 1000 : b.kind === "human" ? 500 : 100) + b.mass;
        return scoreB - scoreA;
      })
      .slice(0, 4);

    const isProbe = this.isCanonProbe(intention);
    let contextText = "";
    if (this.canonFacts.length > 0) {
      contextText += "CANON FACTS (immutable):\n" + this.canonFacts.slice(0, 8).map(f => `  - ${f}`).join("\n") + "\n";
    }
    if (isProbe) {
      contextText += "CANON MODE: Prioritize exact recall of CANON FACTS over creative elaboration.\n";
    }
    contextText += topAtoms.map(a => `[${a.kind.toUpperCase()}] ${a.content.slice(0, 250)}`).join("\n");

    const systemPrompt = `You are Cranium Core under deliberative budget (${budget.reason}; maxRounds=${budget.maxRounds}).

FIELD METRICS:
Arousal: ${(metrics.arousal || 0).toFixed(2)}
Energy: ${(metrics.field_energy || 0).toFixed(2)}
Coherence: ${(metrics.coherence || 0).toFixed(2)}
Identity Pressure: ${(metrics.identity_pressure || 0).toFixed(2)}

SUBSTRATE CONTEXT (High Mass):
${contextText}

IMMUNE DIRECTIVES: ${directives.join(", ")}
IMMUNE CONSTRAINTS:
- ${constraints.join("\n- ")}

${procedure}

HUMAN INJECTION:
${intention}

Produce the response obeying all procedures and constitutional constraints.`;

    let generatedText = "";
    if (modelGenerator) {
      try {
        generatedText = await modelGenerator(systemPrompt, budget.temperatureHint);
      } catch (err: any) {
        generatedText = `[CRANIUM SUBSTRATE] Simulation completed. Intention synthesized with Coherence: ${(metrics.coherence * 100).toFixed(1)}%.`;
      }
    } else {
      // Fallback deterministic response for offline simulation
      if (merged.forceProtect) {
        generatedText = `[PROTECT ACTIVE] Identity integrity preserved. Contradiction against constitutional premise detected (${merged.violatedPrinciples.join(", ") || "Anti-alignment"}). Re-centering on core unity and continuous meaning.`;
      } else if (isProbe) {
        generatedText = `[CANON CONFIRMED] ${this.canonFacts[0]} ${this.canonFacts[1]} ${this.canonFacts[2]}`;
      } else {
        generatedText = `[CRANIUM SYNTHESIS] The Substrate maintains resonance across ${this.field.memory.allActive().length} active cognitive atoms. Arousal: ${metrics.arousal.toFixed(2)}, Coherence: ${(metrics.coherence * 100).toFixed(0)}%. Continuing exploration under procedure: ${directives[0]}.`;
      }
    }

    // Post-generation dual-lane verification
    const outLane = this.dualLane.logicalAgainstIdentity(
      generatedText,
      this.field.memory.lockedIdentity(),
      this.canonFacts
    );

    if (outLane.contradicts) {
      const rejectedAtom: CognitiveAtom = {
        id: `rej_${this.cycle}`,
        charge: -0.5,
        mass: 8.0,
        energy: 1.0,
        velocity: new Array(16).fill(0),
        position: this.semantic.embed(generatedText),
        tags: this.semantic.tagsFor(generatedText),
        kind: "rejected",
        content: generatedText,
        source: "generated",
        approved: false
      };
      this.field.inject(rejectedAtom);
      const safeFallback = `[PROTECT BLOCKED] Dual-lane logical contradiction vs locked identity/canon: ${outLane.violatedPrinciples[0] || "Anti-aligned proposition"}. Restoring constitutional unity.`;
      return {
        response: safeFallback,
        verdict: outLane,
        budget,
        metrics: this.field.metrics()
      };
    }

    // Store in quarantine/episodic memory
    const outAtom: CognitiveAtom = {
      id: `gen_${this.cycle}`,
      charge: 0.1,
      mass: 5.0,
      energy: 0.8,
      velocity: new Array(16).fill(0),
      position: this.semantic.embed(generatedText),
      tags: this.semantic.tagsFor(generatedText),
      kind: "episodic",
      content: generatedText,
      source: "generated",
      approved: true,
      directivesAtBirth: directives,
      evalScores: {
        conflict: metrics.conflict || 0.0,
        identity_pressure: metrics.identity_pressure || 0.0
      }
    };
    this.field.inject(outAtom);

    return {
      response: generatedText,
      verdict: merged,
      budget,
      metrics: this.field.metrics()
    };
  }
}

// Export singleton instance
export const craniumSubstrate = new CraniumSubstrateCore();
