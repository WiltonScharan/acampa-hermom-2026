import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadComprovante(
  inscricaoId: string,
  file: File
): Promise<string> {
  const nomeArquivo = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `comprovantes/${inscricaoId}/${nomeArquivo}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function excluirComprovante(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}
