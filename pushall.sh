#!/bin/bash

git submodule foreach git push
git push

read -p "Press <Enter> to exit..."
