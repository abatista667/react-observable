## About the library
This library is experimental, avoid using it on production unless you take responsability to fix the bugs

## How to Use

### 1. Using `useObservable` Hook

The `useObservable` hook allows you to subscribe to an observable and get its state and status in your React component.

```jsx
import React from 'react';
import { useObservable } from 'react-observable';

const MyComponent = () => {
    const { state, dispatch } = useObservable('myObservable', 'initialValue');

    return (
        <div>
            <button onClick={() => dispatch('newValue')}>Update Observable</button>
            <p>the new value is: {state}</p>
        </div>
    );
};
```

### 2. Using `useSubscribeObservable` Hook

The `useSubscribeObservable` hook allows you to subscribe to an observable and execute a handler function when the observable updates.

```jsx
import React from 'react';
import { useSubscribeObservable } from 'react-observable';

const MyComponent = () => {
    useSubscribeObservable('myObservable', (value) => {
        console.log('Observable updated with value:', value);
    });

    return <div>Check the console for updates</div>;
};
```

### 3. Using `createEffectWithTrigger`

The `createEffectWithTrigger` function allows you to create an effect that triggers when a specific observable updates.
Always use it outside the components

```jsx
import React from 'react';
import { useObservable, createEffectWithTrigger } from 'react-observable';

createEffectWithTrigger('triggerObservable', 'targetObservable', async (val) => {
    // Perform some async operation
    const result = await fetchSomeData(val);
    return result;
});

const TriggerComponent = () => {
    const { state, dispatch } = useObservable('triggerObservable', 'initialValue');

    return (
        <div>
            <button onClick={() => dispatch('newValue')}>Update Observable</button>
        </div>
    );
};
const TargetComponent = () => {
    const { state } = useObservable('targetObservable', 'initialValue');

    return (
        <div>
            data fetched by the effect {state}
        </div>
    );
};
```


### 4. Using `createDispachableEffect`

The `createDispachableEffect` function allows you to create an effect that can be dispatched manually.
Always use it outside the components

```jsx
import React from 'react';
import { createDispachableEffect } from 'react-observable';

//always create effects outside components
const dispatchEffect = createDispachableEffect('targetObservable', async (val) => {
    // Perform some async operation
    const result = await fetchSomeData(val);
    return result;
});

const Dispacher = () => {
    return <button onClick={() => dispatchEffect('someValue')}>Run Effect</button>;
};

const Subscriber = () => {
    const { state, isLoading, isError, isResolved } = useObservable('targetObservable', 'initialValue');

    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error occurred</p>}
            {isResolved && <p>Data fetched: {state}</p>}
        </div>
    );
};
```

This documentation provides an overview of how to use the provided observable functions and hooks in your React components.