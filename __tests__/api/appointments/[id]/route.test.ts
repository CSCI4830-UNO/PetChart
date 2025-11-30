import { GET, PUT, DELETE } from "@/app/api/appointments/[id]/route";
import { getServerSession } from "next-auth";
import Appointment from "@/models/Appointment";
import Pet from "@/models/Pet";

// faking out next-auth session
jest.mock("next-auth");
const mockSessionGetter = getServerSession as jest.Mock;

// mocking DB models
jest.mock("@/models/Pet");
jest.mock("@/models/Appointment");

const FakePetModel = Pet as unknown as jest.Mocked<typeof Pet>;
const FakeAppointmentModel = Appointment as unknown as jest.Mocked<typeof Appointment>;

describe("Testing /api/appointments/[id] API route", () => {
  const testSession = {
    user: { email: "test@example.com", name: "Test User" },
  };

  const appointmentId = "appt123";

  beforeEach(() => {
    jest.resetAllMocks(); // clear mocks before every test
    mockSessionGetter.mockResolvedValue(testSession);
  });

  describe("GET handler", () => {
    it("returns 401 if session is not active", async () => {
      mockSessionGetter.mockResolvedValueOnce(null); // simulate no session

      const fakeReq = new Request(`http://localhost/api/appointments/${appointmentId}`);
      const res = await GET(fakeReq as any, { params: { id: appointmentId } });

      expect(res.status).toBe(401);
    });

    it("returns 404 if no matching appointment", async () => {
      const mockedPopulate = jest.fn().mockResolvedValue(null);
      (FakeAppointmentModel.findOne as jest.Mock).mockReturnValue({ populate: mockedPopulate });

      const fakeReq = new Request(`http://localhost/api/appointments/${appointmentId}`);
      const res = await GET(fakeReq as any, { params: { id: appointmentId } });

      expect(res.status).toBe(404);
    });

    it("returns 200 with the appointment data if found", async () => {
      const sampleAppt = { _id: appointmentId, reason: "Checkup" };
      const mockedPopulate = jest.fn().mockResolvedValue(sampleAppt);

      (FakeAppointmentModel.findOne as jest.Mock).mockReturnValue({ populate: mockedPopulate });

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`);
      const response = await GET(req as any, { params: { id: appointmentId } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(sampleAppt);
    });
  });

  describe("PUT handler", () => {
    const changesToApply = {
      reason: "Updated Reason",
    };

    it("denies access with 401 if unauthenticated", async () => {
      mockSessionGetter.mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify(changesToApply),
      });

      const response = await PUT(req as any, { params: { id: appointmentId } });

      expect(response.status).toBe(401);
    });

    it("returns 404 if appointment doesn't exist", async () => {
      (FakeAppointmentModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify(changesToApply),
      });

      const response = await PUT(req as any, { params: { id: appointmentId } });

      expect(response.status).toBe(404);
    });

    it("fails with 404 if new petId is provided but pet doesn't exist", async () => {
      const existingAppt = {
        _id: appointmentId,
        petId: "oldOne",
        petName: "Fluffy",
        save: jest.fn(),
        populate: jest.fn()
      };

      (FakeAppointmentModel.findOne as jest.Mock).mockResolvedValueOnce(existingAppt);
      (FakePetModel.findOne as jest.Mock).mockResolvedValueOnce(null); // simulate missing pet

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ petId: "nonExistentPet" }),
      });

      const res = await PUT(req as any, { params: { id: appointmentId } });

      expect(res.status).toBe(404);
    });

    it("successfully updates and returns 200", async () => {
      const apptToUpdate = {
        _id: appointmentId,
        petId: "pet1",
        reason: "Old Reason",
        save: jest.fn(),       // spy on save
        populate: jest.fn()    // spy on populate (probably returns the full doc again)
      };

      (FakeAppointmentModel.findOne as jest.Mock).mockResolvedValueOnce(apptToUpdate);

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify(changesToApply),
      });

      const res = await PUT(req as any, { params: { id: appointmentId } });
      const updated = await res.json();

      expect(res.status).toBe(200);
      expect(apptToUpdate.reason).toBe("Updated Reason");
      expect(apptToUpdate.save).toHaveBeenCalled();
      expect(apptToUpdate.populate).toHaveBeenCalled();
    });
  });

  describe("DELETE handler", () => {
    it("returns 401 if session is missing", async () => {
      mockSessionGetter.mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: { id: appointmentId } });

      expect(res.status).toBe(401);
    });

    it("returns 404 if appointment wasn't found", async () => {
      (FakeAppointmentModel.findOneAndDelete as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: { id: appointmentId } });

      expect(res.status).toBe(404);
    });

    it("removes appointment and returns success message", async () => {
      (FakeAppointmentModel.findOneAndDelete as jest.Mock).mockResolvedValueOnce({ _id: appointmentId });

      const req = new Request(`http://localhost/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      const res = await DELETE(req as any, { params: { id: appointmentId } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Appointment deleted successfully");
    });
  });
});
