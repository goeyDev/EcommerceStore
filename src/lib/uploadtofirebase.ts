// lib/uploadToFirebase.ts
import { storage } from "./firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadFileToFirebase(file: File, folder: string) {
  const filePath = `${folder}/${crypto.randomUUID()}-${file.name}`;
  const fileRef = ref(storage, filePath);

  const snapshot = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return { filePath, url };
}
