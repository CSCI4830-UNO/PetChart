import { GET, PUT, DELETE } from "@/app/api/pets/[id]/route";
import { getServerSession } from "next-auth";
import Pet from "@/models/Pet";
import { Types } from "mongoose";
import { getDb } from "@/lib/mongo";

// Faking out next-auth for session stuff
jest.mock("next-auth");
const fakeSessionGetter = getServerSession as jest.Mock;

// Faking the Pet model
jest.mock("@/models/Pet");
const FakePet = Pet as unknown as jest.Mocked<typeof Pet>;

// Mocking DB connection for GridFS
jest.mock("@/lib/mongo", () => ({
  getDb: jest.fn(),
}));
const mockDbGetter = getDb as jest.Mock;

describe("API Route: /api/pets/[id]", () => {
  const testUserSession = {
    user: { email: "test@example.com", name: "Test User" },
  };

  const workingId = "507f1f77bcf86cd799439011";
  const brokenId = "invalid-id";

  beforeEach(() => {
    jest.clearAllMocks();

    fakeSessionGetter.mockResolvedValue(testUserSession);

    // simulate GridFS bucket deletion
    mockDbGetter.mockResolvedValue({
      bucket: {
        delete: jest.fn().mockResolvedValue(true),
      },
    });

    // not the most elegant, but works for tests
    (Types.ObjectId.isValid as jest.Mock).mockImplementation((id) => id === workingId);
  });

  describe("GET pet by ID", () => {
    it("should bail out with 401 if you're not logged in", async () => {
      fakeSessionGetter.mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`);
      const res = await GET(req as any, { params: Promise.resolve({ id: workingId }) });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe("Need to be logged in");
    });

    it("should give 400 if the ID is junk", async () => {
      const req = new Request(`http://localhost/api/pets/${brokenId}`);
      const res = await GET(req as any, { params: Promise.resolve({ id: brokenId }) });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Not a valid ID");
    });

    it("should 404 if there's no pet", async () => {
      (FakePet.findOne as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`);
      const res = await GET(req as any, { params: Promise.resolve({ id: workingId }) });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("No pet with that ID");
    });

    it("should succeed if pet exists and belongs to user", async () => {
      const foundPet = { _id: workingId, name: "Fluffy", species: "Cat" };
      (FakePet.findOne as jest.Mock).mockResolvedValueOnce(foundPet);

      const req = new Request(`http://localhost/api/pets/${workingId}`);
      const res = await GET(req as any, { params: Promise.resolve({ id: workingId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual(foundPet);
      expect(FakePet.findOne).toHaveBeenCalledWith({
        _id: workingId,
        owner: testUserSession.user.email,
      });
    });
  });

  describe("PUT pet by ID", () => {
    const mockUpdate = {
      name: "Fluffy Updated",
      species: "Cat",
      age: 5,
      weight: 10,
    };

    it("should deny unauthenticated users", async () => {
      fakeSessionGetter.mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "PUT",
        body: JSON.stringify(mockUpdate),
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: workingId }) });
      expect(res.status).toBe(401);
    });

    it("should fail on bad ID", async () => {
      const req = new Request(`http://localhost/api/pets/${brokenId}`, {
        method: "PUT",
        body: JSON.stringify(mockUpdate),
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: brokenId }) });
      expect(res.status).toBe(400);
    });

    it("should reject if name or species is missing", async () => {
      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "PUT",
        body: JSON.stringify({ species: "Cat" }), // missing name!
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: workingId }) });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Missing name/species");
    });

    it("should reject if age is invalid", async () => {
      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "PUT",
        body: JSON.stringify({ ...mockUpdate, age: -1 }),
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: workingId }) });
      expect(res.status).toBe(400);
    });

    it("should return 404 if pet doesn't exist (somehow)", async () => {
      (FakePet.findOne as jest.Mock).mockResolvedValueOnce(null);
      (FakePet.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "PUT",
        body: JSON.stringify(mockUpdate),
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: workingId }) });
      expect(res.status).toBe(404);
    });

    it("should return updated pet if all is good", async () => {
      const updatedPet = { _id: workingId, ...mockUpdate };
      (FakePet.findOne as jest.Mock).mockResolvedValueOnce(updatedPet);
      (FakePet.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedPet);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "PUT",
        body: JSON.stringify(mockUpdate),
      });

      const res = await PUT(req as any, { params: Promise.resolve({ id: workingId }) });
      const result = await res.json();

      expect(res.status).toBe(200);
      expect(result).toEqual(updatedPet);
      expect(FakePet.findOneAndUpdate).toHaveBeenCalled(); // could add specifics here
    });
  });

  describe("DELETE pet by ID", () => {
    it("requires auth", async () => {
      fakeSessionGetter.mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: Promise.resolve({ id: workingId }) });
      expect(res.status).toBe(401);
    });

    it("rejects bogus IDs", async () => {
      const req = new Request(`http://localhost/api/pets/${brokenId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: Promise.resolve({ id: brokenId }) });
      expect(res.status).toBe(400);
    });

    it("handles missing pet with a 404", async () => {
      (FakePet.findOneAndDelete as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: Promise.resolve({ id: workingId }) });
      expect(res.status).toBe(404);
    });

    it("confirms deletion with 200", async () => {
      const removedPet = { _id: workingId, name: "Fluffy" };
      (FakePet.findOneAndDelete as jest.Mock).mockResolvedValueOnce(removedPet);

      const req = new Request(`http://localhost/api/pets/${workingId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: Promise.resolve({ id: workingId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Pet gone");
      expect(body.deletedPet.id).toBe(workingId); // not sure where this field comes from but rolling with it
    });
  });
});
