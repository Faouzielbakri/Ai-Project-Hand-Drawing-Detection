import api from '@/lib/axios/interceptor';
import { z } from 'zod';

// Example schema
export const ExampleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export type Example = z.infer<typeof ExampleSchema>;

export const exampleService = {
  getAll: async (): Promise<Example[]> => {
    const response = await api.get('/examples');
    return response.data;
  },

  getById: async (id: number): Promise<Example> => {
    const response = await api.get(`/examples/${id}`);
    return ExampleSchema.parse(response.data);
  },

  create: async (data: Omit<Example, 'id'>): Promise<Example> => {
    const response = await api.post('/examples', data);
    return ExampleSchema.parse(response.data);
  },

  update: async (id: number, data: Partial<Example>): Promise<Example> => {
    const response = await api.put(`/examples/${id}`, data);
    return ExampleSchema.parse(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/examples/${id}`);
  },
};
