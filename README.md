
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

In your `package.json`, add this module as a dependency, and set
`pmb-libdir-make-binlinks-for-npmpkg` as your `postinstall` script, e.g.

```json
{ "name": "some-package",
  "dependencies": {
    "…": "…"
  },
  "scripts": {
    "postinstall": "pmb-libdir-make-binlinks-for-npmpkg"
  }
}
```


<!--#toc stop="scan" -->



Known issues
------------

* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
