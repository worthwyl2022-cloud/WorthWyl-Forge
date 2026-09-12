# WorthWyl Forge

WorthWyl Forge is the interactive application surface for the WorthWyl and Cranium portfolio. It combines a React/Vite operator interface with an Express server and exposes the portfolio’s substrate, benchmark, authority-kernel, and media-oriented work through a runnable application rather than a static concept page.

## What is implemented

The repository contains a browser application under `src/`, an Express entrypoint in `server.ts`, and the `cranium_substrate/` implementation and evidence area. The substrate area includes frozen benchmark data, deterministic harnesses, adversarial stress tests, receipt runners, audit-report generation, and Kotlin authority-kernel sources. These artifacts are the evidence boundary for the governance claims presented by the application.

The application is an operator and demonstration surface. It does not independently grant authority or replace the canonical [cranium-kernel](https://github.com/worthwyl2022-cloud/cranium-kernel). Live model calls require an explicitly configured provider key; deterministic benchmark and receipt paths must not be represented as external production measurements unless their execution receipts are preserved.

## Run locally

```bash
npm ci
npm run lint
npm run build
npm run dev
```

The application requires `GEMINI_API_KEY` only for features that call Gemini. Keep credentials in an ignored local environment file or a deployment secret manager. Do not commit provider keys, Firebase credentials, or generated archives.

## Evidence and verification

The deterministic substrate harnesses can be run from `cranium_substrate/benchmark/` using the scripts and frozen corpus documented in that directory. The resulting receipts and audit reports are evidence artifacts, not claims of independent third-party validation.

## Repository boundaries

| Boundary | Canonical location |
|---|---|
| Authority transitions and replay policy | [cranium-kernel](https://github.com/worthwyl2022-cloud/cranium-kernel) |
| Cognitive/application layer | [Cranium-Core-](https://github.com/worthwyl2022-cloud/Cranium-Core-) |
| Integrated acquisition surface | [Cranium-Ultra](https://github.com/worthwyl2022-cloud/Cranium-Ultra) |
| Diligence and verification workbench | [Substrate Workbench](https://github.com/worthwyl2022-cloud/Substrate-Workbench-Diligence-Proof-) |

## License and ownership

See the repository license and security policy for applicable terms. This README describes the implementation currently present in the repository and intentionally distinguishes runnable evidence from future deployment claims.
