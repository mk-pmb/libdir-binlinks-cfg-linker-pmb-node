
<!--#echo json="package.json" key="name" underline="=" -->
libdir-binlinks-cfg-linker-pmb
==============================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
An npm postinstall helper for installing symlinks according to `binlinks.cfg`,
a more compact notation than the package.json `bin` field.
<!--/#echo -->



API
---

This package is not intended to be used as a JS module.



Usage
-----

In your `package.json`, add this module as a dependency,
and set your `postinstall` script like this:

```json
{ "name": "some-package",
  "dependencies": {
    "…": "…"
  },
  "scripts": {
    "postinstall": "node -r libdir-binlinks-cfg-linker-pmb"
  }
}
```


Fallback sed script
-------------------

Need a shim for environments where npm isn't easily available?
(e.g. embedded device with just busybox and too few space for node.js)

[src/binlinks.minimal.sed](src/binlinks.minimal.sed)
should help with at least the simple cases.


<!--#toc stop="scan" -->



Known issues
------------

* When testing your `postinstall` script, you can add `--no-save` to
  your `npm install` command to make it not reformat your `package.json`.
* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
