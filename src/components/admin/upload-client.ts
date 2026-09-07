export interface UploadedFile {
  url: string;
  thumbUrl: string;
}

export async function uploadImages(files: File[] | FileList): Promise<UploadedFile[]> {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));

  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Ngarkimi dështoi. Provoni përsëri.");
  }
  return data.files as UploadedFile[];
}
