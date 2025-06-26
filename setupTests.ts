import 'whatwg-fetch';

import '@testing-library/jest-dom';

const mockFetch = jest.fn();

global.fetch = mockFetch;

export default mockFetch;
