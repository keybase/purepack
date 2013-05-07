// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var BaseBuffer, CharMap, pow2, rshift, twos_compl_inv, _ref;



  _ref = require('./util'), pow2 = _ref.pow2, rshift = _ref.rshift, twos_compl_inv = _ref.twos_compl_inv;

  CharMap = (function() {
    function CharMap(s, pad) {
      var c, i, _i, _j, _len, _len1;
      if (pad == null) {
        pad = "";
      }
      this.fwd = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = s.length; _i < _len; _i++) {
          c = s[_i];
          _results.push(c);
        }
        return _results;
      })();
      this.rev = {};
      for (i = _i = 0, _len = s.length; _i < _len; i = ++_i) {
        c = s[i];
        this.rev[c] = i;
      }
      for (_j = 0, _len1 = pad.length; _j < _len1; _j++) {
        c = pad[_j];
        this.rev[c] = 0;
      }
    }

    return CharMap;

  })();

  exports.PpBuffer = BaseBuffer = (function() {
    BaseBuffer.prototype.B16 = new CharMap("0123456789abcdef");

    BaseBuffer.prototype.B32 = new CharMap("abcdefghijkmnpqrstuvwxyz23456789");

    BaseBuffer.prototype.B64 = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", "=");

    BaseBuffer.prototype.B64X = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_", "=");

    BaseBuffer.prototype.B64A = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-", "=");

    function BaseBuffer() {
      this._e = [];
      this._cp = 0;
      this._tot = 0;
    }

    BaseBuffer.prototype.get_errors = function() {
      if (this._e.length) {
        return this._e;
      } else {
        return null;
      }
    };

    BaseBuffer.prototype._prepare_encoding = function() {};

    BaseBuffer.prototype.toString = function(enc) {
      if (enc == null) {
        enc = 'base64';
      }
      this._prepare_encoding();
      switch (enc) {
        case 'buffer':
          return this.buffer_encode();
        case 'base64':
          return this.base64_encode();
        case 'base64a':
          return this.base64a_encode();
        case 'base64x':
          return this.base64x_encode();
        case 'base32':
          return this.base32_encode();
        case 'hex':
          return this.base16_encode();
        case 'binary':
          return this.binary_encode();
        case 'ui8a':
          return this.ui8a_encode();
      }
    };

    BaseBuffer.prototype.encode = function(e) {
      return this.toString(e);
    };

    BaseBuffer.prototype._get = function(i, n) {
      throw new Error("pure virtual method");
    };

    BaseBuffer.prototype.ui8a_encode = function() {
      var hold, raw;
      hold = this._cp;
      this._cp = 0;
      raw = this.read_byte_array(this._tot);
      this._cp = hold;
      return raw;
    };

    BaseBuffer.prototype.buffer_encode = function() {
      return this.ui8a_encode();
    };

    BaseBuffer.prototype.binary_encode = function() {
      var i, v;
      v = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (i = _i = 0, _ref1 = this._tot; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          _results.push(this._get(i));
        }
        return _results;
      }).call(this);
      return String.fromCharCode.apply(String, v);
    };

    BaseBuffer.prototype.base16_encode = function() {
      var c, i, tmp, _i, _ref1;
      tmp = "";
      for (i = _i = 0, _ref1 = this._tot; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        c = this._get(i);
        tmp += this.B16.fwd[c >> 4];
        tmp += this.B16.fwd[c & 0xf];
      }
      return tmp;
    };

    BaseBuffer.prototype.bytes_left = function() {
      return this._tot - this._cp;
    };

    BaseBuffer.prototype.base32_encode = function() {
      var b, c, l, outlen, p, _i;
      b = [];
      l = this._tot;
      outlen = Math.floor(l / 5) * 8 + [0, 2, 4, 5, 7][l % 5];
      p = 0;
      for (c = _i = 0; _i < l; c = _i += 5) {
        b[p++] = this.B32.fwd[this._get(c) >> 3];
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x7) << 2 | this._get(++c) >> 6];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) >> 1 & 0x1f];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x1) << 4 | this._get(++c) >> 4];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0xf) << 1 | this._get(++c) >> 7];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) >> 2 & 0x1f];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x3) << 3 | this._get(++c) >> 5];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) & 0x1f];
        }
      }
      return b.slice(0, outlen).join('');
    };

    BaseBuffer.prototype.base64_encode = function() {
      return this._base64_encode(this.B64);
    };

    BaseBuffer.prototype.base64a_encode = function() {
      return this._base64_encode(this.B64A);
    };

    BaseBuffer.prototype.base64x_encode = function() {
      return this._base64_encode(this.B64X);
    };

    BaseBuffer.prototype._base64_encode = function(M) {
      var b, c, i, l, n, p, _i, _j;
      b = [];
      l = this._tot;
      c = l % 3;
      p = c > 0 ? (function() {
        var _i, _results;
        _results = [];
        for (i = _i = c; c <= 3 ? _i < 3 : _i > 3; i = c <= 3 ? ++_i : --_i) {
          _results.push('=');
        }
        return _results;
      })() : [];
      for (c = _i = 0; _i < l; c = _i += 3) {
        n = (this._get(c) << 16) + (this._get(c + 1) << 8) + this._get(c + 2);
        for (i = _j = 3; _j >= 0; i = --_j) {
          b.push(M.fwd[(n >>> i * 6) & 0x3f]);
        }
      }
      return (b.slice(0, b.length - p.length).concat(p)).join('');
    };

    BaseBuffer._decode = function(klass, s, enc) {
      var obj;
      obj = new klass;
      if ((enc == null) && typeof s === 'string') {
        return obj.base64_decode(s);
      } else {
        switch (enc) {
          case 'buffer':
            return obj.buffer_decode(s);
          case 'binary':
            return obj.binary_decode(s);
          case 'base64':
            return obj.base64_decode(s);
          case 'base64a':
            return obj.base64a_decode(s);
          case 'base64x':
            return obj.base64x_decode(s);
          case 'base32':
            return obj.base32_decode(s);
          case 'hex':
            return obj.base16_decode(s);
          case 'ui8a':
            return obj.ui8a_decode(s);
          default:
            return null;
        }
      }
    };

    BaseBuffer.prototype.buffer_decode = function(s) {
      return this.ui8a_decode(s);
    };

    BaseBuffer.prototype.binary_decode = function(b) {
      var i, _i, _ref1;
      for (i = _i = 0, _ref1 = b.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        this.push_uint8(b.charCodeAt(i));
      }
      return this;
    };

    BaseBuffer.prototype.base16_decode = function(data) {
      var c, i, last, v, _i, _len;
      if ((data.length % 2) !== 0) {
        return null;
      } else {
        last = 0;
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          c = data[i];
          if ((v = this.B16.rev[c]) == null) {
            return null;
          }
          if (i % 2 === 0) {
            last = v;
          } else {
            this.push_uint8((last << 4) | v);
          }
        }
        return this;
      }
    };

    BaseBuffer.prototype._base64_decode = function(data, M) {
      var c, i, npad, sum, v, _i, _j, _len;
      if ((data.length % 4) !== 0) {
        return null;
      } else {
        sum = 0;
        npad = 0;
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          c = data[i];
          if ((v = M.rev[c]) == null) {
            return null;
          }
          if (c === '=') {
            npad++;
          }
          sum = (sum << 6) | v;
          if (i % 4 === 3) {
            for (i = _j = 2; 2 <= npad ? _j <= npad : _j >= npad; i = 2 <= npad ? ++_j : --_j) {
              this.push_uint8((sum >> i * 8) & 0xff);
            }
            sum = 0;
          }
        }
        return this;
      }
    };

    BaseBuffer.prototype.base64_decode = function(data) {
      return this._base64_decode(data, this.B64);
    };

    BaseBuffer.prototype.base64a_decode = function(data) {
      return this._base64_decode(data, this.B64A);
    };

    BaseBuffer.prototype.base64x_decode = function(data) {
      return this._base64_decode(data, this.B64X);
    };

    BaseBuffer.prototype.base32_decode = function(data) {
      var before, c, i, j, nmb, rem, sum, v, _i, _j, _k, _l, _len, _ref1;
      sum = 0;
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        c = data[i];
        if ((v = this.B32.rev[c]) == null) {
          return null;
        }
        before = sum;
        sum = (sum * 32) + v;
        if (i % 8 === 7) {
          for (j = _j = 4; _j >= 0; j = --_j) {
            this.push_uint8(rshift(sum, j * 8) & 0xff);
          }
          sum = 0;
        }
      }
      if ((rem = data.length % 8) !== 0) {
        for (i = _k = 8; 8 <= rem ? _k < rem : _k > rem; i = 8 <= rem ? ++_k : --_k) {
          sum *= 32;
        }
        if ((nmb = {
          2: 1,
          4: 2,
          5: 3,
          7: 4
        }[rem]) == null) {
          return null;
        }
        for (i = _l = 4, _ref1 = 4 - nmb; 4 <= _ref1 ? _l < _ref1 : _l > _ref1; i = 4 <= _ref1 ? ++_l : --_l) {
          this.push_uint8(rshift(sum, i * 8) & 0xff);
        }
      }
      return this;
    };

    BaseBuffer.prototype.read_bytes = function(n) {
      var i, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        _results.push(this.read_uint8());
      }
      return _results;
    };

    return BaseBuffer;

  })();

  exports.is_uint8_array = function(x) {
    return Object.prototype.toString.call(x) === '[object Uint8Array]';
  };

}).call(this);