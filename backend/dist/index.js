var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
var _d, _e;
import dotenv from "dotenv";
dotenv.config();
import chalk from "chalk";
import Together from "together-ai";
const together = new Together();
try {
    const response = await together.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Top three things to do in Delhi?" }
        ],
        model: "meta-llama/Llama-Vision-Free",
        //max_tokens: 100,
        temperature: 0,
        stream: true
    });
    let fullResponse = "";
    try {
        for (var _f = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = await response_1.next(), _a = response_1_1.done, !_a; _f = true) {
            _c = response_1_1.value;
            _f = false;
            const token = _c;
            const content = (_e = (_d = token.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content;
            if (content) {
                fullResponse += content;
                console.log(chalk.green.bold("LLM Response: \n"));
                console.log(chalk.white("```python\n" + fullResponse + "\n```"));
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_a && (_b = response_1.return)) await _b.call(response_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
catch (error) {
    console.error("Error:", error);
}
