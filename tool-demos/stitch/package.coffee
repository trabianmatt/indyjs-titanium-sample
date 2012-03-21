stitch = require 'stitch'
fs = require 'fs'

package = stitch.createPackage
  paths: ["#{__dirname}/src"]

outputPath = 'combined.js'

package.compile (err, source) ->

  fs.writeFile outputPath, source, (err) ->
    throw err if err
    console.log "Compiled #{outputPath}"
