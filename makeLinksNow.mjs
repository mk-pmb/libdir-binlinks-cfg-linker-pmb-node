// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';
import prFs from 'nofs';
import pMap from 'p-map';

import detectLdParentDir from './src/detectLdParentDir';
import blParse from './src/blParse';


const dbgLv = (+process.env.DEBUGLEVEL || 0);


function catchErr(f) {
  return async(x) => { try { await f(x); } catch (e) { return e; } };
}

function explainFail(err) { return String(err).replace(/^Error: /, ''); }

function verifyShellSafe(x, d) {
  // i.e. contains no characters what we'd want to escape.
  const m = (/^[A-Za-z0-9_\-\.\/]+$/.exec(x) || false)[0];
  if (m === x) { return m; }
  throw new Error('Unexpected characters: ' + x);
}

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
  const npmBlOpt = process.env.npm_config_bin_links;
  if (npmBlOpt && (npmBlOpt !== 'true')) {
    console.debug('Skipping symlink updates as per npm "bin-links" option.');
    return;
  }

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
    const destRel = ('../lib/' + ldPath.sub + '/' + prog);
    const destOld = await readOldLink(lnk);
    if (dbgLv >= 2) {
      console.debug('# ln --symbolic --no-clobber --no-target-directory --',
        verifyShellSafe(destRel), verifyShellSafe(lnk));
    }
    if (destOld) {
      if (destOld.err) { throw new Error(destOld.err); }
      if (destOld.dest === destRel) {
        if (dbgLv >= 2) {
          console.debug('# Symlink already points correctly:', lnk);
        }
        return;
      }
      await prFs.unlink(lnk);
    }
    await prFs.symlink(destRel, lnk);
  }

  await prFs.mkdirp(binDir);
  const fails = (await pMap(blTodo, catchErr(tryOne))).filter(Boolean);
  if (!fails.length) { return; }
  if (fails.length === 1) { throw fails[0]; }
  const report = [
    fails.length + ' errors:',
    ...fails.map(explainFail),
  ].join('\n');
  throw new Error(report);
}

async function andExit() {
  await linkNow();
  process.exit(0);
}

setImmediate(andExit);
