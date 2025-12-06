import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exampleService, type Example } from '@/services/example.service';

export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: exampleService.getAll,
  });
};

export const useExample = (id: number) => {
  return useQuery({
    queryKey: ['examples', id],
    queryFn: () => exampleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exampleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Example> }) =>
      exampleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};

export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exampleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};
