// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';
import prFs from 'nofs';
import pMap from 'p-map';

import detectLdParentDir from './src/detectLdParentDir';
import blParse from './src/blParse';


function catchErr(f) {
  return async(x) => { try { await f(x); } catch (e) { return e; } };
}

function explainFail(err) { return String(err).replace(/^Error: /, ''); }

async function linkNow() {
  const ldPath = await detectLdParentDir();
  const linkPathPrefix = ldPath.par + '/bin/';
  const blCfgText = await prFs.readFile(ldPath.full
    + '/binlinks.cfg', 'UTF-8');
  const blTodo = blParse(blCfgText);

  async function tryOne(parsed) {
    const { cmd, arrow, prog } = parsed;
    if (arrow !== '<-') { throw new Error('Unsupported arrow: ' + arrow); }
    // "<-" means "provides", i.e. opposite of symlink direction!
    const lnk = linkPathPrefix + cmd;
    const dest = ('../lib/' + ldPath.sub + '/' + prog);
    console.debug(lnk, '<--{provides}--', dest);
  }

  const fails = (await pMap(blTodo, catchErr(tryOne))).filter(Boolean);
  if (!fails.length) { process.exit(0); }
  const report = [
    fails.length + ' errors:',
    ...fails.map(explainFail),
  ].join('\n');
  throw new Error(report);
}

setImmediate(linkNow);
