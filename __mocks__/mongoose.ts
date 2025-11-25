/**
 * Mock Mongoose config
 * So we have to replace the actual 'mongoose' library during tests.
 * Instead of connecting to a real database, it provides "mock" (fake) functions
 * that we can control and spy on. This ensures unit tests are fast and isolated.
 */

// We make our fake Schema constructor.
// When code calls `new Schema(...)`, it gets this object with no-op methods.
export const Schema = jest.fn(() => ({
  index: jest.fn(), // NOTE: .fn() is a dummy function
  pre: jest.fn(),
  post: jest.fn(),
  virtual: jest.fn(),
  set: jest.fn(),
  methods: {},
  statics: {},
}));

// Mock Schema Types (e.g. Schema.Types.ObjectId) so defining models doesn't crash.
(Schema as any).Types = {
  ObjectId: "ObjectId",
  String: "String",
  Number: "Number",
  Boolean: "Boolean",
  Date: "Date",
};

// Mock the model creation function (mongoose.model).
// It returns a "mock model" object that has all the standard Mongoose methods
// (find, findOne, create, etc.) mocked out as Jest functions.
export const model = jest.fn(() => {
  const mockModel = jest.fn();
  (mockModel as any).find = jest.fn();
  (mockModel as any).findOne = jest.fn();
  (mockModel as any).findById = jest.fn();
  (mockModel as any).create = jest.fn();
  (mockModel as any).deleteOne = jest.fn();
  (mockModel as any).updateOne = jest.fn();
  (mockModel as any).findOneAndUpdate = jest.fn();
  (mockModel as any).findOneAndDelete = jest.fn();
  return mockModel;
});

// Mock the connect function so we don't actually try to connect to MongoDB.
export const connect = jest.fn();

// Mock the connection state (readyState: 1 means "connected").
// This tricks code checking `mongoose.connection.readyState` into thinking we are connected.
export const connection = {
  readyState: 1,
};

// Mock Mongoose Types, specifically ObjectId validation.
export const Types = {
  ObjectId: {
    isValid: jest.fn().mockReturnValue(true),
  },
};

// Mock the models cache.
export const models = {};

// Default export object containing all the mocks.
const mongoose = {
  Schema,
  model,
  connect,
  connection,
  Types,
  models,
};

export default mongoose;
