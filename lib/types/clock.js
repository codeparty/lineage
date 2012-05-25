// Vector Clock (aka Logical Clock, or Lamport Clock)

var VersionProtocol = require('../protocol')
  , consts = require('../consts')
  , LT = consts.LT
  , GT = consts.GT
  , EQ = consts.EQ
  , CONCURRENT = consts.CONCURRENT;

module.exports = Clock;

function Clock () {
  this.vector = {};
}

Clock.prototype.protocolId = 'lineage:clock';

VersionProtocol(Clock, {
  incr: function (clock, agentId) {
    var vec = clock.vector;
    if (! (agentId in vec)) return vec[agentId] = 1;
    return ++vec[agentId];
  }
, compare: function (clock, otherClock) {
    var allKeys = {}, vec;
    for (var i = arguments.length; i--; ) {
      vec = arguments[i].vector;
      for (var agentId in vec) allKeys[agentId] = true;
    }

    var counter, otherCounter, mem;
    for (agentId in allKeys) {
      counter = clock.vector[agentId] || 0;
      otherCounter = otherClock.vector[agentId] || 0;

      if (counter < otherCounter) {
        if (mem == GT) return CONCURRENT;
        mem = LT;
      } else if (counter > otherCounter) {
        if (mem == LT) return CONCURRENT;
        mem = GT;
      } else if (counter == otherCounter) {
        if (mem != LT && mem != GT) mem = EQ;
      }
    }
    return mem;
  }
, merge: function (agentId, clock, otherClock) {
    var newClock = new Clock();

    var vec = newClock.vector = greedyZip(clock.vector, otherClock.vector, function (a, b) {
      return Math.max(a || 0, b || 0);
    });
    if (vec[agentId]) {
      ++vec[agentId];
    } else {
      vec[agentId] = 1;
    }
    return newClock;
  }
});

// Given 2 Objects a and b, iterate through their keys. For each key, take the
// corresponding value a[k] and the corresponding value b[k], and apply the
// function fn -- i.e., fn(a[k], b[k]). Assign the result to the same key k on
// a new Object we eventually return.
function greedyZip (a, b, fn) {
  var out = {}
    , seen = {};
  for (var k in a) {
    seen[k] = true;
    out[k] = fn(a[k], b[k]);
  }
  for (k in b) {
    if (k in seen) continue;
    out[k] = fn(a[k], b[k]);
  }
  return out;
}
