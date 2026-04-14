module.exports = {
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn().mockResolvedValue(null),
  getCsrfToken: jest.fn().mockResolvedValue('token'),
}
