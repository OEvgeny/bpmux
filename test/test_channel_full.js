/*global describe: false,
         it: false */
/*jslint node: true, nomen: true */
"use strict";

var BPMux = require('..').BPMux,
    chai = require('chai'),
    expect = chai.expect;

var dummy_carrier = {
    on: function () { return undefined; },
    once: function () { return undefined; },
    emit: function () { return undefined; },
    pipe: function () { return undefined; },
    prependListener: function () { return undefined; }
};

describe('channel number full', function ()
{
    it('should throw a full exception when maximum number of duplexes exceeded', function (cb)
    {
        var mux = new BPMux(dummy_carrier);

        mux._max_duplexes = 3;

        mux.multiplex({ _delay_handshake: true });
        mux.multiplex({ _delay_handshake: true });
        mux.multiplex({ _delay_handshake: true });

        function fn()
        {
            mux.multiplex({ _delay_handshake: true });
        }
        expect(fn).to.throw(Error);
        expect(fn).to.throw('full');

        cb();
    });

    it('should throw a full exception when maximum number of open duplexes exceeded', function (cb)
    {
        var mux = new BPMux(dummy_carrier, { max_open: 3 });

        mux.multiplex({ _delay_handshake: true });
        mux.multiplex({ _delay_handshake: true });
        mux.multiplex({ _delay_handshake: true });

        function fn()
        {
            mux.multiplex({ _delay_handshake: true });
        }
        expect(fn).to.throw(Error);
        expect(fn).to.throw('full');

        cb();

    });

});

