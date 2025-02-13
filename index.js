"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useObservable = useObservable;
exports.useSubscribeObservable = useSubscribeObservable;
exports.createEffectWithTrigger = createEffectWithTrigger;
exports.createDispachableEffect = createDispachableEffect;
var react_1 = require("react");
var observableMap = new Map();
function createObservable(name) {
    var subscribers = new Set();
    var observable = {
        dispatch: function (value) {
            var observable = observableMap.get(name);
            observable.data = value;
            subscribers.forEach(function (subscriber) { return subscriber.handleData(value); });
        },
        subscribe: function (subscriber) {
            subscribers.add(subscriber);
            return function () {
                subscribers.delete(subscriber);
            };
        },
        dispatchStatus: function (val) {
            subscribers.forEach(function (subscriber) {
                var _a;
                (_a = subscriber.handleStatus) === null || _a === void 0 ? void 0 : _a.call(subscriber, val);
            });
        }
    };
    observableMap.set(name, observable);
    return observable;
}
/***
 * @function useObservable
 * is a react hook, It subscribe the component to the given observable
 * @param name the name of the observable to subscribe
 * @param initialValue the initial value to display before the first state update
 * @returns
 * isLoading, isError, isResolved
 * @returns
 * state: updates when the observable updates
 * @returns
 * dispatch: set new value to the observable and notify all subscribers
 */
function useObservable(name, initialValue) {
    var _a;
    var observable = observableMap.get(name);
    if (!observable)
        observable = createObservable(name);
    var _b = (0, react_1.useState)((_a = observable.data) !== null && _a !== void 0 ? _a : initialValue), state = _b[0], setState = _b[1];
    var _c = (0, react_1.useState)("resolved"), status = _c[0], setStatus = _c[1];
    (0, react_1.useEffect)(function () {
        return observable.subscribe({
            handleData: function (value) { return setState(value); },
            handleStatus: function (value) { return setStatus(value); }
        });
    }, []);
    return {
        isloading: status === "loading",
        isError: status === "error",
        isResolved: status === "resolved",
        state: state,
        dispatch: observable === null || observable === void 0 ? void 0 : observable.dispatch
    };
}
/***
 * @function useSubscribeObservable
 * is a react hook, It subscribe the component to the given observable,
 * and excecute the handler when the observable updates
 * @param name the name of the observable to subscribe
 * @param handler the initial value to display before the first state update
 */
function useSubscribeObservable(name, handler) {
    var observable = observableMap.get(name);
    (0, react_1.useEffect)(function () {
        return observable === null || observable === void 0 ? void 0 : observable.subscribe({
            handleData: handler,
        });
    }, []);
    if (!observable) {
        throw Error("not observable has been created with that name");
    }
}
/***
 * @function createEffectWithTrigger
 *
 * @param trigger the name of the observable that triggers the effect
 * @param target the name of the observable that will update when the effect triggers
 * @param effect a function that receive the value of trigger obsevable and return a
 * Promise<value> to be store in the target observable
 */
function createEffectWithTrigger(trigger, target, effect) {
    var _this = this;
    var triggerObservable = observableMap.get(trigger);
    var toObservable = observableMap.get(target);
    if (!triggerObservable)
        triggerObservable = createObservable(trigger);
    if (!toObservable)
        toObservable = createObservable(target);
    triggerObservable.subscribe({
        handleData: function (val) { return __awaiter(_this, void 0, void 0, function () {
            var res, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        toObservable.dispatchStatus("loading");
                        return [4 /*yield*/, effect(val)];
                    case 1:
                        res = _b.sent();
                        toObservable.dispatch(res);
                        toObservable.dispatchStatus("resolved");
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        toObservable.dispatchStatus("error");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }
    });
}
/***
 * @function createDispachableEffect
 *
 * @param target the name of the observable that will update when the effect triggers
 * @param effect a function that receive the value of trigger obsevable and return a
 * Promise<value> to be store in the target observable
 * @returns a function that when call excecute the effect and store it into the
 * target observable
 */
function createDispachableEffect(target, effect) {
    var _this = this;
    var observable = observableMap.get(target);
    if (!observable)
        observable = createObservable(target);
    var isRunning = false;
    return function (val) { return __awaiter(_this, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isRunning)
                        return [2 /*return*/];
                    isRunning = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    observable.dispatchStatus("loading");
                    return [4 /*yield*/, effect(val)];
                case 2:
                    result = _b.sent();
                    observable.dispatch(result);
                    observable.dispatchStatus("resolved");
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    observable.dispatchStatus("error");
                    return [3 /*break*/, 5];
                case 4:
                    isRunning = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
}
