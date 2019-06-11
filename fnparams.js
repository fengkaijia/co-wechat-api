const regex = {
    arrow: /^\(?([\w\s,]+)\)?\s*=>/,
    func: /(?:function|static|async)?\s*\w+\s?\(([\w\s=>"',:{}[\]\\]*)\)/,
    comments: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
    object: /^{([\w\s=>"',:{}[\]\\]*)*}$/,
    array: /^\[[\w\s=>"',:{}[\]\\]*]$/,
    json: /\{.*:\{.*:.*\}\}/g
};

module.exports = class FunctionParser {

    constructor(f) {
        this.f = f;
    }

    run() {
        return this.params;
    }

    get str() {
        if (this._str) return this._str;
        return this._str = this.f.toString().trim();
    }

    get arg() {
        if (this._arg) return this._arg;
        if (regex.arrow.test(this.str)) return this._arg = this.str.match(regex.arrow)[1];
        else if (regex.func.test(this.str)) return this._arg = this.str.match(regex.func)[1];
        throw new Error('Function parsing failed, review:\n' + this.str);
    }

    get sep() {
        if (this._sep) return this._sep;
        return this._sep = FunctionParser.splitCommas(this.arg.replace(regex.comments, ''));
    }

    get params() {
        if (this._params) return this._params;
        return this._params = this.sep
            .map(i => {
                if (i.indexOf('=') !== -1) i = FunctionParser.splitEquals(i)
                    .slice(0, -1)
                    .join('=')
                    .trim();
                return FunctionParser.decompose(i);
            });
    }

    static splitEquals(str) {
        return str
            .trim()
            .split('=')
            .reduce((acc, curr) => {
                if (curr.startsWith('>')) acc[acc.length - 1] += '=' + curr;
                else acc.push(curr);
                return acc;
            }, []);
    }

    static splitCommas(str) {
        let obj = null;
        let arr = str.split(',').map(i => i.trim());
        return arr.reduce((acc, curr) => {
            if (obj) acc[acc.length - 1] += ', ' + curr.trim();
            else acc.push(curr.trim());
            if (curr.includes('[')) obj = ']';
            else if (curr.includes('{')) obj = '}';
            if (curr.endsWith(obj)) obj = null;
            return acc;
        }, []);
    }

    static decompose(str) {
        if (regex.object.test(str)) {
            if (str === '{}') return {};
            let obj = {};
            const val = str.slice(1, -1).trim();
            const entries = FunctionParser.splitCommas(val);
            for (let entry of entries) {
                let [key, value] = FunctionParser.splitEquals(entry);
                if (typeof value === 'undefined') [key, value] = key.split(':');
                if (typeof value !== 'undefined') value = FunctionParser.decompose(value.trim());
                obj[key.trim()] = value;
            }
            return obj;
        } else
            if (regex.array.test(str)) {
                if (str === '[]') return [];
                let arr = FunctionParser.splitCommas(str.slice(1, -1).trim());
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = FunctionParser.decompose(arr[i]);
                }
                return arr;
            } else
                if (str.trim() === 'true') return true;
                else if (str.trim() === 'false') return false;
        str = str.replace(/'/g, '');
        return str;
    }

}