var protocol = require('protocoljs');

module.exports = protocol({
  incr: ('Increments the version'
         , [protocol, ('agent', Object)])
, compare: ('Compares 2 versions of the same type'
            , [protocol, ('otherVersion', protocol)])
, merge: ('Merges 2 versions to create a version that is causally ahead of both input versions'
          , [('agent', Object), protocol, ('otherVersion', Object)])
});
