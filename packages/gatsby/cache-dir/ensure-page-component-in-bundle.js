const didCallServer = new Set()

const ensureComponentInBundle = chunkName =>
  new Promise(resolve => {
    if (!didCallServer.has(chunkName)) {
      const req = new XMLHttpRequest()
      req.open(`post`, `/___client-page-visited`, true)
      req.setRequestHeader(`Content-Type`, `application/json;charset=UTF-8`)
      req.send(JSON.stringify({ chunkName }))

      didCallServer.add(chunkName)
    }

    // Tell the server the user wants to visit this page
    // to trigger it compiling the page component's code.
    const checkForBundle = () => {
      // Check if the bundle is included and return.
      if (process.env.NODE_ENV !== `test`) {
        delete require.cache[
          require.resolve(`$virtual/lazy-client-sync-requires`)
        ]
      }

      const lazyRequires = require(`$virtual/lazy-client-sync-requires`)
      if (lazyRequires.lazyComponents[chunkName]) {
        resolve(lazyRequires.lazyComponents[chunkName])
      } else {
        setTimeout(checkForBundle, 100)
      }
    }

    checkForBundle()
  })

export default ensureComponentInBundle
