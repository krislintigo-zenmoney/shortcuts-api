#!/bin/bash
set -e

# nvm is not errexit-safe — don't let its internal non-zero returns abort the deploy.
source ~/.nvm/nvm.sh || true

pnpm install --frozen-lockfile

pnpm build

pm2 reload ecosystem.config.cjs
