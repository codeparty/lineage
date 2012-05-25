var expect = require('expect.js')
  , lineage = require('../../lib/lineage')
  , VersionProtocol = lineage.protocol
  , consts = lineage.consts
  , GT = consts.GT
  , LT = consts.LT
  , EQ = consts.EQ
require('../../lib/types/date');


describe('Date as a version', function () {
  it('incr should update the time', function () {
    var date = new Date()
    setTimeout( function () {
      var newDate = VersionProtocol.incr(date);
      expect(+newDate).to.be.greaterThan(+date);
    }, 2);
  });

  describe('compare(dateA, dateB)', function () {
    it('should be LT when dateA < dateB', function () {
      var date = new Date()
        , laterDate = new Date(+date + 6000);
      expect(VersionProtocol.compare(date, laterDate)).to.equal(LT);
    });

    it('should be EQ when dateA === dateB', function () {
      var date = new Date()
        , equivDate = new Date(+date);
      expect(VersionProtocol.compare(date, equivDate)).to.equal(EQ);
    });

    it('should be GT when dateA > dateB', function () {
      var date = new Date()
        , priorDate = new Date(+date - 60000);
      expect(VersionProtocol.compare(date, priorDate)).to.equal(GT);
    });
  });

  it('merge should return a version greater than both input versions', function () {
    var refDate = new Date()
      , dateA = new Date(+refDate - 60000)
      , dateB = new Date(+refDate - 30000);
    var dateM = VersionProtocol.merge('agent', dateA, dateB);
    expect(VersionProtocol.compare(dateM, dateA)).to.equal(GT);
    expect(VersionProtocol.compare(dateM, dateB)).to.equal(GT);
  });
});
