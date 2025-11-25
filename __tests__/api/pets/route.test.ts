
// We test our pets routing handlers here!!
import { GET, POST } from '@/app/api/pets/route';


import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Pet from '@/models/Pet';
import { NextRequest } from 'next/server';

// We need to load in mocks of these modules
// because the route handlers depend on them
jest.mock('next-auth');
jest.mock('@/lib/mongoose');
jest.mock('@/models/Pet');



describe('/api/pets', () => {

    // Dummy session data to do the test
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('GET', () => {

    // GET request test for unauthed user
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/pets');
      const res = await GET(req);

      expect(res.status).toBe(401); // should return 401
      const data = await res.json();
      expect(data.error).toBe('Auth failed');
    });

    // GET request to list pets for a user
    it('should return a list of pets if authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      
      const mockPets = [{ name: 'Fluffy', species: 'Cat' }];
      // Mock chainable .sort()
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockPets),
      };
      (Pet.find as jest.Mock).mockReturnValue(mockFind);

      const req = new NextRequest('http://localhost:3000/api/pets');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockPets);
      expect(Pet.find).toHaveBeenCalledWith({ owner: mockSession.user.email });
    });
  });

  describe('POST', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify({ name: 'Buddy', species: 'Dog', age: 2 }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    // A test for when we are missing required fields in the body of the JSON in the 
    // POST request
    it('should return 400 if missing required fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Setup the body with just name
      const req = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify({ name: 'Buddy' }), // Missing species and age
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing required fields');
    });


    // A test for successfully creating a pet
    it('should create a pet if valid data provided', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      

      const somePetData = { name: 'Buddy', species: 'Dog', age: 2 };
      const savedPet = { ...somePetData, _id: '123', owner: mockSession.user.email };

      // Mock the Pet constructor and save method
      // When new Pet() is called, it returns an object with a save method
      (Pet as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedPet),
      }));

      const req = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify(somePetData),
      });
      const res = await POST(req);

      expect(res.status).toBe(201); // Created!!
    // expect(res.status).toBe(200); // legcay, OK is not ideal we want 201 created
      const data = await res.json();
      expect(data).toEqual(savedPet);
    });
  });
});
