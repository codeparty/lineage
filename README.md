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

Why vector clocks are critical when you want to version data in a distributed
system is more involved, and this README will point the reader instead to the
[canonical paper on Lamport
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

Things become more interesting when we involve another actor updating the
version -- in this case, we have a distributed system.

TODO - finish the README

Suppose 1 person in the US and 1 person in China both receive an identical calendar.

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
