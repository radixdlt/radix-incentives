import { describe, expect, it } from 'vitest';
import {
  getAllSurgeComponents,
  isSurgeComponent,
} from './surgeComponentAddressService';

describe('SurgeComponentAddressService', () => {
  describe('isSurgeComponent', () => {
    it('should return true for hardcoded surge component', () => {
      // The hardcoded component should be in the default set
      const allComponents = getAllSurgeComponents();
      expect(allComponents.length).toBeGreaterThan(0);

      const firstComponent = allComponents[0];
      expect(isSurgeComponent(firstComponent)).toBe(true);
    });

    it('should return false for non-surge component', () => {
      const nonSurgeAddress =
        'component_rdx1czx4luwu3l6t5g9czcrc9kp3t9qwzq4hzadgszk8y9cqj6uc6f5k0w';
      expect(isSurgeComponent(nonSurgeAddress)).toBe(false);
    });
  });

  describe('getAllSurgeComponents', () => {
    it('should return at least the hardcoded component', () => {
      const components = getAllSurgeComponents();
      expect(components.length).toBeGreaterThan(0);
    });
  });
});
