import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc,
  getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Autorizacao {
  id: string;
  nomesMenores: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  assinatura: string;
  status: "pendente" | "assinado";
  criadoEm: string | null;
  assinadoEm: string | null;
}

const COL = "autorizacoes";

export async function criarAutorizacao(nomesMenores: string): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    nomesMenores,
    nomeResponsavel: "",
    cpfResponsavel: "",
    telefoneResponsavel: "",
    assinatura: "",
    status: "pendente",
    criadoEm: serverTimestamp(),
    assinadoEm: null,
  });
  return ref.id;
}

export async function buscarAutorizacao(id: string): Promise<Autorizacao | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Autorizacao;
}

export async function listarAutorizacoes(): Promise<Autorizacao[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Autorizacao));
}

export async function deletarAutorizacao(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function assinarAutorizacao(
  id: string,
  dados: { nomeResponsavel: string; cpfResponsavel: string; telefoneResponsavel: string; assinatura: string }
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...dados,
    status: "assinado",
    assinadoEm: serverTimestamp(),
  });
}
