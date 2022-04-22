#!/bin/sed -nurf
# -*- coding: UTF-8, tab-width: 2 -*-

# For use on e.g. busybox with no npm easily available.

/^[a-z0-9_]/!b
s~\s+~ ~g

s~^(\S+) <- (\.[a-z0-9]+)~\1\t\1\2~
s~^(\S+) <- (\S+)~\1\t\2~

/\t/!s~^~# ?? ~
s~^(\S+)\t+(\S+)$~ln -svnT ../lib/"${PWD##*/}"/\2 ../../bin/\1~
p
