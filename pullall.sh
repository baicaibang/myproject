#!/bin/bash

git submodule foreach git pull
git pull

read -p "Press <Enter> to exit..."
