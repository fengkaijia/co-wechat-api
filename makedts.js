const fs = require("fs")
const files = fs.readdirSync("./lib/")
const API = require("./index")

const anotation = {};

/**收集注释 */
function CalcAnotation(file) {
    let filecontent = fs.readFileSync(file).toString();
    let contentArr = filecontent.split(/\n/g)
    let start = false;
    let comment = "";
    contentArr.map(str => {
        let line = str.trim()
        if (line.match(/^\/\*/)) {
            start = true;
            comment = line + "\n";
        } else if (line.match(/\*/) && start) {
            comment += "    " + line + "\n";
        } else if (line.match(/\*\/$/) && start) {
            comment += "    " + line + "\n";
        } else if (line.match(/exports\.([a-z]+)/i) && start) {
            let fnName = line.match(/exports\.([a-z]+)/i)
            let name = fnName[1]
            anotation[name] = comment;
            start = false;
        }
    })
}

files.map(file => CalcAnotation(`./lib/${file}`));

/**获取函数参数 */
function getParameterName(fn) {
    if (typeof fn !== 'object' && typeof fn !== 'function') return;
    const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const DEFAULT_PARAMS = /=[^,)]+/mg;
    const FAT_ARROWS = /=>.*$/mg;
    let code = fn.prototype ? fn.prototype.constructor.toString() : fn.toString();
    code = code
        .replace(COMMENTS, '')
        .replace(FAT_ARROWS, '')
        .replace(DEFAULT_PARAMS, '');
    let result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result === null ? [] : result;
}

let dtsfile = ""

for (let key in API.prototype) {
    if (anotation[key]) {
        dtsfile += "    " + anotation[key] + "\n\n"
    }
    dtsfile += "    " + `${key}:(${getParameterName(API.prototype[key]).map(param=>param+="?").join(",")})=>any \n\n`
}
/**替换模块描述 */
let basefile = fs.readFileSync("./base.d.ts").toString()
dtsfile = basefile.replace(`//--------//`, dtsfile);
/**替换时间 */
let date = new Date();
dtsfile = dtsfile.replace(
    "@@datetime@@",
    `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
)

fs.writeFileSync("./index.d.ts", dtsfile)