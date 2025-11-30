
import { GET, POST } from "@/app/api/appointments/route";
import { getServerSession } from "next-auth";
import Appointment from "@/models/Appointment";
import Pet from "@/models/Pet";

// Mock next-auth
jest.mock("next-auth");
const mockGetServerSession = getServerSession as jest.Mock;

// Mock models
jest.mock("@/models/Pet");
jest.mock("@/models/Appointment");

const mockPet = Pet as unknown as jest.Mocked<typeof Pet>;
const mockAppointment = Appointment as unknown as jest.Mocked<typeof Appointment>;

describe("/api/appointments Route", () => {
  const mockSession = {
    user: { email: "test@example.com", name: "Test User" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  describe("GET", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);
      const req = new Request("http://localhost/api/appointments");
      const res = await GET(req as any);
      expect(res.status).toBe(401);
    });

    it("should return 200 and appointments", async () => {
      const mockAppointments = [{ _id: "1", reason: "Checkup" }];
      
      // Mock chain: find -> populate -> sort -> resolve
      const mockSort = jest.fn().mockResolvedValue(mockAppointments);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      (mockAppointment.find as jest.Mock).mockReturnValue({ populate: mockPopulate });

      const req = new Request("http://localhost/api/appointments?petId=123");
      const res = await GET(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockAppointments);
      expect(mockAppointment.find).toHaveBeenCalledWith(expect.objectContaining({ 
        owner: mockSession.user.email,
        petId: "123"
      }));
      expect(mockPopulate).toHaveBeenCalledWith('petId', 'name species breed');
      expect(mockSort).toHaveBeenCalledWith({ appointmentDate: 1, appointmentTime: 1 });
    });
  });

  describe("POST", () => {
    const validBody = {
      petId: "pet123",
      appointmentDate: "2023-01-01",
      appointmentTime: "10:00",
      location: "Vet Clinic",
      reason: "Vaccination",
      notes: "Bring records",
    };

    // A test
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      // Create request with valid body
      const req = new Request("http://localhost/api/appointments", {
        method: "POST",
        body: JSON.stringify(validBody),
      });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    // Another test for the missing fields (maybe)
    it("should return 400 if missing fields", async () => {
        // Make body with missing fields
      const req = new Request("http://localhost/api/appointments", {
        method: "POST",
        body: JSON.stringify({ petId: "pet123" }), // missing others
      });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("should return 404 if pet not found", async () => {
      (mockPet.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      const req = new Request("http://localhost/api/appointments", {
        method: "POST",
        body: JSON.stringify(validBody),
      });
      const res = await POST(req as any);
      expect(res.status).toBe(404);
    });

    it("should return 201 and created appointment", async () => {
      const mockPetData = { _id: "pet123", name: "Fluffy" };
      (mockPet.findOne as jest.Mock).mockResolvedValueOnce(mockPetData);

      // Mock Appointment constructor and instance methods
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockPopulate = jest.fn().mockResolvedValue(true);
      
      // When new Appointment() is called, return this mock instance
      (mockAppointment as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        populate: mockPopulate,
        ...validBody,
        petName: "Fluffy",
        owner: mockSession.user.email,
        status: 'scheduled'
      }));

      const req = new Request("http://localhost/api/appointments", {
        method: "POST",
        body: JSON.stringify(validBody),
      });
      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.petName).toBe("Fluffy");
      expect(mockSave).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith('petId', 'name species breed');
    });
  });
});
