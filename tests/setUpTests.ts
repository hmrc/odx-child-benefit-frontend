import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import 'jest-fetch-mock';

configure({ testIdAttribute: 'data-test-id' });