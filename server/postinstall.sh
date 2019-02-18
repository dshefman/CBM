#!/usr/bin/env bash


MAIN_PATH=$(pwd)
echo "ln -s $MAIN_PATH/../apps/server/ src"
ln -s "$MAIN_PATH/../apps/server/" "src"
echo "ln -s $MAIN_PATH/../callbacks src/callbacks"
ln -s "$MAIN_PATH/../callbacks" "src/callbacks"
echo "ln -s $MAIN_PATH/../scruitineering/ src/scruitineering"
ln -s "$MAIN_PATH/../scruitineering" "src/scruitineering"
echo "ln -s $MAIN_PATH/output/ ."
ln -s "$MAIN_PATH/output/" "."
