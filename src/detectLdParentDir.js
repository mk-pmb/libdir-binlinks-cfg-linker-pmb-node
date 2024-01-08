// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const splitOnce = require('split-string-or-buffer-once-pmb');
const prFs = require('nofs');


function splitLib(path) {
  if (!path) { return false; }
  const [par, sub] = (splitOnce({ sep: '/lib/', last: true }, path) || []);
  return (par !== undefined) && { full: path, par, sub };
}


async function detectLdParentDir() {
  const naiveCwd = process.cwd();
  let splat = splitLib(naiveCwd);
  if (splat) { return splat; }

  splat = splitLib(process.env.PWD);
  if (splat) {
    const errBase = 'Found "/lib/" segment in env var $PWD but $PWD ';
    try {
      const resolved = await prFs.realpath(splat.full);
      if (resolved === naiveCwd) { return splat; }
    } catch (err) {
      throw new Error(errBase + "couldn't be resolved: " + String(err));
    }
    throw new Error(errBase + "doesn't resolve to " + naiveCwd);
  }

  throw new Error('No "/lib/" segment found in package directory ' + naiveCwd);
}


module.exports = detectLdParentDir;
