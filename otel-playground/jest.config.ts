import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/libs'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/libs/shared/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: 'tsconfig.base.json' },
    ],
  },
};

export default config;
