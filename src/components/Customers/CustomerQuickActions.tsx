import { Link } from "@tanstack/react-router"
import { Download, FilePlus, MessageCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DisabledActionButtonProps {
  icon: typeof Download
  label: string
  tooltip: string
}

function DisabledActionButton({
  icon: Icon,
  label,
  tooltip,
}: DisabledActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="w-full">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 opacity-60"
              disabled
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface Customer {
  id: string
}

interface CustomerQuickActionsProps {
  customer: Customer
}

export function CustomerQuickActions({ customer }: CustomerQuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Link to="/create-invoice" search={{ customerId: customer.id }}>
          <Button className="w-full justify-start gap-2">
            <FilePlus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Link>

        <DisabledActionButton
          icon={Download}
          label="Download Statement"
          tooltip="Coming soon — generates a PDF/Excel statement"
        />

        <DisabledActionButton
          icon={MessageCircle}
          label="Send via WhatsApp"
          tooltip="Coming soon — sends outstanding summary via WhatsApp"
        />
      </CardContent>
    </Card>
  )
}

export default CustomerQuickActions
