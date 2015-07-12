/*global describe: false,
         it: false */
/*jslint node: true, nomen: true */
"use strict";

var BPMux = require('..').BPMux,
    chai = require('chai'),
    expect = chai.expect;

describe('channel number full event', function ()
{
    it('should emit a full event when maximum number of duplexes exceeded', function (cb)
    {
        var mux = new BPMux(
        {
            // dummy carrier
            on: function () { return undefined; },
            once: function () { return undefined; },
            emit: function () { return undefined; },
            pipe: function () { return undefined; }
        });

        mux._max_duplexes = 3;

        mux.multiplex({ _delay_handshake: true }, function (err)
        {
            expect(err).to.equal(null);
        });

        mux.multiplex({ _delay_handshake: true }, function (err)
        {
            expect(err).to.equal(null);
        });

        mux.multiplex({ _delay_handshake: true }, function (err)
        {
            expect(err).to.equal(null);
        });

        mux.multiplex({ _delay_handshake: true }, function (err)
        {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('full');
            cb();
        });
    });
});

