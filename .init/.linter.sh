#!/bin/bash
cd /tmp/kavia/workspace/code-generation/online-tic-tac-toe-3780-3789/frontend_ui
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

