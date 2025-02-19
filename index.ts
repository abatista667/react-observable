import { useEffect, useState } from 'react';

type Handler<T = any> = (val: T) => void

interface Subscribable {
    handleData: Handler,
    handleStatus?: Handler
}

type ObservableStatus = "loading" | "resolved" | "error"

interface Observable<T = any> {
    data?: any
    dispatch: (value: T) => void,
    dispatchStatus: (value: ObservableStatus) => void,
    subscribe: (subscriber: Subscribable) => () => void,
}

const observableMap = new Map<string, Observable>()

/***
 * @function getObservable
 * 
 * @param name the name of the observable to get
 * @returns the observable with the given name
 * if the observable does not exist it will create it
 */
export const getObservable = <T>(name: string): Observable<T> => {
    let observable = observableMap.get(name) as Observable<T>
    if (!observable) {
        observable = createObservable(name)
    }
    return observable
}

function createObservable<T>(name: string): Observable<T> {
    const subscribers = new Set<Subscribable>()

    const observable: Observable<T> = {
        dispatch<T>(value: T) {
            const observable = observableMap.get(name) as Observable<T>
            observable.data = value
            subscribers.forEach(subscriber => subscriber.handleData(value))

        },
        subscribe(subscriber: Subscribable) {
            subscribers.add(subscriber)

            return () => {
                subscribers.delete(subscriber)
            }
        },
        dispatchStatus(val) {
            subscribers.forEach(subscriber => {
                subscriber.handleStatus?.(val)
            })
        }
    }
    observableMap.set(name, observable)
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
export function useObservable<T>(name: string, initialValue: T) {
    let observable = observableMap.get(name) as Observable<T>

    if (!observable)
        observable = createObservable(name)

    const [state, setState] = useState<T>(observable.data ?? initialValue)
    const [status, setStatus] = useState<ObservableStatus>("resolved")
    useEffect(() => {
        return observable.subscribe({
            handleData: (value) => setState(value),
            handleStatus: (value) => setStatus(value)
        })
    }, [])

    return {
        isloading: status === "loading",
        isError: status === "error",
        isResolved: status === "resolved",
        state,
        dispatch: observable?.dispatch
    }
}
/***
 * @function useSubscribeObservable
 * is a react hook, It subscribe the component to the given observable, 
 * and excecute the handler when the observable updates
 * @param name the name of the observable to subscribe
 * @param handler the initial value to display before the first state update
 */
export function useSubscribeObservable<T>(name: string, handler: Handler<T>) {
    const observable = observableMap.get(name)

    useEffect(() => {
        return observable?.subscribe({
            handleData: handler,
        })
    }, [])

    if (!observable) {
        throw Error("not observable has been created with that name")
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
export function createEffectWithTrigger<T>(trigger: string, target: string, effect: (val: T) => Promise<any>) {
    let triggerObservable = observableMap.get(trigger)
    let toObservable = observableMap.get(target)

    if (!triggerObservable)
        triggerObservable = createObservable(trigger);

    if (!toObservable)
        toObservable = createObservable(target)


    triggerObservable.subscribe({
        handleData: async (val) => {
            try {
                toObservable.dispatchStatus("loading")
                const res = await effect(val)
                toObservable.dispatch(res)
                toObservable.dispatchStatus("resolved")
            } catch {
                toObservable.dispatchStatus("error")
            }
        }
    })
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
export function createDispachableEffect<T>(target: string, effect: (val?: T) => Promise<any>) {
    let observable = observableMap.get(target)

    if (!observable)
        observable = createObservable(target)

    let isRunning = false
    return async (val?: T) => {
        if (isRunning) return;

        isRunning = true
        try {
            observable.dispatchStatus("loading")
            const result = await effect(val)
            observable.dispatch(result)
            observable.dispatchStatus("resolved")
        } catch {
            observable.dispatchStatus("error")
        } finally {
            isRunning = false
        }
    }
}
