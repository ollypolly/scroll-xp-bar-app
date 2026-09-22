import {
  describeMovieTime,
  describeScrollDistance,
  describeWorkdayTime,
  estimateScrollDistanceMeters,
  xpPerHour,
} from '../funStats';

describe('estimateScrollDistanceMeters', () => {
  it('scales linearly with Shorts watched', () => {
    expect(estimateScrollDistanceMeters(0)).toBe(0);
    expect(estimateScrollDistanceMeters(100)).toBeCloseTo(16);
  });
});

describe('describeScrollDistance', () => {
  it('shows feet under a mile, miles beyond it', () => {
    expect(describeScrollDistance(30.48)).toBe('100 ft');
    expect(describeScrollDistance(2000)).toBe('1.24 mi');
    expect(describeScrollDistance(4000)).toBe('2.49 mi');
  });
});

describe('describeMovieTime', () => {
  it('shows a percentage under one movie, a count above it', () => {
    expect(describeMovieTime(60)).toBe('1% of a movie');
    expect(describeMovieTime(110 * 60 * 2)).toBe('2.0 movies');
  });
});

describe('describeWorkdayTime', () => {
  it('shows a percentage under one workday, a count above it', () => {
    expect(describeWorkdayTime(60)).toBe('0% of a workday');
    expect(describeWorkdayTime(8 * 3600 * 2)).toBe('2.0 workdays');
  });
});

describe('xpPerHour', () => {
  it('is zero with no watch time', () => {
    expect(xpPerHour(500, 0)).toBe(0);
  });

  it('divides XP by hours watched', () => {
    expect(xpPerHour(500, 3600)).toBe(500);
    expect(xpPerHour(500, 1800)).toBe(1000);
  });
});
