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

async function readOldLink(lnk) {
  try {
    const oldStat = await prFs.lstat(lnk);
    if (!oldStat.isSymbolicLink()) {
      return { err: 'Symlink path is blocked by a non-symlink: ' + lnk };
    }
  } catch (err) {
    if (err.code === 'ENOENT') { return false; }
    throw err;
  }
  const dest = await prFs.readlink(lnk);
  return { dest };
}

async function linkNow() {
  const ldPath = await detectLdParentDir();
  const binDir = ldPath.par + '/bin';
  const blCfg = await prFs.readFile(ldPath.full + '/binlinks.cfg', 'UTF-8');
  const blTodo = blParse(blCfg);
  if (!blTodo.length) { return; }

  async function tryOne(parsed) {
    const { cmd, arrow, prog } = parsed;
    if (arrow !== '<-') { throw new Error('Unsupported arrow: ' + arrow); }
    // "<-" means "provides", i.e. opposite of symlink direction!
    const lnk = binDir + '/' + cmd;
    const dest = ('../lib/' + ldPath.sub + '/' + prog);
    const oldDest = await readOldLink(lnk);
    if (oldDest) {
      if (oldDest.err) { throw new Error(oldDest.err); }
      if (oldDest.dest === dest) { return; }
      await prFs.unlink(lnk);
    }
    await prFs.symlink(dest, lnk);
  }

  await prFs.mkdirp(binDir);
  const fails = (await pMap(blTodo, catchErr(tryOne))).filter(Boolean);
  if (!fails.length) { process.exit(0); }
  if (fails.length === 1) { throw fails[0]; }
  const report = [
    fails.length + ' errors:',
    ...fails.map(explainFail),
  ].join('\n');
  throw new Error(report);
}

setImmediate(linkNow);
