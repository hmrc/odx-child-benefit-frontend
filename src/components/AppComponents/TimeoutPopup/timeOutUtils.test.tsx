import { TimeoutState } from '.';
import { timeoutText } from './timeOutUtils';

jest.mock('i18next', () => ({
  t: key => key
}));

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('timeoutText', () => {
  it('should return "1_MINUTE" when timeRemaining is 60 and countdownStart is true', () => {
    const timeoutState: TimeoutState = {
      countdownStart: true,
      timeRemaining: 60,
      screenReaderCountdown: ''
    };
    const result = timeoutText(timeoutState);
    expect(result).toBe('1_MINUTE.');
  });

  it('should return "1 SECOND" when timeRemaining is 1 and countdownStart is true', () => {
    const timeoutState = { countdownStart: true, timeRemaining: 1, screenReaderCountdown: '' };
    const result = timeoutText(timeoutState);
    expect(result).toBe('1 SECOND.');
  });

  it('should return "30 SECONDS" when timeRemaining is less than 60 and countdownStart is true', () => {
    const timeoutState = { countdownStart: true, timeRemaining: 30, screenReaderCountdown: '' };
    const result = timeoutText(timeoutState);
    expect(result).toBe('30 SECONDS.');
  });

  it('should return "0 SECONDS" when timeRemaining is 0 and countdownStart is true', () => {
    const timeoutState = { countdownStart: true, timeRemaining: 0, screenReaderCountdown: '' };
    const result = timeoutText(timeoutState);
    expect(result).toBe('0 SECONDS.');
  });

  it('should return "2_MINUTES" when countdownStart is false', () => {
    const timeoutState = { countdownStart: false, timeRemaining: 60, screenReaderCountdown: '' };
    const result = timeoutText(timeoutState);
    expect(result).toBe('2_MINUTES.');
  });
});
