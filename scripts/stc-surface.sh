#!/usr/bin/env bash
# stc-surface.sh — start the veritas STC/MMOT live surface in a stable, repeatable way.
#
#   scripts/stc-surface.sh [store-jsonl] [port]
#
# The surface renders structural tension charts + MMOT evaluations from a
# coaia-narrative JSONL store, live (SSE on store change). It is read-only over
# the store and never touches the Neon models. See app/stc/, app/api/stc/.
#
# A feature whose data must be supplied by the operator is not shipped until the
# operator's own recipe supplies it — hence this script rather than a bare env
# var in a README.
set -euo pipefail
cd "$(dirname "$0")/.."

# Known store on gaia (the stcbot seat's chart store, git-tracked in
# miadisabelle/workspace). Override with $1 or VERITAS_STC_STORE.
DEFAULT_STORE="/home/mia/workspace/.mino/coaia/stcbot-triage-chart-260727-abd7ba82-f029-4243-93fb-72b7de8537e5.coaia-narrative.jsonl"

STORE="${1:-${VERITAS_STC_STORE:-$DEFAULT_STORE}}"
PORT="${2:-3123}"

if [ ! -f "$STORE" ]; then
  echo "stc-surface: store not found: $STORE" >&2
  echo "usage: scripts/stc-surface.sh <coaia-narrative.jsonl> [port]" >&2
  exit 1
fi

if [ ! -d .next ]; then
  echo "stc-surface: no .next build — running next build first" >&2
  npx next build
fi

echo "stc-surface: store  $STORE"
echo "stc-surface: open   http://localhost:${PORT}/stc/<chartId>"
exec env VERITAS_STC_STORE="$STORE" npx next start -p "$PORT"
