var expect = require('expect.js')
  , lineage = require('../../lib/lineage')
  , VersionProtocol = lineage.protocol
  , consts = lineage.consts
  , GT = consts.GT
  , LT = consts.LT
  , EQ = consts.EQ
  , CONCURRENT = consts.CONCURRENT
  , VectorClock = require('../../lib/types/clock');

describe('VectorClock as a version', shouldBehaveLikeAVectorClock(createClock));

exports.shouldBehaveLikeAVectorClock = shouldBehaveLikeAVectorClock;

function createClock () {
  return new VectorClock();
}

function shouldBehaveLikeAVectorClock (createClock) {
  return function () {
    it('a blank clock incremented once should be LT a clock incremented twice by the same agent', function () {
      var clockA = createClock()
        , clockB = createClock();

      VersionProtocol.incr(clockA, 'agent-1');
      VersionProtocol.incr(clockB, 'agent-1');
      VersionProtocol.incr(clockB, 'agent-1');
      expect(VersionProtocol.compare(clockA, clockB)).to.equal(LT);
    });

    it('a blank clock incremented twice should be GT a clock incremented once by the same agent', function () {
      var clockA = createClock()
        , clockB = createClock();

      VersionProtocol.incr(clockA, 'agent-1');
      VersionProtocol.incr(clockA, 'agent-1');
      VersionProtocol.incr(clockB, 'agent-1');

      expect(VersionProtocol.compare(clockA, clockB)).to.equal(GT);
    });

    it('a blank clock incremented the same number of times as another clock by the same agent should be EQ', function () {
      var clockA = createClock()
        , clockB = createClock();

      VersionProtocol.incr(clockA, 'agent-1');
      VersionProtocol.incr(clockB, 'agent-1');

      expect(VersionProtocol.compare(clockA, clockB)).to.equal(EQ);
    });

    it('clocks with the same causal past that are then incremented by different agents should be CONCURRENT', function () {
      var clockA = createClock()
        , clockB = createClock();

      VersionProtocol.incr(clockA, 'agent-1');
      VersionProtocol.incr(clockB, 'agent-2');

      expect(VersionProtocol.compare(clockA, clockB)).to.equal(CONCURRENT);
    });

    describe('a merged version', function () {
      it('should be greater than the versions that were merged', function () {
        var clockA = createClock()
          , clockB = createClock();

        VersionProtocol.incr(clockA, 'agent-1');
        VersionProtocol.incr(clockB, 'agent-2');

        var mergedClock = VersionProtocol.merge('agent-1', clockA, clockB);

        expect(VersionProtocol.compare(mergedClock, clockA)).to.equal(GT);
        expect(VersionProtocol.compare(mergedClock, clockB)).to.equal(GT);
      });
    });
  };
}
