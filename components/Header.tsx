"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  BrainCircuit,
  PanelLeft,
  Search,
  BarChart,
  Home,
  Briefcase,
  Moon,
  Sun,
  PlusCircle,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModelMode } from "@/lib/constants"
import { DigitalThinkingModelType } from "@/lib/types"

interface HeaderProps {
  currentMode: ModelMode
  onSetMode: (mode: ModelMode) => void
  modelType: DigitalThinkingModelType
  modelName: string
  modelId: string
}

const ModeButton = ({
  label,
  currentMode,
  onClick,
  icon,
}: {
  label: ModelMode
  currentMode: ModelMode
  onClick: (mode: ModelMode) => void
  icon: React.ReactNode
}) => (
  <Button
    variant={currentMode === label ? "default" : "outline"}
    onClick={() => onClick(label)}
    className="flex items-center gap-2"
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Button>
)

export default function Header({ currentMode, onSetMode, modelType, modelName, modelId }: HeaderProps) {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <BrainCircuit className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">TandT</span>
            </Link>
            <Link href="/" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-4 px-2.5 text-foreground">
              <Briefcase className="h-5 w-5" />
              Models
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/models`}>Models</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{modelName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <div className="flex items-center gap-2">
          <ModeButton
            label={ModelMode.Modeling}
            currentMode={currentMode}
            onClick={onSetMode}
            icon={<PlusCircle className="h-5 w-5" />}
          />
          <ModeButton
            label={ModelMode.Analyzing}
            currentMode={currentMode}
            onClick={onSetMode}
            icon={<Search className="h-5 w-5" />}
          />
          <ModeButton
            label={ModelMode.Results}
            currentMode={currentMode}
            onClick={onSetMode}
            icon={<BarChart className="h-5 w-5" />}
          />
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <BrainCircuit />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Toggle Theme
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
} 