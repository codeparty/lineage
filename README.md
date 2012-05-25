Lineage
=======

A data versioning library.

## Introduction

Lineage is a JavaScript library for managing versions of data, especially
helpful when reasoning about state in distributed systems. It provides several
data types that can act as versions and also provide

Lineage:

- Defines a [protocol](https://github.com/codeparty/protocoljs) for
  incrementing, comparing, and merging versions.
- Provides several data types that can act as versions.
- Enables you to add your own data types that can act as versions.

## Installation

```
$ npm install lineage
```

## Basics

The most basic version data type you can use is a Number or Date.

## Numbers as versions

```javascript
var lineage = require('lineage')
  , protocol = lineage.protocol;

// Require this to extend Number with the version protocol provided by lineage.
require('lineage/lib/types/number');

var oldVersion = 1;
var newVersion = protocol.incr(oldVersion); // => 2

var comparison = protocol.compare(oldVersion, newVersion);
console.log(comparison === protocol.consts.LT); // true

comparison = protocol.compare(oldVersion, oldVersion);
console.log(comparison === protocol.consts.EQ); // true

comparison = protocol.compare(newVersion, oldVersion);
console.log(comparison === protocol.consts.GT); // true
```

## Dates as versions

Dates act similarly to numbers except version incrementing a Date just means
returning the Date right now.

```javascript
var lineage = require('lineage')
  , protocol = lineage.protocol;

// Require this to extend Date with the version protocol provided by lineage
require('lineage/lib/types/number');

var oldVersion = new Date();

setTimeout( function () {
  var newVersion = protocol.incr(oldVersion); // => <Date>
  var comparison = protocol.compare(oldVersion, newVersion);
  console.log(comparison ==== protocol.consts.LT); // true

  comparison = protocol.compare(oldVersion, oldVersion);
  console.log(comparison, protocol.consts.EQ); // true

  comparison = protocol.compare(newVersion, oldVersion);
  console.log(comparison === protocol.consts.GT); // true
}, 1);
```

## Vector Clocks

For distributed systems, the ideal data structure to use is a vector clock,
also known as a [Lamport Clock](http://en.wikipedia.org/wiki/Lamport_timestamps).

Lineage provides vector clocks out of the box.

We will get into why vector clocks are critical when you want to version data
in a distributed system, but for a more complete treatment on the subject, this
README points the reader to the [canonical paper on Lamport
clocks](http://research.microsoft.com/en-us/um/people/lamport/pubs/time-clocks.pdf).

What a vector clock does behind the scenes is more straightforward. Vector
clocks extend the concept of the Number as a counter that represents the
version. Vector clocks are a set of counters, where each counter is associated
with the actor/client/node that updated the vector clock. Every time a
particular actor updates a vector clock, the counter it is associated with is
incremented.

```JavaScript
var lineage = require('lineage')
  , protocol = lineage.protocol
  , Clock = require('lineage/lib/types/clock');

var oldVersion = new Clock(); // => <Clock>

// Compared to Number as a version, Clocks as versions must associate every
// update to a version with an actor id. Here that actor id is 'actor-A'
var newVersion = protocol.incr(oldVersion, 'actor-A');

// Vectors updated by an actor compare to other vectors just how you would
// expect them to.
var comparison = protocol.compare(oldVersion, newVersion);
console.log(comparison === protocol.consts.LT); // true

comparison = protocol.compare(oldVersion, oldVersion);
console.log(comparison === protocol.consts.EQ); // true

comparison = protocol.compare(newVersion, oldVersion);
console.log(comparison === protocol.consts.GT); // true
```

Up until this point, it would appear as though Clock versions compare to each
other in the same way that Number versions compare to each other. So why even
have a different data structure to use for versions?

In a contrived real world scenario, consider a person in San Francisco who owns
a calendar. If she adds an event to the calendar each day, then the calendar on
any given day is a later version than the calendar the day before. In this
scenario, using a Number as a counter version works perfectly well.

Things become more interesting when we involve another actor updating the
version -- in this case, we have a distributed system.

Suppose the San Francisco citizen makes a copy of her calendar and sends it to
a man in China. Now suppose that on the first day that they both have identical
calendars, each of them decide to update their calendars. How would you compare
the 2 calendars? They are older than their respective versions, but how do they
compare to each other? They are not at equivalent versions, but one does not
also have a greater or less version than the other. In this case, we say the
two versions are concurrent.

```javascript
var lineage = require('lineage')
  , protocol = lineage.protocol
  , Clock = require('lineage/lib/types/clock');

var sfVersion      = new Clock(); // => <Clock>
var chineseVersion = new Clock(); // => <Clock>

protocol.incr(sfVersion, 'sf-person');
protocol.incr(chineseVersion, 'chinese-person');

var comparison = protocol.compare(sfVersion, chineseVersion);
console.log(comparison === protocol.consts.CONCURRENT); // true
```

In distributed systems, we can reconcile data at concurrent versions by
resolving the given data conflict inherent in the concurrent versions of data
and then merge the two versions into a new version that is greater than the two
versions.

In the contrived real world example, this could occur if the Chinese man sends
the San Francisco woman his calendar. She could then make a 3rd calendar that
included both her and his events. This calendar would then be considered at a
greater version than the two prior calendars because it reflects a calendar
that takes into account the historic set of changes to both calendars.

Continuing with our code from the last example:

```javascript
var reconciledVersion = protocol.merge(sfVersion, chineseVersion);

comparison = protocol.compare(reconciledVersion, sfVersion);
console.log(comparison === protocol.consts.GT); // true

comparison = protocol.compare(reconciledVersion, chineseVersion);
console.log(comparison === protocol.consts.GT); // true
```

## Annealing Vector Clocks

Vector clocks are essential to handle data versioning in a distributed system.
However, they can also grow in an unbounded way if the number of actors who can
update the version grows in an unbounded way. If there are 100 actors, the
clock will consist of 100 counters behind the scenes.

In practice, what is often used instead is a variation known as an annealed
vector clock, that limits the number of actors to a maximum. If a vector clock
has already been updated by a maximum number of actors, then a new actor who
decides to update that version will effectively replace the counter that has
not been updated the longest.

```javascript
var lineage = require('lineage')
  , protocol = lineage.protocol
  , LengthAnnealedClock = require('lineage/lib/types/length_annealed_clock');

var versionA = new LengthAnnealedClock(2); // => <LengthAnnealedClock>
var versionB = new LengthAnnealedClock(2); // => <LengthAnnealedClock>

protocol.incr(versionA, 'actor-A');
protocol.incr(versionA, 'actor-B');

protocol.incr(versionB, 'actor-A');
protocol.incr(versionB, 'actor-B');

var comparison = protocol.compare(versionA, versionB);
console.log(comparison === protocol.consts.EQ);

// Here we update the version with a new actor, but the version clock is
// already at its maximum number of counters.
protocol.incr(versionB, 'actor-C');

comparison = protocol.compare(versionA, versionB);
// Normally, in a non-annealed Clock, this comparison would place versionA as
// LT (less than) versionB.
// When we anneal a Clock, we can lose information of what other actors have
// done to a version historically. Because of that, versionB actually counts as
// being CONCURRENT to versionA.
console.log(comparison === protocol.consts.CONCURRENT;
```

### MIT License
Copyright (c) 2012 by Brian Noguchi and Nate Smith

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
