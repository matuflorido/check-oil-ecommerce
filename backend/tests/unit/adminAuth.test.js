/**
 * Unit Tests for Admin Authentication (Task 10)
 * Tests JWT token generation, verification, and login
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken, decodeToken } from '../../src/utils/jwt.js';

describe('JWT Token Management', () => {
  const testAdmin = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@check-oil.com',
    rol: 'super_admin',
  };

  describe('generateToken', () => {
    test('should generate valid JWT token', () => {
      const token = generateToken(testAdmin);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    test('should include admin data in token payload', () => {
      const token = generateToken(testAdmin);
      const decoded = decodeToken(token);

      expect(decoded.id).toBe(testAdmin.id);
      expect(decoded.email).toBe(testAdmin.email);
      expect(decoded.rol).toBe(testAdmin.rol);
    });

    test('should have expiration in token', () => {
      const token = generateToken(testAdmin);
      const decoded = decodeToken(token);

      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const token = generateToken(testAdmin);
      const verified = verifyToken(token);

      expect(verified.id).toBe(testAdmin.id);
      expect(verified.email).toBe(testAdmin.email);
      expect(verified.rol).toBe(testAdmin.rol);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow();
    });

    test('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('malformed');
      }).toThrow();
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verification', () => {
      const token = generateToken(testAdmin);
      const decoded = decodeToken(token);

      expect(decoded.id).toBe(testAdmin.id);
      expect(decoded.email).toBe(testAdmin.email);
    });

    test('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token.format');
      expect(decoded).toBeNull();
    });
  });
});

describe('Password Hashing', () => {
  test('should hash password with bcrypt', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
  });

  test('should verify correct password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);

    const match = await bcrypt.compare('WrongPassword', hash);
    expect(match).toBe(false);
  });
});
