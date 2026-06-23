import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Inscricao, InscricaoForm } from "@/types";

const COLLECTION = "inscricoes";

export async function listarInscricoes(): Promise<Inscricao[]> {
  const q = query(collection(db, COLLECTION), orderBy("nome"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inscricao));
}

export function ouvirInscricoes(callback: (inscricoes: Inscricao[]) => void) {
  const q = query(collection(db, COLLECTION), orderBy("nome"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inscricao));
    callback(data);
  });
}

export async function buscarInscricao(id: string): Promise<Inscricao | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Inscricao;
}

export async function criarInscricao(dados: InscricaoForm): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...dados,
    comprovantes: [],
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarInscricao(
  id: string,
  dados: Partial<InscricaoForm>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirInscricao(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function contarInscricoesImportadas(): Promise<number> {
  const q = query(collection(db, COLLECTION), where("origemImportacao", "==", true));
  const snap = await getDocs(q);
  return snap.size;
}

export async function excluirInscricoesImportadas(): Promise<number> {
  const q = query(collection(db, COLLECTION), where("origemImportacao", "==", true));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export async function atualizarComprovantes(
  id: string,
  comprovantes: string[]
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    comprovantes,
    atualizadoEm: serverTimestamp(),
  });
}
