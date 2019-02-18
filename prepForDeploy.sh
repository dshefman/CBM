#!/usr/bin/env bash


MAIN_PATH=$(pwd)
echo "cd ../"
cd ../
targetDir="deployResults"
targetDirCreated=0

if [ -d "$targetDir" ]
then
	echo "$targetDir directory exists!...removing"
	rm -rf $targetDir
fi

echo "$targetDir directory not found...creating!"
mkdir -p deployResults
targetDirCreated=1


cd "deployResults"
if [ "$targetDirCreated" -eq "1" ]
then
    echo "git init"
	git init
	$MAIN_PATH/node_modules/heroku/bin/run git:remote -a competition-ballroom-machine

fi	

echo "cp -a $MAIN_PATH/server/ ./"
cp -a "$MAIN_PATH/server/" "./"
rm -rf "public/output"
rm -rf "src/callbacks"
rm -rf "src/scruitineering"

echo "cp -a $MAIN_PATH/output/ ./public/output"
cp -a "$MAIN_PATH/output/" "./public/output/"

cp "$MAIN_PATH/.gitignore" "./"

mkdir -p "src"
cp -a $"MAIN_PATH/apps/server/" "./src/"

cp -a "$MAIN_PATH/callbacks" "src/"
cp -a "$MAIN_PATH/scruitineering" "src/"

git add .
git commit


