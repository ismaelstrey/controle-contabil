import { useEffect } from 'react'
import { useDocuments } from '@/hooks/use-documents'
import { Button } from '@/components/ui/button'

export function DocumentList() {
  const { documents, loading, error, listDocuments, downloadDocument, deleteDocument } = useDocuments()

  useEffect(() => {
    listDocuments()
  }, [])

  if (loading) {
    return <div className="py-10 text-center">Carregando...</div>
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>
  }

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">Documentos</h2>
      <ul className="space-y-2">
        {documents.map((d) => (
          <li key={d.id} className="flex items-center justify-between">
            <span>{d.file_name}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => downloadDocument(d.id)}>Baixar</Button>
              <Button variant="destructive" onClick={() => deleteDocument(d.id)}>Excluir</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
