/**
 * generate by ikrong from ikrong.com
 * @@datetime@@
 */

declare class AccessToken {
    constructor(accessToken?, expireTime?)

    /*!
     * 检查AccessToken是否有效，检查规则为当前时间和过期时间进行对比
     * Examples:
     * ```
     * token.isValid();
     * ```
     */
    isValid: () => boolean
}

declare class API {
    /**小程序appid */
    appid: string;
    /**小程序appsecret */
    appsecret: string;
    static AccessToken: AccessToken
    /**
   * 根据 appid 和 appsecret 创建API的构造函数
   * 如需跨进程跨机器进行操作Wechat API（依赖access token），access token需要进行全局维护
   * 使用策略如下：
   * 1. 调用用户传入的获取 token 的异步方法，获得 token 之后使用
   * 2. 使用appid/appsecret获取 token 。并调用用户传入的保存 token 方法保存
   * Tips:
   * - 如果跨机器运行wechat模块，需要注意同步机器之间的系统时间。
   * Examples:
   * ```
   * var API = require('wechat-api');
   * var api = new API('appid', 'secret');
   * ```
   * 以上即可满足单进程使用。
   * 当多进程时，token 需要全局维护，以下为保存 token 的接口。
   * ```
   * var api = new API('appid', 'secret', async function () {
   *   // 传入一个获取全局 token 的方法
   *   var txt = await fs.readFile('access_token.txt', 'utf8');
   *   return JSON.parse(txt);
   * }, async function (token) {
   *   // 请将 token 存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
   *   // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
   *   await fs.writeFile('access_token.txt', JSON.stringify(token));
   * });
   * ```
   * @param {String} appid 在公众平台上申请得到的appid
   * @param {String} appsecret 在公众平台上申请得到的app secret
   * @param {AsyncFunction} getToken 可选的。获取全局token对象的方法，多进程模式部署时需在意
   * @param {AsyncFunction} saveToken 可选的。保存全局token对象的方法，多进程模式部署时需在意
   */
    constructor(appid, appsecret, getToken?, saveToken?, tokenFromCustom?)
    /**
     * 用于设置urllib的默认options * Examples:
     * ```
     * api.setOpts({timeout: 15000});
     * ```
     * @param {Object} opts 默认选项
     */
    setOpts: (opts?) => void;
    /**
     * 设置urllib的hook
     */
    request: (url, opts?, retry?) => any
    /*!
    * 根据创建API时传入的appid和appsecret获取access token
    * 进行后续所有API调用时，需要先获取access token
    * 详细请看：<http://mp.weixin.qq.com/wiki/index.php?title=获取access_token> * 应用开发者无需直接调用本API。 * Examples:
    * ```
    * var token = await api.getAccessToken();
    * ```
    * - `err`, 获取access token出现异常时的异常对象
    * - `result`, 成功时得到的响应结果 * Result:
    * ```
    * {"access_token": "ACCESS_TOKEN","expires_in": 7200}
    * ```
    */
    getAccessToken: () => Promise<{ accessToken: string, expireTime: number }>
    /*!
    * 需要access token的接口调用如果采用preRequest进行封装后，就可以直接调用。
    * 无需依赖 getAccessToken 为前置调用。
    * 应用开发者无需直接调用此API。
    * Examples:
    * ```
    * await api.ensureAccessToken();
    * ```
    */
    ensureAccessToken: () => Promise<{ accessToken: string, expireTime: number }>
    /**
      * 用于支持对象合并。将对象合并到API.prototype上，使得能够支持扩展
      * Examples:
      * ```
      * // 媒体管理（上传、下载）
      * API.mixin(require('./lib/api_media'));
      * ```
      * @param {Object} obj 要合并的对象
      */
    mixin: () => void;


    //--------//

}

declare namespace API { }

export = API;

export as namespace API;