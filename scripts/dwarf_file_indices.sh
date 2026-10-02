#!/bin/bash
/home/mx/emsdk/upstream/bin/llvm-dwarfdump --debug-line \
  /mnt/c/devel/ea/ea31337/FX31337-wasm/dist/IndicatorTest.wasm 2>&1 \
  | grep -E '^0x[0-9a-f]+ ' \
  | awk '{print $4}' \
  | sort -nu
