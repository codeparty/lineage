var VersionProtocol = require('../protocol')
  , consts = require('../consts')
  , LT = consts.LT
  , GT = consts.GT
  , EQ = consts.EQ;

module.exports = Number;

VersionProtocol(Number, {
  incr: function (scalarClock, agent) {
    return scalarClock + 1;
  }
, compare: function (scalarClockA, scalarClockB) {
    if (scalarClockA < scalarClockB) return LT;
    if (scalarClockA > scalarClockB) return GT;
    return EQ;
  }
, merge: function (agent, scalarClockA, scalarClockB) {
    return Math.max(scalarClockA, scalarClockB) + 1;
  }
});
