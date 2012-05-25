var VersionProtocol = require('../protocol')
  , consts = require('../consts')
  , LT = consts.LT
  , GT = consts.GT
  , EQ = consts.EQ
  , CONCURRENT = consts.CONCURRENT

  , Clock = require('./clock');

module.exports = LengthAnnealingClock;

function LengthAnnealingClock (max) {
  this.vectorClock = new Clock();

  this.max = max;

  // [agentId, timestamp] pairs sorted from earliest to most recent
  this.lruAgents = [];
}

function indexOf (array, fn) {
  for (var i = 0, l = array.length; i < l; i++) {
    if (fn(array[i])) return i;
  }
  return -1;
};

LengthAnnealingClock.prototype.protocolId = 'lineage:length_annealing_clock';

VersionProtocol(LengthAnnealingClock, {
  incr: function (clock, agentId) {
    var max = clock.max
      , vec = clock.vectorClock.vector
      , lruAgents = clock.lruAgents
      , index = indexOf(lruAgents, function (pair) {
          return pair[0] === agentId;
        })
      , counter;

    if (~index) {
      lruAgents.splice(index, 1);
      lruAgents.push([agentId, +new Date()]);
    } else {
      vec[agentId] = 0;
    }
    lruAgents.push([agentId, +new Date()]);
    if (lruAgents.length >= max) {
      var agentIdToRm = lruAgents.shift()[0];
      delete vec[agentIdToRm];
    }
    return ++vec[agentId];
  }
, compare: function (clock, otherClock) {
    return VersionProtocol.compare(clock.vectorClock, otherClock.vectorClock);
  }
, merge: function (agentId, clock, otherClock) {
    var lruAgents  = clock.lruAgents

      , otherLruAgents  = otherClock.lruAgents

      , max = Math.max(clock.max, otherClock.max)

      , mergedClock      = new LengthAnnealingClock(max)
      , mergedLruAgents  = mergedClock.lruAgents
      ;

    mergedClock.vectorClock = VersionProtocol.merge(agentId, clock.vectorClock, otherClock.vectorClock);

    // Merge the lru agents
    var uniqueAgents = [[agentId, +new Date()]];
    var agentLists = [lruAgents, otherLruAgents];
    for (var k = agentLists.length; k--; ) {
      var agentList = agentLists[k]
        , pair, index, currAgentId, timestamp;
      for (var i = 0, l = agentList.length; i < l; i++) {
        pair = agentList[i];
        currAgentId = pair[0];
        if (currAgentId === agentId) {
          continue;
        }
        index = indexOf(uniqueAgents, function (pair) {
          return pair[0] === currAgentId;
        });
        if (~index) {
          // Update the timestamp to the max timestamp per agentId
          timestamp = pair[1];
          uniqueAgents[index][1] = Math.max(timestamp, uniqueAgents[index][1]);
        } else {
          uniqueAgents.push(pair);
        }
      }
    }

    // Sort the agents in chronological order and assign to the clock
    mergedClock.lruAgents = uniqueAgents.sort( function (pairA, pairB) {
      return pairA[1] - pairB[1];
    });
    return mergedClock;
  }
});
