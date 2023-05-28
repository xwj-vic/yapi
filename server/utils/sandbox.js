const Safeify = require('safeify').default;

module.exports = async function sandboxFn(context, script) {
    // 创建 safeify 实例
    const safeVm = new Safeify({
        timeout: 3000,          //超时时间
        asyncTimeout: 10000,    //包含异步操作的超时时间
        unrestricted: true,
        quantity: 4,          //沙箱进程数量，默认同 CPU 核数
        memoryQuota: 500,     //沙箱最大能使用的内存（单位 m），默认 500m
        cpuQuota: 0.5        //沙箱的 cpu 资源配额（百分比），默认 50%
    })

    // 执行动态代码·
    script += "\n  return {mockJson, resHeader, httpCode, delay, Random}";
    const result = await safeVm.run(script, context)

    // 释放资源
    safeVm.destroy()
    return result
}
