import papa from 'papaparse';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';

export const useUploadActivityCsv = () => {
  const { mutate: uploadActivityCsv, mutateAsync } =
    api.admin.activity.bulkEdit.useMutation({
      onSuccess: () => {
        toast.success('Activities uploaded successfully');
      },
      onError: (error) => {
        toast.error('Failed to upload activities');
        console.error(error);
      },
    });

  const transformRawData = (data: any) => {
    return data.map((item: any) => {
      const data = JSON.parse(item.Data);
      data.ap = item['Data → Ap'] === 'TRUE';
      data.multiplier = item['Data → Multiplier'] === 'TRUE';
      data.showOnEarnPage = item['Data → ShowOnEarnPage'] === 'FALSE';

      return {
        id: item.ID,
        name: item.Name,
        description: item.Description,
        category: item.Category,
        dapp: item.Dapp,
        componentAddresses: JSON.parse(item['Component Addresses']),
        data: data,
      };
    });
  };

  const handleUpload = useCallback(
    async (files: FileList) =>
      new Promise<undefined>((resolve, reject) => {
        toast.info('Uploading activities...');
        const file = files[0];
        if (!file) {
          toast.error('No file selected');
          reject(new Error('No file selected'));
          return;
        }
        papa.parse(file, {
          header: true,
          complete: async (results) => {
            if (results.data) {
              const output = transformRawData(results.data);
              await mutateAsync(output);
              resolve(undefined);
            }

            if (results.errors.length > 0) {
              toast.error('Failed to upload activities');
              console.error(results.errors);
              reject(new Error('Failed to upload activities'));
            }
          },
        });
      }),
    [uploadActivityCsv],
  );

  return { upload: handleUpload };
};
