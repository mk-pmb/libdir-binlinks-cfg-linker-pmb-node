// -*- coding: utf-8, tab-width: 2 -*-

import assert from 'assert';


const specRgx = /^(\S*)(\.([a-z]{2,8}))$/;


function parseSpec(spec, cmd) {
  const [verify, bfn, dotFxt, fxt] = (specRgx.exec(spec) || []);
  if (verify !== spec) { throw new Error('Invalid right side: ' + spec); }
  const parsed = {
    ...(bfn ? { bfn, prog: verify } : { bfn: cmd, prog: cmd + dotFxt }),
    dotFxt,
    fxt,
  };
  return parsed;
}


function blParse(input) {
  if (!input) { return false; }
  if (Array.isArray(input)) { return input.map(blParse).filter(Boolean); }
  const ln = String(input).trim();
  if (ln.indexOf('\n') >= 0) {
    return blParse(String(input).replace(/\r/g, '').split(/\n/));
  }
  if (ln.startsWith('#')) { return false; }
  const parts = ln.split(/\s+/);
  assert(parts.length, 3, 'Wrong number of line parts in line ' + ln);
  const [cmd, arrow, rawSpec] = parts;
  return { cmd, arrow, ...parseSpec(rawSpec, cmd) };
}


export default blParse;
