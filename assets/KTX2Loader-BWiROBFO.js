import { M as Matrix3, S as SRGBTransfer, L as LinearTransfer, a as SRGBColorSpace, C as ColorManagement, b as Loader, F as FileLoader, c as CompressedCubeTexture, d as CompressedArrayTexture, e as CompressedTexture, f as LinearFilter, g as LinearMipmapLinearFilter, R as RGBA_S3TC_DXT1_Format, h as RGB_PVRTC_4BPPV1_Format, i as RGB_ETC2_Format, j as RGB_ETC1_Format, k as RGBA_S3TC_DXT5_Format, l as RGBA_PVRTC_4BPPV1_Format, m as RGBA_ETC2_EAC_Format, n as RGBA_BPTC_Format, o as RGB_BPTC_UNSIGNED_Format, p as RGBA_ASTC_4x4_Format, q as RGBAFormat, r as FloatType, H as HalfFloatType, U as UnsignedByteType, s as RGBFormat, t as RGFormat, u as RedFormat, v as RGBA_PVRTC_2BPPV1_Format, w as RED_GREEN_RGTC2_Format, x as SIGNED_RED_GREEN_RGTC2_Format, y as RED_RGTC1_Format, z as SIGNED_RED_RGTC1_Format, A as RGBA_S3TC_DXT3_Format, B as RGB_S3TC_DXT1_Format, D as RGBA_ASTC_6x6_Format, E as UnsignedInt101111Type, G as UnsignedInt5999Type, I as DataTexture, J as Data3DTexture, N as NearestMipmapNearestFilter, K as NearestFilter, O as LinearSRGBColorSpace, P as NoColorSpace } from "./index-D23gSIn4.js";
class WorkerPool {
  /**
   * Constructs a new Worker pool.
   *
   * @param {number} [pool=4] - The size of the pool.
   */
  constructor(pool = 4) {
    this.pool = pool;
    this.queue = [];
    this.workers = [];
    this.workersResolve = [];
    this.workerStatus = 0;
    this.workerCreator = null;
  }
  _initWorker(workerId) {
    if (!this.workers[workerId]) {
      const worker = this.workerCreator();
      worker.addEventListener("message", this._onMessage.bind(this, workerId));
      this.workers[workerId] = worker;
    }
  }
  _getIdleWorker() {
    for (let i2 = 0; i2 < this.pool; i2++)
      if (!(this.workerStatus & 1 << i2)) return i2;
    return -1;
  }
  _onMessage(workerId, msg) {
    const resolve = this.workersResolve[workerId];
    resolve && resolve(msg);
    if (this.queue.length) {
      const { resolve: resolve2, msg: msg2, transfer } = this.queue.shift();
      this.workersResolve[workerId] = resolve2;
      this.workers[workerId].postMessage(msg2, transfer);
    } else {
      this.workerStatus ^= 1 << workerId;
    }
  }
  /**
   * Sets a function that is responsible for creating Workers.
   *
   * @param {Function} workerCreator - The worker creator function.
   */
  setWorkerCreator(workerCreator) {
    this.workerCreator = workerCreator;
  }
  /**
   * Sets the Worker limit
   *
   * @param {number} pool - The size of the pool.
   */
  setWorkerLimit(pool) {
    this.pool = pool;
  }
  /**
   * Post a message to an idle Worker. If no Worker is available,
   * the message is pushed into a message queue for later processing.
   *
   * @param {Object} msg - The message.
   * @param {Array<ArrayBuffer>} transfer - An array with array buffers for data transfer.
   * @return {Promise} A Promise that resolves when the message has been processed.
   */
  postMessage(msg, transfer) {
    return new Promise((resolve) => {
      const workerId = this._getIdleWorker();
      if (workerId !== -1) {
        this._initWorker(workerId);
        this.workerStatus |= 1 << workerId;
        this.workersResolve[workerId] = resolve;
        this.workers[workerId].postMessage(msg, transfer);
      } else {
        this.queue.push({ resolve, msg, transfer });
      }
    });
  }
  /**
   * Terminates all Workers of this pool. Call this  method whenever this
   * Worker pool is no longer used in your app.
   */
  dispose() {
    this.workers.forEach((worker) => worker.terminate());
    this.workersResolve.length = 0;
    this.workers.length = 0;
    this.queue.length = 0;
    this.workerStatus = 0;
  }
}
const t = 0, e = 1, n = 2, i = 3, s = 0, a = 0, r = 2, o = 0, l = 1, f = 160, c = 161, U = 162, h = 163, p = 166, _ = 0, u = 1, g$1 = 0, x = 1, y = 2, b = 3, m = 4, d = 5, D = 6, w = 7, v = 8, B$1 = 9, L = 10, A$1 = 11, k = 12, I$1 = 13, V = 14, C$1 = 15, F = 16, O = 17, T = 18, S = 0, E = 1, P = 2, M = 3, N = 4, W = 5, H = 6, z = 7, j = 8, K = 9, X = 10, Y = 11, R = 0, G = 1, q = 2, J = 13, Q$1 = 14, Z = 15, $ = 128, tt = 64, et = 32, nt = 16, it = 0, st = 1, at = 2, rt = 3, ot = 4, lt = 5, ft = 6, ct = 7, Ut = 8, ht = 9, pt = 10, _t = 13, ut = 14, gt = 15, xt = 16, yt = 17, bt = 20, mt = 21, dt = 22, Dt = 23, wt = 24, vt = 27, Bt = 28, Lt = 29, At = 30, kt = 31, It = 34, Vt = 35, Ct = 36, Ft = 37, Ot = 38, Tt = 41, St = 42, Et = 43, Pt = 44, Mt = 45, Nt = 48, Wt = 49, Ht = 50, zt = 58, jt = 59, Kt = 62, Xt = 63, Yt = 64, Rt = 65, Gt = 68, qt = 69, Jt = 70, Qt = 71, Zt = 74, $t = 75, te = 76, ee = 77, ne = 78, ie = 81, se = 82, ae = 83, re = 84, oe = 85, le = 88, fe = 89, ce = 90, Ue = 91, he = 92, pe = 95, _e = 96, ue = 97, ge = 98, xe = 99, ye = 100, be = 101, me = 102, de = 103, De = 104, we = 105, ve = 106, Be = 107, Le = 108, Ae = 109, ke = 110, Ie = 111, Ve = 112, Ce = 113, Fe = 114, Oe = 115, Te = 116, Se = 117, Ee = 118, Pe = 119, Me = 120, Ne = 121, We = 122, He = 123, ze = 124, je = 125, Ke = 126, Xe = 127, Ye = 128, Re = 129, Ge = 130, qe = 131, Je = 132, Qe = 133, Ze = 134, $e = 135, tn = 136, en = 137, nn = 138, sn = 139, an = 140, rn = 141, on = 142, ln = 143, fn = 144, cn = 145, Un = 146, hn = 147, pn = 148, _n = 149, un = 150, gn = 151, xn = 152, yn = 153, bn = 154, mn = 155, dn = 156, Dn = 157, wn = 158, vn = 159, Bn = 160, Ln = 161, An = 162, kn = 163, In = 164, Vn = 165, Cn = 166, Fn = 167, On = 168, Tn = 169, Sn = 170, En = 171, Pn = 172, Mn = 173, Nn = 174, Wn = 175, Hn = 176, zn = 177, jn = 178, Kn = 179, Xn = 180, Yn = 181, Rn = 182, Gn = 183, qn = 184, Jn = 1000156007, Qn = 1000156008, Zn = 1000156009, $n = 1000156010, ti = 1000156011, ei = 1000156017, ni = 1000156018, ii = 1000156019, si = 1000156020, ai = 1000156021, ri = 1000054e3, oi = 1000054001, li = 1000054002, fi = 1000054003, ci = 1000054004, Ui = 1000054005, hi = 1000054006, pi = 1000054007, _i = 1000066e3, ui = 1000066001, gi = 1000066002, xi = 1000066003, yi = 1000066004, bi = 1000066005, mi = 1000066006, di = 1000066007, Di = 1000066008, wi = 1000066009, vi = 1000066010, Bi = 1000066011, Li = 1000066012, Ai = 1000066013, ki = 100034e4, Ii = 1000340001;
function Vi() {
  return { vkFormat: 0, typeSize: 1, pixelWidth: 0, pixelHeight: 0, pixelDepth: 0, layerCount: 0, faceCount: 1, levelCount: 0, supercompressionScheme: 0, levels: [], dataFormatDescriptor: [{ vendorId: 0, descriptorType: 0, versionNumber: 2, colorModel: 0, colorPrimaries: 1, transferFunction: 2, flags: 0, texelBlockDimension: [0, 0, 0, 0], bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0], samples: [] }], keyValue: {}, globalData: null };
}
class Ci {
  constructor(t2, e2, n2, i2) {
    this._dataView = void 0, this._littleEndian = void 0, this._offset = void 0, this._dataView = new DataView(t2.buffer, t2.byteOffset + e2, n2), this._littleEndian = i2, this._offset = 0;
  }
  _nextUint8() {
    const t2 = this._dataView.getUint8(this._offset);
    return this._offset += 1, t2;
  }
  _nextUint16() {
    const t2 = this._dataView.getUint16(this._offset, this._littleEndian);
    return this._offset += 2, t2;
  }
  _nextUint32() {
    const t2 = this._dataView.getUint32(this._offset, this._littleEndian);
    return this._offset += 4, t2;
  }
  _nextUint64() {
    const t2 = this._dataView.getUint32(this._offset, this._littleEndian) + 2 ** 32 * this._dataView.getUint32(this._offset + 4, this._littleEndian);
    return this._offset += 8, t2;
  }
  _nextInt32() {
    const t2 = this._dataView.getInt32(this._offset, this._littleEndian);
    return this._offset += 4, t2;
  }
  _nextUint8Array(t2) {
    const e2 = new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + this._offset, t2);
    return this._offset += t2, e2;
  }
  _skip(t2) {
    return this._offset += t2, this;
  }
  _scan(t2, e2 = 0) {
    const n2 = this._offset;
    let i2 = 0;
    for (; this._dataView.getUint8(this._offset) !== e2 && i2 < t2; ) i2++, this._offset++;
    return i2 < t2 && this._offset++, new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + n2, i2);
  }
}
const Fi = new Uint8Array([0]), Oi = [171, 75, 84, 88, 32, 50, 48, 187, 13, 10, 26, 10];
function Ti(t2) {
  return new TextEncoder().encode(t2);
}
function Si(t2) {
  return new TextDecoder().decode(t2);
}
function Ei(t2) {
  let e2 = 0;
  for (const n3 of t2) e2 += n3.byteLength;
  const n2 = new Uint8Array(e2);
  let i2 = 0;
  for (const e3 of t2) n2.set(new Uint8Array(e3), i2), i2 += e3.byteLength;
  return n2;
}
function Pi(t2, e2 = 4) {
  return Math.ceil(t2 / e2) * e2 - t2;
}
function Mi(t2) {
  const e2 = new Uint8Array(t2.buffer, t2.byteOffset, Oi.length);
  if (e2[0] !== Oi[0] || e2[1] !== Oi[1] || e2[2] !== Oi[2] || e2[3] !== Oi[3] || e2[4] !== Oi[4] || e2[5] !== Oi[5] || e2[6] !== Oi[6] || e2[7] !== Oi[7] || e2[8] !== Oi[8] || e2[9] !== Oi[9] || e2[10] !== Oi[10] || e2[11] !== Oi[11]) throw new Error("Missing KTX 2.0 identifier.");
  const n2 = { vkFormat: 0, typeSize: 1, pixelWidth: 0, pixelHeight: 0, pixelDepth: 0, layerCount: 0, faceCount: 1, levelCount: 0, supercompressionScheme: 0, levels: [], dataFormatDescriptor: [{ vendorId: 0, descriptorType: 0, versionNumber: 2, colorModel: 0, colorPrimaries: 1, transferFunction: 2, flags: 0, texelBlockDimension: [0, 0, 0, 0], bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0], samples: [] }], keyValue: {}, globalData: null }, i2 = 17 * Uint32Array.BYTES_PER_ELEMENT, s2 = new Ci(t2, Oi.length, i2, true);
  n2.vkFormat = s2._nextUint32(), n2.typeSize = s2._nextUint32(), n2.pixelWidth = s2._nextUint32(), n2.pixelHeight = s2._nextUint32(), n2.pixelDepth = s2._nextUint32(), n2.layerCount = s2._nextUint32(), n2.faceCount = s2._nextUint32(), n2.levelCount = s2._nextUint32(), n2.supercompressionScheme = s2._nextUint32();
  const a2 = s2._nextUint32(), r2 = s2._nextUint32(), o2 = s2._nextUint32(), l2 = s2._nextUint32(), f2 = s2._nextUint64(), c2 = s2._nextUint64(), U2 = 3 * Math.max(n2.levelCount, 1) * 8, h2 = new Ci(t2, Oi.length + i2, U2, true);
  for (let e3 = 0, i3 = Math.max(n2.levelCount, 1); e3 < i3; e3++) n2.levels.push({ levelData: new Uint8Array(t2.buffer, t2.byteOffset + h2._nextUint64(), h2._nextUint64()), uncompressedByteLength: h2._nextUint64() });
  const p2 = new Ci(t2, a2, r2, true);
  p2._skip(4);
  const _2 = p2._nextUint16(), u2 = p2._nextUint16(), g2 = p2._nextUint16(), x2 = p2._nextUint16(), y2 = { vendorId: _2, descriptorType: u2, versionNumber: g2, colorModel: p2._nextUint8(), colorPrimaries: p2._nextUint8(), transferFunction: p2._nextUint8(), flags: p2._nextUint8(), texelBlockDimension: [p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8()], bytesPlane: [p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8()], samples: [] }, b2 = (x2 / 4 - 6) / 4;
  for (let t3 = 0; t3 < b2; t3++) {
    const e3 = { bitOffset: p2._nextUint16(), bitLength: p2._nextUint8(), channelType: p2._nextUint8(), samplePosition: [p2._nextUint8(), p2._nextUint8(), p2._nextUint8(), p2._nextUint8()], sampleLower: Number.NEGATIVE_INFINITY, sampleUpper: Number.POSITIVE_INFINITY };
    64 & e3.channelType ? (e3.sampleLower = p2._nextInt32(), e3.sampleUpper = p2._nextInt32()) : (e3.sampleLower = p2._nextUint32(), e3.sampleUpper = p2._nextUint32()), y2.samples[t3] = e3;
  }
  n2.dataFormatDescriptor.length = 0, n2.dataFormatDescriptor.push(y2);
  const m2 = new Ci(t2, o2, l2, true);
  for (; m2._offset < l2; ) {
    const t3 = m2._nextUint32(), e3 = m2._scan(t3), i3 = Si(e3);
    if (n2.keyValue[i3] = m2._nextUint8Array(t3 - e3.byteLength - 1), i3.match(/^ktx/i)) {
      const t4 = Si(n2.keyValue[i3]);
      n2.keyValue[i3] = t4.substring(0, t4.lastIndexOf("\0"));
    }
    m2._skip(t3 % 4 ? 4 - t3 % 4 : 0);
  }
  if (c2 <= 0) return n2;
  const d2 = new Ci(t2, f2, c2, true), D2 = d2._nextUint16(), w2 = d2._nextUint16(), v2 = d2._nextUint32(), B2 = d2._nextUint32(), L2 = d2._nextUint32(), A2 = d2._nextUint32(), k2 = [];
  for (let t3 = 0, e3 = Math.max(n2.levelCount, 1); t3 < e3; t3++) k2.push({ imageFlags: d2._nextUint32(), rgbSliceByteOffset: d2._nextUint32(), rgbSliceByteLength: d2._nextUint32(), alphaSliceByteOffset: d2._nextUint32(), alphaSliceByteLength: d2._nextUint32() });
  const I2 = f2 + d2._offset, V2 = I2 + v2, C2 = V2 + B2, F2 = C2 + L2, O2 = new Uint8Array(t2.buffer, t2.byteOffset + I2, v2), T2 = new Uint8Array(t2.buffer, t2.byteOffset + V2, B2), S2 = new Uint8Array(t2.buffer, t2.byteOffset + C2, L2), E2 = new Uint8Array(t2.buffer, t2.byteOffset + F2, A2);
  return n2.globalData = { endpointCount: D2, selectorCount: w2, imageDescs: k2, endpointsData: O2, selectorsData: T2, tablesData: S2, extendedData: E2 }, n2;
}
function Ni() {
  return Ni = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var n2 = arguments[e2];
      for (var i2 in n2) ({}).hasOwnProperty.call(n2, i2) && (t2[i2] = n2[i2]);
    }
    return t2;
  }, Ni.apply(null, arguments);
}
const Wi = { keepWriter: false };
function Hi(t2, e2 = {}) {
  e2 = Ni({}, Wi, e2);
  let n2 = new ArrayBuffer(0);
  if (t2.globalData) {
    const e3 = new ArrayBuffer(20 + 5 * t2.globalData.imageDescs.length * 4), i3 = new DataView(e3);
    i3.setUint16(0, t2.globalData.endpointCount, true), i3.setUint16(2, t2.globalData.selectorCount, true), i3.setUint32(4, t2.globalData.endpointsData.byteLength, true), i3.setUint32(8, t2.globalData.selectorsData.byteLength, true), i3.setUint32(12, t2.globalData.tablesData.byteLength, true), i3.setUint32(16, t2.globalData.extendedData.byteLength, true);
    for (let e4 = 0; e4 < t2.globalData.imageDescs.length; e4++) {
      const n3 = t2.globalData.imageDescs[e4];
      i3.setUint32(20 + 5 * e4 * 4 + 0, n3.imageFlags, true), i3.setUint32(20 + 5 * e4 * 4 + 4, n3.rgbSliceByteOffset, true), i3.setUint32(20 + 5 * e4 * 4 + 8, n3.rgbSliceByteLength, true), i3.setUint32(20 + 5 * e4 * 4 + 12, n3.alphaSliceByteOffset, true), i3.setUint32(20 + 5 * e4 * 4 + 16, n3.alphaSliceByteLength, true);
    }
    n2 = Ei([e3, t2.globalData.endpointsData, t2.globalData.selectorsData, t2.globalData.tablesData, t2.globalData.extendedData]);
  }
  const i2 = [], s2 = Object.entries(Ni({}, t2.keyValue, !e2.keepWriter && { KTXwriter: "KTX-Parse v1.0.1" }));
  s2.sort((t3, e3) => t3[0] > e3[0] ? 1 : -1);
  for (const [t3, e3] of s2) {
    const n3 = Ti(t3), s3 = "string" == typeof e3 ? Ei([Ti(e3), Fi]) : e3, a3 = n3.byteLength + 1 + s3.byteLength, r3 = Pi(a3, 4);
    i2.push(Ei([new Uint32Array([a3]), n3, Fi, s3, new Uint8Array(r3).fill(0)]));
  }
  const a2 = Ei(i2);
  if (1 !== t2.dataFormatDescriptor.length || 0 !== t2.dataFormatDescriptor[0].descriptorType) throw new Error("Only BASICFORMAT Data Format Descriptor output supported.");
  const r2 = t2.dataFormatDescriptor[0], o2 = new ArrayBuffer(28 + 16 * r2.samples.length), l2 = new DataView(o2), f2 = 24 + 16 * r2.samples.length;
  if (l2.setUint32(0, o2.byteLength, true), l2.setUint16(4, r2.vendorId, true), l2.setUint16(6, r2.descriptorType, true), l2.setUint16(8, r2.versionNumber, true), l2.setUint16(10, f2, true), l2.setUint8(12, r2.colorModel), l2.setUint8(13, r2.colorPrimaries), l2.setUint8(14, r2.transferFunction), l2.setUint8(15, r2.flags), !Array.isArray(r2.texelBlockDimension)) throw new Error("texelBlockDimension is now an array. For dimensionality `d`, set `d - 1`.");
  l2.setUint8(16, r2.texelBlockDimension[0]), l2.setUint8(17, r2.texelBlockDimension[1]), l2.setUint8(18, r2.texelBlockDimension[2]), l2.setUint8(19, r2.texelBlockDimension[3]);
  for (let t3 = 0; t3 < 8; t3++) l2.setUint8(20 + t3, r2.bytesPlane[t3]);
  for (let t3 = 0; t3 < r2.samples.length; t3++) {
    const e3 = r2.samples[t3], n3 = 28 + 16 * t3;
    l2.setUint16(n3 + 0, e3.bitOffset, true), l2.setUint8(n3 + 2, e3.bitLength), l2.setUint8(n3 + 3, e3.channelType), l2.setUint8(n3 + 4, e3.samplePosition[0]), l2.setUint8(n3 + 5, e3.samplePosition[1]), l2.setUint8(n3 + 6, e3.samplePosition[2]), l2.setUint8(n3 + 7, e3.samplePosition[3]), 64 & e3.channelType ? (l2.setInt32(n3 + 8, e3.sampleLower, true), l2.setInt32(n3 + 12, e3.sampleUpper, true)) : (l2.setUint32(n3 + 8, e3.sampleLower, true), l2.setUint32(n3 + 12, e3.sampleUpper, true));
  }
  const c2 = Oi.length + 68 + 3 * t2.levels.length * 8, U2 = c2 + o2.byteLength;
  let h2 = n2.byteLength > 0 ? U2 + a2.byteLength : 0;
  h2 % 8 && (h2 += 8 - h2 % 8);
  const p2 = [], _2 = new DataView(new ArrayBuffer(3 * t2.levels.length * 8)), u2 = new Uint32Array(t2.levels.length);
  let g2 = 0;
  0 === t2.supercompressionScheme && (g2 = (function(t3) {
    const e3 = Math.max(t3, 4), n3 = Math.min(t3, 4);
    let i3 = e3;
    for (; i3 % n3 !== 0; ) i3 += e3;
    return i3;
  })((function(t3) {
    return t3.levels[0].levelData.byteLength / (function(t4) {
      let e3 = 1;
      const n3 = [t4.pixelWidth, t4.pixelHeight, t4.pixelDepth], i3 = (function(t5) {
        const [e4, n4, i4] = t5.dataFormatDescriptor[0].texelBlockDimension;
        return [e4 + 1, n4 + 1, i4 + 1];
      })(t4);
      for (let t5 = 0; t5 < 3; t5++) if (n3[t5] > 0) {
        const s3 = Math.ceil(Math.floor(1 * n3[t5]) / i3[t5]);
        e3 *= Math.max(1, s3);
      }
      return t4.layerCount > 0 && (e3 *= t4.layerCount), t4.faceCount > 0 && (e3 *= t4.faceCount), e3;
    })(t3);
  })(t2)));
  let x2 = (h2 || U2 + a2.byteLength) + n2.byteLength;
  for (let e3 = t2.levels.length - 1; e3 >= 0; e3--) {
    if (x2 % g2) {
      const t3 = Pi(x2, g2);
      p2.push(new Uint8Array(t3)), x2 += t3;
    }
    const n3 = t2.levels[e3];
    p2.push(n3.levelData), u2[e3] = x2, x2 += n3.levelData.byteLength;
  }
  for (let e3 = 0; e3 < t2.levels.length; e3++) {
    const n3 = t2.levels[e3];
    _2.setBigUint64(24 * e3 + 0, BigInt(u2[e3]), true), _2.setBigUint64(24 * e3 + 8, BigInt(n3.levelData.byteLength), true), _2.setBigUint64(24 * e3 + 16, BigInt(n3.uncompressedByteLength), true);
  }
  const y2 = new ArrayBuffer(68), b2 = new DataView(y2);
  return b2.setUint32(0, t2.vkFormat, true), b2.setUint32(4, t2.typeSize, true), b2.setUint32(8, t2.pixelWidth, true), b2.setUint32(12, t2.pixelHeight, true), b2.setUint32(16, t2.pixelDepth, true), b2.setUint32(20, t2.layerCount, true), b2.setUint32(24, t2.faceCount, true), b2.setUint32(28, t2.levelCount, true), b2.setUint32(32, t2.supercompressionScheme, true), b2.setUint32(36, c2, true), b2.setUint32(40, o2.byteLength, true), b2.setUint32(44, U2, true), b2.setUint32(48, a2.byteLength, true), b2.setBigUint64(52, BigInt(n2.byteLength > 0 ? h2 : 0), true), b2.setBigUint64(60, BigInt(n2.byteLength), true), new Uint8Array(Ei([new Uint8Array(Oi).buffer, y2, _2.buffer, o2, a2, h2 > 0 ? new ArrayBuffer(h2 - (U2 + a2.byteLength)) : new ArrayBuffer(0), n2, ...p2]));
}
let A, I, B;
const g = { env: { emscripten_notify_memory_growth: function(A2) {
  B = new Uint8Array(I.exports.memory.buffer);
} } };
class Q {
  init() {
    return A || (A = "undefined" != typeof fetch ? fetch("data:application/wasm;base64," + C).then((A2) => A2.arrayBuffer()).then((A2) => WebAssembly.instantiate(A2, g)).then(this._init) : WebAssembly.instantiate(Buffer.from(C, "base64"), g).then(this._init), A);
  }
  _init(A2) {
    I = A2.instance, g.env.emscripten_notify_memory_growth(0);
  }
  decode(A2, g2 = 0) {
    if (!I) throw new Error("ZSTDDecoder: Await .init() before decoding.");
    const Q2 = A2.byteLength, C2 = I.exports.malloc(Q2);
    B.set(A2, C2), g2 = g2 || Number(I.exports.ZSTD_findDecompressedSize(C2, Q2));
    const E2 = I.exports.malloc(g2), i2 = I.exports.ZSTD_decompress(E2, g2, C2, Q2), D2 = B.slice(E2, E2 + i2);
    return I.exports.free(C2), I.exports.free(E2), D2;
  }
}
const C = "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IAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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";
const P3_PRIMARIES = [0.68, 0.32, 0.265, 0.69, 0.15, 0.06];
const P3_LUMINANCE_COEFFICIENTS = [0.2289, 0.6917, 0.0793];
const REC2020_PRIMARIES = [0.708, 0.292, 0.17, 0.797, 0.131, 0.046];
const REC2020_LUMINANCE_COEFFICIENTS = [0.2627, 0.678, 0.0593];
const D65 = [0.3127, 0.329];
const LINEAR_DISPLAY_P3_TO_XYZ = /* @__PURE__ */ new Matrix3().set(
  0.4865709,
  0.2656677,
  0.1982173,
  0.2289746,
  0.6917385,
  0.0792869,
  0,
  0.0451134,
  1.0439444
);
const XYZ_TO_LINEAR_DISPLAY_P3 = /* @__PURE__ */ new Matrix3().set(
  2.4934969,
  -0.9313836,
  -0.4027108,
  -0.829489,
  1.7626641,
  0.0236247,
  0.0358458,
  -0.0761724,
  0.9568845
);
const DisplayP3ColorSpace = "display-p3";
const LinearDisplayP3ColorSpace = "display-p3-linear";
const DisplayP3ColorSpaceImpl = {
  primaries: P3_PRIMARIES,
  whitePoint: D65,
  transfer: SRGBTransfer,
  toXYZ: LINEAR_DISPLAY_P3_TO_XYZ,
  fromXYZ: XYZ_TO_LINEAR_DISPLAY_P3,
  luminanceCoefficients: P3_LUMINANCE_COEFFICIENTS,
  outputColorSpaceConfig: { drawingBufferColorSpace: DisplayP3ColorSpace }
};
const LinearDisplayP3ColorSpaceImpl = {
  primaries: P3_PRIMARIES,
  whitePoint: D65,
  transfer: LinearTransfer,
  toXYZ: LINEAR_DISPLAY_P3_TO_XYZ,
  fromXYZ: XYZ_TO_LINEAR_DISPLAY_P3,
  luminanceCoefficients: P3_LUMINANCE_COEFFICIENTS,
  workingColorSpaceConfig: { unpackColorSpace: DisplayP3ColorSpace },
  outputColorSpaceConfig: { drawingBufferColorSpace: DisplayP3ColorSpace }
};
const LINEAR_REC2020_TO_XYZ = /* @__PURE__ */ new Matrix3().set(
  0.636958,
  0.1446169,
  0.168881,
  0.2627002,
  0.6779981,
  0.0593017,
  0,
  0.0280727,
  1.0609851
);
const XYZ_TO_LINEAR_REC2020 = /* @__PURE__ */ new Matrix3().set(
  1.7166512,
  -0.3556708,
  -0.2533663,
  -0.6666844,
  1.6164812,
  0.0157685,
  0.0176399,
  -0.0427706,
  0.9421031
);
const LinearRec2020ColorSpace = "rec2020-linear";
const LinearRec2020ColorSpaceImpl = {
  primaries: REC2020_PRIMARIES,
  whitePoint: D65,
  transfer: LinearTransfer,
  toXYZ: LINEAR_REC2020_TO_XYZ,
  fromXYZ: XYZ_TO_LINEAR_REC2020,
  luminanceCoefficients: REC2020_LUMINANCE_COEFFICIENTS
};
const ExtendedSRGBColorSpace = "extended-srgb";
const ExtendedSRGBColorSpaceImpl = {
  ...ColorManagement.spaces[SRGBColorSpace],
  outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace, toneMappingMode: "extended" }
};
const _taskCache = /* @__PURE__ */ new WeakMap();
let _activeLoaders = 0;
let _zstd;
class KTX2Loader extends Loader {
  /**
   * Constructs a new KTX2 loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(manager) {
    super(manager);
    this.transcoderPath = "";
    this.transcoderBinary = null;
    this.transcoderPending = null;
    this.workerPool = new WorkerPool();
    this.workerSourceURL = "";
    this.workerConfig = null;
    if (typeof MSC_TRANSCODER !== "undefined") {
      console.warn(
        'THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.'
      );
    }
  }
  /**
   * Sets the transcoder path.
   *
   * The WASM transcoder and JS wrapper are available from the `examples/jsm/libs/basis` directory.
   *
   * @param {string} path - The transcoder path to set.
   * @return {KTX2Loader} A reference to this loader.
   */
  setTranscoderPath(path) {
    this.transcoderPath = path;
    return this;
  }
  /**
   * Sets the maximum number of Web Workers to be allocated by this instance.
   *
   * @param {number} workerLimit - The worker limit.
   * @return {KTX2Loader} A reference to this loader.
   */
  setWorkerLimit(workerLimit) {
    this.workerPool.setWorkerLimit(workerLimit);
    return this;
  }
  /**
   * Async version of {@link KTX2Loader#detectSupport}.
   *
   * @async
   * @param {WebGPURenderer|WebGLRenderer} renderer - The renderer.
   * @return {Promise} A Promise that resolves when the support has been detected.
   */
  async detectSupportAsync(renderer) {
    this.workerConfig = {
      astcSupported: await renderer.hasFeatureAsync("texture-compression-astc"),
      astcHDRSupported: false,
      // https://github.com/gpuweb/gpuweb/issues/3856
      etc1Supported: await renderer.hasFeatureAsync("texture-compression-etc2"),
      etc2Supported: await renderer.hasFeatureAsync("texture-compression-etc2"),
      dxtSupported: await renderer.hasFeatureAsync("texture-compression-bc"),
      bptcSupported: await renderer.hasFeatureAsync("texture-compression-bc"),
      pvrtcSupported: await renderer.hasFeatureAsync("texture-compression-pvrtc")
    };
    return this;
  }
  /**
   * Detects hardware support for available compressed texture formats, to determine
   * the output format for the transcoder. Must be called before loading a texture.
   *
   * @param {WebGPURenderer|WebGLRenderer} renderer - The renderer.
   * @return {KTX2Loader} A reference to this loader.
   */
  detectSupport(renderer) {
    if (renderer.isWebGPURenderer === true) {
      this.workerConfig = {
        astcSupported: renderer.hasFeature("texture-compression-astc"),
        astcHDRSupported: false,
        // https://github.com/gpuweb/gpuweb/issues/3856
        etc1Supported: renderer.hasFeature("texture-compression-etc2"),
        etc2Supported: renderer.hasFeature("texture-compression-etc2"),
        dxtSupported: renderer.hasFeature("texture-compression-bc"),
        bptcSupported: renderer.hasFeature("texture-compression-bc"),
        pvrtcSupported: renderer.hasFeature("texture-compression-pvrtc")
      };
    } else {
      this.workerConfig = {
        astcSupported: renderer.extensions.has("WEBGL_compressed_texture_astc"),
        astcHDRSupported: renderer.extensions.has("WEBGL_compressed_texture_astc") && renderer.extensions.get("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr"),
        etc1Supported: renderer.extensions.has("WEBGL_compressed_texture_etc1"),
        etc2Supported: renderer.extensions.has("WEBGL_compressed_texture_etc"),
        dxtSupported: renderer.extensions.has("WEBGL_compressed_texture_s3tc"),
        bptcSupported: renderer.extensions.has("EXT_texture_compression_bptc"),
        pvrtcSupported: renderer.extensions.has("WEBGL_compressed_texture_pvrtc") || renderer.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")
      };
    }
    return this;
  }
  // TODO: Make this method private
  init() {
    if (!this.transcoderPending) {
      const jsLoader = new FileLoader(this.manager);
      jsLoader.setPath(this.transcoderPath);
      jsLoader.setWithCredentials(this.withCredentials);
      const jsContent = jsLoader.loadAsync("basis_transcoder.js");
      const binaryLoader = new FileLoader(this.manager);
      binaryLoader.setPath(this.transcoderPath);
      binaryLoader.setResponseType("arraybuffer");
      binaryLoader.setWithCredentials(this.withCredentials);
      const binaryContent = binaryLoader.loadAsync("basis_transcoder.wasm");
      this.transcoderPending = Promise.all([jsContent, binaryContent]).then(([jsContent2, binaryContent2]) => {
        const fn2 = KTX2Loader.BasisWorker.toString();
        const body = [
          "/* constants */",
          "let _EngineFormat = " + JSON.stringify(KTX2Loader.EngineFormat),
          "let _EngineType = " + JSON.stringify(KTX2Loader.EngineType),
          "let _TranscoderFormat = " + JSON.stringify(KTX2Loader.TranscoderFormat),
          "let _BasisFormat = " + JSON.stringify(KTX2Loader.BasisFormat),
          "/* basis_transcoder.js */",
          jsContent2,
          "/* worker */",
          fn2.substring(fn2.indexOf("{") + 1, fn2.lastIndexOf("}"))
        ].join("\n");
        this.workerSourceURL = URL.createObjectURL(new Blob([body]));
        this.transcoderBinary = binaryContent2;
        this.workerPool.setWorkerCreator(() => {
          const worker = new Worker(this.workerSourceURL);
          const transcoderBinary = this.transcoderBinary.slice(0);
          worker.postMessage({ type: "init", config: this.workerConfig, transcoderBinary }, [transcoderBinary]);
          return worker;
        });
      });
      if (_activeLoaders > 0) {
        console.warn(
          "THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."
        );
      }
      _activeLoaders++;
    }
    return this.transcoderPending;
  }
  /**
   * Starts loading from the given URL and passes the loaded KTX2 texture
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(CompressedTexture)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(url, onLoad, onProgress, onError) {
    if (this.workerConfig === null) {
      throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
    }
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setWithCredentials(this.withCredentials);
    loader.setResponseType("arraybuffer");
    loader.load(url, (buffer) => {
      this.parse(buffer, onLoad, onError);
    }, onProgress, onError);
  }
  /**
   * Parses the given KTX2 data.
   *
   * @param {ArrayBuffer} buffer - The raw KTX2 data as an array buffer.
   * @param {function(CompressedTexture)} onLoad - Executed when the loading/parsing process has been finished.
   * @param {onErrorCallback} onError - Executed when errors occur.
   * @returns {Promise} A Promise that resolves when the parsing has been finished.
   */
  parse(buffer, onLoad, onError) {
    if (this.workerConfig === null) {
      throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
    }
    if (_taskCache.has(buffer)) {
      const cachedTask = _taskCache.get(buffer);
      return cachedTask.promise.then(onLoad).catch(onError);
    }
    this._createTexture(buffer).then((texture) => onLoad ? onLoad(texture) : null).catch(onError);
  }
  _createTextureFrom(transcodeResult, container) {
    const { type: messageType, error, data: { faces, width, height, format, type, dfdFlags } } = transcodeResult;
    if (messageType === "error") return Promise.reject(error);
    let texture;
    if (container.faceCount === 6) {
      texture = new CompressedCubeTexture(faces, format, type);
    } else {
      const mipmaps = faces[0].mipmaps;
      texture = container.layerCount > 1 ? new CompressedArrayTexture(mipmaps, width, height, container.layerCount, format, type) : new CompressedTexture(mipmaps, width, height, format, type);
    }
    texture.minFilter = faces[0].mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    texture.colorSpace = parseColorSpace(container);
    texture.premultiplyAlpha = !!(dfdFlags & u);
    return texture;
  }
  /**
   * @private
   * @param {ArrayBuffer} buffer
   * @param {?Object} config
   * @return {Promise<CompressedTexture|CompressedArrayTexture|DataTexture|Data3DTexture>}
   */
  async _createTexture(buffer, config = {}) {
    const container = Mi(new Uint8Array(buffer));
    const isBasisHDR = container.vkFormat === _i && container.dataFormatDescriptor[0].colorModel === 167;
    const needsTranscoder = container.vkFormat === it || isBasisHDR && !this.workerConfig.astcHDRSupported;
    if (!needsTranscoder) {
      return createRawTexture(container);
    }
    const taskConfig = config;
    const texturePending = this.init().then(() => {
      return this.workerPool.postMessage({ type: "transcode", buffer, taskConfig }, [buffer]);
    }).then((e2) => this._createTextureFrom(e2.data, container));
    _taskCache.set(buffer, { promise: texturePending });
    return texturePending;
  }
  /**
   * Frees internal resources. This method should be called
   * when the loader is no longer required.
   */
  dispose() {
    this.workerPool.dispose();
    if (this.workerSourceURL) URL.revokeObjectURL(this.workerSourceURL);
    _activeLoaders--;
  }
}
KTX2Loader.BasisFormat = {
  ETC1S: 0,
  UASTC: 1,
  UASTC_HDR: 2
};
KTX2Loader.TranscoderFormat = {
  ETC1: 0,
  ETC2: 1,
  BC1: 2,
  BC3: 3,
  BC4: 4,
  BC5: 5,
  BC7_M6_OPAQUE_ONLY: 6,
  BC7_M5: 7,
  PVRTC1_4_RGB: 8,
  PVRTC1_4_RGBA: 9,
  ASTC_4x4: 10,
  ATC_RGB: 11,
  ATC_RGBA_INTERPOLATED_ALPHA: 12,
  RGBA32: 13,
  RGB565: 14,
  BGR565: 15,
  RGBA4444: 16,
  BC6H: 22,
  RGB_HALF: 24,
  RGBA_HALF: 25
};
KTX2Loader.EngineFormat = {
  RGBAFormat,
  RGBA_ASTC_4x4_Format,
  RGB_BPTC_UNSIGNED_Format,
  RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format,
  RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT1_Format
};
KTX2Loader.EngineType = {
  UnsignedByteType,
  HalfFloatType,
  FloatType
};
KTX2Loader.BasisWorker = function() {
  let config;
  let transcoderPending;
  let BasisModule;
  const EngineFormat = _EngineFormat;
  const EngineType = _EngineType;
  const TranscoderFormat = _TranscoderFormat;
  const BasisFormat = _BasisFormat;
  self.addEventListener("message", function(e2) {
    const message = e2.data;
    switch (message.type) {
      case "init":
        config = message.config;
        init(message.transcoderBinary);
        break;
      case "transcode":
        transcoderPending.then(() => {
          try {
            const { faces, buffers, width, height, hasAlpha, format, type, dfdFlags } = transcode(message.buffer);
            self.postMessage({ type: "transcode", id: message.id, data: { faces, width, height, hasAlpha, format, type, dfdFlags } }, buffers);
          } catch (error) {
            console.error(error);
            self.postMessage({ type: "error", id: message.id, error: error.message });
          }
        });
        break;
    }
  });
  function init(wasmBinary) {
    transcoderPending = new Promise((resolve) => {
      BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
      BASIS(BasisModule);
    }).then(() => {
      BasisModule.initializeBasis();
      if (BasisModule.KTX2File === void 0) {
        console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.");
      }
    });
  }
  function transcode(buffer) {
    const ktx2File = new BasisModule.KTX2File(new Uint8Array(buffer));
    function cleanup() {
      ktx2File.close();
      ktx2File.delete();
    }
    if (!ktx2File.isValid()) {
      cleanup();
      throw new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");
    }
    let basisFormat;
    if (ktx2File.isUASTC()) {
      basisFormat = BasisFormat.UASTC;
    } else if (ktx2File.isETC1S()) {
      basisFormat = BasisFormat.ETC1S;
    } else if (ktx2File.isHDR()) {
      basisFormat = BasisFormat.UASTC_HDR;
    } else {
      throw new Error("THREE.KTX2Loader: Unknown Basis encoding");
    }
    const width = ktx2File.getWidth();
    const height = ktx2File.getHeight();
    const layerCount = ktx2File.getLayers() || 1;
    const levelCount = ktx2File.getLevels();
    const faceCount = ktx2File.getFaces();
    const hasAlpha = ktx2File.getHasAlpha();
    const dfdFlags = ktx2File.getDFDFlags();
    const { transcoderFormat, engineFormat, engineType } = getTranscoderFormat(basisFormat, width, height, hasAlpha);
    if (!width || !height || !levelCount) {
      cleanup();
      throw new Error("THREE.KTX2Loader:	Invalid texture");
    }
    if (!ktx2File.startTranscoding()) {
      cleanup();
      throw new Error("THREE.KTX2Loader: .startTranscoding failed");
    }
    const faces = [];
    const buffers = [];
    for (let face = 0; face < faceCount; face++) {
      const mipmaps = [];
      for (let mip = 0; mip < levelCount; mip++) {
        const layerMips = [];
        let mipWidth, mipHeight;
        for (let layer = 0; layer < layerCount; layer++) {
          const levelInfo = ktx2File.getImageLevelInfo(mip, layer, face);
          if (face === 0 && mip === 0 && layer === 0 && (levelInfo.origWidth % 4 !== 0 || levelInfo.origHeight % 4 !== 0)) {
            console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions.");
          }
          if (levelCount > 1) {
            mipWidth = levelInfo.origWidth;
            mipHeight = levelInfo.origHeight;
          } else {
            mipWidth = levelInfo.width;
            mipHeight = levelInfo.height;
          }
          let dst = new Uint8Array(ktx2File.getImageTranscodedSizeInBytes(mip, layer, 0, transcoderFormat));
          const status = ktx2File.transcodeImage(dst, mip, layer, face, transcoderFormat, 0, -1, -1);
          if (engineType === EngineType.HalfFloatType) {
            dst = new Uint16Array(dst.buffer, dst.byteOffset, dst.byteLength / Uint16Array.BYTES_PER_ELEMENT);
          }
          if (!status) {
            cleanup();
            throw new Error("THREE.KTX2Loader: .transcodeImage failed.");
          }
          layerMips.push(dst);
        }
        const mipData = concat(layerMips);
        mipmaps.push({ data: mipData, width: mipWidth, height: mipHeight });
        buffers.push(mipData.buffer);
      }
      faces.push({ mipmaps, width, height, format: engineFormat, type: engineType });
    }
    cleanup();
    return { faces, buffers, width, height, hasAlpha, dfdFlags, format: engineFormat, type: engineType };
  }
  const FORMAT_OPTIONS = [
    {
      if: "astcSupported",
      basisFormat: [BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
      engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: Infinity,
      priorityUASTC: 1,
      needsPowerOfTwo: false
    },
    {
      if: "bptcSupported",
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
      engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 3,
      priorityUASTC: 2,
      needsPowerOfTwo: false
    },
    {
      if: "dxtSupported",
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
      engineFormat: [EngineFormat.RGBA_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 4,
      priorityUASTC: 5,
      needsPowerOfTwo: false
    },
    {
      if: "etc2Supported",
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
      engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 1,
      priorityUASTC: 3,
      needsPowerOfTwo: false
    },
    {
      if: "etc1Supported",
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.ETC1],
      engineFormat: [EngineFormat.RGB_ETC1_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 2,
      priorityUASTC: 4,
      needsPowerOfTwo: false
    },
    {
      if: "pvrtcSupported",
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
      engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
      engineType: [EngineType.UnsignedByteType],
      priorityETC1S: 5,
      priorityUASTC: 6,
      needsPowerOfTwo: true
    },
    {
      if: "bptcSupported",
      basisFormat: [BasisFormat.UASTC_HDR],
      transcoderFormat: [TranscoderFormat.BC6H],
      engineFormat: [EngineFormat.RGB_BPTC_UNSIGNED_Format],
      engineType: [EngineType.HalfFloatType],
      priorityHDR: 1,
      needsPowerOfTwo: false
    },
    // Uncompressed fallbacks.
    {
      basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC],
      transcoderFormat: [TranscoderFormat.RGBA32, TranscoderFormat.RGBA32],
      engineFormat: [EngineFormat.RGBAFormat, EngineFormat.RGBAFormat],
      engineType: [EngineType.UnsignedByteType, EngineType.UnsignedByteType],
      priorityETC1S: 100,
      priorityUASTC: 100,
      needsPowerOfTwo: false
    },
    {
      basisFormat: [BasisFormat.UASTC_HDR],
      transcoderFormat: [TranscoderFormat.RGBA_HALF],
      engineFormat: [EngineFormat.RGBAFormat],
      engineType: [EngineType.HalfFloatType],
      priorityHDR: 100,
      needsPowerOfTwo: false
    }
  ];
  const OPTIONS = {
    // TODO: For ETC1S we intentionally sort by _UASTC_ priority, preserving
    // a historical accident shown to avoid performance pitfalls for Linux with
    // Firefox & AMD GPU (RadeonSI). Further work needed.
    // See https://github.com/mrdoob/three.js/pull/29730.
    [BasisFormat.ETC1S]: FORMAT_OPTIONS.filter((opt) => opt.basisFormat.includes(BasisFormat.ETC1S)).sort((a2, b2) => a2.priorityUASTC - b2.priorityUASTC),
    [BasisFormat.UASTC]: FORMAT_OPTIONS.filter((opt) => opt.basisFormat.includes(BasisFormat.UASTC)).sort((a2, b2) => a2.priorityUASTC - b2.priorityUASTC),
    [BasisFormat.UASTC_HDR]: FORMAT_OPTIONS.filter((opt) => opt.basisFormat.includes(BasisFormat.UASTC_HDR)).sort((a2, b2) => a2.priorityHDR - b2.priorityHDR)
  };
  function getTranscoderFormat(basisFormat, width, height, hasAlpha) {
    const options = OPTIONS[basisFormat];
    for (let i2 = 0; i2 < options.length; i2++) {
      const opt = options[i2];
      if (opt.if && !config[opt.if]) continue;
      if (!opt.basisFormat.includes(basisFormat)) continue;
      if (hasAlpha && opt.transcoderFormat.length < 2) continue;
      if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height))) continue;
      const transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0];
      const engineFormat = opt.engineFormat[hasAlpha ? 1 : 0];
      const engineType = opt.engineType[0];
      return { transcoderFormat, engineFormat, engineType };
    }
    throw new Error("THREE.KTX2Loader: Failed to identify transcoding target.");
  }
  function isPowerOfTwo(value) {
    if (value <= 2) return true;
    return (value & value - 1) === 0 && value !== 0;
  }
  function concat(arrays) {
    if (arrays.length === 1) return arrays[0];
    let totalByteLength = 0;
    for (let i2 = 0; i2 < arrays.length; i2++) {
      const array = arrays[i2];
      totalByteLength += array.byteLength;
    }
    const result = new Uint8Array(totalByteLength);
    let byteOffset = 0;
    for (let i2 = 0; i2 < arrays.length; i2++) {
      const array = arrays[i2];
      result.set(array, byteOffset);
      byteOffset += array.byteLength;
    }
    return result;
  }
};
const UNCOMPRESSED_FORMATS = /* @__PURE__ */ new Set([RGBAFormat, RGBFormat, RGFormat, RedFormat]);
const FORMAT_MAP = {
  [Ae]: RGBAFormat,
  [de]: RGFormat,
  [ye]: RedFormat,
  [ue]: RGBAFormat,
  [ae]: RGFormat,
  [te]: RedFormat,
  [Et]: RGBAFormat,
  [Ft]: RGBAFormat,
  [dt]: RGFormat,
  [xt]: RGFormat,
  [gt]: RedFormat,
  [ht]: RedFormat,
  [He]: RGBFormat,
  [We]: RGBFormat,
  [xn]: RGBA_ETC2_EAC_Format,
  [pn]: RGB_ETC2_Format,
  [_i]: RGBA_ASTC_4x4_Format,
  [wn]: RGBA_ASTC_4x4_Format,
  [Dn]: RGBA_ASTC_4x4_Format,
  [yi]: RGBA_ASTC_6x6_Format,
  [Cn]: RGBA_ASTC_6x6_Format,
  [Vn]: RGBA_ASTC_6x6_Format,
  [Ze]: RGBA_S3TC_DXT1_Format,
  [Qe]: RGBA_S3TC_DXT1_Format,
  [Je]: RGB_S3TC_DXT1_Format,
  [qe]: RGB_S3TC_DXT1_Format,
  [nn]: RGBA_S3TC_DXT3_Format,
  [en]: RGBA_S3TC_DXT3_Format,
  [an]: SIGNED_RED_RGTC1_Format,
  [sn]: RED_RGTC1_Format,
  [on]: SIGNED_RED_GREEN_RGTC2_Format,
  [rn]: RED_GREEN_RGTC2_Format,
  [Un]: RGBA_BPTC_Format,
  [cn]: RGBA_BPTC_Format,
  [Ui]: RGBA_PVRTC_4BPPV1_Format,
  [oi]: RGBA_PVRTC_4BPPV1_Format,
  [ci]: RGBA_PVRTC_2BPPV1_Format,
  [ri]: RGBA_PVRTC_2BPPV1_Format
};
const TYPE_MAP = {
  [Ae]: FloatType,
  [de]: FloatType,
  [ye]: FloatType,
  [ue]: HalfFloatType,
  [ae]: HalfFloatType,
  [te]: HalfFloatType,
  [Et]: UnsignedByteType,
  [Ft]: UnsignedByteType,
  [dt]: UnsignedByteType,
  [xt]: UnsignedByteType,
  [gt]: UnsignedByteType,
  [ht]: UnsignedByteType,
  [He]: UnsignedInt5999Type,
  [We]: UnsignedInt101111Type,
  [xn]: UnsignedByteType,
  [pn]: UnsignedByteType,
  [_i]: HalfFloatType,
  [wn]: UnsignedByteType,
  [Dn]: UnsignedByteType,
  [yi]: HalfFloatType,
  [Cn]: UnsignedByteType,
  [Vn]: UnsignedByteType,
  [Ze]: UnsignedByteType,
  [Qe]: UnsignedByteType,
  [Je]: UnsignedByteType,
  [qe]: UnsignedByteType,
  [nn]: UnsignedByteType,
  [en]: UnsignedByteType,
  [an]: UnsignedByteType,
  [sn]: UnsignedByteType,
  [on]: UnsignedByteType,
  [rn]: UnsignedByteType,
  [Un]: UnsignedByteType,
  [cn]: UnsignedByteType,
  [Ui]: UnsignedByteType,
  [oi]: UnsignedByteType,
  [ci]: UnsignedByteType,
  [ri]: UnsignedByteType
};
async function createRawTexture(container) {
  const { vkFormat } = container;
  if (FORMAT_MAP[vkFormat] === void 0) {
    throw new Error("THREE.KTX2Loader: Unsupported vkFormat: " + vkFormat);
  }
  if (TYPE_MAP[vkFormat] === void 0) {
    console.warn('THREE.KTX2Loader: Missing ".type" for vkFormat: ' + vkFormat);
  }
  let zstd;
  if (container.supercompressionScheme === n) {
    if (!_zstd) {
      _zstd = new Promise(async (resolve) => {
        const zstd2 = new Q();
        await zstd2.init();
        resolve(zstd2);
      });
    }
    zstd = await _zstd;
  }
  const mipmaps = [];
  for (let levelIndex = 0; levelIndex < container.levels.length; levelIndex++) {
    const levelWidth = Math.max(1, container.pixelWidth >> levelIndex);
    const levelHeight = Math.max(1, container.pixelHeight >> levelIndex);
    const levelDepth = container.pixelDepth ? Math.max(1, container.pixelDepth >> levelIndex) : 0;
    const level = container.levels[levelIndex];
    let levelData;
    if (container.supercompressionScheme === t) {
      levelData = level.levelData;
    } else if (container.supercompressionScheme === n) {
      levelData = zstd.decode(level.levelData, level.uncompressedByteLength);
    } else {
      throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");
    }
    let data;
    if (TYPE_MAP[vkFormat] === FloatType) {
      data = new Float32Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Float32Array.BYTES_PER_ELEMENT
      );
    } else if (TYPE_MAP[vkFormat] === HalfFloatType) {
      data = new Uint16Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Uint16Array.BYTES_PER_ELEMENT
      );
    } else if (TYPE_MAP[vkFormat] === UnsignedInt5999Type || TYPE_MAP[vkFormat] === UnsignedInt101111Type) {
      data = new Uint32Array(
        levelData.buffer,
        levelData.byteOffset,
        levelData.byteLength / Uint32Array.BYTES_PER_ELEMENT
      );
    } else {
      data = levelData;
    }
    mipmaps.push({
      data,
      width: levelWidth,
      height: levelHeight,
      depth: levelDepth
    });
  }
  const useMipmaps = container.levelCount === 0 || mipmaps.length > 1;
  let texture;
  if (UNCOMPRESSED_FORMATS.has(FORMAT_MAP[vkFormat])) {
    texture = container.pixelDepth === 0 ? new DataTexture(mipmaps[0].data, container.pixelWidth, container.pixelHeight) : new Data3DTexture(mipmaps[0].data, container.pixelWidth, container.pixelHeight, container.pixelDepth);
    texture.minFilter = useMipmaps ? NearestMipmapNearestFilter : NearestFilter;
    texture.magFilter = NearestFilter;
    texture.generateMipmaps = container.levelCount === 0;
  } else {
    if (container.pixelDepth > 0) throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");
    texture = new CompressedTexture(mipmaps, container.pixelWidth, container.pixelHeight);
    texture.minFilter = useMipmaps ? LinearMipmapLinearFilter : LinearFilter;
    texture.magFilter = LinearFilter;
  }
  texture.mipmaps = mipmaps;
  texture.type = TYPE_MAP[vkFormat];
  texture.format = FORMAT_MAP[vkFormat];
  texture.colorSpace = parseColorSpace(container);
  texture.needsUpdate = true;
  return Promise.resolve(texture);
}
function parseColorSpace(container) {
  const dfd = container.dataFormatDescriptor[0];
  if (dfd.colorPrimaries === E) {
    return dfd.transferFunction === y ? SRGBColorSpace : LinearSRGBColorSpace;
  } else if (dfd.colorPrimaries === X) {
    return dfd.transferFunction === y ? DisplayP3ColorSpace : LinearDisplayP3ColorSpace;
  } else if (dfd.colorPrimaries === S) {
    return NoColorSpace;
  } else {
    console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${dfd.colorPrimaries}"`);
    return NoColorSpace;
  }
}
export {
  KTX2Loader
};
//# sourceMappingURL=KTX2Loader-BWiROBFO.js.map
