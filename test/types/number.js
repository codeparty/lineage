var expect = require('expect.js')
  , lineage = require('../../lib/lineage')
  , VersionProtocol = lineage.protocol
  , consts = lineage.consts
  , GT = consts.GT
  , LT = consts.LT
  , EQ = consts.EQ
require('../../lib/types/number');


describe('Number as a version', function () {
  it('incr should increment the number', function () {
    expect(VersionProtocol.incr(1)).to.equal(2);
  });

  describe('compare(numA, numB)', function () {
    it('should be LT when numA < numB', function () {
      expect(VersionProtocol.compare(1, 2)).to.equal(LT);
    });

    it('should be EQ when numA === numB', function () {
      expect(VersionProtocol.compare(1, 1)).to.equal(EQ);
    });

    it('should be GT when numA > numB', function () {
      expect(VersionProtocol.compare(2, 1)).to.equal(GT);
    });
  });

  it('merge should return a version greater than both input versions', function () {
    var ver = VersionProtocol.merge('agent', 2, 6);
    expect(VersionProtocol.compare(ver, 2)).to.equal(GT);
    expect(VersionProtocol.compare(ver, 6)).to.equal(GT);
  });
});
