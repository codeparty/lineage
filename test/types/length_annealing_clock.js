var expect = require('expect.js')
  , lineage = require('../../lib/lineage')
  , VersionProtocol = lineage.protocol
  , consts = lineage.consts
  , GT = consts.GT
  , LT = consts.LT
  , EQ = consts.EQ
  , CONCURRENT = consts.CONCURRENT
  , LengthAnnealingClock = require('../../lib/types/length_annealing_clock')

  , shouldBehaveLikeAVectorClock = require('./clock').shouldBehaveLikeAVectorClock;

function createClock () {
  return new LengthAnnealingClock(2);
}

describe('LengthAnnealingClock as a version', function () {
  shouldBehaveLikeAVectorClock(createClock);

  describe('when the number of agents who updated the version exceed the limit', function () {
    describe('an incremented version', function () {
      it('should be CONCURRENT with the version before incrementing the version', function () {
        var clockA = createClock()
          , clockB = createClock();
        VersionProtocol.incr(clockA, 'agent-1');
        VersionProtocol.incr(clockA, 'agent-2');

        VersionProtocol.incr(clockB, 'agent-1');
        VersionProtocol.incr(clockB, 'agent-2');

        expect(VersionProtocol.compare(clockA, clockB)).to.equal(EQ);

        VersionProtocol.incr(clockB, 'agent-3');

        expect(VersionProtocol.compare(clockA, clockB)).to.equal(CONCURRENT);
      });
    });

    describe('a merged version', function () {
      it('should be GT the versions that were merged', function () {
        var clockA = createClock()
          , clockB = createClock();
        VersionProtocol.incr(clockA, 'agent-1');
        VersionProtocol.incr(clockA, 'agent-2');

        VersionProtocol.incr(clockB, 'agent-1');
        VersionProtocol.incr(clockB, 'agent-2');
        VersionProtocol.incr(clockB, 'agent-3');

        var mergedClock = VersionProtocol.merge('agent-3', clockA, clockB);
        expect(VersionProtocol.compare(mergedClock, clockA)).to.equal(GT);
        expect(VersionProtocol.compare(mergedClock, clockB)).to.equal(GT);
      });

      it('should be CONCURRENT with a version that results from incrementing it', function () {
        var clockA = createClock()
          , clockB = createClock();
        VersionProtocol.incr(clockA, 'agent-1');
        VersionProtocol.incr(clockA, 'agent-2');

        VersionProtocol.incr(clockB, 'agent-1');
        VersionProtocol.incr(clockB, 'agent-2');
        VersionProtocol.incr(clockB, 'agent-3');

        var mergedClockX = VersionProtocol.merge('agent-3', clockA, clockB);
        var mergedClockY = VersionProtocol.merge('agent-3', clockA, clockB);
        expect(VersionProtocol.compare(mergedClockX, mergedClockY)).to.equal(EQ);
        VersionProtocol.incr(mergedClockY, 'agent-3');
        expect(VersionProtocol.compare(mergedClockX, mergedClockY)).to.equal(CONCURRENT);
      });
    });
  });
});
