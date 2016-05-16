/*global describe: false,
         it: false */
/*jshint node: true */
"use strict";

var BPMux = require('..').BPMux,
    chai = require('chai'),
    expect = chai.expect,
    stream = require('stream'),
    util = require('util'),
    Duplex = stream.Duplex,
    PassThrough = stream.PassThrough;

function RightDuplex(left)
{
    Duplex.call(this);
    this.left = left;
}

util.inherits(RightDuplex, Duplex);

RightDuplex.prototype._read = function ()
{
    if (this._cb)
    {
        this._cb();
        this._cb = null;
    }
};

RightDuplex.prototype._write = function (chunk, encoding, cb)
{
    if (this.left.push(chunk, encoding))
    {
        cb();
    }
    else
    {
        this._cb = cb;
    }
};

function LeftDuplex()
{
    Duplex.call(this);
    this.right = new RightDuplex(this);
}

util.inherits(LeftDuplex, Duplex);

LeftDuplex.prototype._read = function ()
{
    if (this._cb)
    {
        this._cb();
        this._cb = null;
    }
};

LeftDuplex.prototype._write = function (chunk, encoding, cb)
{
    if (this.right.push(chunk, encoding))
    {
        cb();
    }
    else
    {
        this._cb = cb;
    }
};

describe('inline stream', function ()
{
	it('should multiplex over inline stream', function (cb)
	{
        var left = new LeftDuplex(),
            right = left.right,
            lmux = new BPMux(left),
            rmux = new BPMux(right);

        rmux.once('handshake', function (duplex, hsdata)
        {
            expect(hsdata.toString()).to.equal('left hs');

            var bufs = [];

            duplex.on('end', function ()
            {
                var buf = Buffer.concat(bufs);
                expect(buf.toString()).to.equal('left data');

                rmux.multiplex(
                {
                    handshake_data: new Buffer('right hs')
                }, function (err, duplex)
                {
                    if (err) { return cb(err); }
                    duplex.end('right data');
                });
            });

            duplex.on('readable', function ()
            {
                while (true)
                {
                    var data = this.read();
                    if (data === null)
                    {
                        break;
                    }
                    bufs.push(data);
                }
            });
        });

        lmux.multiplex(
        {
            handshake_data: new Buffer('left hs')
        }, function (err, duplex)
        {
            if (err) { return cb(err); }
            duplex.end('left data');
        });

        lmux.on('handshake', function (duplex, hsdata, delay)
        {
            if (!delay)
            {
                return expect(hsdata.length).to.equal(0);
            }

            expect(hsdata.toString()).to.equal('right hs');

            var bufs = [];

            duplex.on('end', function ()
            {
                var buf = Buffer.concat(bufs);
                expect(buf.toString()).to.equal('right data');
                cb();
            });

            duplex.on('readable', function ()
            {
                while (true)
                {
                    var data = this.read();
                    if (data === null)
                    {
                        break;
                    }
                    bufs.push(data);
                }
            });
        });
    });
});

