#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function reproduce_binlinks () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local FOPT=(
    "$HOME"/bin/
    -maxdepth 1
    -type l
    '(' -false
    )
  local ARG=
  for ARG in "$@"; do
    FOPT+=( -o -lname "../lib/*$ARG*/*" )
  done

  local LN_OPT='-snT' # --symbolic --no-clobber --no-target-directory

  FOPT+=(
    ')'
    -printf "  ln $LN_OPT -- '%l' '%f'\n"
    )
  find "${FOPT[@]}" || return $?
}










reproduce_binlinks "$@"; exit $?
