## 2. Supabase Storage & FormData Native Fix
When uploading pet images to Supabase Storage, use the native fetch block to avoid multi-part boundary corruption in Android:
```typescript
const uploadPetImage = async (bucket: string, fileUri: string): Promise<string | null> => {
  const filename = fileUri.split('/').pop() || 'pet.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri: fileUri, name: filename, type } as any);

  // Concrete application upload using Supabase client storage API
  const { data, error } = await supabase.storage.from(bucket).upload(`public/${filename}`, formData, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
};