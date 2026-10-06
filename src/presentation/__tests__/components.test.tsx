import { fireEvent, render, screen } from '@testing-library/react-native';

import { aStream } from '../../test/fixtures';
import { LabStreamRow } from '../components/molecules/LabStreamRow';
import { MetricTile } from '../components/molecules/MetricTile';
import { formatBitrate, formatMs, formatTime } from '../format';

describe('LabStreamRow', () => {
  it('opens the player when the platform supports the format', async () => {
    const onPress = jest.fn();
    await render(<LabStreamRow stream={aStream({ title: 'DASH' })} supported onPress={onPress} />);

    await fireEvent.press(screen.getByLabelText('Play DASH'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is locked when the platform cannot play the format', async () => {
    const onPress = jest.fn();
    await render(
      <LabStreamRow stream={aStream({ title: 'DASH' })} supported={false} onPress={onPress} />,
    );

    expect(screen.getByText('Not available on this platform.')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Play DASH'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('MetricTile', () => {
  it('exposes label and value to screen readers', async () => {
    await render(<MetricTile icon="flash-outline" label="Startup" value="820 ms" />);

    expect(screen.getByLabelText('Startup: 820 ms')).toBeTruthy();
  });
});

describe('formatters', () => {
  it.each([
    [null, '—'],
    [850_000, '850 kbps'],
    [4_500_000, '4.5 Mbps'],
  ])('formatBitrate(%p) → %s', (input, expected) => {
    expect(formatBitrate(input)).toBe(expected);
  });

  it.each([
    [0, '0:00'],
    [65, '1:05'],
    [3725, '1:02:05'],
    [Number.NaN, '0:00'],
  ])('formatTime(%p) → %s', (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it('formats durations in ms or seconds', () => {
    expect(formatMs(null)).toBe('—');
    expect(formatMs(420)).toBe('420 ms');
    expect(formatMs(1830)).toBe('1.83 s');
  });
});
