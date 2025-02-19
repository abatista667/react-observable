
import { getObservable, useObservable } from '../index';
import { render } from '@testing-library/react';

const C = () => {
    const observable = useObservable('testObservable', 'initialValue');

    return observable.state;
}

describe('useObservable', () => {
    it('should update the ui using the observable', async () => {
        const observable = getObservable('testObservable')

        const { getByText, findByText } = render(<C />);
        expect(getByText('initialValue')).toBeInTheDocument();

        observable.dispatch("newData");

        const newData = await findByText('newData');
        expect(newData).toBeInTheDocument();
    });
});