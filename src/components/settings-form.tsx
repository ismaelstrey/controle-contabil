import { useAppContext } from '@/contexts/app-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsForm() {
  const { theme, language, itemsPerPage, dateFormat, currencyFormat, setTheme, setLanguage, setItemsPerPage, setDateFormat, setCurrencyFormat } = useAppContext()

  return (
    <form className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="theme">Tema</Label>
        <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value as any)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lang">Linguagem</Label>
        <Input id="lang" value={language} onChange={(e) => setLanguage(e.target.value as any)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="items">Itens por página</Label>
        <Input id="items" type="number" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Formato de data</Label>
        <Input id="date" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Formato de moeda</Label>
        <Input id="currency" value={currencyFormat} onChange={(e) => setCurrencyFormat(e.target.value)} />
      </div>
    </form>
  )
}
