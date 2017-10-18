#!/usr/bin/env bash


MAIN_PATH=$(pwd)
echo "ln -s $MAIN_PATH/scruitineering/ node_modules"
ln -s "$MAIN_PATH/scruitineering/" "node_modules"
echo "ln -s $MAIN_PATH/callbacks/ node_modules"
ln -s "$MAIN_PATH/callbacks/" "node_modules"
