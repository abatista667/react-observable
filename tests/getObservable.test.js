import { getObservable } from '../index';

describe('getObservable', () => {
    it('should return an existing observable if it exists', () => {
        const name = 'testObservable';
        const existingObservable = getObservable(name); // Create the observable first


        const observable = getObservable(name);

        expect(observable).toBe(existingObservable);
    });

    it('should create a new observable if it does not exist', () => {
        const name = 'newObservable';

        const observable = getObservable(name);

        expect(observable).toBeDefined();
    });

    it('should create a new observable with the correct structure', () => {
        const name = 'structuredObservable';

        const observable = getObservable(name);
        observable.dispatch('testData');

        expect(observable).toHaveProperty('data');
        expect(observable).toHaveProperty('dispatch');
        expect(observable).toHaveProperty('dispatchStatus');
        expect(observable).toHaveProperty('subscribe');
    });
    it('should create a new observable if it does not exist', () => {
        const observableName = 'testObservable';
        const observable = getObservable(observableName);

        expect(observable).toBeDefined();
    });

    it('should return the existing observable if it already exists', () => {
        const observableName = 'existingObservable';
        const observable1 = getObservable(observableName);
        const observable2 = getObservable(observableName);

        expect(observable1).toBe(observable2);
    });

    it('should allow subscribing and unsubscribing to the observable', () => {
        const observableName = 'subscribeObservable';
        const observable = getObservable(observableName);
        const handler = jest.fn();

        const unsubscribe = observable.subscribe({ handleData: handler });
        observable.dispatch('testData');

        expect(handler).toHaveBeenCalledWith('testData');

        unsubscribe();
        observable.dispatch('newData');

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should allow dispatching status to the observable', () => {
        const observableName = 'statusObservable';
        const observable = getObservable(observableName);
        const statusHandler = jest.fn();

        observable.subscribe({ handleStatus: statusHandler });
        observable.dispatchStatus('loading');

        expect(statusHandler).toHaveBeenCalledWith('loading');

        observable.dispatchStatus('success');
        expect(statusHandler).toHaveBeenCalledWith('success');
        
        observable.dispatchStatus('error');
        expect(statusHandler).toHaveBeenCalledWith('error');
    });
});