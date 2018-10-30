#!/usr/bin/env bash


MAIN_PATH=$(pwd)
echo "ln -s $MAIN_PATH/../apps/server/ src"
ln -s "$MAIN_PATH/../apps/server/" "src"
echo "ln -s $MAIN_PATH/output/ ."
ln -s "$MAIN_PATH/output/" "."
