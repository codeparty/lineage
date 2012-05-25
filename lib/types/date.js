var VersionProtocol = require('../protocol')
  , consts = require('../consts')
  , LT = consts.LT
  , GT = consts.GT
  , EQ = consts.EQ;

module.exports = Date;

VersionProtocol(Date, {
  incr: function (date, agent) {
    var newDate = new Date();
    if (+newDate === +date) {
      return new Date(+date + 1);
    }
    return newDate;
  }
, compare: function (dateA, dateB) {
    if (dateA < dateB) return LT;
    if (dateA > dateB) return GT;
    return EQ;
  }
, merge: function (agent, dateA, dateB) {
    var now = new Date;
    if (now > dateA && now > dateB) return now;
    return new Date(Math.max(dateA, dateB));
  }
});
